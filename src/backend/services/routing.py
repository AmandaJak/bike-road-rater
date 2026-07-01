import os

import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()

ORS_URL = "https://api.openrouteservice.org/v2/directions/cycling-regular/geojson"


class HardExcludes(BaseModel):
    avoidStateRoads: bool = False


class RouteRequest(BaseModel):
    from_coords: list[float]
    to_coords: list[float]
    hard_excludes: HardExcludes = HardExcludes()


@router.post("")
async def get_routes(req: RouteRequest):
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

    return resp.json()
