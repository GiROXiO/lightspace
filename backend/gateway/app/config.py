from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file="../../.env", extra="ignore")

  usuarios_url: str = "http://localhost:8001"
  cursos_url: str = "http://localhost:8002"
  recomendaciones_url: str = "http://localhost:8003"
  archivos_url: str = "http://localhost:8004"
  cors_origins: list[str] = ["http://localhost:5173"]
  tiempo_espera: float = 10.0

settings = Settings()