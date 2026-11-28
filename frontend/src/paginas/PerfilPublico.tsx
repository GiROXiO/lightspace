// Perfil de otra persona. El mío es /perfil.
import { Navigate, useParams } from "react-router";
import { Avatar } from "@/components/Avatar";
import { BotonesConexion } from "@/components/BotonesConexion";
import { Card, CardContent } from "@/components/ui/card";
import { usePerfilPublico } from "@/lib/conexiones";
import { useSesion } from "@/sesion/contexto";

export function PerfilPublico() {
  const { id = "" } = useParams();
  const { usuario } = useSesion();
  const { data: perfil, isPending, error } = usePerfilPublico(id);

  if (id === usuario?.id) return <Navigate to="/perfil" replace />;
  if (isPending)
    return (
      <p className="py-8 text-center text-muted-foreground">Cargando...</p>
    );
  if (error)
    return <p className="py-8 text-center text-destructive">{error.message}</p>;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <Avatar
            nombre={perfil.nombre}
            apellido={perfil.apellido}
            foto={perfil.foto_url}
            tamano="lg"
          />
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl break-words">
              {perfil.nombre} {perfil.apellido}
            </h1>
            <p className="text-sm font-semibold">{perfil.programa.nombre}</p>
            <p className="text-sm text-muted-foreground">
              Semestre {perfil.semestre} · {perfil.total_conexiones}{" "}
              {perfil.total_conexiones === 1 ? "conexión" : "conexiones"}
            </p>
          </div>
        </div>
        <p className="text-sm break-words whitespace-pre-line empty:hidden">
          {perfil.bio}
        </p>
        <ul
          aria-label="Intereses"
          className="flex flex-wrap gap-2 empty:hidden"
        >
          {perfil.intereses.map((interes) => (
            <li
              key={interes}
              className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"
            >
              {interes}
            </li>
          ))}
        </ul>
        <BotonesConexion
          usuarioId={perfil.id}
          relacion={perfil.relacion_conexion}
        />
      </CardContent>
    </Card>
  );
}
