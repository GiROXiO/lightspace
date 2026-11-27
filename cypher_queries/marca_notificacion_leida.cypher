// Marca una notificación específica del usuario como leída.

MATCH (u:Usuario {id: $uid})-[:RECIBIO]->(n:Notificacion {id: $notificacion_id})
SET n.leida = true
RETURN n.id AS id,
       n.leida AS leida,
       n.fecha AS fecha;