# bike-road-rater
This app will find bike roads between locations and rate their safety.

## About

This project was created as part of a vibe coding event and is not done. The inspiration came from a local Facebook group, where a parent asked whether their 11-year-old son could bike between two neighboring towns without using any bigger roads that lack bike lanes — spoiler: it was not possible.

**Trygvej** helps parents check whether a cycling route is safe enough for their child to ride alone. Enter a start and end address, and the app finds routes between them and rates each segment's safety based on road type (e.g. dedicated cycleway vs. large/state road). Filters let you weigh how much to prefer cycleways and avoid large roads, and you can hard-exclude routes that use state roads entirely. Hovering a route on the map shows the road type per segment, so it can be used as guidance before letting a child cycle a route unsupervised. The app also includes a feedback form and links to official Danish resources on children and cycling safety.
## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) (for the frontend)
- [uv](https://docs.astral.sh/uv/) (for the Python backend)

### Setup
1. Install frontend dependencies:
   ```
   npm install
   ```
2. Configure the backend environment: copy `src/backend/.env.example` to `src/backend/.env` and fill in your own `ORS_API_KEY` (get one from [OpenRouteService](https://openrouteservice.org/dev/#/signup)).
   ```
   cp src/backend/.env.example src/backend/.env
   ```

### Running the app
Start both the frontend and backend together:
```
npm run dev
```
This runs the Vite dev server (frontend) and the FastAPI/uvicorn server (backend) concurrently. The frontend is available at http://localhost:5173 and the backend at http://localhost:8000.

You can also run them separately:
```
npm run dev:frontend
npm run dev:backend
```
