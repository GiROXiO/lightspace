from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

RAIZ = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file="../.env", extra="ignore")
  
  neo4j_uri: str = "bolt://localhost:7687"
  neo4j_user: str = "neo4j"
  neo4j_password: str
  schema_path: Path = RAIZ / "database" / "schema.cypher"
  periodo_actual: str = "202630"

settings = Settings()