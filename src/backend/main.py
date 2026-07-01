# To run the backend:
# cd src/backend
# uv sync
# cp .env.example .env  (then add your ORS_API_KEY)
# uv run uvicorn main:app --reload --port 8000

# Frontend (Vite) proxies /api to localhost:8000
# Add to vite.config.js:
# server: {
#   proxy: {
#     '/api': 'http://localhost:8000'
#   }
# }

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.geocode import router as geocode_router
from services.routing import router as routing_router

app = FastAPI(title="Trygvej API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        # Add your production domain here, e.g. "https://trygvej.dk"
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(geocode_router, prefix="/api/geocode")
app.include_router(routing_router, prefix="/api/routes")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
