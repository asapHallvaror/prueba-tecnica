# Sistema de Evaluación de Proveedores

Este proyecto implementa una aplicación completa para la evaluación de riesgo de proveedores, con backend en FastAPI y frontend en React.

## 🏗️ Arquitectura del Proyecto

- **Backend**: FastAPI + SQLAlchemy 2.0 + PostgreSQL
- **Frontend**: React 18 + Vite
- **Autenticación**: JWT (JSON Web Tokens)
- **Base de Datos**: PostgreSQL con migraciones Alembic
- **Containerización**: Docker + Docker Compose
- **Testing**: pytest para backend

## Requisitos del Sistema

- **Docker** y **Docker Compose** (recomendado)
- O alternativamente:
  - Python 3.9+
  - Node.js 18+
  - PostgreSQL 13+

## Instalación y Configuración

### Opción 1: Con Docker (Recomendado)

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd pt-proveedores
```

2. **Levantar los servicios**
```bash
docker-compose up -d
```

3. **Ejecutar migraciones**
```bash
docker-compose exec api alembic upgrade head
```

4. **Crear usuario administrador inicial**
```bash
docker-compose exec api python -c "
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRole
from passlib.context import CryptContext
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
db = next(get_db())

# Verificar si ya existe un admin
existing_admin = db.query(User).filter(User.role == UserRole.admin).first()
if not existing_admin:
    admin_user = User(
        email='admin@test.com',
        hashed_password=pwd_context.hash('admin123'),
        role=UserRole.admin
    )
    db.add(admin_user)
    db.commit()
    print('Usuario admin creado: admin@test.com / admin123')
else:
    print('Usuario admin ya existe')
"
```

5. **Configurar el frontend**
```bash
cd frontend
npm install
```

6. **Crear archivo de variables de entorno para el frontend**
```bash
# En la carpeta frontend, crear archivo .env
echo "VITE_API_URL=http://localhost:8000" > .env
```

7. **Iniciar el frontend**
```bash
npm run dev
```

### Opción 2: Instalación Manual

#### Backend

1. **Instalar dependencias de Python**
```bash
pip install -r requirements.txt
```

2. **Configurar variables de entorno**
```bash
export DATABASE_URL="postgresql+psycopg2://appuser:apppass@localhost:5432/appdb"
export JWT_SECRET="supersecret"
export JWT_ALGORITHM="HS256"
```

3. **Configurar PostgreSQL**
```bash
# Crear base de datos
createdb appdb
```

4. **Ejecutar migraciones**
```bash
alembic upgrade head
```

5. **Iniciar el servidor**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

1. **Instalar dependencias**
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno**
```bash
# Crear archivo .env en la carpeta frontend
echo "VITE_API_URL=http://localhost:8000" > .env
```

3. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

## 🔧 Variables de Entorno

### Backend
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql+psycopg2://appuser:apppass@db:5432/appdb` |
| `JWT_SECRET` | Clave secreta para JWT | `supersecret` |
| `JWT_ALGORITHM` | Algoritmo de encriptación JWT | `HS256` |

### Frontend
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_URL` | URL del backend API | `http://localhost:8000` |

## 🗄️ Base de Datos y Migraciones

### Ejecutar migraciones
```bash
# Con Docker
docker-compose exec api alembic upgrade head

# Sin Docker
alembic upgrade head
```

### Crear nueva migración
```bash
# Con Docker
docker-compose exec api alembic revision --autogenerate -m "descripción del cambio"

# Sin Docker
alembic revision --autogenerate -m "descripción del cambio"
```

### Rollback de migración
```bash
# Con Docker
docker-compose exec api alembic downgrade -1

# Sin Docker
alembic downgrade -1
```

## Datos Iniciales (Seed)

### Usuario Administrador
El sistema requiere un usuario administrador para funcionar. Puedes crearlo de las siguientes maneras:

**Opción 1: Script automático (ya incluido en las instrucciones de Docker)**

**Opción 2: Manualmente a través de la API**
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Opción 3: A través del frontend**
1. Ve a `http://localhost:5173`
2. Usa las credenciales: `admin@test.com` / `admin123`

### Datos de Prueba
Una vez que tengas acceso al sistema, puedes crear empresas y solicitudes de evaluación a través del frontend.

## 🧪 Testing

### Ejecutar tests del backend
```bash
# Con Docker
docker-compose exec api pytest

# Sin Docker
pytest
```

### Ejecutar tests con coverage
```bash
# Con Docker
docker-compose exec api pytest --cov=app

# Sin Docker
pytest --cov=app
```

## Uso de la Aplicación

### Acceso
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

### Credenciales por defecto
- **Email**: admin@test.com
- **Password**: admin123

### Funcionalidades Principales

1. **Autenticación JWT**
   - Login/logout de usuarios
   - Roles: admin y user

2. **Gestión de Empresas**
   - Crear empresas con nombre, RUT y país
   - Listar todas las empresas

3. **Solicitudes de Evaluación**
   - Crear solicitudes asociadas a empresas
   - Cálculo automático de riesgo basado en:
     - PEP flag (+60 puntos)
     - Lista de sanciones (+40 puntos)
     - Pagos tardíos (+10 puntos cada uno, máximo +30)
   - Tabla con búsqueda, filtros y paginación

## 🔍 Estructura del Proyecto

```
pt-proveedores/
├── app/                    # Backend FastAPI
│   ├── api/               # Endpoints de la API
│   ├── models/            # Modelos SQLAlchemy
│   ├── schemas/           # Esquemas Pydantic
│   └── services/          # Lógica de negocio
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── api.js        # Cliente API
│   │   └── AuthContext.jsx # Contexto de autenticación
├── migrations/            # Migraciones Alembic
├── tests/                # Tests del backend
├── docker-compose.yml    # Configuración Docker
└── requirements.txt      # Dependencias Python
```

## Troubleshooting

### Puerto ya en uso
```bash
# Verificar qué proceso usa el puerto
lsof -i :8000  # Backend
lsof -i :5173  # Frontend

# Matar proceso si es necesario
kill -9 <PID>
```

### Problemas de base de datos
```bash
# Reiniciar contenedor de base de datos
docker-compose restart db

# Ver logs de la base de datos
docker-compose logs db
```

### Problemas de CORS
Verifica que el frontend esté corriendo en `http://localhost:5173` o actualiza la configuración de CORS en `app/main.py`.

## Notas de Desarrollo

- El backend incluye validación automática con Pydantic
- El frontend usa Context API para manejo de estado de autenticación
- Las migraciones se ejecutan automáticamente en el contenedor
- Los tests cubren los endpoints principales y la lógica de cálculo de riesgo
