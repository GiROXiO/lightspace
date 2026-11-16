# Lightspace

Red social universitaria para conectar con otras personas, seguir e inscribirse en cursos, publicar en el muro de cada curso y buscar grupo para trabajos. Proyecto final del curso de Bases de Datos.

## Stack

| Capa            | Tecnología                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------- |
| Base de datos   | Neo4j 5.26 Community (en Docker)                                                              |
| Backend         | Python 3.13 + FastAPI                                                                         |
| Frontend        | React + TypeScript + Vite, React Router, TanStack Query, Tailwind CSS + shadcn/ui (pendiente) |
| Infraestructura | Docker Compose                                                                                |

## Equipo

| Integrante       | Rol                                                                          |
| ---------------- | ---------------------------------------------------------------------------- |
| Jeronimo Castro  | Frontend + base de datos (líder técnico)                                     |
| Juan Arrieta     | Backend núcleo: cuenta, perfil, conexiones, publicaciones                    |
| Juan Caceres     | Backend de cursos: catálogo, inscripción, estrellas, muro y grupos           |
| Miguel Carrizosa | Backend de recomendaciones y notificaciones, pruebas, informe y sustentación |

## Requisitos

- **Docker Desktop** con WSL 2 y la virtualización habilitada en la BIOS (SVM Mode en AMD, Intel VT-x en Intel).
- **Git**.
- **Python 3.13**: solo si vas a correr el backend fuera de Docker.
- **Node.js**: se usará cuando exista el frontend.

## Cómo ejecutar

1. Clona el repositorio (la rama por defecto es `develop`):

   ```bash
   git clone https://github.com/GiROXiO/lightspace.git
   cd lightspace
   ```

2. Crea tu archivo `.env` a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

   Abre el `.env` y completa:

   | Variable         | Qué poner                                                                   |
   | ---------------- | --------------------------------------------------------------------------- |
   | `NEO4J_PASSWORD` | La contraseña que quieras para tu Neo4j local (mínimo 8 caracteres)         |
   | `JWT_SECRET`     | Un texto aleatorio de 32 caracteres o más. Genéralo con el comando de abajo |

   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(48))"
   ```

   El `.env` no se sube a GitHub. Cada integrante usa sus propios valores: no hace falta que coincidan. Si cambias `JWT_SECRET`, los tokens anteriores dejan de valer y hay que iniciar sesión otra vez.

3. Abre **Docker Desktop** y espera a que diga _Engine running_.

4. Levanta todo:

   ```bash
   docker compose up -d --build
   ```

5. Comprueba el estado:

   ```bash
   docker compose ps
   ```

   `lightspace-neo4j` debe estar en `healthy` (tarda unos 30 a 60 segundos la primera vez) y `lightspace-backend` en `Up`.

6. Verifica en el navegador:
   - `http://localhost:8000/api/health` debe responder `{"estado":"ok","base_de_datos":"conectada",...}`.
   - `http://localhost:8000/api/docs` abre Swagger.

El esquema de la base (restricciones e índices) se aplica solo cada vez que arranca el backend.

## Servicios

| Servicio      | URL                              | Notas                                                                      |
| ------------- | -------------------------------- | -------------------------------------------------------------------------- |
| API           | `http://localhost:8000/api`      | Todas las rutas llevan el prefijo `/api`                                   |
| Swagger       | `http://localhost:8000/api/docs` | Documentación y pruebas de la API                                          |
| Neo4j Browser | `http://localhost:7474`          | Conectar a `bolt://localhost:7687`, usuario `neo4j`, contraseña del `.env` |

## Base de datos

- **Cada integrante tiene su propia base local.** No se comparte en la nube: lo que se comparte es el código y el esquema, vía GitHub.
- **Cómo se crea:** la primera vez que ejecutas `docker compose up`, el volumen `lightspace_neo4j_data` está vacío y Neo4j se inicializa solo, con el usuario `neo4j` y la contraseña de `NEO4J_PASSWORD` (tu `.env`). Esa contraseña queda guardada dentro del volumen.
- **Cambiar la contraseña del `.env` después no la modifica**, porque Neo4j ya la guardó. Para empezar de cero (se borran los datos):

  ```bash
  docker compose down -v
  docker compose up -d --build
  ```

