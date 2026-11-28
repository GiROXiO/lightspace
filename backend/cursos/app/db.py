import time
from collections.abc import Iterator

from neo4j import Driver, GraphDatabase, Session
from neo4j.exceptions import ServiceUnavailable

from .config import settings

_driver: Driver | None = None


def init_driver(intentos: int = 60) -> Driver:
  global _driver
  _driver = GraphDatabase.driver(
    settings.neo4j_uri,
    auth=(settings.neo4j_user, settings.neo4j_password),
  )
  # Tras reiniciar el equipo, Neo4j puede tardar más que el servicio en arrancar
  for intento in range(1, intentos + 1):
    try:
      _driver.verify_connectivity()
      break
    except ServiceUnavailable:
      if intento == intentos:
        raise
      time.sleep(2)
  return _driver


def close_driver() -> None:
  global _driver
  if _driver is not None:
    _driver.close()
    _driver = None


def get_session() -> Iterator[Session]:
  if _driver is None:
    raise RuntimeError("El driver de Neo4j no esta inicializado")
  with _driver.session() as session:
    yield session