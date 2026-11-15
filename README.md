# Lightspace

Red social universitaria para hacer networking: conectar con otras personas, publicar, buscar perfiles y unirse a los cursos del semestre. Proyecto final de Bases de Datos.

## Stack

| Capa            | Tecnología       |
| --------------- | ---------------- |
| Base de datos   | Neo4j            |
| Backend         | Python + FastAPI |
| Frontend        | React            |
| Infraestructura | Docker           |

## Equipo

- Juan Arrieta
- Juan Caceres
- Miguel Carrizosa
- Jeronimo Castro

## Requisitos

| Herramienta                                                       | Notas                                         |
| ----------------------------------------------------------------- | --------------------------------------------- |
| [Git](https://git-scm.com/)                                       | Versión 2.28 o superior                       |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | En Windows, instalar con el backend **WSL 2** |

En Windows, Docker Desktop necesita la **virtualización activada en la BIOS** (ver _Solución de problemas_).

## Cómo ejecutar

1. Aceptar la invitación al repositorio (llega al correo o a las notificaciones de GitHub).
2. Abrir **Docker Desktop** y esperar a que abajo a la izquierda diga **Engine running**.
3. Clonar el repositorio y entrar en la carpeta:

   ```bash
   git clone https://github.com/GiROXiO/lightspace.git
   cd lightspace
   ```

4. Crear el archivo de variables de entorno:

   ```bash
   cp .env.example .env      # en PowerShell: copy .env.example .env
   ```

5. Levantar los servicios y esperar a que Neo4j diga `healthy`:

   ```bash
   docker compose up -d
   docker compose ps
   ```

6. Verificar la conexión en http://localhost:7474 con estos datos:

   | Campo       | Valor                   |
   | ----------- | ----------------------- |
   | Connect URL | `bolt://localhost:7687` |
   | Username    | `neo4j`                 |
   | Password    | la de tu `.env`         |

   En la barra superior (la que empieza con `$`) ejecutar `RETURN "Hola Lightspace" AS mensaje;`. Si devuelve el texto, todo funciona.

## Servicios

| Servicio               | Dirección             |
| ---------------------- | --------------------- |
| Neo4j Browser          | http://localhost:7474 |
| Bolt (para el backend) | bolt://localhost:7687 |

## Comandos útiles

| Acción                         | Comando                        |
| ------------------------------ | ------------------------------ |
| Ver estado                     | `docker compose ps`            |
| Ver logs                       | `docker compose logs -f neo4j` |
| Detener (conserva los datos)   | `docker compose down`          |
| Detener y **borrar los datos** | `docker compose down -v`       |

## Solución de problemas

| Mensaje o síntoma                                                  | Causa y solución                                                                                                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `failed to connect to the docker API ... dockerDesktopLinuxEngine` | Docker Desktop no está corriendo. Ábrelo y espera a **Engine running**                                                                           |
| `Virtualization is disabled in firmware`                           | Activar la virtualización en la BIOS: **SVM Mode** (AMD) o **Intel VT-x** (Intel). Se verifica en el Administrador de tareas → Rendimiento → CPU |
| `port is already allocated` (7474 o 7687)                          | Otro programa usa ese puerto (por ejemplo, otro Neo4j). Ciérralo y repite `docker compose up -d`                                                 |
| Neo4j no conecta tras cambiar la contraseña del `.env`             | El volumen conserva la anterior: `docker compose down -v` y vuelve a levantar                                                                    |
| Neo4j se queda en `starting`                                       | La primera vez tarda hasta un minuto. Revisa con `docker compose logs neo4j`                                                                     |

## Estado

En construcción: por ahora solo está la base de datos Neo4j.
