# Contrato de la API (fase 1)

Documento vivo. Responsable: Jeronimo Castro. Cualquier cambio a una ruta, entrada o respuesta se avisa al grupo y se actualiza aquí **antes** de implementarlo.

Alcance: lo necesario para el **corte 1** (jueves 19 de noviembre): registro, login, perfil, lista de cursos y seguir o dejar de seguir de punta a punta. Inscribirse, estrellas, conexiones, publicaciones, notificaciones y recomendaciones se agregan en las fases 2 y 3.

## Arquitectura de servicios

> **Por confirmar:** puertos, reparto de rutas y la tecnología del gateway. Se ajustan al implementar el compose.

El backend se divide en servicios independientes (cada uno con su carpeta, su `Dockerfile` y sus dependencias) que comparten una sola base Neo4j. Todos van detrás de un **gateway**, que es el único punto de entrada: el frontend y Swagger solo conocen `http://localhost:8000/api`.

| Servicio                         | Carpeta                    | Rutas (prefijos)                                                                                                                   | Responsable | Puerto interno |
| -------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------- |
| Gateway                          | `backend/gateway/`         | `/api/health` y reenvío de `/api/*` al servicio que corresponda                                                                    | Castro      | 8000           |
| Usuarios                         | `backend/usuarios/`        | `/api/auth`, `/api/usuarios`, `/api/programas`, `/api/intereses`. Fase 2: `/api/conexiones`, `/api/publicaciones`, `/api/busqueda` | Arrieta     | 8001           |
| Cursos                           | `backend/cursos/`          | `/api/cursos` (incluye seguir, inscripción, estrellas, muro y grupos)                                                              | Caceres     | 8002           |
| Recomendaciones y notificaciones | `backend/recomendaciones/` | `/api/recomendaciones`, `/api/notificaciones`                                                                                      | Carrizosa   | 8003           |

Reglas de la arquitectura:

- Cada servicio tiene su propia conexión a Neo4j. Ninguno llama a otro por HTTP: lo que comparten lo leen del grafo.
- Solo el servicio de **usuarios** emite tokens. Los otros dos únicamente los validan.
- Solo el servicio de **usuarios** aplica `schema.cypher` al arrancar, para evitar que tres servicios lo apliquen a la vez.
- Si un servicio está caído, el gateway responde `503`.
- En desarrollo, cada servicio publica además su Swagger en su puerto (`http://localhost:800X/api/docs`).

### `GET /api/health`

Sin sesión. Lo responde el gateway consultando el estado de los tres servicios, de modo que solo dice `ok` si **todos** están vivos y conectados a Neo4j.

Respuesta `200`:

```json
{
  "estado": "ok",
  "servicios": { "usuarios": "ok", "cursos": "ok", "recomendaciones": "ok" },
  "periodo_vigente": "202630"
}
```

Respuesta `503` si falla alguno (el `detail` nombra los servicios caídos):

```json
{
  "detail": "Servicios no disponibles: cursos"
}
```

Cada servicio expone internamente un `GET /health` (sin prefijo `/api`, no pasa por el gateway) que el gateway consulta.

## Convenciones

| Tema             | Regla                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Prefijo          | Todas las rutas empiezan con `/api`                                                                                               |
| Formato          | JSON (`Content-Type: application/json`), propiedades en `snake_case`                                                              |
| Ids              | UUID en texto                                                                                                                     |
| Fechas           | ISO 8601 en UTC con `Z`, ej. `2026-08-04T10:30:00Z`. En Neo4j son `datetime`: convertir con `.to_native()` y luego `.isoformat()` |
| `periodo`, `nrc` | Texto (`"202630"`, `"10020"`)                                                                                                     |
| Autenticación    | `Authorization: Bearer <token>` (JWT). Las rutas marcadas "Sí" en la columna **Sesión** la exigen                                 |
| Contraseña       | Nunca se devuelve. `password_hash` no sale en ninguna respuesta                                                                   |
| Correo           | Se guarda y compara en minúsculas                                                                                                 |
| Paginación       | `pagina` (desde 1) y `tamano` (por defecto 20, máximo 100)                                                                        |

### Formato de errores

Todos los errores propios devuelven:

```json
{ "detail": "Mensaje legible en español" }
```

