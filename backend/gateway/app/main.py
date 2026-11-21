import asyncio
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from .config import settings

DESTINOS = {
  "usuarios": settings.usuarios_url,
  "cursos": settings.cursos_url,
  "recomendaciones": settings.recomendaciones_url,
}

# Primer segmento de la ruta (/api/<prefijo>/...) -> servicio que la atiende
RUTAS = {
  "auth": "usuarios",
  "usuarios": "usuarios",
  "programas": "usuarios",
  "intereses": "usuarios",
  "conexiones": "usuarios",
  "publicaciones": "usuarios",
  "busqueda": "usuarios",
  "cursos": "cursos",
  "recomendaciones": "recomendaciones",
  "notificaciones": "recomendaciones",
}

CABECERAS_IGNORADAS = {"host", "content-length", "connection"}
CABECERAS_RESPUESTA = {"content-type", "www-authenticate", "location"}


@asynccontextmanager
async def lifespan(app: FastAPI):
  app.state.cliente = httpx.AsyncClient(timeout=settings.tiempo_espera)
  yield

  await app.state.cliente.aclose()


app = FastAPI(
  title="Lightspace Gateway",
  version="0.2.0",
  docs_url=None,
  redoc_url=None,
  openapi_url=None,
  lifespan=lifespan,
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=settings.cors_origins,
  allow_methods=["*"],
  allow_headers=["*"],
)


async def _estado(cliente: httpx.AsyncClient, nombre: str, url: str) -> tuple[str, str, dict]:
  try:
    r = await cliente.get(f"{url}/health", timeout=3)
  except httpx.HTTPError:
    return nombre, "caido", {}
  if r.status_code != 200:
    return nombre, "error", {}
  return nombre, "ok", r.json()


@app.get("/api/health", tags=["Estado"])
async def health(request: Request):
  resultados = await asyncio.gather(
    *(_estado(request.app.state.cliente, n, u) for n, u in DESTINOS.items())
  )
  servicios = {nombre: estado for nombre, estado, _ in resultados}
  caidos = [nombre for nombre, estado in servicios.items() if estado != "ok"]
  if caidos:
    raise HTTPException(status_code=503, detail=f"Servicios no disponibles: {', '.join(caidos)}")
  periodo = next((datos.get("periodo_vigente") for _, _, datos in resultados if datos), None)
  return {"estado": "ok", "servicios": servicios, "periodo_vigente": periodo}


@app.api_route("/api/{ruta:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"], include_in_schema=False)
async def reenviar(ruta: str, request: Request):
  servicio = RUTAS.get(ruta.split("/", 1)[0])
  if servicio is None:
    raise HTTPException(status_code=404, detail="La ruta no existe")

  cabeceras = {k: v for k, v in request.headers.items() if k.lower() not in CABECERAS_IGNORADAS}
  try:
    r = await request.app.state.cliente.request(
      request.method,
      f"{DESTINOS[servicio]}/api/{ruta}",
      params=list(request.query_params.multi_items()),
      content=await request.body(),
      headers=cabeceras,
    )
  except httpx.HTTPError:
    raise HTTPException(status_code=503, detail=f"Servicio no disponible: {servicio}")

  cabeceras_respuesta = {k: v for k, v in r.headers.items() if k.lower() in CABECERAS_RESPUESTA}
  return Response(content=r.content, status_code=r.status_code, headers=cabeceras_respuesta)