// Procedimientos: operaciones que el backend llama con
// CALL custom.lightspace.<nombre>(...) YIELD ...





// @procedimiento write lightspace.inscribir(uid :: STRING, curso_id :: STRING, periodo :: STRING) :: (relacion :: STRING, periodo :: STRING, nrc :: STRING)
// Sin filas = no está matriculado en ese periodo (403).
// El SIGUE lo elimina el trigger excluir_sigue.
MATCH (u:Usuario {id: $uid})-[m:MATRICULADO_EN {periodo: $periodo}]->(c:Curso {id: $curso_id})
MERGE (u)-[i:INSCRITO_EN]->(c)
ON CREATE SET i.desde = datetime()
SET i.periodo = m.periodo, i.nrc = m.nrc
RETURN "INSCRITO" AS relacion, i.periodo AS periodo, i.nrc AS nrc





// @procedimiento write lightspace.unirse_grupo(uid :: STRING, publicacion_id :: STRING) :: (resultado :: STRING, estado :: STRING, total_unidos :: INTEGER, unido :: BOOLEAN)
// resultado: OK, SIN_PERMISO (403) o CERRADO (409). Sin filas = no existe (404).
// El grupo lo cierra el trigger cerrar_grupo.
MATCH (p:Publicacion {id: $publicacion_id, tipo: "BUSCA_GRUPO"})
// Bloquea la publicación: dos personas no pueden tomar el último cupo a la vez
SET p.bloqueo = true
REMOVE p.bloqueo
WITH p
MATCH (u:Usuario {id: $uid})
WITH u, p,
     EXISTS { (u)-[:SE_UNIO]->(p) } AS ya_estaba,
     EXISTS { (u)-[:INSCRITO_EN]->(:Curso)<-[:EN_CURSO]-(p) }
       AND NOT EXISTS { (u)-[:PUBLICO]->(p) } AS puede,
     COUNT { (:Usuario)-[:SE_UNIO]->(p) } AS total
WITH u, p, total,
     CASE
       WHEN ya_estaba THEN "YA"
       WHEN NOT puede THEN "SIN_PERMISO"
       WHEN p.estado = "CERRADA" OR total >= p.cupos THEN "CERRADO"
       ELSE "NUEVO"
     END AS caso
FOREACH (_ IN CASE WHEN caso = "NUEVO" THEN [1] ELSE [] END |
  MERGE (u)-[s:SE_UNIO]->(p)
  ON CREATE SET s.fecha = datetime())
RETURN CASE WHEN caso IN ["YA", "NUEVO"] THEN "OK" ELSE caso END AS resultado,
       CASE WHEN caso = "NUEVO" AND total + 1 >= p.cupos THEN "CERRADA" ELSE p.estado END AS estado,
       total + CASE WHEN caso = "NUEVO" THEN 1 ELSE 0 END AS total_unidos,
       caso IN ["YA", "NUEVO"] AS unido





// @procedimiento read lightspace.recomendar_personas(uid :: STRING, limite :: INTEGER) :: (id :: STRING, nombre :: STRING, apellido :: STRING, semestre :: INTEGER, foto_url :: STRING, programas :: LIST OF STRING, score :: FLOAT, intereses_comunes :: LIST OF STRING, cursos_comunes :: LIST OF STRING, conexiones_comunes :: INTEGER)
// Personas sin ninguna conexión ni solicitud conmigo
MATCH (u:Usuario {id: $uid}), (otro:Usuario)
WHERE otro <> u AND NOT EXISTS { (u)-[:CONECTA_CON]-(otro) }
WITH u, otro, custom.lightspace.puntaje_persona(u.id, otro.id) AS score
WHERE score > 0
ORDER BY score DESC, otro.apellido, otro.id
LIMIT $limite
RETURN otro.id AS id, otro.nombre AS nombre, otro.apellido AS apellido,
       otro.semestre AS semestre, otro.foto_url AS foto_url,
       [(otro)-[:ESTUDIA]->(p:Programa) | p.nombre] AS programas,
       score,
       [(u)-[:INTERESADO_EN]->(i:Interes)<-[:INTERESADO_EN]-(otro) | i.nombre] AS intereses_comunes,
       COLLECT {
         MATCH (u)-[:INSCRITO_EN|MATRICULADO_EN]->(c:Curso)<-[:INSCRITO_EN|MATRICULADO_EN]-(otro)
         RETURN DISTINCT c.codigo AS codigo ORDER BY codigo
       } AS cursos_comunes,
       COUNT {
         MATCH (u)-[r1:CONECTA_CON]-(x:Usuario)-[r2:CONECTA_CON]-(otro)
         WHERE r1.estado = "ACEPTADA" AND r2.estado = "ACEPTADA"
         RETURN DISTINCT x
       } AS conexiones_comunes





// @procedimiento read lightspace.recomendar_cursos(uid :: STRING, limite :: INTEGER) :: (id :: STRING, codigo :: STRING, materia :: STRING, numero :: STRING, nombre :: STRING, creditos :: INTEGER, nivel :: STRING, semestre_sugerido :: INTEGER, departamento :: STRING, portada_url :: STRING, score :: FLOAT, intereses_comunes :: LIST OF STRING, seguidores_parecidos :: INTEGER, estrellas :: INTEGER)
// Cursos de mi carrera que no tengo matriculados, inscritos ni sigo
MATCH (u:Usuario {id: $uid})-[:ESTUDIA]->(:Programa)<-[:DE_PROGRAMA]-(c:Curso)
WHERE NOT EXISTS { (u)-[:INSCRITO_EN|MATRICULADO_EN|SIGUE]->(c) }
WITH DISTINCT u, c
WITH u, c, custom.lightspace.puntaje_curso(u.id, c.id) AS score,
     COUNT { (:Usuario)-[:DA_ESTRELLA]->(c) } AS estrellas
ORDER BY score DESC, estrellas DESC, c.codigo
LIMIT $limite
RETURN c.id AS id, c.codigo AS codigo, c.materia AS materia, c.numero AS numero,
       c.nombre AS nombre, c.creditos AS creditos, c.nivel AS nivel,
       c.semestre_sugerido AS semestre_sugerido, c.departamento AS departamento,
       c.portada_url AS portada_url, score,
       [(u)-[:INTERESADO_EN]->(i:Interes)<-[:TRATA_SOBRE]-(c) | i.nombre] AS intereses_comunes,
       COUNT {
         MATCH (par:Usuario)-[:SIGUE]->(c)
         WHERE par <> u AND (
           EXISTS { (u)-[:ESTUDIA]->(:Programa)<-[:ESTUDIA]-(par) }
           OR EXISTS { (u)-[:INTERESADO_EN]->(:Interes)<-[:INTERESADO_EN]-(par) }
           OR EXISTS { (u)-[:CONECTA_CON {estado: "ACEPTADA"}]-(par) }
         )
         RETURN DISTINCT par
       } AS seguidores_parecidos,
       estrellas