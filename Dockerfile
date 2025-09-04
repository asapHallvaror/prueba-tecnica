FROM python:3.11-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /code

# Copiar dependencias y instalarlas
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del proyecto
COPY . .

# Comando por defecto
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
