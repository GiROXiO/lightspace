"""Borra las imágenes subidas que ya nadie usa en el grafo."""
import asyncio
import logging
import time
from pathlib import Path

from neo4j import Driver

from .archivos import NOMBRE_SUBIDA
from .config import settings

logger = logging.getLogger("uvicorn.error")

# Todos los lugares del grafo donde se guarda la dirección de una imagen
EN_USO = """
MATCH (u:Usuario) WHERE u.foto_url IS NOT NULL RETURN u.foto_url AS url
UNION
MATCH (p:Publicacion) UNWIND coalesce(p.imagenes, []) AS url RETURN url
UNION
MATCH (c:Comentario) WHERE c.imagen_url IS NOT NULL RETURN c.imagen_url AS url
"""


def _base(nombre: str) -> str:
  return nombre.removesuffix(".webp").removesuffix("_mini")


def limpiar(driver: Driver) -> int:
  # Si la consulta falla, la excepción sale antes de borrar nada
  with driver.session(notifications_min_severity="OFF") as session:
    en_uso = {_base(r["url"].rsplit("/", 1)[-1]) for r in session.run(EN_USO)}

  # Margen para las que se acaban de subir y todavía no se han publicado
  limite = time.time() - settings.limpieza_gracia_horas * 3600
  borradas = 0
  for ruta in Path(settings.subidas_dir).iterdir():
    if not NOMBRE_SUBIDA.fullmatch(ruta.name) or _base(ruta.name) in en_uso:
      continue
    if ruta.stat().st_mtime < limite:
      ruta.unlink(missing_ok=True)
      borradas += 1
  return borradas


async def limpiar_periodicamente(driver: Driver) -> None:
  while True:
    await asyncio.sleep(settings.limpieza_cada_segundos)
    try:
      borradas = await asyncio.to_thread(limpiar, driver)
      logger.info("Limpieza de imágenes: %s archivos borrados", borradas)
    except Exception:
      logger.exception("La limpieza de imágenes falló; se reintenta en la próxima vuelta")