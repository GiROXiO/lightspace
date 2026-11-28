from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file="../../.env", extra="ignore")

  neo4j_uri: str = "bolt://localhost:7687"
  neo4j_user: str = "neo4j"
  neo4j_password: str = Field(min_length=8)
  jwt_secret: str = Field(min_length=32)
  jwt_algoritmo: str = "HS256"

  subidas_dir: str = "datos/subidas"
  portadas_dir: str = "datos/portadas"
  max_bytes: int = 10 * 1024 * 1024
  max_pixeles: int = 50_000_000
  lado_grande: int = 1080
  lado_miniatura: int = 320
  limpieza_cada_segundos: int = 3600
  limpieza_gracia_horas: float = 24

settings = Settings()