# HexaLytics

Interactive web app for exploring road accidents in Łodź, Poland.

HexaLytics combines a map-first browsing flow, hex-based density views, street search, and accident detail drill-down to help move quickly from a city-wide overview to specific locations and cases.

## Purpose

The project is designed to make road accident data easier to inspect, compare, and discuss.

Instead of treating the source data as a static report, the app presents it as an interactive map with filters and multiple visualization modes. The goal is to support fast exploratory analysis, not to replace official reporting.

## What you get

- **Accident map view**  
  Browse individual accidents and collisions as map points in their real locations.
- **Hex density view (2D)**  
  See spatial concentration patterns across the city in a quick, readable way.
- **Hex density view (3D)**  
  Use column height to emphasize differences between areas with higher and lower accident counts.
- **Filtering by year and severity**  
  Narrow the visible dataset to selected years and severity groups.
- **District filtering**  
  Focus the analysis on selected Łódz districts.
- **Street search**  
  Search for a street, maps move to it, so you can inspect accidents near it.
- **Street insights**  
  For the selected street, see total accident count, severity breakdown, and the most active year.
- **Accident detail drill-down**  
  Open a single accident and inspect its participants, casualties, severity, event type, and location metadata.
- **Light and dark theme**  
  Switch between visual themes directly in the app.

## Data scope

- **City:** Łodź
- **Current coverage:** `2015..2025`
- **Runtime data source:** PostgreSQL served through the backend API

The application does **not** read runtime accident data directly from local JSON files.

## Runtime architecture

This repository is split into two runtimes:

- `frontend/` - Next.js application running on `localhost:3000`
- `backend/` - Spring Boot API and importer running on `localhost:8080`

The default PostgreSQL instance runs on `localhost:55432` to avoid clashing with a local PostgreSQL server already using `5432`.

## Tech stack

### Frontend

- **Framework:** Next.js 15
- **Language:** TypeScript
- **UI:** React 19
- **Map rendering:** MapLibre + deck.gl
- 
### Backend

- **Framework:** Spring Boot 4
- **Language:** Java 24
- **Persistence:** Spring Data JPA + PostgreSQL
- **Migrations:** Flyway

## API surface

### Backend API

Default base URL:

```text
http://localhost:8080/api
```

Main endpoints:

- `GET /api/accidents` - accident summaries for the map
- `GET /api/accidents/{id}` - full details for a single accident
- `GET /api/filters` - available filter values used by the frontend
- `GET /api/stats` - aggregate statistics for a filtered dataset

Supported backend filters:

- `year`
- `severity` 
- `district`
- `eventType`

### Frontend route handlers

The Next.js app also exposes small frontend-side API handlers:

- `GET /api/accident-details?id=...` - client-facing detail fetch used by the detail modal
- `GET /api/street-search?q=...` - street search proxy built on top of OpenStreetMap Nominatim

## Data pipeline

The project moved away from depending on the external ObserwatoriumBRD application at runtime.

The current flow is:

1. **Legacy fetch scripts** scraped yearly Łodz source data from the public ObserwatoriumBRD endpoints.
2. **Raw yearly JSON files** are stored locally under `frontend/data/obserwatoriumbrd/raw/lodz/` and `frontend/data/obserwatoriumbrd/details/lodz/`.
3. **Backend importer** reads those local snapshots, validates them, normalizes fields, resolves Łodz districts from GeoJSON polygons, and writes the result into PostgreSQL.
4. **Frontend runtime** reads the prepared data from the backend API, not from the JSON files directly.

### Legacy source acquisition

The data acquisition step is implemented with the legacy scripts in:

```text
frontend/scripts/legacy/
```

Those scripts fetch:

- yearly raw accident list snapshots for Lodz
- yearly detailed accident records keyed by accident ID

The generated files live in:

```text
frontend/data/obserwatoriumbrd/raw/lodz/
frontend/data/obserwatoriumbrd/details/lodz/
```

This is effectively a controlled local archive of the public source data before import.

### Import step

The backend importer then:

- checks ID consistency between raw and detailed files
- normalizes severity, injury levels, vehicle types, and event types
- resolves districts from `frontend/public/lodz-districts.geojson`
- writes the normalized data into PostgreSQL tables

Main tables involved:

- `districts`
- `event_types`
- `vehicle_types`
- `accidents`
- `accident_participants`
- `participant_casualties`

## Repository structure

```text
.
├── frontend/   # Next.js app, map UI, frontend route handlers
├── backend/    # Spring Boot API, importer, Flyway migrations
├── docs/       # technical docs and notes
└── docker-compose.yml
```

## Quick start

### Requirements

- Node.js
- `pnpm@11.3.0`
- Java 24
- Docker Desktop

### 1. Install frontend dependencies

```bash
cd frontend
pnpm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 3. Import data into the local database

Run the importer locally from `backend/`:

The required source snapshots are already included in this repository. This import run is a one-off data load step, not the normal long-running backend API process.

```bash
cd backend
./gradlew bootRun --args='--app.import.enabled=true --app.import.command=import-all --app.import.years=2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025'
```

### 4. Start the backend runtime

```bash
docker compose up --build backend
```

### 5. Start the frontend

```bash
cd frontend
pnpm dev
```

### 6. Open the app

- frontend: `http://localhost:3000`
- backend API: `http://localhost:8080/api`

## Daily local run

If the database is already populated, you usually only need:

```bash
docker compose up --build
```

and in a second terminal:

```bash
cd frontend
pnpm dev
```

The importer is meant to be run when:

- the source JSON snapshots change
- you want to rebuild the database
- you want to import a different year range

For normal day-to-day use, treat the importer as a separate maintenance step and the backend container as the regular API runtime.

## Running without Docker for the backend

You can also run the backend locally if PostgreSQL is already available on `localhost:55432` or if you override the datasource settings.

Supported environment variables:

```bash
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
SERVER_PORT
ACCIDENTS_BACKEND_URL
```

Then run:

```bash
cd backend
./gradlew bootRun
```

## Main commands

### Frontend

| Command | Description |
|---|---|
| `pnpm dev` | start the development server |
| `pnpm build` | create a production build |
| `pnpm start` | run the production build |

### Backend

| Command | Description |
|---|---|
| `./gradlew compileJava` | compile the backend |
| `./gradlew bootRun` | run the backend locally |

### Docker

| Command | Description |
|---|---|
| `docker compose up --build` | start PostgreSQL and backend |
| `docker compose up -d postgres` | start only PostgreSQL |
| `docker compose down` | stop the stack |

## Notes

- The app is an exploratory visualization, not an official road safety report.
- Source data originates from the Polish Road Safety Observatory (`obserwatoriumbrd.pl`) and includes material sourced there from systems such as SEWiK.
- Legacy source-contract code is kept in `frontend/src/legacy/obserwatorium/` for reference only and is not part of the current runtime path.