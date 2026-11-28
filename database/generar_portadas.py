"""Dibuja una portada por materia en database/portadas (solo se corre si cambian).

Desde la raíz del repo (en Git Bash, anteponer MSYS_NO_PATHCONV=1):
  docker compose run --rm --no-deps -v ./database:/database archivos sh -c 'cd /database && python generar_portadas.py'
"""
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from seed.catalogo import DEPARTAMENTOS

ANCHO, ALTO = 1200, 400
AMARILLO = (255, 209, 0)
# Pares de colores del degradado (rojos de la universidad, negro y gris oscuro)
FONDOS = [
    ((228, 58, 21), (142, 15, 8)),
    ((142, 15, 8), (66, 8, 5)),
    ((43, 43, 43), (17, 17, 17)),
    ((196, 45, 14), (43, 12, 8)),
]


def degradado(inicio, fin) -> Image.Image:
    mascara = Image.linear_gradient("L").rotate(90).resize((ANCHO, ALTO))
    return Image.composite(Image.new("RGB", (ANCHO, ALTO), fin), Image.new("RGB", (ANCHO, ALTO), inicio), mascara)


def portada(materia: str, indice: int) -> Image.Image:
    azar = random.Random(materia)  # misma materia, mismo dibujo
    imagen = degradado(*FONDOS[indice % len(FONDOS)]).convert("RGBA")

    capa = Image.new("RGBA", imagen.size, (0, 0, 0, 0))
    dibujo = ImageDraw.Draw(capa)
    for _ in range(7):
        x, y, radio = azar.randint(500, ANCHO), azar.randint(0, ALTO), azar.randint(60, 220)
        caja = (x - radio, y - radio, x + radio, y + radio)
        if azar.random() < 0.5:
            dibujo.ellipse(caja, fill=(255, 255, 255, azar.randint(12, 30)))
        else:
            dibujo.ellipse(caja, outline=(255, 255, 255, 60), width=azar.randint(3, 10))
    imagen = Image.alpha_composite(imagen, capa)

    dibujo = ImageDraw.Draw(imagen)
    dibujo.text((60, 290), materia, font=ImageFont.load_default(size=150), fill="white", anchor="ls")
    dibujo.rectangle((64, 320, 224, 332), fill=AMARILLO)
    return imagen.convert("RGB")


def main() -> None:
    carpeta = Path(__file__).parent / "portadas"
    carpeta.mkdir(exist_ok=True)
    for indice, materia in enumerate(DEPARTAMENTOS):
        portada(materia, indice).save(carpeta / f"{materia}.webp", "WEBP", quality=85)
    print(f"{len(DEPARTAMENTOS)} portadas en {carpeta}")


if __name__ == "__main__":
    main()