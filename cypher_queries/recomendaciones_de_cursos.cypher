// Recomienda cursos del programa del usuario ponderando intereses, seguidores similares y estrellas.

MATCH (u:Usuario {id: $uid})-[:ESTUDIA]->(p:Programa)<-[:DE_PROGRAMA]-(c:Curso)
WHERE NOT (u)-[:INSCRITO_EN|MATRICULADO_EN|SIGUE]->(c)
WITH DISTINCT u, c, collect(DISTINCT p.nombre) AS programasCurso

OPTIONAL MATCH (u)-[:INTERESADO_EN]->(i:Interes)<-[:TRATA_SOBRE]-(c)
WITH u, c, programasCurso, collect(DISTINCT i.nombre) AS interesesComunes

OPTIONAL MATCH (c)-[:TRATA_SOBRE]->(tema:Interes)
WITH u, c, programasCurso, interesesComunes, count(DISTINCT tema) AS totalTemas

OPTIONAL MATCH (par:Usuario)-[:SIGUE]->(c)
WHERE par.id <> u.id
  AND (
    (u)-[:ESTUDIA]->(:Programa)<-[:ESTUDIA]-(par)
    OR (u)-[:INTERESADO_EN]->(:Interes)<-[:INTERESADO_EN]-(par)
    OR EXISTS {
      MATCH (u)-[r:CONECTA_CON]-(par)
      WHERE r.estado = 'ACEPTADA'
    }
  )
WITH c, programasCurso, interesesComunes, totalTemas, count(DISTINCT par) AS seguidoresParecidos

OPTIONAL MATCH (estUser:Usuario)-[:DA_ESTRELLA]->(c)
WITH c, programasCurso, interesesComunes, totalTemas, seguidoresParecidos, count(DISTINCT estUser) AS estrellas

WITH c, programasCurso, interesesComunes, seguidoresParecidos, estrellas,
     CASE WHEN totalTemas > 0 THEN toFloat(size(interesesComunes)) / totalTemas ELSE 0.0 END AS simIntereses,
     toFloat(seguidoresParecidos) / (seguidoresParecidos + 5.0) AS simSeguidores,
     toFloat(estrellas) / (estrellas + 10.0) AS simEstrellas

WITH c, programasCurso, interesesComunes, seguidoresParecidos, estrellas,
     (0.45 * simIntereses + 0.35 * simSeguidores + 0.20 * simEstrellas) AS score
RETURN c.id AS id,
       c.codigo AS codigo,
       c.nombre AS nombre,
       c.materia AS materia,
       c.numero AS numero,
       c.creditos AS creditos,
       c.nivel AS nivel,
       c.semestre_sugerido AS semestre_sugerido,
       c.departamento AS departamento,
       programasCurso,
       round(score, 4) AS score,
       interesesComunes,
       seguidoresParecidos,
       estrellas
ORDER BY score DESC, size(interesesComunes) DESC, estrellas DESC
LIMIT $limite;