- **Neo4j Desktop no es necesario.** Si lo tienes, no enciendas una instancia suya mientras usas Docker: ambas usan el puerto 7687.
- **Modelo:** ver `docs/modelo-grafo.md`. Es la fuente de verdad de nodos, relaciones y reglas de negocio.

### Esquema

`database/schema.cypher` define las restricciones de unicidad y los índices. Es idempotente (`IF NOT EXISTS`) y el backend lo aplica al arrancar. Para aplicarlo a mano:

```bash
docker compose exec -T neo4j sh -c 'cypher-shell -u neo4j -p "${NEO4J_AUTH#neo4j/}"' < database/schema.cypher
```

Para **cambiar** una restricción o un índice que ya existe, `IF NOT EXISTS` no lo reemplaza (compara solo el nombre). Bórralo primero en Neo4j Browser y vuelve a aplicar el archivo:

```cypher
DROP CONSTRAINT nombre_de_la_restriccion IF EXISTS
DROP INDEX nombre_del_indice IF EXISTS
```

### Datos de prueba (seed)

Carga un conjunto determinista de datos simulados: programas, cursos, usuarios, matrículas, publicaciones, comentarios, conexiones y notificaciones. Los prefijos de materia (IST, MAT, LEY...) son los reales de la universidad; todo lo demás es simulado.

```bash
docker compose exec -T backend sh -c 'cd /database && python -m seed.main --reset'
```

| Opción         | Efecto                                           | Por defecto |
| -------------- | ------------------------------------------------ | ----------- |
| `--reset`      | **Borra toda la base** antes de cargar           | desactivado |
| `--usuarios N` | Cantidad de usuarios                             | 120         |
| `--semilla N`  | Semilla aleatoria (misma semilla = mismos datos) | 42          |
| `--dry-run`    | Genera y valida sin tocar Neo4j                  | desactivado |

Cuentas demo (contraseña de todas: `Lightspace123!`):

| Email                                    | Perfil                                                 |
| ---------------------------------------- | ------------------------------------------------------ |
| `demo.sistemas@lightspace.example.com`   | Sistemas, semestre 6, con todos sus cursos inscritos   |
| `demo.industrial@lightspace.example.com` | Industrial, semestre 5, con todos sus cursos inscritos |
| `demo.derecho@lightspace.example.com`    | Derecho, semestre 4                                    |
| `demo.medicina@lightspace.example.com`   | Medicina, semestre 3                                   |
| `demo.nuevo@lightspace.example.com`      | Recién registrado: sin matrículas, conexiones ni posts |

## Desarrollo del backend

