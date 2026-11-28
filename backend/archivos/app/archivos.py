import re
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from . import imagenes
from .config import settings
from .seguridad import get_usuario_actual

router = APIRouter(prefix="/api/archivos", tags=["Archivos"])

# Solo se aceptan estos nombres: así nadie puede pedir rutas como ../../algo
NOMBRE_SUBIDA = re.compile(r"[0-9a-f]{32}(_mini)?\.webp")
NOMBRE_PORTADA = re.compile(r"[A-Za-z0-9_-]+\.webp")


# Es `def` y no `async def` para que procesar la imagen no bloquee el servicio
@router.post("", status_code=201)
def subir(archivo: UploadFile = File(...), usuario: dict = Depends(get_usuario_actual)):
  datos = archivo.file.read(settings.max_bytes + 1)
  if len(datos) > settings.max_bytes:
    raise HTTPException(status_code=413, detail="La imagen supera los 10 MB")
  try:
    nombre = imagenes.guardar(datos)
  except imagenes.ImagenInvalida:
    raise HTTPException(status_code=400, detail="El archivo no es una imagen JPG, PNG o WebP válida")
  url = f"/api/archivos/{nombre}"
  return {"url": url, "url_miniatura": url.replace(".webp", "_mini.webp")}


def _enviar(carpeta: str, nombre: str, patron: re.Pattern, cache: str) -> FileResponse:
  ruta = Path(carpeta) / nombre
  if not patron.fullmatch(nombre) or not ruta.is_file():
    raise HTTPException(status_code=404, detail="La imagen no existe")
  return FileResponse(ruta, media_type="image/webp", headers={"Cache-Control": cache})


@router.get("/portadas/{nombre}")
def portada(nombre: str):
  return _enviar(settings.portadas_dir, nombre, NOMBRE_PORTADA, "public, max-age=86400")


@router.get("/{nombre}")
def imagen(nombre: str):
  # El nombre nunca se reutiliza, así que el navegador puede guardarla para siempre
  return _enviar(settings.subidas_dir, nombre, NOMBRE_SUBIDA, "public, max-age=31536000, immutable")