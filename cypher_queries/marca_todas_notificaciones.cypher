// Marca todas las notificaciones pendientes del usuario como leídas.

MATCH (u:Usuario {id: $uid})-[:RECIBIO]->(n:Notificacion)
WHERE n.leida = false
SET n.leida = true
RETURN count(n) AS total_marcadas;