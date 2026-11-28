// Comentarios de una publicación, con una imagen opcional cada uno.
import { useState, type SubmitEvent } from "react";
import { Link } from "react-router";
import { BotonImagen, VistaPrevia } from "@/components/Adjuntos";
import { Avatar } from "@/components/Avatar";
import { Confirmar } from "@/components/Confirmar";
import { EditorTexto } from "@/components/EditorTexto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hace } from "@/lib/fecha";
import { urlImagen } from "@/lib/imagenes";
import { useCambioPublicacion, useComentarios } from "@/lib/publicaciones";
import { useImagenes } from "@/lib/useImagenes";
import { useSesion } from "@/sesion/contexto";
import type { Comentario, Publicacion } from "@/types/api";

const ENLACE = "text-xs text-muted-foreground hover:text-foreground";

interface PropsUno {
  comentario: Comentario;
  publicacion: Publicacion;
}

function Uno({ comentario, publicacion }: PropsUno) {
  const { usuario } = useSesion();
  const cambio = useCambioPublicacion();
  const [editando, setEditando] = useState(false);
  const { autor } = comentario;
  const mio = autor.id === usuario?.id;
  const puedoBorrar = mio || publicacion.autor.id === usuario?.id;
  const ruta = `/${publicacion.id}/comentarios/${comentario.id}`;

  return (
    <li className="flex gap-2">
      <Avatar
        nombre={autor.nombre}
        apellido={autor.apellido}
        foto={autor.foto_url}
        tamano="sm"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm break-words">
          <Link to={`/usuarios/${autor.id}`} className="mr-1 font-semibold">
            {autor.nombre} {autor.apellido}
          </Link>
          {!editando && comentario.contenido}
        </p>
        {editando && (
          <EditorTexto
            inicial={comentario.contenido}
            maximo={500}
            puedeQuedarVacio={comentario.imagen_url !== null}
            guardando={cambio.isPending}
            cancelar={() => setEditando(false)}
            guardar={(contenido) =>
              cambio.mutate(
                { metodo: "PATCH", ruta, cuerpo: { contenido } },
                { onSuccess: () => setEditando(false) },
              )
            }
          />
        )}
        {comentario.imagen_url && (
          <img
            src={urlImagen(comentario.imagen_url)}
            alt="Imagen del comentario"
            loading="lazy"
            className="max-h-60 rounded-lg border"
          />
        )}
        <div className="flex gap-3">
          <span className="text-xs text-muted-foreground">
            {hace(comentario.fecha)}
          </span>
          {mio && !editando && (
            <button
              type="button"
              className={ENLACE}
              onClick={() => setEditando(true)}
            >
              Editar
            </button>
          )}
          {puedoBorrar && (
            <Confirmar
              titulo="¿Eliminar el comentario?"
              detalle="No se puede deshacer."
              alConfirmar={() => cambio.mutate({ metodo: "DELETE", ruta })}
            >
              <button type="button" className={ENLACE}>
                Eliminar
              </button>
            </Confirmar>
          )}
        </div>
        {cambio.error && (
          <p role="alert" className="text-xs text-destructive">
            {cambio.error.message}
          </p>
        )}
      </div>
    </li>
  );
}

function Nuevo({ publicacionId }: { publicacionId: string }) {
  const [texto, setTexto] = useState("");
  const imagen = useImagenes(1);
  const cambio = useCambioPublicacion();
  const vacio = !texto.trim() && imagen.urls.length === 0;

  const enviar = (evento: SubmitEvent) => {
    evento.preventDefault();
    cambio.mutate(
      {
        metodo: "POST",
        ruta: `/${publicacionId}/comentarios`,
        cuerpo: {
          contenido: texto.trim(),
          imagen_url: imagen.urls[0] ?? null,
        },
      },
      {
        onSuccess: () => {
          setTexto("");
          imagen.vaciar();
        },
      },
    );
  };

  return (
    <form onSubmit={enviar} className="space-y-2">
      <VistaPrevia imagenes={imagen} />
      <div className="flex items-center gap-1">
        <Input
          aria-label="Escribe un comentario"
          placeholder="Escribe un comentario..."
          maxLength={500}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <BotonImagen imagenes={imagen} />
        <Button
          type="submit"
          disabled={vacio || imagen.subiendo || cambio.isPending}
        >
          Enviar
        </Button>
      </div>
      {cambio.error && (
        <p role="alert" className="text-xs text-destructive">
          {cambio.error.message}
        </p>
      )}
    </form>
  );
}

export function Comentarios({ publicacion }: { publicacion: Publicacion }) {
  const comentarios = useComentarios(publicacion.id);
  const items = comentarios.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-3 border-t pt-3">
      {comentarios.isPending && (
        <p className="text-xs text-muted-foreground">Cargando comentarios...</p>
      )}
      {comentarios.error && (
        <p className="text-xs text-destructive">{comentarios.error.message}</p>
      )}
      <ul className="space-y-3 empty:hidden">
        {items.map((comentario) => (
          <Uno
            key={comentario.id}
            comentario={comentario}
            publicacion={publicacion}
          />
        ))}
      </ul>
      {comentarios.hasNextPage && (
        <button
          type="button"
          className={ENLACE}
          onClick={() => comentarios.fetchNextPage()}
        >
          Ver más comentarios
        </button>
      )}
      <Nuevo publicacionId={publicacion.id} />
    </div>
  );
}
