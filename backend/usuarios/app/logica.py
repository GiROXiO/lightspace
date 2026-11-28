"""Instala los triggers, funciones, procedimientos y vistas de database/logica.

Cada objeto empieza con un comentario `// @tipo ...` y dura hasta el siguiente.
APOC los instala desde la base `system`; reinstalar sobrescribe, así que es seguro
hacerlo en cada arranque.
"""
import time
from pathlib import Path

from neo4j import Driver

BASE = "neo4j"
# Las funciones van primero porque los procedimientos las usan
ARCHIVOS = ["funciones.cypher", "procedimientos.cypher", "vistas.cypher", "triggers.cypher"]


def leer_objetos(texto: str) -> list[tuple[str, str, str]]:
  """Devuelve (tipo, cabecera, sentencia) de cada bloque `// @`."""
  objetos = []
  for bloque in ("\n" + texto).split("\n// @")[1:]:
    primera, _, sentencia = bloque.partition("\n")
    tipo, _, cabecera = primera.strip().partition(" ")
    objetos.append((tipo, cabecera.strip(), sentencia.strip()))
  return objetos


def _instalar(session, tipo: str, cabecera: str, sentencia: str) -> None:
  if tipo == "trigger":
    consulta = "CALL apoc.trigger.install($base, $firma, $sentencia, {phase: 'before'})"
  elif tipo == "funcion":
    consulta = "CALL apoc.custom.installFunction($firma, $sentencia, $base, true)"
  elif tipo in ("procedimiento", "vista"):
    consulta = "CALL apoc.custom.installProcedure($firma, $sentencia, $base, $modo)"
  else:
    raise ValueError(f"Tipo desconocido en database/logica: {tipo}")

  modo, firma = "read", cabecera
  if tipo == "procedimiento":
    modo, _, firma = cabecera.partition(" ")
  session.run(consulta, base=BASE, firma=firma, sentencia=sentencia, modo=modo).consume()


def aplicar_logica(driver: Driver, carpeta: Path) -> int:
  total = 0
  with driver.session(database="system") as session:
    for archivo in ARCHIVOS:
      for objeto in leer_objetos((carpeta / archivo).read_text(encoding="utf-8")):
        _instalar(session, *objeto)
        total += 1
      if archivo == "funciones.cypher":
        time.sleep(2)  # APOC tarda un momento en registrarlas
  return total