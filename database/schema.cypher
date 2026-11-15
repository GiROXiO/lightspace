// Usuario

// Restricciones de unicidad
CREATE CONSTRAINT usuario_id IF NOT EXISTS
	FOR (u:Usuario) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT usuario_email IF NOT EXISTS
	FOR (u:Usuario) REQUIRE u.email IS UNIQUE;
CREATE CONSTRAINT usuario_codigo IF NOT EXISTS
	FOR (u:Usuario) REQUIRE u.codigo IS UNIQUE;

// Busquedas por texto
CREATE FULLTEXT INDEX usuario_busqueda IF NOT EXISTS
	FOR (u:Usuario) ON EACH [u.nombre, u.apellido];





// Programa

// Restricciones de unicidad
CREATE CONSTRAINT programa_id IF NOT EXISTS
	FOR (p:Programa) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT programa_codigo IF NOT EXISTS
	FOR (p:Programa) REQUIRE p.codigo IS UNIQUE;
CREATE CONSTRAINT programa_nombre IF NOT EXISTS
	FOR (p:Programa) REQUIRE p.nombre IS UNIQUE;





// Curso

// Restricciones de unicidad
CREATE CONSTRAINT curso_id IF NOT EXISTS
	FOR (c:Curso) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT curso_codigo IF NOT EXISTS
	FOR (c:Curso) REQUIRE c.codigo IS UNIQUE;

// Indices para filtro rapido
CREATE INDEX curso_materia IF NOT EXISTS
  FOR (c:Curso) ON (c.materia);
CREATE INDEX curso_departamento IF NOT EXISTS
  FOR (c:Curso) ON (c.departamento);


// Busquedas por texto
CREATE FULLTEXT INDEX curso_busqueda IF NOT EXISTS
  FOR (c:Curso) ON EACH [c.nombre, c.codigo];





// Interes

// Restricciones de unicidad
CREATE CONSTRAINT interes_nombre IF NOT EXISTS
	FOR (i:Interes) REQUIRE i.nombre IS UNIQUE;





// Publicacion

// Restricciones de unicidad
CREATE CONSTRAINT publicacion_id IF NOT EXISTS
	FOR (p:Publicacion) REQUIRE p.id IS UNIQUE;

// Indices para ordenar por fecha
CREATE INDEX publicacion_fecha IF NOT EXISTS
	FOR (p:Publicacion) ON (p.fecha);





// Comentario

// Restricciones de unicidad
CREATE CONSTRAINT comentario_id IF NOT EXISTS
	FOR (c:Comentario) REQUIRE c.id IS UNIQUE;

// Indices
CREATE INDEX comentario_fecha IF NOT EXISTS
	FOR (c:Comentario) ON (c.fecha);





// Notificacion

// Restricciones de unicidad
CREATE CONSTRAINT notificacion_id IF NOT EXISTS
	FOR (n:Notificacion) REQUIRE n.id IS UNIQUE;

// Indices para ordenar por fecha
CREATE INDEX notificacion_fecha IF NOT EXISTS
	FOR (n:Notificacion) ON (n.fecha);
