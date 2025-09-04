# Sistema de Evaluación de Proveedores

Aplicación full-stack para evaluación de riesgo de proveedores.

- Backend: FastAPI + SQLAlchemy 2.0 + PostgreSQL
- Frontend: React 18 + Vite
- Autenticación: JWT
- Migraciones: Alembic
- Contenedores: Docker + Docker Compose
- Tests: pytest (backend)

---

## Requisitos

- Docker
- Docker Compose
- Node.js 18+ (solo para ejecutar el frontend en modo desarrollo)

---

## Paso a paso (solo con Docker)

> Ejecuta todo desde la carpeta raíz del repo (`pt-proveedores/`).

### 1) Clonar el repositorio

```bash
git clone <URL-DEL-REPO>
cd pt-proveedores
```

### 2) Construir y levantar servicios

```bash
docker compose up -d --build
```

**Servicios:**
- `api` → FastAPI en http://localhost:8000
- `db` → PostgreSQL

### 3) Ejecutar migraciones de base de datos

```bash
docker compose exec api alembic upgrade head
```

### 4) Cargar datos iniciales (seed)

El repo incluye `seed_data.py` en la raíz. Crea:
- Usuario admin `admin@example.com` / `Admin123!`
- Empresas y solicitudes de ejemplo

```bash
docker compose exec api python seed_data.py
```

### 5) Configurar y levantar el frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

**Acceso:**
- **Frontend**: http://localhost:5173
- **API**: http://localhost:8000
- **Swagger**: http://localhost:8000/docs

---

## Uso rápido

1. Abre http://localhost:5173
2. Inicia sesión con `admin@example.com` / `Admin123!`
3. Crea y lista empresas y solicitudes desde la UI

> **Nota**: La API expone rutas con y sin "/" final. Para evitar redirecciones 307, usa las rutas con "/" (por ejemplo `/companies/`, `/requests/`).

---

## Paginación desde el frontend o clientes HTTP

Los listados devuelven 10 elementos por defecto. Puedes paginar con `page` y `page_size`:

```bash
GET /companies/?page=1&page_size=25
GET /requests/?page=2&page_size=50
```

---

## Comandos útiles

### Ver logs
```bash
docker compose logs -f api
docker compose logs -f db
```

### Ejecutar tests del backend
```bash
docker compose exec api pytest -v
```

### Resetear y volver a sembrar la base
```bash
docker compose exec api alembic downgrade base
docker compose exec api alembic upgrade head
docker compose exec api python seed_data.py
```

### Detener y eliminar contenedores
```bash
docker compose down
```

---

## Estructura del proyecto

```
pt-proveedores/
├── app/                     # Backend FastAPI
│   ├── api/                 # Endpoints
│   ├── models/              # Modelos SQLAlchemy
│   ├── schemas/             # Esquemas Pydantic
│   └── services/            # Lógica de negocio
├── frontend/                # Frontend React (Vite)
│   └── src/
│       ├── api.js           # Cliente HTTP
│       ├── AuthContext.jsx  # Contexto de autenticación
│       └── App.jsx          # App principal
├── migrations/              # Migraciones Alembic
├── tests/                   # Tests backend (pytest)
├── seed_data.py             # Script de seed
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

---

## Variables de entorno

El `docker-compose.yml` ya define lo necesario para desarrollo. Para el frontend asegúrate de crear `frontend/.env`:

```ini
VITE_API_URL=http://localhost:8000
```

Si quieres personalizar `DATABASE_URL` o el secreto JWT del backend, edita `docker-compose.yml` y vuelve a levantar con `docker compose up -d --build`.

---

## Endpoints principales

- `POST /auth/login` → devuelve `access_token`
- `GET /companies/` → lista empresas (paginado)
- `POST /companies/` → crea empresa
- `GET /requests/` → lista solicitudes (paginado)
- `POST /requests/` → crea solicitud y calcula `risk_score`

**Documentación completa**: http://localhost:8000/docs

