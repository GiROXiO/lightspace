// Crea una notificación para un destinatario vinculada al usuario origen y opcionalmente a una publicación.

MATCH (dest:Usuario {id: $uid})
MATCH (orig:Usuario {id: $origen_uid})
CREATE (n:Notificacion {
    id: randomUUID(),
    tipo: $tipo,
    mensaje: $mensaje,
    leida: false,
    fecha: datetime()
})
CREATE (dest)-[:RECIBIO]->(n)
CREATE (n)-[:ORIGEN]->(orig)
WITH orig, n
OPTIONAL MATCH (pb:Publicacion {id: $publicacion_id})
FOREACH (_ IN CASE WHEN pb IS NOT NULL THEN [1] ELSE [] END |
    CREATE (n)-[:SOBRE]->(pb)
)
RETURN n.id AS id,
       n.tipo AS tipo,
       n.mensaje AS mensaje,
       n.leida AS leida,
       n.fecha AS fecha,
       orig.id AS origen_id,
       pb.id AS publicacion_id;