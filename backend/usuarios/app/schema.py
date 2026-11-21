from pathlib import Path

from neo4j import Driver


def aplicar_esquema(driver: Driver, ruta: Path) -> int:
  texto = ruta.read_text(encoding="utf-8")
  lineas = [l for l in texto.splitlines() if not l.strip().startswith("//")]
  sentencias = [s.strip() for s in "\n".join(lineas).split(";") if s.strip()]
  
  with driver.session() as session:
    for sentencia in sentencias:
      session.run(sentencia).consume()
      
  return len(sentencias)