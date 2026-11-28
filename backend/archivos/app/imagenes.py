"""Valida una imagen y la guarda en WebP con sus dos tamaños."""
import io
import uuid
from pathlib import Path

from PIL import Image, ImageOps

from .config import settings

FORMATOS = ["JPEG", "PNG", "WEBP"]


class ImagenInvalida(Exception):
  pass


def _abrir(datos: bytes) -> Image.Image:
  try:
    imagen = Image.open(io.BytesIO(datos), formats=FORMATOS)
    # Antes de descomprimir: una imagen pequeña en disco puede ocupar gigas en memoria
    if imagen.width * imagen.height > settings.max_pixeles:
      raise ImagenInvalida()
    imagen.load()
    # Aplica el giro que indica la cámara antes de borrar los metadatos
    imagen = ImageOps.exif_transpose(imagen)
  except (OSError, ValueError, SyntaxError, Image.DecompressionBombError):
    raise ImagenInvalida()

  con_transparencia = imagen.mode in ("RGBA", "LA") or "transparency" in imagen.info
  imagen = imagen.convert("RGBA" if con_transparencia else "RGB")
  imagen.info.clear()  # sin EXIF, GPS ni perfiles
  return imagen


def guardar(datos: bytes) -> str:
  """Devuelve el nombre del archivo grande, ej. 3f2b...c6d.webp"""
  imagen = _abrir(datos)
  carpeta = Path(settings.subidas_dir)
  base = uuid.uuid4().hex

  grande = imagen.copy()
  grande.thumbnail((settings.lado_grande, settings.lado_grande))  # nunca agranda
  grande.save(carpeta / f"{base}.webp", "WEBP", quality=85)

  lado = min(settings.lado_miniatura, imagen.width, imagen.height)
  miniatura = ImageOps.fit(imagen, (lado, lado))  # recorte al centro
  miniatura.save(carpeta / f"{base}_mini.webp", "WEBP", quality=80)

  return f"{base}.webp"