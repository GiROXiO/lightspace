// Publicaciones generales, "me gusta" y comentarios simulados.
import type { Comentario, Publicacion } from "@/types/api";
import { relacion, resumen } from "./conexiones";
import { usuarios } from "./datos";
import { fallo, ok, paginar, ruta, sinContenido } from "./servidor";

interface Post {
  id: string;
  autor: string;
  contenido: string;
  imagenes: string[];
  fecha: string;
  likes: string[];
}

interface Nota {
  id: string;
  publicacion: string;
  autor: string;
  contenido: string;
  imagen_url: string | null;
  fecha: string;
}

const CLAVE = "lightspace.mock.publicaciones";
const hace = (horas: number) =>
  new Date(Date.now() - horas * 3_600_000).toISOString();
const post = (
  id: string,
  autor: string,
  horas: number,
  contenido: string,
  likes: string[] = [],
  imagenes: string[] = [],
): Post => ({ id, autor, contenido, imagenes, likes, fecha: hace(horas) });

const datos: { posts: Post[]; notas: Nota[] } = JSON.parse(
  localStorage.getItem(CLAVE) ?? "null",
) ?? {
  posts: [
    post(
      "pub-1",
      "u-laura",
      2,
      "¿Alguien más preparando la entrega de Bases de Datos?",
      ["u-andres"],
    ),
    post(
      "pub-2",
      "u-andres",
      20,
      "Les dejo las portadas nuevas de los cursos.",
      ["u-sistemas", "u-laura"],
      ["/api/archivos/portadas/IST.webp", "/api/archivos/portadas/MAT.webp"],
    ),
    post("pub-3", "u-sistemas", 50, "Empezando el semestre con toda."),
    post("pub-4", "u-camila", 5, "Esto solo lo ven mis conexiones."),
  ],
  notas: [
    {
      id: "com-1",
      publicacion: "pub-1",
      autor: "u-sistemas",
      contenido: "Yo, voy por los triggers.",
      imagen_url: null,
      fecha: hace(1),
    },
  ],
};
const guardar = () => localStorage.setItem(CLAVE, JSON.stringify(datos));

const buscarUsuario = (id: string) => usuarios.find((u) => u.id === id);
const buscarPost = (id: string) => datos.posts.find((p) => p.id === id);
const noExiste = () => fallo(404, "La publicación no existe");

function aPublicacion(p: Post, yo: string): Publicacion {
  return {
    id: p.id,
    tipo: "GENERAL",
    contenido: p.contenido,
    imagenes: p.imagenes,
    fecha: p.fecha,
    enlace: null,
    actividad: null,
    cupos: null,
    estado: null,
    autor: resumen(buscarUsuario(p.autor)!),
    curso: null,
    total_likes: p.likes.length,
    total_comentarios: datos.notas.filter((n) => n.publicacion === p.id).length,
    me_gusta: p.likes.includes(yo),
    total_unidos: null,
    unido: null,
  };
}

const aComentario = (n: Nota): Comentario => ({
  id: n.id,
  contenido: n.contenido,
  imagen_url: n.imagen_url,
  fecha: n.fecha,
  autor: resumen(buscarUsuario(n.autor)!),
});

// De la más reciente a la más antigua, sin las de cuentas borradas
function listar(yo: string, filtro: (p: Post) => boolean) {
  return datos.posts
    .filter((p) => buscarUsuario(p.autor) && filtro(p))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map((p) => aPublicacion(p, yo));
}

ruta("GET", "/publicaciones", ({ consulta, usuarioId }) => {
  const yo = usuarioId!;
  const feed = listar(
    yo,
    (p) => p.autor === yo || relacion(yo, p.autor) === "CONECTADOS",
  );
  return ok(paginar(feed, consulta));
});

ruta(
  "GET",
  "/usuarios/:id/publicaciones",
  ({ partes, consulta, usuarioId }) => {
    const suyas = listar(usuarioId!, (p) => p.autor === partes.id);
    return ok(paginar(suyas, consulta));
  },
);

ruta("POST", "/publicaciones", ({ cuerpo, usuarioId }) => {
  const { contenido, imagenes = [] } = cuerpo as {
    contenido: string;
    imagenes?: string[];
  };
  if (!contenido && imagenes.length === 0)
    return fallo(422, "Escribe algo o añade una imagen");
  const nuevo: Post = {
    id: crypto.randomUUID(),
    autor: usuarioId!,
    contenido,
    imagenes,
    fecha: new Date().toISOString(),
    likes: [],
  };
  datos.posts.push(nuevo);
  guardar();
  return ok(aPublicacion(nuevo, usuarioId!), 201);
});

