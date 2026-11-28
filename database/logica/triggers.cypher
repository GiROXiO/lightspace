// Triggers: Neo4j los ejecuta solo, dentro de la misma transacción que los dispara.





// @trigger excluir_sigue
// Seguir e inscribirse son excluyentes
UNWIND $createdRelationships AS r
WITH r WHERE type(r) = "INSCRITO_EN"
WITH startNode(r) AS u, endNode(r) AS c
MATCH (u)-[s:SIGUE]->(c)
DELETE s





// @trigger cerrar_grupo
UNWIND $createdRelationships AS r
WITH r WHERE type(r) = "SE_UNIO"
WITH DISTINCT endNode(r) AS p
WHERE p.tipo = "BUSCA_GRUPO" AND COUNT { (:Usuario)-[:SE_UNIO]->(p) } >= p.cupos
SET p.estado = "CERRADA"





// @trigger notificar_comentario
UNWIND $createdRelationships AS r
WITH r WHERE type(r) = "COMENTA_EN"
WITH startNode(r) AS comentario, endNode(r) AS p
MATCH (origen:Usuario)-[:ESCRIBIO]->(comentario), (destino:Usuario)-[:PUBLICO]->(p)
WHERE origen <> destino
CREATE (n:Notificacion {
  id: randomUUID(), tipo: "COMENTARIO", leida: false, fecha: datetime(),
  mensaje: origen.nombre + " " + origen.apellido + " comentó tu publicación"
})
CREATE (destino)-[:RECIBIO]->(n)
CREATE (n)-[:ORIGEN]->(origen)
CREATE (n)-[:SOBRE]->(p)





// @trigger notificar_like
UNWIND $createdRelationships AS r
WITH r WHERE type(r) = "LE_GUSTA"
WITH startNode(r) AS origen, endNode(r) AS p
MATCH (destino:Usuario)-[:PUBLICO]->(p)
// Quitar y volver a poner "me gusta" no llena de avisos
WHERE origen <> destino AND NOT EXISTS {
  MATCH (destino)-[:RECIBIO]->(x:Notificacion {tipo: "LIKE", leida: false})-[:SOBRE]->(p)
  WHERE EXISTS { (x)-[:ORIGEN]->(origen) }
}
CREATE (n:Notificacion {
  id: randomUUID(), tipo: "LIKE", leida: false, fecha: datetime(),
  mensaje: "A " + origen.nombre + " " + origen.apellido + " le gustó tu publicación"
})
CREATE (destino)-[:RECIBIO]->(n)
CREATE (n)-[:ORIGEN]->(origen)
CREATE (n)-[:SOBRE]->(p)





// @trigger notificar_union
UNWIND $createdRelationships AS r
WITH r WHERE type(r) = "SE_UNIO"
WITH startNode(r) AS origen, endNode(r) AS p
MATCH (destino:Usuario)-[:PUBLICO]->(p)
WHERE origen <> destino
CREATE (n:Notificacion {
  id: randomUUID(), tipo: "RESPUESTA_GRUPO", leida: false, fecha: datetime(),
  mensaje: origen.nombre + " " + origen.apellido + " se unió a tu grupo"
})
CREATE (destino)-[:RECIBIO]->(n)
CREATE (n)-[:ORIGEN]->(origen)
CREATE (n)-[:SOBRE]->(p)





// @trigger notificar_conexion
// Solicitud nueva (PENDIENTE) o solicitud aceptada
UNWIND coalesce($assignedRelationshipProperties["estado"], []) AS cambio
WITH cambio.relationship AS r, cambio.old AS antes, cambio.new AS ahora
WHERE type(r) = "CONECTA_CON"
WITH r,
     CASE
       WHEN antes IS NULL AND ahora = "PENDIENTE" THEN "SOLICITUD_CONEXION"
       WHEN antes = "PENDIENTE" AND ahora = "ACEPTADA" THEN "CONEXION_ACEPTADA"
     END AS tipo
WHERE tipo IS NOT NULL
// La solicitud le llega a quien la recibe; la aceptación, a quien la envió
WITH tipo,
     CASE tipo WHEN "SOLICITUD_CONEXION" THEN startNode(r) ELSE endNode(r) END AS origen,
     CASE tipo WHEN "SOLICITUD_CONEXION" THEN endNode(r) ELSE startNode(r) END AS destino
CREATE (n:Notificacion {
  id: randomUUID(), tipo: tipo, leida: false, fecha: datetime(),
  mensaje: origen.nombre + " " + origen.apellido +
    CASE tipo WHEN "SOLICITUD_CONEXION" THEN " te envió una solicitud de conexión" ELSE " aceptó tu solicitud" END
})
CREATE (destino)-[:RECIBIO]->(n)
CREATE (n)-[:ORIGEN]->(origen)