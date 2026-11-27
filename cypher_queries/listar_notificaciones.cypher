// Lista las notificaciones de un usuario ordenadas por fecha (con filtro opcional de no leídas).

MATCH (u:Usuario {id: $uid})-[:RECIBIO]->(n:Notificacion)
WHERE $solo_no_leidas = false OR n.leida = false
OPTIONAL MATCH (n)-[:ORIGEN]->(orig:Usuario)
OPTIONAL MATCH (n)-[:SOBRE]->(pb:Publicacion)
RETURN n.id AS id,
       n.tipo AS tipo,
       n.mensaje AS mensaje,
       n.leida AS leida,
       n.fecha AS fecha,
       orig { .id, .nombre, .apellido } AS origen,
       pb.id AS publicacion_id
ORDER BY n.fecha DESC
LIMIT $limite;