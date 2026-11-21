// Recomienda personas sin conexión previa ponderando intereses, carrera, cursos y amigos en común.

MATCH (u:Usuario {id: $uid})
OPTIONAL MATCH (u)-[:ESTUDIA]->(pu:Programa)
OPTIONAL MATCH (u)-[:INTERESADO_EN]->(iu:Interes)
OPTIONAL MATCH (u)-[:INSCRITO_EN|MATRICULADO_EN]->(cu:Curso)
WITH u,
     collect(DISTINCT pu) AS programasU,
     collect(DISTINCT iu) AS interesesU,
     collect(DISTINCT cu) AS cursosU

MATCH (cand:Usuario)
WHERE cand.id <> u.id
  AND NOT (u)-[:CONECTA_CON]-(cand)

OPTIONAL MATCH (cand)-[:ESTUDIA]->(pc:Programa)
OPTIONAL MATCH (cand)-[:INTERESADO_EN]->(ic:Interes)
OPTIONAL MATCH (cand)-[:INSCRITO_EN|MATRICULADO_EN]->(cc:Curso)
WITH u, programasU, interesesU, cursosU, cand,
     collect(DISTINCT pc) AS programasCand,
     collect(DISTINCT ic) AS interesesCand,
     collect(DISTINCT cc) AS cursosCand

OPTIONAL MATCH (u)-[r1:CONECTA_CON]-(comun:Usuario)-[r2:CONECTA_CON]-(cand)
WHERE r1.estado = 'ACEPTADA' AND r2.estado = 'ACEPTADA'
WITH programasU, interesesU, cursosU, cand, programasCand, interesesCand, cursosCand,
     count(DISTINCT comun) AS conexionesComunes

WITH cand, programasCand, conexionesComunes,
     [x IN interesesU WHERE x IN interesesCand | x.nombre] AS interesesComunes,
     size(interesesU) + size(interesesCand) - size([x IN interesesU WHERE x IN interesesCand]) AS unionIntereses,
     [c IN cursosU WHERE c IN cursosCand | c.codigo] AS cursosComunes,
     size(cursosU) + size(cursosCand) - size([c IN cursosU WHERE c IN cursosCand]) AS unionCursos,
     CASE WHEN size([p IN programasU WHERE p IN programasCand]) > 0 THEN 1.0 ELSE 0.0 END AS mismaCarrera

WITH cand, programasCand, conexionesComunes, interesesComunes, cursosComunes, mismaCarrera,
     CASE WHEN unionIntereses > 0 THEN toFloat(size(interesesComunes)) / unionIntereses ELSE 0.0 END AS simIntereses,
     CASE WHEN unionCursos > 0 THEN toFloat(size(cursosComunes)) / unionCursos ELSE 0.0 END AS simCursos,
     toFloat(conexionesComunes) / (conexionesComunes + 5.0) AS simConexiones

WITH cand, programasCand, conexionesComunes, interesesComunes, cursosComunes,
     (0.35 * simIntereses + 0.25 * mismaCarrera + 0.20 * simCursos + 0.20 * simConexiones) AS score
WHERE score > 0
RETURN cand.id AS id,
       cand.nombre AS nombre,
       cand.apellido AS apellido,
       cand.codigo AS codigo,
       cand.semestre AS semestre,
       [p IN programasCand | p.nombre] AS programas,
       round(score, 4) AS score,
       interesesComunes,
       cursosComunes,
       conexionesComunes
ORDER BY score DESC, conexionesComunes DESC
LIMIT $limite;