from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from neo4j import Session

from . import cursos, db
from .config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
  db.init_driver()
  yield

  db.close_driver()


app = FastAPI(
  title="Lightspace API - Cursos",
  version="0.2.0",
  docs_url="/api/docs",
  openapi_url="/api/openapi.json",
  lifespan=lifespan,
)

app.include_router(cursos.router)


@app.get("/health", tags=["Estado"])
def health(session: Session = Depends(db.get_session)):
  try:
    session.run("RETURN 1 AS ok").single()
  except Exception:
    raise HTTPException(status_code=503, detail="Base de datos no disponible")
  return {
    "estado": "ok",
    "servicio": "cursos",
    "periodo_vigente": settings.periodo_actual,
  }