import asyncio
import time

import httpx
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter()

# In-memory cache: key → (lon, lat, cached_at)
_cache: dict[str, tuple[float, float, float]] = {}
_CACHE_TTL = 86400.0  # 24 hours
_CACHE_MAX = 1000

# Ensures at most one Nominatim request per 1.1 seconds
_nominatim_lock = asyncio.Lock()
_last_request_at: float = 0.0


def _cache_get(key: str) -> tuple[float, float] | None:
    entry = _cache.get(key)
    if entry is None:
        return None
    lon, lat, cached_at = entry
    if time.monotonic() - cached_at > _CACHE_TTL:
        del _cache[key]
        return None
    return lon, lat


def _cache_set(key: str, lon: float, lat: float) -> None:
    if len(_cache) >= _CACHE_MAX:
        # Evict the oldest entry by cached_at timestamp
        oldest_key = min(_cache, key=lambda k: _cache[k][2])
        del _cache[oldest_key]
    _cache[key] = (lon, lat, time.monotonic())


@router.get("")
async def geocode(q: str = Query(..., description="Address to geocode")):
    global _last_request_at

    cached = _cache_get(q)
    if cached is not None:
        lon, lat = cached
        return {"lon": lon, "lat": lat}

    async with _nominatim_lock:
        # Re-check cache in case another request populated it while we waited
        cached = _cache_get(q)
        if cached is not None:
            lon, lat = cached
            return {"lon": lon, "lat": lat}

        elapsed = time.monotonic() - _last_request_at
        if elapsed < 1.1:
            await asyncio.sleep(1.1 - elapsed)

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    "https://nominatim.openstreetmap.org/search",
                    params={"q": q, "format": "json", "limit": 1, "countrycodes": "dk"},
                    headers={"Accept-Language": "en", "User-Agent": "Trygvej/1.0"},
                    timeout=10.0,
                )
        except Exception:
            return JSONResponse(status_code=500, content={"error": "GEOCODE_ERROR"})
        finally:
            _last_request_at = time.monotonic()

        if not resp.is_success:
            return JSONResponse(status_code=502, content={"error": "GEOCODE_FAILED"})

        results = resp.json()
        if not results:
            return JSONResponse(status_code=404, content={"error": "ADDRESS_NOT_FOUND"})

        lon = float(results[0]["lon"])
        lat = float(results[0]["lat"])
        _cache_set(q, lon, lat)
        return {"lon": lon, "lat": lat}
