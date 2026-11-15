import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from neo4j import Session

from . import db
from .config import settings
from .schema import aplicar_esquema

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
  driver = db.init_driver()
  total = aplicar_esquema(driver, settings.schema_path)
  logger.info("Esquema aplicado: %s sentencias", total)
  yield
  
  db.close_driver()


app = FastAPI(
  title="Lightspace API",
  version="0.1.1",
  docs_url="/api/docs",
  openapi_url="/api/openapi.json",
  lifespan=lifespan,
)


@app.get("/api/health", tags=["Estado"])
def health(session: Session = Depends(db.get_session)):
  try:
    session.run("RETURN 1 AS ok").single()
  except Exception:
    raise HTTPException(status_code=503, detail="Base de datos no disponible")
  return {
    "estado": "ok",
    "base_de_datos": "conectada",
    "periodo_vigente": settings.periodo_actual,
  }