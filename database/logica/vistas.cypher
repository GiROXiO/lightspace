// Vistas: consultas fijas de solo lectura. No guardan datos.
// CALL custom.lightspace.vista_<nombre>(...) YIELD ...





// @vista lightspace.vista_perfil(uid :: STRING) :: (usuario :: MAP, programa :: MAP, intereses :: LIST OF STRING)
MATCH (u:Usuario {id: $uid})-[:ESTUDIA]->(p:Programa)
RETURN u {.id, .nombre, .apellido, .email, .codigo, .semestre, .bio, .fecha_registro, .foto_url} AS usuario,
       p {.id, .codigo, .nombre, .facultad} AS programa,
       [(u)-[:INTERESADO_EN]->(i:Interes) | i.nombre] AS intereses





// @vista lightspace.vista_mis_cursos(uid :: STRING, periodo :: STRING) :: (curso :: MAP)
// Matriculados en el periodo, inscritos o seguidos
MATCH (u:Usuario {id: $uid})-[r:MATRICULADO_EN|INSCRITO_EN|SIGUE]->(c:Curso)
WHERE type(r) <> "MATRICULADO_EN" OR r.periodo = $periodo
WITH DISTINCT u, c
ORDER BY c.codigo
RETURN c {
  .id, .codigo, .materia, .numero, .nombre, .creditos, .nivel, .semestre_sugerido,
  .departamento, .portada_url,
  programas: [(c)-[:DE_PROGRAMA]->(p:Programa) | p.codigo],
  intereses: [(c)-[:TRATA_SOBRE]->(i:Interes) | i.nombre],
  matriculado: EXISTS { (u)-[:MATRICULADO_EN {periodo: $periodo}]->(c) },
  relacion: CASE
    WHEN EXISTS { (u)-[:INSCRITO_EN]->(c) } THEN "INSCRITO"
    WHEN EXISTS { (u)-[:SIGUE]->(c) } THEN "SIGUE"
    ELSE null
  END,
  matricula: head([(u)-[m:MATRICULADO_EN {periodo: $periodo}]->(c) | m {.periodo, .nrc}])
} AS curso





// @vista lightspace.vista_feed(uid :: STRING, pagina :: INTEGER, tamano :: INTEGER) :: (publicacion :: MAP)
// Publicaciones generales mías y de mis conexiones aceptadas
MATCH (yo:Usuario {id: $uid})
MATCH (autor:Usuario)-[:PUBLICO]->(p:Publicacion {tipo: "GENERAL"})
WHERE autor = yo OR EXISTS { (yo)-[:CONECTA_CON {estado: "ACEPTADA"}]-(autor) }
WITH yo, autor, p
ORDER BY p.fecha DESC, p.id
SKIP ($pagina - 1) * $tamano
LIMIT $tamano
RETURN p {
  .id, .tipo, .contenido, .fecha, .enlace, .actividad, .cupos, .estado,
  imagenes: coalesce(p.imagenes, []),
  autor: autor {
    .id, .nombre, .apellido, .semestre, .foto_url,
    programa: head([(autor)-[:ESTUDIA]->(pr:Programa) | pr {.codigo, .nombre}])
  },
  curso: null,
  total_likes: COUNT { (:Usuario)-[:LE_GUSTA]->(p) },
  total_comentarios: COUNT { (:Comentario)-[:COMENTA_EN]->(p) },
  me_gusta: EXISTS { (yo)-[:LE_GUSTA]->(p) },
  total_unidos: null,
  unido: null
} AS publicacion





// @vista lightspace.vista_muro_curso(curso_id :: STRING, uid :: STRING, tipo :: STRING, pagina :: INTEGER, tamano :: INTEGER) :: (publicacion :: MAP)
// tipo vacío o null = todas
MATCH (yo:Usuario {id: $uid})
MATCH (autor:Usuario)-[:PUBLICO]->(p:Publicacion)-[:EN_CURSO]->(c:Curso {id: $curso_id})
WHERE coalesce($tipo, "") = "" OR p.tipo = $tipo
WITH yo, autor, p, c
ORDER BY p.fecha DESC, p.id
SKIP ($pagina - 1) * $tamano
LIMIT $tamano
RETURN p {
  .id, .tipo, .contenido, .fecha, .enlace, .actividad, .cupos, .estado,
  imagenes: coalesce(p.imagenes, []),
  autor: autor {
    .id, .nombre, .apellido, .semestre, .foto_url,
    programa: head([(autor)-[:ESTUDIA]->(pr:Programa) | pr {.codigo, .nombre}])
  },
  curso: c {.id, .codigo, .nombre},
  total_likes: COUNT { (:Usuario)-[:LE_GUSTA]->(p) },
  total_comentarios: COUNT { (:Comentario)-[:COMENTA_EN]->(p) },
  me_gusta: EXISTS { (yo)-[:LE_GUSTA]->(p) },
  total_unidos: CASE WHEN p.tipo = "BUSCA_GRUPO" THEN COUNT { (:Usuario)-[:SE_UNIO]->(p) } ELSE null END,
  unido: CASE WHEN p.tipo = "BUSCA_GRUPO" THEN EXISTS { (yo)-[:SE_UNIO]->(p) } ELSE null END
} AS publicacion





// @vista lightspace.vista_notificaciones_pendientes(uid :: STRING) :: (notificacion :: MAP)
MATCH (:Usuario {id: $uid})-[:RECIBIO]->(n:Notificacion {leida: false})
OPTIONAL MATCH (n)-[:ORIGEN]->(o:Usuario)
OPTIONAL MATCH (n)-[:SOBRE]->(p:Publicacion)
WITH n, o, p
ORDER BY n.fecha DESC, n.id
RETURN n {
  .id, .tipo, .mensaje, .leida, .fecha,
  origen: o {.id, .nombre, .apellido, .foto_url},
  publicacion_id: p.id
} AS notificacion