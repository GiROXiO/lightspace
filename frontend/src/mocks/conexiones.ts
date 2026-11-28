// Personas de ejemplo, búsqueda, perfil público y conexiones simuladas.
import type { RelacionConexion, UsuarioResumen } from "@/types/api";
import { programas, usuarios, type UsuarioMock } from "./datos";
import { fallo, ok, paginar, ruta, sinContenido } from "./servidor";

// [id, nombre, apellido, programa, semestre, interés]
const EXTRA: [string, string, string, string, number, string][] = [
  ["u-laura", "Laura", "Gómez Ruiz", "SIS", 6, "Programación"],
  ["u-andres", "Andrés", "Martínez Polo", "SIS", 7, "Ciberseguridad"],
  ["u-camila", "Camila", "Torres Díaz", "IND", 4, "Emprendimiento"],
  ["u-sofia", "Sofía", "Herrera Vega", "PSI", 5, "Salud"],
  ["u-mateo", "Mateo", "Vargas Niño", "DER", 3, "Debate"],
];

for (const [id, nombre, apellido, codigoPrograma, semestre, interes] of EXTRA) {
  if (usuarios.some((u) => u.id === id)) continue;
  usuarios.push({
    id,
    nombre,
    apellido,
    email: `${id.slice(2)}@lightspace.example.com`,
    password: "Lightspace123!",
    codigo: `2001001${usuarios.length}`.padEnd(9, "0"),
    semestre,
    bio: `Me interesa ${interes}.`,
    foto_url: null,
    fecha_registro: "2026-02-01T10:00:00Z",
    programa: programas.find((p) => p.codigo === codigoPrograma)!,
    intereses: [interes],
  });
}

interface Conexion {
  de: string;
  para: string;
  estado: "PENDIENTE" | "ACEPTADA";
  desde: string;
}

const CLAVE = "lightspace.mock.conexiones";
const inicial = (de: string, para: string, estado: Conexion["estado"]) => ({
  de,
  para,
  estado,
  desde: "2026-11-01T15:00:00Z",
});
export const conexiones: Conexion[] = JSON.parse(
  localStorage.getItem(CLAVE) ?? "null",
) ?? [
  inicial("u-sistemas", "u-laura", "ACEPTADA"),
  inicial("u-andres", "u-sistemas", "ACEPTADA"),
  inicial("u-camila", "u-sistemas", "PENDIENTE"),
  inicial("u-sistemas", "u-sofia", "PENDIENTE"),
];
const guardar = () => localStorage.setItem(CLAVE, JSON.stringify(conexiones));

const entre = (a: string, b: string) =>
  conexiones.findIndex(
    (c) => (c.de === a && c.para === b) || (c.de === b && c.para === a),
  );

export function relacion(yo: string, otro: string): RelacionConexion {
  const c = conexiones[entre(yo, otro)];
  if (!c) return "NINGUNA";
  if (c.estado === "ACEPTADA") return "CONECTADOS";
  return c.de === yo ? "ENVIADA" : "RECIBIDA";
}

export function resumen(u: UsuarioMock): UsuarioResumen {
  const { id, nombre, apellido, semestre, programa } = u;
  return {
    id,
    nombre,
    apellido,
    semestre,
    foto_url: u.foto_url ?? null,
    programa: { codigo: programa.codigo, nombre: programa.nombre },
  };
}

const buscar = (id: string) => usuarios.find((u) => u.id === id);
const noExiste = () => fallo(404, "El usuario no existe");
// Quienes tienen conmigo una conexión en ese estado (se ignoran cuentas borradas)
const relacionados = (yo: string, estado: RelacionConexion) =>
  usuarios.filter((u) => relacion(yo, u.id) === estado);

ruta("GET", "/busqueda/usuarios", ({ consulta, usuarioId }) => {
  const q = (consulta.get("q") ?? "").toLowerCase();
  if (q.length < 2) return fallo(422, "q debe tener al menos 2 caracteres");
  const encontrados = usuarios.filter(
    (u) =>
      u.id !== usuarioId &&
      `${u.nombre} ${u.apellido}`.toLowerCase().includes(q),
  );
  const pagina = paginar(encontrados, consulta);
  return ok({
    ...pagina,
    items: pagina.items.map((u) => ({
      ...resumen(u),
      relacion_conexion: relacion(usuarioId!, u.id),
    })),
  });
});

ruta("GET", "/usuarios/:id", ({ partes, usuarioId }) => {
  const u = buscar(partes.id);
  if (!u) return noExiste();
  return ok({
    ...resumen(u),
    bio: u.bio,
    intereses: u.intereses,
    total_conexiones: relacionados(u.id, "CONECTADOS").length,
    relacion_conexion: relacion(usuarioId!, u.id),
  });
});

ruta("GET", "/conexiones", ({ consulta, usuarioId }) => {
  const lista = relacionados(usuarioId!, "CONECTADOS").map((u) => ({
    ...resumen(u),
    desde: conexiones[entre(usuarioId!, u.id)].desde,
  }));
  return ok(paginar(lista, consulta));
});

ruta("GET", "/conexiones/solicitudes", ({ usuarioId }) => {
  const de = (estado: RelacionConexion) =>
    relacionados(usuarioId!, estado).map((u) => ({
      usuario: resumen(u),
      desde: conexiones[entre(usuarioId!, u.id)].desde,
    }));
  return ok({ recibidas: de("RECIBIDA"), enviadas: de("ENVIADA") });
});

ruta("POST", "/conexiones", ({ cuerpo, usuarioId }) => {
  const { usuario_id } = cuerpo as { usuario_id: string };
  if (usuario_id === usuarioId)
    return fallo(400, "No puedes conectarte contigo");
  if (!buscar(usuario_id)) return noExiste();
  if (entre(usuarioId!, usuario_id) >= 0)
    return fallo(409, "Ya hay una conexión o solicitud");
  conexiones.push({
    de: usuarioId!,
    para: usuario_id,
    estado: "PENDIENTE",
    desde: new Date().toISOString(),
  });
  guardar();
  return ok({ relacion_conexion: "ENVIADA" }, 201);
});

ruta("POST", "/conexiones/:id/aceptar", ({ partes, usuarioId }) => {
  if (relacion(usuarioId!, partes.id) !== "RECIBIDA")
    return fallo(404, "No hay una solicitud recibida");
  conexiones[entre(usuarioId!, partes.id)].estado = "ACEPTADA";
  guardar();
  return ok({ relacion_conexion: "CONECTADOS" });
});

ruta("DELETE", "/conexiones/:id", ({ partes, usuarioId }) => {
  const posicion = entre(usuarioId!, partes.id);
  if (posicion < 0) return fallo(404, "No hay relación con esa persona");
  conexiones.splice(posicion, 1);
  guardar();
  return sinContenido();
});
