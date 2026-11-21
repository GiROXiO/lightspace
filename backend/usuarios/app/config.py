from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_carpetas = Path(__file__).resolve().parents
RAIZ = _carpetas[min(3, len(_carpetas) - 1)]


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file="../../.env", extra="ignore")

  neo4j_uri: str = "bolt://localhost:7687"
  neo4j_user: str = "neo4j"
  neo4j_password: str = Field(min_length=8)
  jwt_secret: str = Field(min_length=32)
  jwt_algoritmo: str = "HS256"
  jwt_horas: int = 24
  schema_path: Path = RAIZ / "database" / "schema.cypher"
  periodo_actual: str = "202630"

settings = Settings()