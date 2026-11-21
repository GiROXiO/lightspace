from collections.abc import Iterator

from neo4j import Driver, GraphDatabase, Session

from .config import settings

_driver: Driver | None = None


def init_driver() -> Driver:
  global _driver
  _driver = GraphDatabase.driver(
    settings.neo4j_uri,
    auth=(settings.neo4j_user, settings.neo4j_password),
  )
  _driver.verify_connectivity()
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