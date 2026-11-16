from __future__ import annotations

import argparse
import os
import sys
import time

from . import catalogo as cat
from .generador import generar, resumen


def main() -> int:
    ap = argparse.ArgumentParser(description="Seed de datos de Lightspace")
    ap.add_argument("--usuarios", type=int, default=120)
    ap.add_argument("--semilla", type=int, default=42)
    ap.add_argument("--reset", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if args.dry_run:
        print(resumen(generar(args.usuarios, args.semilla)))
        print("Reglas del modelo: OK")
        return 0

    # Imports tardíos: el dry-run no necesita el driver ni la librería de hash
    from neo4j import GraphDatabase
    from pwdlib import PasswordHash

    from . import cargador

    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    usuario = os.getenv("NEO4J_USER", "neo4j")
    clave = os.getenv("NEO4J_PASSWORD")
    if not clave:
        print("Falta NEO4J_PASSWORD en el entorno", file=sys.stderr)
        return 1

    print("Calculando el hash de la contraseña demo…", flush=True)
    password_hash = PasswordHash.recommended().hash(cat.PASSWORD_DEMO)

    print(f"Generando datos ({args.usuarios} usuarios, semilla {args.semilla})…", flush=True)
    ds = generar(args.usuarios, args.semilla, password_hash)

    driver = GraphDatabase.driver(uri, auth=(usuario, clave))
    for intento in range(1, 31):
        try:
            driver.verify_connectivity()
            break
        except Exception as exc:  # noqa: BLE001
            print(f"Esperando a Neo4j ({intento}/30): {exc}", flush=True)
            time.sleep(2)
    else:
        print("No fue posible conectar con Neo4j", file=sys.stderr)
        return 1

    with driver.session() as session:
        if args.reset:
            print("--reset: borrando todo el grafo…", flush=True)
            cargador.borrar_todo(session)
        print("Cargando datos:", flush=True)
        cargador.cargar(session, ds)
        nodos, relaciones = cargador.estadisticas(session)
    driver.close()

    print("\nNodos en la base:")
    for etiqueta, total in nodos.items():
        print(f"  {etiqueta:<16}{total:>6}")
    print("Relaciones en la base:")
    for tipo, total in relaciones.items():
        print(f"  {tipo:<16}{total:>6}")

    print(f"\nCuentas demo (contraseña: {cat.PASSWORD_DEMO}):")
    for d in cat.DEMOS:
        print(f"  {d['email']}@{cat.DOMINIO_EMAIL}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
