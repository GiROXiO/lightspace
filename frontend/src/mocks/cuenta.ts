// Rutas simuladas: catálogos, autenticación y mi perfil.
import type { CambiosPerfil, DatosRegistro, Usuario } from "@/types/api";
import {
  guardarUsuarios,
  intereses,
  programas,
  usuarios,
  type UsuarioMock,
} from "./datos";
import { fallo, ok, ruta, sinContenido } from "./servidor";

function aUsuario(u: UsuarioMock): Usuario {
  const { id, nombre, apellido, email, codigo, semestre, bio, fecha_registro } =
    u;
  return { id, nombre, apellido, email, codigo, semestre, bio, fecha_registro };
}

const aPerfil = (u: UsuarioMock) => ({
  ...aUsuario(u),
  programa: u.programa,
  intereses: u.intereses,
});

const sesion = (u: UsuarioMock, estado = 200) =>
  ok(
    {
      access_token: `mock-${u.id}`,
      token_type: "bearer",
      usuario: aUsuario(u),
    },
    estado,
  );

ruta("GET", "/programas", () => ok(programas), false);
ruta("GET", "/intereses", () => ok(intereses), false);

ruta(
  "POST",
  "/auth/login",
  ({ cuerpo }) => {
    const { email, password } = cuerpo as { email: string; password: string };
    const u = usuarios.find((x) => x.email === email.toLowerCase());
    return u && u.password === password
      ? sesion(u)
      : fallo(401, "Credenciales inválidas");
  },
  false,
);

ruta(
  "POST",
  "/auth/registro",
  ({ cuerpo }) => {
    const datos = cuerpo as DatosRegistro;
    const email = datos.email.toLowerCase();
    if (usuarios.some((u) => u.email === email))
      return fallo(409, "El correo ya está registrado");
    if (usuarios.some((u) => u.codigo === datos.codigo))
      return fallo(409, "El código ya está registrado");
    const programa = programas.find((p) => p.codigo === datos.programa);
    if (!programa) return fallo(404, "El programa no existe");

    const nuevo: UsuarioMock = {
      id: crypto.randomUUID(),
      nombre: datos.nombre,
      apellido: datos.apellido,
      email,
      codigo: datos.codigo,
      semestre: datos.semestre,
      bio: "",
      fecha_registro: new Date().toISOString(),
      programa,
      intereses: datos.intereses,
      password: datos.password,
    };
    usuarios.push(nuevo);
    guardarUsuarios();
    return sesion(nuevo, 201);
  },
  false,
);

ruta("GET", "/usuarios/me", ({ usuarioId }) => {
  const u = usuarios.find((x) => x.id === usuarioId);
  return u ? ok(aPerfil(u)) : fallo(401, "El usuario no existe");
});

ruta("PATCH", "/usuarios/me", ({ usuarioId, cuerpo }) => {
  const u = usuarios.find((x) => x.id === usuarioId);
  if (!u) return fallo(401, "El usuario no existe");
  Object.assign(u, cuerpo as CambiosPerfil);
  guardarUsuarios();
  return ok(aPerfil(u));
});

ruta("DELETE", "/usuarios/me", ({ usuarioId }) => {
  const posicion = usuarios.findIndex((x) => x.id === usuarioId);
  if (posicion >= 0) usuarios.splice(posicion, 1);
  guardarUsuarios();
  return sinContenido();
});