| Código | Cuándo                                                                                                   |
| ------ | -------------------------------------------------------------------------------------------------------- |
| `400`  | Petición válida en forma pero con datos imposibles (ej. interés que no existe)                           |
| `401`  | Falta el token, está vencido o es inválido; credenciales incorrectas. Incluye `WWW-Authenticate: Bearer` |
| `403`  | Autenticado pero sin permiso (fases posteriores)                                                         |
| `404`  | El recurso no existe                                                                                     |
| `409`  | Conflicto de unicidad (correo o código ya registrados)                                                   |
| `422`  | Falla de validación de Pydantic. Lo genera FastAPI con su formato estándar; no se modifica               |
| `503`  | El gateway no puede llegar al servicio (está caído o arrancando)                                         |

### Autenticación con JWT

- Algoritmo `HS256`, firmado con `JWT_SECRET` (variable de entorno).
- Contenido (`claims`): `sub` = id del usuario, `iat` y `exp`.
- Duración: 24 horas.
- Respuesta de registro y login: `{ "access_token": "...", "token_type": "bearer", "usuario": { ... } }`.
- Se emite en `backend/usuarios/app/auth.py` (registro y login). Los servicios de cursos y de recomendaciones incluyen su propio `app/seguridad.py`, que **solo valida** el token con el mismo `JWT_SECRET`. Los endpoints protegidos lo reutilizan así:

```python
from app.seguridad import get_usuario_actual   # en usuarios: from app.auth import get_usuario_actual

@router.get("/algo")
def algo(usuario: dict = Depends(get_usuario_actual), session=Depends(db.get_session)):
    uid = usuario["id"]
```

`get_usuario_actual` verifica el token, comprueba que el usuario siga existiendo en Neo4j y devuelve `{"id": "<uuid>"}`. Si algo falla, responde `401`.

### Reglas que afectan a todos

- El correo se valida con `EmailStr` de Pydantic. Los correos del seed usan el dominio `lightspace.example.com`, que el validador acepta.
- Relaciones siempre con `MERGE`, nunca `CREATE`. Nodos nuevos con `CREATE` solo si el `id` lo genera el backend (`uuid.uuid4()`).
- El periodo vigente es `PERIODO_ACTUAL` de `config.py`. No se escribe a mano.
- Cada endpoint pide su sesión con `Depends(db.get_session)`.
- Las consultas Cypher de abajo son **referencia**: se pueden reescribir mientras la entrada y la respuesta se mantengan.

## Configuración que hay que agregar (una vez por servicio)

Cada servicio de la API (usuarios, cursos y recomendaciones) necesita lo siguiente. En la base del proyecto ya está aplicado; al crear un servicio nuevo hay que repetirlo en su carpeta.

