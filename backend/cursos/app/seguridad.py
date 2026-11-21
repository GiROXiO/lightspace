import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from neo4j import Session

from . import db
from .config import settings

_esquema = HTTPBearer(auto_error=False)


def _no_autorizado(detalle: str) -> HTTPException:
  return HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail=detalle,
    headers={"WWW-Authenticate": "Bearer"},
  )


def get_usuario_actual(
  credenciales: HTTPAuthorizationCredentials | None = Depends(_esquema),
  session: Session = Depends(db.get_session),
) -> dict:
  if credenciales is None:
    raise _no_autorizado("Falta el token")
  try:
    claims = jwt.decode(
      credenciales.credentials,
      settings.jwt_secret,
      algorithms=[settings.jwt_algoritmo],
      options={"require": ["sub", "exp"]},
    )
  except jwt.ExpiredSignatureError:
    raise _no_autorizado("El token venció")
  except jwt.InvalidTokenError:
    raise _no_autorizado("Token inválido")

  uid = claims["sub"]
  existe = session.run("MATCH (u:Usuario {id: $uid}) RETURN u.id AS id", uid=uid).single()
  if existe is None:
    raise _no_autorizado("El usuario no existe")
  return {"id": uid}