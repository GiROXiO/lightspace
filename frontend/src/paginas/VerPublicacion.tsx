// Una publicación sola, con sus comentarios (se llega desde la fecha o una notificación).
import { useNavigate, useParams } from "react-router";
import { TarjetaPublicacion } from "@/components/TarjetaPublicacion";
import { usePublicacion } from "@/lib/publicaciones";

export function VerPublicacion() {
  const { id = "" } = useParams();
  const navegar = useNavigate();
  const { data, isPending, error } = usePublicacion(id);

  if (isPending)
    return (
      <p className="py-8 text-center text-muted-foreground">Cargando...</p>
    );
  if (error)
    return <p className="py-8 text-center text-destructive">{error.message}</p>;

  return (
    <TarjetaPublicacion
      publicacion={data}
      conComentarios
      alBorrar={() => navegar("/")}
    />
  );
}
