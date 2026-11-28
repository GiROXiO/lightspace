// Funciones: calculan un valor y no modifican nada.
// Se llaman como custom.lightspace.<nombre>(...)
// Las fórmulas son las de las consultas de recomendaciones de Miguel Carrizosa.





// @funcion lightspace.puntaje_persona(uid_a :: STRING, uid_b :: STRING) :: FLOAT
// 0.35 intereses + 0.25 misma carrera + 0.20 cursos + 0.20 conexiones en común
MATCH (a:Usuario {id: $uid_a}), (b:Usuario {id: $uid_b})
WITH a, b,
     COUNT { (a)-[:INTERESADO_EN]->(:Interes)<-[:INTERESADO_EN]-(b) } AS intereses,
     COUNT { (a)-[:INTERESADO_EN]->() } AS intereses_a,
     COUNT { (b)-[:INTERESADO_EN]->() } AS intereses_b,
     COUNT { MATCH (a)-[:INSCRITO_EN|MATRICULADO_EN]->(c:Curso)<-[:INSCRITO_EN|MATRICULADO_EN]-(b) RETURN DISTINCT c } AS cursos,
     COUNT { MATCH (a)-[:INSCRITO_EN|MATRICULADO_EN]->(c:Curso) RETURN DISTINCT c } AS cursos_a,
     COUNT { MATCH (b)-[:INSCRITO_EN|MATRICULADO_EN]->(c:Curso) RETURN DISTINCT c } AS cursos_b,
     COUNT {
       MATCH (a)-[r1:CONECTA_CON]-(x:Usuario)-[r2:CONECTA_CON]-(b)
       WHERE r1.estado = "ACEPTADA" AND r2.estado = "ACEPTADA"
       RETURN DISTINCT x
     } AS conexiones,
     CASE WHEN EXISTS { (a)-[:ESTUDIA]->(:Programa)<-[:ESTUDIA]-(b) } THEN 1.0 ELSE 0.0 END AS carrera
WITH carrera, conexiones, intereses, cursos,
     intereses_a + intereses_b - intereses AS todos_intereses,
     cursos_a + cursos_b - cursos AS todos_cursos
RETURN round(
  0.35 * CASE WHEN todos_intereses > 0 THEN toFloat(intereses) / todos_intereses ELSE 0.0 END
  + 0.25 * carrera
  + 0.20 * CASE WHEN todos_cursos > 0 THEN toFloat(cursos) / todos_cursos ELSE 0.0 END
  + 0.20 * toFloat(conexiones) / (conexiones + 5.0), 4) AS puntaje





// @funcion lightspace.puntaje_curso(uid :: STRING, curso_id :: STRING) :: FLOAT
// 0.45 intereses + 0.35 seguidores parecidos + 0.20 estrellas
MATCH (u:Usuario {id: $uid}), (c:Curso {id: $curso_id})
WITH u, c,
     COUNT { (u)-[:INTERESADO_EN]->(:Interes)<-[:TRATA_SOBRE]-(c) } AS comunes,
     COUNT { (c)-[:TRATA_SOBRE]->() } AS temas,
     COUNT {
       MATCH (par:Usuario)-[:SIGUE]->(c)
       WHERE par <> u AND (
         EXISTS { (u)-[:ESTUDIA]->(:Programa)<-[:ESTUDIA]-(par) }
         OR EXISTS { (u)-[:INTERESADO_EN]->(:Interes)<-[:INTERESADO_EN]-(par) }
         OR EXISTS { (u)-[:CONECTA_CON {estado: "ACEPTADA"}]-(par) }
       )
       RETURN DISTINCT par
     } AS parecidos,
     COUNT { (:Usuario)-[:DA_ESTRELLA]->(c) } AS estrellas
RETURN round(
  0.45 * CASE WHEN temas > 0 THEN toFloat(comunes) / temas ELSE 0.0 END
  + 0.35 * toFloat(parecidos) / (parecidos + 5.0)
  + 0.20 * toFloat(estrellas) / (estrellas + 10.0), 4) AS puntaje