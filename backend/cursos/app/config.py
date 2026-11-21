from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
  model_config = SettingsConfigDict(env_file="../../.env", extra="ignore")

  neo4j_uri: str = "bolt://localhost:7687"
  neo4j_user: str = "neo4j"
  neo4j_password: str = Field(min_length=8)
  jwt_secret: str = Field(min_length=32)
  jwt_algoritmo: str = "HS256"
  periodo_actual: str = "202630"

settings = Settings()