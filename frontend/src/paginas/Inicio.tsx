// El feed, con un panel lateral en pantallas anchas.
import { Link } from "react-router";
import { Avatar } from "@/components/Avatar";
import { BotonesConexion } from "@/components/BotonesConexion";
import { FilaPersona } from "@/components/FilaPersona";
import { ListaPublicaciones } from "@/components/ListaPublicaciones";
import { NuevaPublicacion } from "@/components/NuevaPublicacion";
import {
  CursosSugeridos,
  PersonasRecomendadas,
} from "@/components/Recomendaciones";
import { Card, CardContent } from "@/components/ui/card";
import { useSolicitudes } from "@/lib/conexiones";
import { useSesion } from "@/sesion/contexto";

function Panel() {
  const { usuario } = useSesion();
  const solicitudes = useSolicitudes();
  const recibidas = solicitudes.data?.recibidas ?? [];
  if (!usuario) return null;

  return (
    <aside className="sticky top-6 hidden max-h-[calc(100vh-3rem)] space-y-4 overflow-y-auto lg:block">
      <Card>
        <CardContent>
          <Link to="/perfil" className="flex items-center gap-3">
            <Avatar
              nombre={usuario.nombre}
              apellido={usuario.apellido}
              foto={usuario.foto_url}
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {usuario.nombre} {usuario.apellido}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {usuario.programa.nombre}
              </span>
            </span>
          </Link>
        </CardContent>
      </Card>
      {recibidas.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="text-base">Solicitudes</h2>
            <ul className="divide-y">
              {recibidas.slice(0, 3).map(({ usuario: persona }) => (
                <FilaPersona key={persona.id} persona={persona}>
                  <BotonesConexion usuarioId={persona.id} relacion="RECIBIDA" />
                </FilaPersona>
              ))}
            </ul>
            <Link to="/buscar" className="text-xs font-semibold text-primary">
              Ver todas
            </Link>
          </CardContent>
        </Card>
      )}
      <PersonasRecomendadas limite={4} />
      <CursosSugeridos limite={3} />
    </aside>
  );
}

export function Inicio() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <NuevaPublicacion />
        <ListaPublicaciones
          ruta="/publicaciones"
          vacio="Aún no hay publicaciones. Conecta con otras personas o publica algo."
        />
      </div>
      <Panel />
    </div>
  );
}
