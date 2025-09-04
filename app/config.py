import os

class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://appuser:apppass@db:5432/appdb"
    )
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecret")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")

settings = Settings()
