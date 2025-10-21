# Vibeenengineer LMS (Monorepo)

Dockerized monorepo with `web` (Vite React TS) and `api` (Express TS + Prisma) and Postgres.

## Quickstart (dev)

1. Copy envs:
   - `cp api/.env.example api/.env`
   - `cp web/.env.example web/.env`
2. Start stack:
   - `docker-compose up -d --build`
3. Open:
   - API: http://localhost:4000/health
   - Web: http://localhost:5173

DB:
- postgres://app:app@localhost:5432/vibeen

## Services
- db: Postgres 16 (with healthcheck)
- api: Node 20, Express TS (hot reload)
- web: Vite React TS (hot reload)

## Logs
- `docker-compose logs -f db api web`
