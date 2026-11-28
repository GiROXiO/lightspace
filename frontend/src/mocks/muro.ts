// Muro del curso y grupos de estudio simulados. Comparte datos con publicaciones.
import type { EstadoGrupo, TipoPublicacion } from "@/types/api";
import { resumen } from "./conexiones";
import { inscrito, refCurso, sigue } from "./cursos";
import { usuarios } from "./datos";
import {
  aPublicacion,
  buscarPost,
  datos,
  guardar,
  type Post,
} from "./publicaciones";
import { fallo, ok, paginar, ruta } from "./servidor";

const CURSO = "c-ist3010";
const hace = (horas: number) =>
  new Date(Date.now() - horas * 3_600_000).toISOString();

// Ejemplos en Bases de Datos, una sola vez
if (!datos.muroSembrado) {
  const base = { curso_id: CURSO, imagenes: [], likes: [] };
  datos.posts.push(
    {
      ...base,
      id: "muro-1",
      autor: "u-andres",
      tipo: "MATERIAL",
      contenido: "Guía de Cypher que me sirvió para el parcial.",
      enlace: "https://neo4j.com/docs/cypher-manual/current/",
      fecha: hace(30),
    },
    {
      ...base,
      id: "muro-2",
      autor: "u-laura",
      tipo: "PREGUNTA",
      contenido: "¿Los triggers entran en el examen?",
      fecha: hace(8),
    },
    {
      ...base,
      id: "muro-3",
      autor: "u-laura",
      tipo: "BUSCA_GRUPO",
      contenido: "Busco gente para el proyecto final.",
      actividad: "Proyecto final",
      cupos: 2,
      estado: "ABIERTA",
      unidos: ["u-andres"],
      fecha: hace(3),
    },
  );
  datos.muroSembrado = true;
  guardar();
}

const noExiste = () => fallo(404, "La publicación no existe");

ruta("GET", "/cursos/:id/muro", ({ partes, consulta, usuarioId }) => {
  const tipo = consulta.get("tipo");
  const lista = datos.posts
    .filter(
      (p) =>
        p.curso_id === partes.id &&
        (!tipo || p.tipo === tipo) &&
        usuarios.some((u) => u.id === p.autor),
    )
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map((p) => aPublicacion(p, usuarioId!));
  return ok(paginar(lista, consulta));
});

ruta("POST", "/cursos/:id/publicaciones", ({ partes, cuerpo, usuarioId }) => {
  const yo = usuarioId!;
  const d = cuerpo as {
    tipo: TipoPublicacion;
    contenido: string;
    imagenes: string[];
    enlace: string | null;
    actividad: string | null;
    cupos: number | null;
  };
  const puede =
    inscrito(yo, partes.id) || (d.tipo === "PREGUNTA" && sigue(yo, partes.id));
  if (!puede) return fallo(403, "No tienes permiso para publicar eso aquí");
  const grupo = d.tipo === "BUSCA_GRUPO";
  if (!d.contenido || (d.tipo === "MATERIAL" && !d.enlace))
    return fallo(422, "Faltan datos");
  if (grupo && (!d.actividad || !d.cupos)) return fallo(422, "Faltan datos");
  refCurso(partes.id);

  const nueva: Post = {
    id: crypto.randomUUID(),
    autor: yo,
    curso_id: partes.id,
    tipo: d.tipo,
    contenido: d.contenido,
    imagenes: d.imagenes,
    enlace: d.enlace,
    actividad: d.actividad ?? undefined,
    cupos: d.cupos ?? undefined,
    estado: grupo ? "ABIERTA" : undefined,
    unidos: grupo ? [] : undefined,
    likes: [],
    fecha: new Date().toISOString(),
  };
  datos.posts.push(nueva);
  guardar();
  return ok(aPublicacion(nueva, yo), 201);
});

const buscarGrupo = (id: string) => {
  const p = buscarPost(id);
  return p?.tipo === "BUSCA_GRUPO" ? p : undefined;
};

const estadoGrupo = (p: Post, yo: string) =>
  ok({
    estado: p.estado,
    total_unidos: p.unidos!.length,
    unido: p.unidos!.includes(yo),
  });

ruta("GET", "/cursos/grupos/:pid/miembros", ({ partes }) => {
  const p = buscarGrupo(partes.pid);
  if (!p) return noExiste();
  return ok(usuarios.filter((u) => p.unidos!.includes(u.id)).map(resumen));
});

ruta("POST", "/cursos/grupos/:pid/miembros", ({ partes, usuarioId }) => {
  const p = buscarGrupo(partes.pid);
  const yo = usuarioId!;
  if (!p) return noExiste();
  if (p.autor === yo || !inscrito(yo, p.curso_id!))
    return fallo(403, "Solo los inscritos en el curso pueden unirse");
  if (!p.unidos!.includes(yo)) {
    if (p.estado === "CERRADA") return fallo(409, "El grupo está cerrado");
    p.unidos!.push(yo);
    // En el backend esto lo hace el trigger cerrar_grupo
    if (p.unidos!.length >= p.cupos!) p.estado = "CERRADA";
    guardar();
  }
  return estadoGrupo(p, yo);
});

ruta("DELETE", "/cursos/grupos/:pid/miembros", ({ partes, usuarioId }) => {
  const p = buscarGrupo(partes.pid);
  if (!p) return noExiste();
  p.unidos = p.unidos!.filter((id) => id !== usuarioId); // no reabre el grupo
  guardar();
  return estadoGrupo(p, usuarioId!);
});

ruta("PATCH", "/cursos/grupos/:pid", ({ partes, cuerpo, usuarioId }) => {
  const p = buscarGrupo(partes.pid);
  if (!p) return noExiste();
  if (p.autor !== usuarioId) return fallo(403, "Solo el autor puede hacerlo");
  const { estado } = cuerpo as { estado: EstadoGrupo };
  if (estado === "ABIERTA" && p.unidos!.length >= p.cupos!)
    return fallo(409, "No quedan cupos libres");
  p.estado = estado;
  guardar();
  return estadoGrupo(p, usuarioId);
});
