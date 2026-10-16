# Cinema Manager

Application de gestion de cinéma.

- **Backend** : ASP.NET Core 10 (Web API, controllers) + EF Core / PostgreSQL — `backend/`
- **Frontend** : React + TypeScript (Vite), servi par nginx — `frontend/`
- **Base de données** : PostgreSQL 17

## Démarrage

```bash
cp .env.example .env   # puis modifier POSTGRES_PASSWORD
docker compose up -d --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| API      | http://localhost:8080        |
| Health   | http://localhost:8080/health |

## Commandes utiles

```bash
# Tests du backend (nécessitent la base)
docker compose exec api dotnet test

# Migrations EF Core
docker compose run --rm api dotnet ef migrations add <Nom> --project src/CinemaManager.Api --output-dir Data/Migrations
docker compose run --rm api dotnet ef database update --project src/CinemaManager.Api

# Frontend en mode dev (avec rechargement à chaud)
docker compose up -d db api
cd frontend && npm ci && npm run dev   # http://localhost:5173
```
