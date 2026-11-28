from __future__ import annotations

import time
from neo4j import Driver, Session

TAMANO_LOTE = 500

# Cada entrada: (clave del dataset, consulta Cypher). `$rows` es el lote.
# El orden importa: primero los nodos, luego las relaciones que los usan.
CARGAS: list[tuple[str, str]] = [
    ("programas", """
        UNWIND $rows AS r
        MERGE (p:Programa {id: r.id})
        SET p.codigo = r.codigo, p.nombre = r.nombre, p.facultad = r.facultad
    """),
    ("intereses", """
        UNWIND $rows AS r
        MERGE (:Interes {nombre: r.nombre})
    """),
    ("cursos", """
        UNWIND $rows AS r
        MERGE (c:Curso {id: r.id})
        SET c.codigo = r.codigo, c.materia = r.materia, c.numero = r.numero,
            c.nombre = r.nombre, c.descripcion = r.descripcion, c.creditos = r.creditos,
            c.nivel = r.nivel, c.semestre_sugerido = r.semestre_sugerido,
            c.departamento = r.departamento, c.portada_url = r.portada_url
    """),
    ("curso_programa", """
        UNWIND $rows AS r
        MATCH (c:Curso {id: r.curso}), (p:Programa {id: r.programa})
        MERGE (c)-[:DE_PROGRAMA]->(p)
    """),
    ("curso_interes", """
        UNWIND $rows AS r
        MATCH (c:Curso {id: r.curso}), (i:Interes {nombre: r.interes})
        MERGE (c)-[:TRATA_SOBRE]->(i)
    """),
    ("usuarios", """
        UNWIND $rows AS r
        MERGE (u:Usuario {id: r.props.id})
        SET u += r.props, u.fecha_registro = datetime(r.fecha_registro)
        WITH u, r
        MATCH (p:Programa {id: r.programa})
        MERGE (u)-[:ESTUDIA]->(p)
    """),
    ("usuario_interes", """
        UNWIND $rows AS r
        MATCH (u:Usuario {id: r.usuario}), (i:Interes {nombre: r.interes})
        MERGE (u)-[:INTERESADO_EN]->(i)
    """),
    ("matriculas", """
        UNWIND $rows AS r
        MATCH (u:Usuario {id: r.usuario}), (c:Curso {id: r.curso})
        MERGE (u)-[m:MATRICULADO_EN {periodo: r.periodo}]->(c)
        SET m.nrc = r.nrc
    """),
    ("inscripciones", """
        UNWIND $rows AS r
        MATCH (u:Usuario {id: r.usuario}), (c:Curso {id: r.curso})
        MERGE (u)-[x:INSCRITO_EN]->(c)
        SET x.desde = datetime(r.desde), x.periodo = r.periodo, x.nrc = r.nrc
    """),
    ("sigue", """
        UNWIND $rows AS r
        MATCH (u:Usuario {id: r.usuario}), (c:Curso {id: r.curso})
        MERGE (u)-[x:SIGUE]->(c)
        SET x.desde = datetime(r.desde)
    """),
    ("estrellas", """
        UNWIND $rows AS r
        MATCH (u:Usuario {id: r.usuario}), (c:Curso {id: r.curso})
        MERGE (u)-[x:DA_ESTRELLA]->(c)
        SET x.fecha = datetime(r.fecha)
    """),
    ("conexiones", """
        UNWIND $rows AS r
        MATCH (a:Usuario {id: r.origen}), (b:Usuario {id: r.destino})
        MERGE (a)-[x:CONECTA_CON]->(b)
        SET x.estado = r.estado, x.desde = datetime(r.desde)
    """),
    ("publicaciones", """
        UNWIND $rows AS r
        MERGE (p:Publicacion {id: r.props.id})
        SET p += r.props, p.fecha = datetime(r.props.fecha)
        WITH p, r
        MATCH (u:Usuario {id: r.autor})
        MERGE (u)-[:PUBLICO]->(p)
    """),
    ("publicacion_curso", """
        UNWIND $rows AS r
        MATCH (p:Publicacion {id: r.publicacion}), (c:Curso {id: r.curso})
        MERGE (p)-[:EN_CURSO]->(c)
    """),
    ("comentarios", """
        UNWIND $rows AS r
        MERGE (c:Comentario {id: r.id})
        SET c.contenido = r.contenido, c.fecha = datetime(r.fecha)
        WITH c, r
        MATCH (u:Usuario {id: r.autor}), (p:Publicacion {id: r.publicacion})
        MERGE (u)-[:ESCRIBIO]->(c)
        MERGE (c)-[:COMENTA_EN]->(p)
    """),
    ("likes", """
        UNWIND $rows AS r
        MATCH (u:Usuario {id: r.usuario}), (p:Publicacion {id: r.publicacion})
        MERGE (u)-[x:LE_GUSTA]->(p)
        SET x.fecha = datetime(r.fecha)
    """),
    ("uniones", """
        UNWIND $rows AS r
        MATCH (u:Usuario {id: r.usuario}), (p:Publicacion {id: r.publicacion})
        MERGE (u)-[x:SE_UNIO]->(p)
        SET x.fecha = datetime(r.fecha)
    """),
    ("notificaciones", """
        UNWIND $rows AS r
        MERGE (n:Notificacion {id: r.id})
        SET n.tipo = r.tipo, n.mensaje = r.mensaje, n.leida = r.leida,
            n.fecha = datetime(r.fecha)
        WITH n, r
        MATCH (d:Usuario {id: r.destinatario}), (o:Usuario {id: r.origen})
        MERGE (d)-[:RECIBIO]->(n)
        MERGE (n)-[:ORIGEN]->(o)
    """),
    ("notificacion_publicacion", """
        UNWIND $rows AS r
        MATCH (n:Notificacion {id: r.notificacion}), (p:Publicacion {id: r.publicacion})
        MERGE (n)-[:SOBRE]->(p)
    """),
]


def borrar_todo(session: Session) -> None:
    """Elimina todos los nodos y relaciones. Las restricciones e índices se conservan."""
    session.run("MATCH (n) DETACH DELETE n").consume()


def pausar_triggers(driver: Driver, pausar: bool) -> None:
    """El seed trae sus propias notificaciones: con los triggers activos saldrían dobles."""
    accion = "stop" if pausar else "start"
    with driver.session(database="system") as session:
        nombres = [r["name"] for r in session.run("CALL apoc.trigger.show('neo4j')")]
        for nombre in nombres:
            session.run(f"CALL apoc.trigger.{accion}('neo4j', $nombre)", nombre=nombre).consume()
    if nombres:
        time.sleep(2)  # APOC tarda un momento en aplicar el cambio


def cargar(session: Session, ds: dict[str, list[dict]]) -> None:
    for clave, consulta in CARGAS:
        filas = ds[clave]
        for i in range(0, len(filas), TAMANO_LOTE):
            session.run(consulta, rows=filas[i:i + TAMANO_LOTE]).consume()
        print(f"  {clave:<26}{len(filas):>6}", flush=True)


def estadisticas(session: Session) -> tuple[dict[str, int], dict[str, int]]:
    nodos = session.run(
        "MATCH (n) UNWIND labels(n) AS etiqueta "
        "RETURN etiqueta, count(*) AS total ORDER BY etiqueta"
    )
    relaciones = session.run(
        "MATCH ()-[r]->() RETURN type(r) AS tipo, count(*) AS total ORDER BY tipo"
    )
    return (
        {r["etiqueta"]: r["total"] for r in nodos},
        {r["tipo"]: r["total"] for r in relaciones},
    )