ruta("GET", "/publicaciones/:id", ({ partes, usuarioId }) => {
  const p = buscarPost(partes.id);
  return p ? ok(aPublicacion(p, usuarioId!)) : noExiste();
});

ruta("PATCH", "/publicaciones/:id", ({ partes, cuerpo, usuarioId }) => {
  const p = buscarPost(partes.id);
  if (!p) return noExiste();
  if (p.autor !== usuarioId) return fallo(403, "No eres el autor");
  const { contenido } = cuerpo as { contenido: string };
  if (!contenido && p.imagenes.length === 0)
    return fallo(400, "La publicación no puede quedar vacía");
  p.contenido = contenido;
  guardar();
  return ok(aPublicacion(p, usuarioId));
});

ruta("DELETE", "/publicaciones/:id", ({ partes, usuarioId }) => {
  const p = buscarPost(partes.id);
  if (!p) return noExiste();
  if (p.autor !== usuarioId) return fallo(403, "No eres el autor");
  datos.posts.splice(datos.posts.indexOf(p), 1);
  datos.notas = datos.notas.filter((n) => n.publicacion !== p.id);
  guardar();
  return sinContenido();
});

function marcar(id: string, yo: string, gusta: boolean) {
  const p = buscarPost(id);
  if (!p) return noExiste();
  p.likes = p.likes.filter((uid) => uid !== yo);
  if (gusta) p.likes.push(yo);
  guardar();
  return ok({ total_likes: p.likes.length, me_gusta: gusta });
}

ruta("POST", "/publicaciones/:id/like", ({ partes, usuarioId }) =>
  marcar(partes.id, usuarioId!, true),
);
ruta("DELETE", "/publicaciones/:id/like", ({ partes, usuarioId }) =>
  marcar(partes.id, usuarioId!, false),
);

ruta("GET", "/publicaciones/:id/comentarios", ({ partes, consulta }) => {
  if (!buscarPost(partes.id)) return noExiste();
  const suyos = datos.notas
    .filter((n) => n.publicacion === partes.id && buscarUsuario(n.autor))
    .map(aComentario);
  return ok(paginar(suyos, consulta));
});

ruta("POST", "/publicaciones/:id/comentarios", (peticion) => {
  const { partes, cuerpo, usuarioId } = peticion;
  if (!buscarPost(partes.id)) return noExiste();
  const { contenido, imagen_url = null } = cuerpo as {
    contenido: string;
    imagen_url?: string | null;
  };
  if (!contenido && !imagen_url)
    return fallo(422, "Escribe algo o añade una imagen");
  const nueva: Nota = {
    id: crypto.randomUUID(),
    publicacion: partes.id,
    autor: usuarioId!,
    contenido,
    imagen_url,
    fecha: new Date().toISOString(),
  };
  datos.notas.push(nueva);
  guardar();
  return ok(aComentario(nueva), 201);
});

const buscarNota = (id: string) => datos.notas.find((n) => n.id === id);

ruta("PATCH", "/publicaciones/:id/comentarios/:cid", (peticion) => {
  const { partes, cuerpo, usuarioId } = peticion;
  const n = buscarNota(partes.cid);
  if (!n) return fallo(404, "El comentario no existe");
  if (n.autor !== usuarioId) return fallo(403, "No eres el autor");
  const { contenido } = cuerpo as { contenido: string };
  if (!contenido && !n.imagen_url)
    return fallo(400, "El comentario no puede quedar vacío");
  n.contenido = contenido;
  guardar();
  return ok(aComentario(n));
});

ruta("DELETE", "/publicaciones/:id/comentarios/:cid", (peticion) => {
  const { partes, usuarioId } = peticion;
  const n = buscarNota(partes.cid);
  if (!n) return fallo(404, "El comentario no existe");
  if (n.autor !== usuarioId && buscarPost(partes.id)?.autor !== usuarioId)
    return fallo(403, "No puedes borrar este comentario");
  datos.notas.splice(datos.notas.indexOf(n), 1);
  guardar();
  return sinContenido();
});