| Dónde                                                         | Qué                                                                                                                                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/<servicio>/requirements.txt`                         | `PyJWT` en los tres. `email-validator` (la necesita `EmailStr`) solo en usuarios. Después, `pip freeze`                                                                    |
| `backend/<servicio>/app/config.py`                            | `jwt_secret: str` (obligatoria, mínimo 32 caracteres), `jwt_algoritmo: str = "HS256"`, `jwt_horas: int = 24`. También `neo4j_password` (mínimo 8 caracteres) y `neo4j_uri` |
| `.env` y `.env.example` (raíz, compartidos por los servicios) | `JWT_SECRET=<texto largo aleatorio>`                                                                                                                                       |
| `docker-compose.yml`, cada servicio, `environment`            | `JWT_SECRET: ${JWT_SECRET}` y las variables `NEO4J_*` (sin esto el contenedor no las recibe, aunque estén en el `.env`)                                                    |
| `docker-compose.yml`, servicio `gateway`, `environment`       | Las direcciones internas de los servicios (usuarios, cursos y recomendaciones). El gateway no valida tokens, así que no necesita `JWT_SECRET`                              |

Generar el valor de `JWT_SECRET`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Cada integrante usa el suyo en su `.env`, pero dentro de una misma máquina **los tres servicios reciben el mismo valor**, porque solo así el token que emite usuarios lo pueden validar cursos y recomendaciones. Si falta, o tiene menos de 32 caracteres, el servicio no arranca.

## Módulos y responsables

| Servicio | Archivo                             | Rutas                                               | Responsable |
| -------- | ----------------------------------- | --------------------------------------------------- | ----------- |
| Usuarios | `backend/usuarios/app/auth.py`      | `/api/auth/*` y la dependencia `get_usuario_actual` | Arrieta     |
| Usuarios | `backend/usuarios/app/usuarios.py`  | `/api/usuarios/me`                                  | Arrieta     |
| Usuarios | `backend/usuarios/app/catalogos.py` | `/api/programas`, `/api/intereses`                  | Arrieta     |
| Cursos   | `backend/cursos/app/cursos.py`      | `/api/cursos`                                       | Caceres     |

Cada módulo define `router = APIRouter(prefix="/api/...", tags=["..."])` y se registra en el `main.py` de su servicio con `app.include_router(...)`.

**Orden sugerido:** Arrieta publica primero un PR pequeño con `auth.py` (solo `get_usuario_actual` y la creación del token). Caceres copia la validación a `backend/cursos/app/seguridad.py` y puede proteger `/api/cursos` sin esperar el resto.

## Tabla de endpoints

| Método   | Ruta                      | Descripción                                         | Sesión | Responsable |
| -------- | ------------------------- | --------------------------------------------------- | ------ | ----------- |
| `GET`    | `/api/programas`          | Lista de programas (para el formulario de registro) | No     | Arrieta     |
| `GET`    | `/api/intereses`          | Lista de intereses                                  | No     | Arrieta     |
| `POST`   | `/api/auth/registro`      | Crea una cuenta y devuelve el token                 | No     | Arrieta     |
| `POST`   | `/api/auth/login`         | Inicia sesión y devuelve el token                   | No     | Arrieta     |
| `GET`    | `/api/usuarios/me`        | Perfil del usuario autenticado                      | Sí     | Arrieta     |
| `PATCH`  | `/api/usuarios/me`        | Edita el perfil                                     | Sí     | Arrieta     |
| `GET`    | `/api/cursos`             | Lista de cursos con filtros y paginación            | Sí     | Caceres     |
| `GET`    | `/api/cursos/{id}`        | Detalle de un curso                                 | Sí     | Caceres     |
| `POST`   | `/api/cursos/{id}/seguir` | Empieza a seguir un curso                           | Sí     | Caceres     |
| `DELETE` | `/api/cursos/{id}/seguir` | Deja de seguir un curso                             | Sí     | Caceres     |

---

## Programas e intereses

### `GET /api/programas`

Respuesta `200`:

```json
[
  {
    "id": "uuid",
    "codigo": "SIS",
    "nombre": "Ingeniería de Sistemas y Computación",
    "facultad": "Ingenierías"
  }
]
```

```cypher
MATCH (p:Programa) RETURN p{.id, .codigo, .nombre, .facultad} AS programa ORDER BY p.nombre
```

> Los códigos de programa del seed (`SIS`, `IND`, `CIV`...) son simulados, no los del registro de la universidad.

### `GET /api/intereses`

Respuesta `200`: lista de textos ordenada alfabéticamente.

```json
["Cine", "Ciberseguridad", "Ciencia de Datos", "Debate"]
```

```cypher
MATCH (i:Interes) RETURN i.nombre AS nombre ORDER BY nombre
```

---

## Autenticación

### `POST /api/auth/registro`

Crea el usuario, lo relaciona con su programa y sus intereses, y devuelve un token (queda con la sesión iniciada).

Entrada:

```json
{
  "nombre": "Ana",
  "apellido": "Pérez Gómez",
  "email": "ana.perez@lightspace.example.com",
  "password": "Lightspace123!",
  "codigo": "200100500",
  "semestre": 3,
  "programa": "SIS",
  "intereses": ["Programación", "Música"]
}
```

| Campo                | Regla                                                                |
| -------------------- | -------------------------------------------------------------------- |
| `nombre`, `apellido` | Texto de 1 a 60 caracteres, sin espacios al inicio ni al final       |
| `email`              | `EmailStr`. Se guarda en minúsculas                                  |
| `password`           | Mínimo 8 caracteres                                                  |
| `codigo`             | Solo dígitos, 9 caracteres (como en el seed)                         |
| `semestre`           | Entero de 1 a 10                                                     |
| `programa`           | `codigo` de un `Programa` existente                                  |
| `intereses`          | Opcional. Lista de nombres existentes en `Interes`. Por defecto `[]` |

Respuesta `201`:

```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "usuario": {
    "id": "uuid",
    "nombre": "Ana",
    "apellido": "Pérez Gómez",
    "email": "ana.perez@lightspace.example.com",
    "codigo": "200100500",
    "semestre": 3,
    "bio": "",
    "fecha_registro": "2026-11-16T14:05:00Z"
  }
}
```

Errores: `409` "El correo ya está registrado" / "El código ya está registrado"; `404` "El programa no existe"; `400` "Algún interés no existe"; `422` validación.

Referencia (en **una** transacción, `session.execute_write`). Antes, verificar que el programa y los intereses existan:

```cypher
// 1) Crear usuario y programa
MATCH (p:Programa {codigo: $programa})
CREATE (u:Usuario {
  id: $id, nombre: $nombre, apellido: $apellido, email: $email, codigo: $codigo,
  semestre: $semestre, bio: "", password_hash: $password_hash, fecha_registro: datetime()
})
CREATE (u)-[:ESTUDIA]->(p)
RETURN u.id AS id

// 2) Intereses (segunda consulta: con lista vacía el UNWIND no devuelve filas)
MATCH (u:Usuario {id: $id})
UNWIND $intereses AS nombre
MATCH (i:Interes {nombre: nombre})
MERGE (u)-[:INTERESADO_EN]->(i)
```

Las restricciones de unicidad de `email` y `codigo` están en el esquema. Si Neo4j lanza `ConstraintError`, se traduce a `409`. Para saber cuál de los dos falló, comprobar antes con un `MATCH`.

Contraseña: `PasswordHash.recommended().hash(password)` (`pwdlib`, Argon2).

### `POST /api/auth/login`

Entrada:

```json
{
  "email": "demo.sistemas@lightspace.example.com",
  "password": "Lightspace123!"
}
```

Respuesta `200`: la misma forma que el registro (`access_token`, `token_type`, `usuario`).

Errores: `401` "Credenciales inválidas". **Mismo mensaje** si el correo no existe o la contraseña es incorrecta, para no revelar qué cuentas existen.

```cypher
MATCH (u:Usuario {email: $email})
RETURN u{.id, .nombre, .apellido, .email, .codigo, .semestre, .bio, .fecha_registro, .password_hash} AS usuario
```

Verificación: `PasswordHash.recommended().verify(password, usuario["password_hash"])`. Quitar `password_hash` antes de responder.

---

## Perfil

### `GET /api/usuarios/me`

Sesión requerida. Respuesta `200`:

```json
{
  "id": "uuid",
  "nombre": "Demo",
  "apellido": "Sistemas",
  "email": "demo.sistemas@lightspace.example.com",
  "codigo": "200100000",
  "semestre": 6,
  "bio": "Estudiante de Ingeniería de Sistemas...",
  "fecha_registro": "2026-01-15T10:00:00Z",
  "programa": {
    "id": "uuid",
    "codigo": "SIS",
    "nombre": "Ingeniería de Sistemas y Computación",
    "facultad": "Ingenierías"
  },
  "intereses": ["Programación", "Desarrollo Web"]
}
```

```cypher
MATCH (u:Usuario {id: $uid})-[:ESTUDIA]->(p:Programa)
OPTIONAL MATCH (u)-[:INTERESADO_EN]->(i:Interes)
RETURN u{.id, .nombre, .apellido, .email, .codigo, .semestre, .bio, .fecha_registro} AS usuario,
       p{.id, .codigo, .nombre, .facultad} AS programa,
       collect(i.nombre) AS intereses
```

### `PATCH /api/usuarios/me`

Sesión requerida. Todos los campos son opcionales; solo se cambian los que llegan. **No** se pueden editar `email`, `codigo`, `password` ni `programa` en esta fase.

Entrada:

```json
{
  "nombre": "Ana",
  "apellido": "Pérez",
  "bio": "Me gusta el backend.",
  "semestre": 4,
  "intereses": ["Programación"]
}
```

| Campo                | Regla                                                                         |
| -------------------- | ----------------------------------------------------------------------------- |
| `nombre`, `apellido` | Igual que en el registro                                                      |
| `bio`                | Hasta 500 caracteres                                                          |
| `semestre`           | Entero de 1 a 10                                                              |
| `intereses`          | Si llega, **reemplaza** la lista completa. `[]` deja al usuario sin intereses |

Respuesta `200`: el mismo objeto que `GET /api/usuarios/me`, ya actualizado.

Errores: `400` "Algún interés no existe"; `422` validación.

```cypher
// Propiedades (construir el SET solo con los campos recibidos)
MATCH (u:Usuario {id: $uid})
SET u += $cambios

// Intereses (solo si llegó la lista)
MATCH (u:Usuario {id: $uid})
OPTIONAL MATCH (u)-[r:INTERESADO_EN]->()
DELETE r
WITH DISTINCT u
UNWIND $intereses AS nombre
MATCH (i:Interes {nombre: nombre})
MERGE (u)-[:INTERESADO_EN]->(i)
```

---

## Cursos

Un `Curso` es la asignatura, no la sección. `codigo` = `materia` + `numero` (ej. `IST 4360`). Ver `docs/modelo-grafo.md`.

### `GET /api/cursos`

Sesión requerida. Lista paginada, ordenada por `codigo`.

Parámetros de consulta (todos opcionales):

| Parámetro  | Tipo   | Efecto                                                              |
| ---------- | ------ | ------------------------------------------------------------------- |
| `q`        | texto  | Búsqueda por nombre o código (índice de texto `curso_busqueda`)     |
| `programa` | texto  | `codigo` del programa; solo cursos con `DE_PROGRAMA` a ese programa |
| `materia`  | texto  | Prefijo exacto (`IST`, `MAT`...)                                    |
| `semestre` | entero | `semestre_sugerido` igual a ese valor                               |
| `pagina`   | entero | Desde 1. Por defecto 1                                              |
| `tamano`   | entero | De 1 a 100. Por defecto 20                                          |

Respuesta `200`:

```json
{
  "total": 47,
  "pagina": 1,
  "tamano": 20,
  "items": [
    {
      "id": "uuid",
      "codigo": "IST 4360",
      "materia": "IST",
      "numero": "4360",
      "nombre": "Soluciones Computacionales a Problemas en Ingeniería",
      "creditos": 3,
      "nivel": "Pregrado",
      "semestre_sugerido": 6,
      "departamento": "Ingeniería de Sistemas y Computación",
      "programas": ["SIS", "IND", "CIV", "ELE"],
      "intereses": ["Programación", "Matemáticas"],
      "matriculado": true,
      "relacion": "INSCRITO"
    }
  ]
}
```

| Campo calculado | Significado                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `matriculado`   | `true` si existe `MATRICULADO_EN` del usuario con ese curso en `PERIODO_ACTUAL`                  |
| `relacion`      | `"INSCRITO"` si hay `INSCRITO_EN`, `"SIGUE"` si hay `SIGUE`, `null` si ninguna (son excluyentes) |

Errores: `401` sin token; `422` parámetros inválidos (por ejemplo `tamano=500`).

Referencia sin `q` (dos consultas: la página y el total con los mismos filtros):

```cypher
MATCH (c:Curso)
WHERE ($materia IS NULL OR c.materia = $materia)
  AND ($semestre IS NULL OR c.semestre_sugerido = $semestre)
  AND ($programa IS NULL OR EXISTS { (c)-[:DE_PROGRAMA]->(:Programa {codigo: $programa}) })
WITH c
ORDER BY c.codigo
SKIP $salto LIMIT $tamano
RETURN c{.id, .codigo, .materia, .numero, .nombre, .creditos, .nivel, .semestre_sugerido, .departamento} AS curso,
       [(c)-[:DE_PROGRAMA]->(p:Programa) | p.codigo] AS programas,
       [(c)-[:TRATA_SOBRE]->(i:Interes) | i.nombre] AS intereses,
       EXISTS { (:Usuario {id: $uid})-[:MATRICULADO_EN {periodo: $periodo}]->(c) } AS matriculado,
       CASE
         WHEN EXISTS { (:Usuario {id: $uid})-[:INSCRITO_EN]->(c) } THEN "INSCRITO"
         WHEN EXISTS { (:Usuario {id: $uid})-[:SIGUE]->(c) } THEN "SIGUE"
         ELSE null
       END AS relacion
```

`$salto` = `(pagina - 1) * tamano`.

Con `q`, se parte del índice de texto y se aplican los mismos filtros:

```cypher
CALL db.index.fulltext.queryNodes("curso_busqueda", $consulta) YIELD node AS c
WHERE ...mismos filtros...
```

Para armar `$consulta`: quitar los caracteres especiales de Lucene (`+ - && || ! ( ) { } [ ] ^ " ~ * ? : \ /`), partir por espacios y unir cada palabra con `*` al final (`"bases dat"` pasa a `"bases* dat*"`). Si queda vacía, tratar como si no hubiera `q`.

> **Limitación conocida:** el índice distingue tildes (`calculo` no encuentra `Cálculo`). Si molesta, se cambia el analizador del índice a `standard-folding` en `database/schema.cypher`.

### `GET /api/cursos/{id}`

Sesión requerida. Respuesta `200`: todos los campos de un item de la lista, más:

```json
{
  "descripcion": "Soluciones Computacionales...: curso de 3 créditos del departamento de ...",
  "programas": [
    { "codigo": "SIS", "nombre": "Ingeniería de Sistemas y Computación" }
  ],
  "matricula": { "periodo": "202630", "nrc": "10092" },
  "total_inscritos": 14,
  "total_seguidores": 6,
  "total_estrellas": 5,
  "dio_estrella": false
}
```

| Campo          | Significado                                                                     |
| -------------- | ------------------------------------------------------------------------------- |
| `programas`    | Aquí con objeto (`codigo` y `nombre`), a diferencia de la lista                 |
| `matricula`    | `{periodo, nrc}` del usuario en `PERIODO_ACTUAL`; `null` si no está matriculado |
| `total_*`      | Conteos de `INSCRITO_EN`, `SIGUE` y `DA_ESTRELLA` hacia el curso                |
| `dio_estrella` | `true` si el usuario tiene `DA_ESTRELLA` hacia el curso                         |

Errores: `404` "El curso no existe".

### `POST /api/cursos/{id}/seguir`

Sesión requerida. Sin cuerpo. Es **idempotente**: si el usuario ya lo sigue, responde igual.

Respuesta `200`:

```json
{ "relacion": "SIGUE" }
```

Errores: `404` "El curso no existe"; `409` "Ya estás inscrito en este curso" (seguir e inscribirse son excluyentes).

```cypher
MATCH (u:Usuario {id: $uid}), (c:Curso {id: $curso_id})
MERGE (u)-[s:SIGUE]->(c)
ON CREATE SET s.desde = datetime()
```

Antes, comprobar que el curso existe y que no hay `INSCRITO_EN`. El frontend debe ocultar el botón "seguir" cuando `relacion` sea `"INSCRITO"`.

### `DELETE /api/cursos/{id}/seguir`

Sesión requerida. Es idempotente. **No afecta a la estrella**: la estrella es una estadística aparte del curso, no depende de seguirlo.

Respuesta `204`, sin cuerpo.

Errores: `404` "El curso no existe".

```cypher
MATCH (:Usuario {id: $uid})-[s:SIGUE]->(:Curso {id: $curso_id})
DELETE s
```

---

## Qué sigue (no está en este contrato)

Fase 2 (corte 2): conexiones, publicaciones, seguir e inscribirse con verificación de matrícula, estrellas.
Fase 3 (corte 3): muro del curso, "busco grupo", notificaciones y recomendaciones.

Estas rutas se documentan aquí antes de implementarse.

## Cuándo un endpoint está terminado

Funciona en Swagger con los datos del seed, su efecto se verificó en Neo4j Browser, tiene al menos una prueba automatizada y está documentado aquí (rutas, entrada y respuesta reales).

Cuentas para probar (contraseña `Lightspace123!`): `demo.sistemas@lightspace.example.com`, `demo.industrial@lightspace.example.com`, `demo.derecho@lightspace.example.com`, `demo.medicina@lightspace.example.com`, `demo.nuevo@lightspace.example.com`.
