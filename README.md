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
cd pt-proveedores
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
```

Crear el archivo de variables de entorno:

```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

Iniciar el servidor de desarrollo:

```bash
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

## Comandos útiles para desarrollo

### Ver logs de los servicios

```bash
# Logs del backend
docker compose logs -f api

# Logs de la base de datos
docker compose logs -f db

# Logs de todos los servicios
docker compose logs -f
```

### Ejecutar tests

```bash
docker compose exec api pytest -v
```

### Resetear la base de datos

```bash
# Bajar todas las migraciones
docker compose exec api alembic downgrade base

# Aplicar migraciones nuevamente
docker compose exec api alembic upgrade head

# Volver a cargar datos iniciales
docker compose exec api python seed_data.py
```

### Crear nuevas migraciones

```bash
docker compose exec api alembic revision --autogenerate -m "descripción del cambio"
```

### Detener los servicios

```bash
# Detener contenedores
docker compose stop

# Detener y eliminar contenedores, redes y volúmenes
docker compose down

# Eliminar también los volúmenes de datos
docker compose down -v
```

## Estructura del proyecto

```
pt-proveedores/
├── app/                     # Backend FastAPI
│   ├── api/                 # Endpoints de la API
│   │   ├── auth.py         # Autenticación y usuarios
│   │   ├── companies.py    # CRUD de empresas
│   │   └── requests.py     # CRUD de solicitudes
│   ├── models/             # Modelos SQLAlchemy
│   │   ├── user.py         # Modelo de usuario
│   │   ├── company.py      # Modelo de empresa
│   │   └── request.py      # Modelo de solicitud
│   ├── schemas/            # Esquemas Pydantic
│   └── services/           # Lógica de negocio
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── api.js         # Cliente HTTP para API
│   │   ├── AuthContext.jsx # Contexto de autenticación
│   │   └── App.jsx        # Componente principal
│   ├── package.json
│   └── vite.config.js
├── migrations/             # Migraciones Alembic
├── tests/                  # Tests del backend
├── seed_data.py           # Script para datos iniciales
├── docker-compose.yml     # Configuración de servicios
├── Dockerfile            # Imagen del backend
├── requirements.txt      # Dependencias Python
└── README.md
```

## Variables de entorno

### Backend

Las variables están configuradas en `docker-compose.yml`:

- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para firmar tokens JWT
- `JWT_ALGORITHM`: Algoritmo de encriptación (HS256)

### Frontend

Crear el archivo `frontend/.env`:

```
VITE_API_URL=http://localhost:8000
```

## API Endpoints

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión (devuelve access_token)

### Empresas
- `GET /companies/` - Listar empresas (paginado)
- `POST /companies/` - Crear nueva empresa
- `GET /companies/{id}` - Obtener empresa por ID

### Solicitudes
- `GET /requests/` - Listar solicitudes (paginado)
- `POST /requests/` - Crear nueva solicitud
- `GET /requests/{id}` - Obtener solicitud por ID

### Paginación

Todos los listados soportan paginación:

```bash
GET /companies/?page=1&page_size=25
GET /requests/?page=2&page_size=50
```

## Solución de problemas

### Error de conexión a la base de datos

```bash
# Verificar que los contenedores estén corriendo
docker compose ps

# Reiniciar el servicio de base de datos
docker compose restart db
```

### Puerto ya en uso

```bash
# Verificar qué proceso usa el puerto
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Detener los contenedores y cambiar puertos en docker-compose.yml si es necesario
docker compose down
```

### Problemas con migraciones

```bash
# Ver el estado actual de las migraciones
docker compose exec api alembic current

# Ver historial de migraciones
docker compose exec api alembic history

# Aplicar una migración específica
docker compose exec api alembic upgrade <revision>
```

### Limpiar todo y empezar de nuevo

```bash
# Detener y eliminar todo
docker compose down -v

# Eliminar imágenes
docker rmi pt-proveedores-api

# Volver a construir
docker compose up -d --build

# Aplicar migraciones y seed
docker compose exec api alembic upgrade head
docker compose exec api python seed_data.py
```

