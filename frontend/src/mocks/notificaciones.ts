// Notificaciones de ejemplo. En el backend las crean los triggers.
import type { Notificacion, TipoNotificacion } from "@/types/api";
import { usuarios } from "./datos";
import { fallo, ok, paginar, ruta, sinContenido } from "./servidor";

interface Aviso {
  id: string;
  para: string;
  origen: string;
  tipo: TipoNotificacion;
  mensaje: string;
  leida: boolean;
  fecha: string;
  publicacion_id: string | null;
}

const CLAVE = "lightspace.mock.notificaciones";
const aviso = (
  id: string,
  origen: string,
  tipo: TipoNotificacion,
  mensaje: string,
  horas: number,
  publicacion_id: string | null = null,
  leida = false,
): Aviso => ({
  id,
  para: "u-sistemas",
  origen,
  tipo,
  mensaje,
  leida,
  publicacion_id,
  fecha: new Date(Date.now() - horas * 3_600_000).toISOString(),
});

let avisos: Aviso[] = JSON.parse(localStorage.getItem(CLAVE) ?? "null") ?? [
  aviso(
    "n-1",
    "u-camila",
    "SOLICITUD_CONEXION",
    "Camila te envió una solicitud de conexión.",
    1,
  ),
  aviso(
    "n-2",
    "u-laura",
    "LIKE",
    "A Laura le gustó tu publicación.",
    4,
    "pub-3",
  ),
  aviso(
    "n-3",
    "u-andres",
    "COMENTARIO",
    "Andrés comentó tu publicación.",
    26,
    "pub-3",
    true,
  ),
  aviso(
    "n-4",
    "u-laura",
    "CONEXION_ACEPTADA",
    "Laura aceptó tu solicitud.",
    200,
    null,
    true,
  ),
];
const guardar = () => localStorage.setItem(CLAVE, JSON.stringify(avisos));
const mias = (uid: string) => avisos.filter((a) => a.para === uid);
const noExiste = () => fallo(404, "La notificación no existe");

function aNotificacion(a: Aviso): Notificacion {
  const u = usuarios.find((x) => x.id === a.origen)!;
  const { id, tipo, mensaje, leida, fecha, publicacion_id } = a;
  return {
    id,
    tipo,
    mensaje,
    leida,
    fecha,
    publicacion_id,
    origen: {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      foto_url: u.foto_url ?? null,
    },
  };
}

ruta("GET", "/notificaciones", ({ consulta, usuarioId }) => {
  const todas = mias(usuarioId!).filter((a) =>
    usuarios.some((u) => u.id === a.origen),
  );
  const filtradas =
    consulta.get("solo_no_leidas") === "true"
      ? todas.filter((a) => !a.leida)
      : todas;
  const ordenadas = [...filtradas].sort((a, b) =>
    b.fecha.localeCompare(a.fecha),
  );
  return ok({
    ...paginar(ordenadas.map(aNotificacion), consulta),
    no_leidas: todas.filter((a) => !a.leida).length,
  });
});

ruta("PATCH", "/notificaciones/:id/leida", ({ partes, usuarioId }) => {
  const a = mias(usuarioId!).find((x) => x.id === partes.id);
  if (!a) return noExiste();
  a.leida = true;
  guardar();
  return ok({ id: a.id, leida: true });
});

ruta("POST", "/notificaciones/leidas", ({ usuarioId }) => {
  const pendientes = mias(usuarioId!).filter((a) => !a.leida);
  for (const a of pendientes) a.leida = true;
  guardar();
  return ok({ total_marcadas: pendientes.length });
});

ruta("DELETE", "/notificaciones/:id", ({ partes, usuarioId }) => {
  if (!mias(usuarioId!).some((x) => x.id === partes.id)) return noExiste();
  avisos = avisos.filter((a) => a.id !== partes.id);
  guardar();
  return sinContenido();
});
