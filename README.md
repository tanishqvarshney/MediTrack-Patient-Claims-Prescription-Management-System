# TanCura — Patient Claims & Prescription Management System

A production-grade healthcare claims processing system built with **ASP.NET Core 8**, **Angular 17**, and **SQL Server**.

---

## 🏗 Project Structure

```
tancura/
├── backend/
│   ├── TanCura.Core/            # Domain models, DTOs, interfaces, enums
│   ├── TanCura.Infrastructure/  # EF Core DbContext, repositories, services
│   ├── TanCura.Api/             # Claims REST API + Auth
│   ├── TanCura.PharmacyApi/     # Pharmacy & Formulary API
│   ├── TanCura.Worker/          # Background claims polling service
│   └── TanCura.Tests/           # xUnit unit + integration tests
├── frontend/                      # Angular 17 SPA
├── db/init/                       # SQL seed scripts
├── nginx/                         # Reverse proxy config
├── .github/workflows/ci-cd.yml    # GitHub Actions pipeline
├── docker-compose.yml             # Multi-container orchestration
└── .env.example                   # Environment variable template
```

---

## 🚀 Quick Start (Docker)

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your secrets

# 2. Start all services
docker-compose up -d

# 3. API is available at:
#    Claims API:  http://localhost:5001/swagger
#    Frontend:    http://localhost:4200
```

---

## 🔧 Local Development (without Docker)

### Backend Prerequisites
- .NET 8 SDK
- SQL Server 2019+ (or Docker: `docker run -e ACCEPT_EULA=Y -e SA_PASSWORD=Dev@1234! -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest`)

```bash
cd backend

# Apply migrations and seed data
dotnet ef database update --project TanCura.Api

# Run Claims API
dotnet run --project TanCura.Api

# Run Worker Service
dotnet run --project TanCura.Worker

# Run Tests
dotnet test TanCura.Tests
```

### Frontend Prerequisites
- Node.js 20+
- Angular CLI 17: `npm install -g @angular/cli`

```bash
cd frontend
npm install
ng serve
# App at http://localhost:4200
```

---

## 🔑 Default Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tancura.io | Password123! |
| Provider | provider@clinic.com | Password123! |
| Patient | patient@example.com | Password123! |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | None | Get JWT tokens |
| POST | `/api/v1/auth/refresh` | None | Rotate access token |
| POST | `/api/v1/claims` | Provider, Admin | Submit a new claim |
| GET | `/api/v1/claims/{id}` | Any | Get claim by ID |
| GET | `/api/v1/claims` | Admin | List all claims |
| PUT | `/api/v1/claims/{id}/status` | Admin | Update claim status |
| GET | `/api/v1/pharmacy/formulary/{ndc}` | Any | Drug benefit lookup |
| GET | `/api/v1/admin/metrics/claims` | Admin | Dashboard metrics |

Full interactive docs: `http://localhost:5001/swagger`

---

## 🧪 Running Tests

```bash
# Backend unit tests
dotnet test backend/TanCura.Tests --configuration Release

# Frontend tests
cd frontend && npm test -- --watch=false --browsers=ChromeHeadless
```

---

## 🏭 CI/CD

GitHub Actions pipeline (`.github/workflows/ci-cd.yml`):
1. **test-backend** — Restore, build, run xUnit tests with SQL Server service
2. **test-frontend** — Lint, unit test, production build
3. **build-and-push** — Multi-platform Docker images → GHCR (main branch only)
4. **deploy** — SSH deploy via `docker-compose pull && up -d`

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DEPLOY_HOST` | Production server IP |
| `DEPLOY_USER` | SSH username |
| `DEPLOY_KEY` | SSH private key |
| `CODECOV_TOKEN` | Codecov upload token |

---

## 🔒 Security

- JWT access tokens expire in **15 minutes**
- Refresh tokens rotate on each use (7-day validity)
- Passwords hashed with **BCrypt** (cost factor 12)
- All PHI access logged with userId, role, IP, timestamp
- Non-root Docker containers
- TLS terminated at Nginx layer

---

## 📊 Architecture

```
Angular SPA ──► Nginx ──► Claims API (ASP.NET Core 8)
                    └──► Pharmacy API
                              │
                         SQL Server
                              │
                    Worker Service (polls pending claims)
                              │
                       Mock Payer API
```
