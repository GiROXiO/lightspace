import { Heart, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Avatar } from "@/components/Avatar";
import { Carrusel } from "@/components/Carrusel";
import { Comentarios } from "@/components/Comentarios";
import { Confirmar } from "@/components/Confirmar";
import { EditorTexto } from "@/components/EditorTexto";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hace } from "@/lib/fecha";
import { useCambioPublicacion } from "@/lib/publicaciones";
import { useSesion } from "@/sesion/contexto";
import type { Publicacion } from "@/types/api";

interface Props {
  publicacion: Publicacion;
  conComentarios?: boolean; // abiertos desde el principio
  alBorrar?: () => void;
}

export function TarjetaPublicacion(props: Props) {
  const { publicacion, alBorrar } = props;
  const { autor, curso } = publicacion;
  const { usuario } = useSesion();
  const cambio = useCambioPublicacion();
  const [editando, setEditando] = useState(false);
  const [abiertos, setAbiertos] = useState(props.conComentarios ?? false);
  const mia = autor.id === usuario?.id;
  const ruta = `/${publicacion.id}`;

  return (
    <article>
      <Card className="gap-3">
        <CardContent className="flex items-center gap-3">
          <Avatar
            nombre={autor.nombre}
            apellido={autor.apellido}
            foto={autor.foto_url}
          />
          <div className="min-w-0 flex-1">
            <Link
              to={`/usuarios/${autor.id}`}
              className="block truncate text-sm font-semibold"
            >
              {autor.nombre} {autor.apellido}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              <Link to={`/publicaciones/${publicacion.id}`}>
                {hace(publicacion.fecha)}
              </Link>
              {curso && (
                <>
                  {" · "}
                  <Link to={`/cursos/${curso.id}`}>{curso.nombre}</Link>
                </>
              )}
            </p>
          </div>
          {mia && (
            <div className="flex">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Editar publicación"
                onClick={() => setEditando(true)}
              >
                <Pencil />
              </Button>
              <Confirmar
                titulo="¿Eliminar la publicación?"
                detalle="También se borran sus comentarios y reacciones."
                alConfirmar={() =>
                  cambio.mutate(
                    { metodo: "DELETE", ruta },
                    { onSuccess: alBorrar },
                  )
                }
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Eliminar publicación"
                >
                  <Trash2 />
                </Button>
              </Confirmar>
            </div>
          )}
        </CardContent>

        {editando ? (
          <CardContent>
            <EditorTexto
              inicial={publicacion.contenido}
              maximo={2000}
              puedeQuedarVacio={publicacion.imagenes.length > 0}
              guardando={cambio.isPending}
              cancelar={() => setEditando(false)}
              guardar={(contenido) =>
                cambio.mutate(
                  { metodo: "PATCH", ruta, cuerpo: { contenido } },
                  { onSuccess: () => setEditando(false) },
                )
              }
            />
          </CardContent>
        ) : (
          publicacion.contenido && (
            <CardContent>
              <p className="text-sm break-words whitespace-pre-line">
                {publicacion.contenido}
              </p>
            </CardContent>
          )
        )}

        <Carrusel imagenes={publicacion.imagenes} />

        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              aria-pressed={publicacion.me_gusta}
              aria-label={publicacion.me_gusta ? "Quitar me gusta" : "Me gusta"}
              disabled={cambio.isPending}
              onClick={() =>
                cambio.mutate({
                  metodo: publicacion.me_gusta ? "DELETE" : "POST",
                  ruta: `${ruta}/like`,
                })
              }
            >
              <Heart
                className={
                  publicacion.me_gusta ? "fill-primary text-primary" : ""
                }
              />
              {publicacion.total_likes}
            </Button>
            <Button
              variant="ghost"
              aria-expanded={abiertos}
              aria-label="Comentarios"
              onClick={() => setAbiertos(!abiertos)}
            >
              <MessageCircle />
              {publicacion.total_comentarios}
            </Button>
          </div>
          {cambio.error && (
            <p role="alert" className="text-xs text-destructive">
              {cambio.error.message}
            </p>
          )}
          {abiertos && <Comentarios publicacion={publicacion} />}
        </CardContent>
      </Card>
    </article>
  );
}
