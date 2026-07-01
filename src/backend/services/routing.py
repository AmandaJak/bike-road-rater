import os
import time

import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()

ORS_URL = "https://api.openrouteservice.org/v2/directions/cycling-regular/geojson"

# In-memory cache: key → (response_json, cached_at)
_cache: dict[tuple, tuple[dict, float]] = {}
_CACHE_TTL = 86400.0  # 24 hours
_CACHE_MAX = 1000


class HardExcludes(BaseModel):
    avoidStateRoads: bool = False


class RouteRequest(BaseModel):
    from_coords: list[float]
    to_coords: list[float]
    hard_excludes: HardExcludes = HardExcludes()


def _cache_key(req: RouteRequest) -> tuple:
    return (tuple(req.from_coords), tuple(req.to_coords), req.hard_excludes.avoidStateRoads)


def _cache_get(key: tuple) -> dict | None:
    entry = _cache.get(key)
    if entry is None:
        return None
    data, cached_at = entry
    if time.monotonic() - cached_at > _CACHE_TTL:
        del _cache[key]
        return None
    return data


def _cache_set(key: tuple, data: dict) -> None:
    if len(_cache) >= _CACHE_MAX:
        oldest_key = min(_cache, key=lambda k: _cache[k][1])
        del _cache[oldest_key]
    _cache[key] = (data, time.monotonic())


@router.post("")
async def get_routes(req: RouteRequest):
    key = _cache_key(req)
    cached = _cache_get(key)
    if cached is not None:
        return cached

    api_key = os.environ.get("ORS_API_KEY", "")
    if not api_key:
        return JSONResponse(status_code=500, content={"error": "ORS_API_KEY not configured"})

    body = {
        "coordinates": [req.from_coords, req.to_coords],
        "alternative_routes": {"target_count": 3, "share_factor": 0.6},
        "extra_info": ["waytype", "surface"],
        "options": {},
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                ORS_URL,
                json=body,
                headers={
                    "Authorization": api_key,
                    "Content-Type": "application/json",
                },
            )
    except Exception:
        return JSONResponse(status_code=500, content={"error": "ROUTING_ERROR"})

    if resp.status_code == 403:
        return JSONResponse(status_code=403, content={"error": "DAILY_LIMIT"})
    if resp.status_code == 429:
        return JSONResponse(status_code=429, content={"error": "RATE_LIMIT"})
    if not resp.is_success:
        return JSONResponse(
            status_code=502,
            content={"error": "ORS_ERROR", "status": resp.status_code},
        )

    data = resp.json()
    _cache_set(key, data)
    return data
