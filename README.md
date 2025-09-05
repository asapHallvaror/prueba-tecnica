# Sistema de Evaluación de Proveedores

Aplicación completa para la evaluación de riesgo de proveedores con backend en FastAPI y frontend en React.

## Tecnologías

- Backend: FastAPI + SQLAlchemy 2.0 + PostgreSQL
- Frontend: React 18 + Vite
- Autenticación: JWT (JSON Web Tokens)
- Base de datos: PostgreSQL con migraciones Alembic
- Contenedores: Docker + Docker Compose
- Tests: pytest

## Requisitos del sistema

- Docker
- Docker Compose

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone <URL-DEL-REPOSITORIO>
cd prueba-tecnica
```

### 2. Construir y levantar los servicios

```bash
docker compose up -d --build
```

Este comando construirá las imágenes y levantará dos servicios:
- `api`: Backend FastAPI en el puerto 8000
- `db`: Base de datos PostgreSQL en el puerto 5432

### 3. Ejecutar las migraciones de base de datos

```bash
docker compose exec api alembic upgrade head
```

### 4. Cargar datos iniciales

El proyecto incluye un script `seed_data.py` que crea datos de prueba:

```bash
docker compose exec api python seed_data.py
```

Esto creará:
- Usuario administrador: `admin@example.com` / `Admin123!`
- 4 empresas de ejemplo (Acme SpA, Globex Ltd., Initech, Hooli)
- 6 solicitudes de evaluación con diferentes estados y puntajes de riesgo

### 5. Configurar el frontend

```bash
cd frontend
npm install
echo VITE_API_URL=http://localhost:8000> .env
npm run dev
```

## Acceso a la aplicación

Una vez completados todos los pasos:

- Frontend: http://localhost:5173
- API Backend: http://localhost:8000
- Documentación API (Swagger): http://localhost:8000/docs

### Credenciales de acceso

- Email: `admin@example.com`
- Contraseña: `Admin123!`

## Funcionalidades principales

### Autenticación
- Sistema de login con JWT
- Roles de usuario (admin, user)
- Persistencia de sesión

### Gestión de empresas
- Crear empresas con nombre, RUT/tax_id y país
- Listar todas las empresas registradas
- Validación de datos de entrada

### Solicitudes de evaluación
- Crear solicitudes asociadas a empresas
- Cálculo automático de puntaje de riesgo basado en:
  - PEP flag (Persona Expuesta Políticamente): +60 puntos
  - Lista de sanciones: +40 puntos
  - Pagos tardíos: +10 puntos cada uno (máximo 3)
- Estados de solicitud: pendiente, aprobada, rechazada
- Tabla con funciones de búsqueda, filtros y paginación

## Ejecutar tests

Para ejecutar las pruebas del backend con pytest:

```bash
docker compose exec api pytest -v
```

Este comando ejecutará todas las pruebas unitarias del proyecto, incluyendo:
- Tests de autenticación
- Tests de endpoints de empresas
- Tests de endpoints de solicitudes
- Tests del cálculo de riesgo

## Comandos útiles

### Ver logs de los servicios
```bash
# Logs del backend
docker compose logs api

# Logs de la base de datos
docker compose logs db

# Logs en tiempo real
docker compose logs -f
```

### Reiniciar la base de datos
```bash
docker compose down
docker volume rm pt-proveedores_postgres_data
docker compose up -d --build
docker compose exec api alembic upgrade head
docker compose exec api python seed_data.py
```

### Detener los servicios
```bash
docker compose down
```


