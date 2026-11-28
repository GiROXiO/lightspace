import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from neo4j import Session

from . import db
from .config import settings
from .logica import aplicar_logica
from .schema import aplicar_esquema

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
  driver = db.init_driver()
  total = aplicar_esquema(driver, settings.schema_path)
  logger.info("Esquema aplicado: %s sentencias", total)
  total = aplicar_logica(driver, settings.logica_path)
  logger.info("Lógica de base de datos instalada: %s objetos", total)
  yield

  db.close_driver()


app = FastAPI(
  title="Lightspace API - Usuarios",
  version="0.2.0",
  docs_url="/api/docs",
  openapi_url="/api/openapi.json",
  lifespan=lifespan,
)


@app.get("/health", tags=["Estado"])
def health(session: Session = Depends(db.get_session)):
  try:
    session.run("RETURN 1 AS ok").single()
  except Exception:
    raise HTTPException(status_code=503, detail="Base de datos no disponible")
  return {
    "estado": "ok",
    "servicio": "usuarios",
    "periodo_vigente": settings.periodo_actual,
  }