El backend corre en Docker y recarga solo al guardar cambios en `backend/app/`. Para editar con autocompletado y probar fuera de Docker:

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate      # Git Bash en Windows (en Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
```

Si quieres ejecutarlo fuera de Docker, detén antes el contenedor para liberar el puerto 8000:

```bash
docker compose stop backend
uvicorn app.main:app --reload
```

Convenciones:

- Todas las rutas van bajo el prefijo `/api`.
- Cada endpoint pide su sesión de Neo4j con `Depends(db.get_session)`.
- El periodo vigente es `PERIODO_ACTUAL` en `config.py` (`202630`).
- Al agregar una librería: `pip install paquete` y `pip freeze > requirements.txt` (desde Git Bash, con el entorno activo).
- Cada módulo va en su propio archivo dentro de `app/` y se registra en `main.py`.
- Autenticación con JWT en el encabezado `Authorization: Bearer <token>`. Los endpoints protegidos usan `Depends(get_usuario_actual)` (en `app/auth.py`), que devuelve `{"id": ...}`.
- Rutas, entradas y respuestas: ver `docs/api.md`. Si cambias algo, actualiza ese archivo **antes** de implementarlo y avisa al grupo.

## Flujo de trabajo

- `main` siempre funciona. `develop` es la rama de integración.
- Una rama por tarea (`feat/...`, `fix/...`, `docs/...`) que entra a `develop` por **Pull Request**.
- Prefijos de commit: `chore:`, `feat:`, `fix:`, `docs:`.
- Un endpoint está **terminado** cuando: funciona en Swagger con datos de prueba, su efecto se verificó en Neo4j Browser, tiene al menos una prueba automatizada y está documentado.

## Cortes

Cada integrante trabaja a su ritmo, pero debe llegar a cada corte con lo suyo terminado, en `develop`. Esa noche hay una revisión de 15 minutos por llamada. Quien no llegue avisa con 24 horas de anticipación.

| Corte   | Fecha                    | Contenido                                                                                         |
| ------- | ------------------------ | ------------------------------------------------------------------------------------------------- |
| 1       | Jueves 19 de noviembre   | Login, perfil y lista de cursos de punta a punta                                                  |
| 2       | Lunes 23 de noviembre    | Conexiones, publicaciones e inscripción con verificación de matrícula                             |
| 3       | Viernes 27 de noviembre  | Congelamiento de funcionalidades: muro del curso, "busco grupo", notificaciones y recomendaciones |
| 4       | Lunes 30 de noviembre    | Versión candidata                                                                                 |
| Entrega | Miércoles 2 de diciembre | Entrega final                                                                                     |

## Comandos útiles

| Comando                                                                              | Qué hace                                                  |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `docker compose up -d --build`                                                       | Levanta (y reconstruye) todos los servicios               |
| `docker compose ps`                                                                  | Estado de los contenedores                                |
| `docker compose logs -f backend`                                                     | Logs del backend en vivo (`Ctrl + C` para salir)          |
| `docker compose logs neo4j`                                                          | Logs de Neo4j                                             |
| `docker compose stop`                                                                | Apaga los contenedores (los datos se conservan)           |
| `docker compose down`                                                                | Apaga y elimina los contenedores (los datos se conservan) |
| `docker compose down -v`                                                             | Elimina también el volumen: **borra los datos**           |
| `docker compose exec -T backend sh -c 'cd /database && python -m seed.main --reset'` | Recarga los datos de prueba (**borra la base**)           |

## Solución de problemas

| Problema                                                           | Causa y solución                                                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `failed to connect to the docker API ... dockerDesktopLinuxEngine` | Docker Desktop no está encendido. Ábrelo y espera _Engine running_                                          |
| Docker Desktop dice _Virtualization is disabled in firmware_       | Habilita la virtualización en la BIOS (SVM Mode en AMD, Intel VT-x en Intel)                                |
| `lightspace-neo4j` no llega a `healthy`                            | Revisa `docker compose logs neo4j`. Si el volumen tiene otra contraseña, usa `docker compose down -v`       |
| El backend no arranca con un error de validación                   | Falta `NEO4J_PASSWORD` o `JWT_SECRET` en el `.env` (paso 2 de "Cómo ejecutar")                              |
| `failed to read dockerfile`                                        | El archivo debe llamarse exactamente `backend/Dockerfile`, sin extensión                                    |
| Puerto 8000 ocupado                                                | Hay un `uvicorn` local corriendo. Detenlo con `Ctrl + C`                                                    |
| Puerto 7687 ocupado                                                | Hay una instancia de Neo4j Desktop encendida. Apágala                                                       |
| La contraseña del `.env` no funciona                               | Se cambió después de crear el volumen. Usa `docker compose down -v`                                         |
| Swagger responde `401` en una ruta protegida                       | Falta el token. En Swagger usa el botón _Authorize_ y pega el `access_token` que devuelve `/api/auth/login` |

## Documentación

- `docs/modelo-grafo.md`: modelo del grafo.
- `docs/api.md`: contrato de la API (fase 1: registro, login, perfil y cursos).

## Estado

- [x] Repositorio, ramas y convenciones
- [x] Neo4j en Docker
- [x] Modelo del grafo
- [x] Esquema de la base
- [x] Backend base (`/api/health`)
- [x] Seed de datos
- [x] Contrato de la API (`docs/api.md`)
- [x] Configuración de JWT
- [ ] Frontend base
