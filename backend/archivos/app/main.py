import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from neo4j import Session

from . import archivos, db
from .config import settings
from .limpieza import limpiar_periodicamente


@asynccontextmanager
async def lifespan(app: FastAPI):
  Path(settings.subidas_dir).mkdir(parents=True, exist_ok=True)
  driver = db.init_driver()
  tarea = asyncio.create_task(limpiar_periodicamente(driver))
  yield

  tarea.cancel()
  db.close_driver()


app = FastAPI(
  title="Lightspace API - Archivos",
  version="0.2.0",
  docs_url="/api/docs",
  openapi_url="/api/openapi.json",
  lifespan=lifespan,
)

app.include_router(archivos.router)


@app.get("/health", tags=["Estado"])
def health(session: Session = Depends(db.get_session)):
  try:
    session.run("RETURN 1 AS ok").single()
  except Exception:
    raise HTTPException(status_code=503, detail="Base de datos no disponible")
  return {"estado": "ok", "servicio": "archivos"}