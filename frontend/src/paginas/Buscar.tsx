// Buscar personas y gestionar solicitudes y conexiones.
import { useSearchParams } from "react-router";
import { BotonesConexion } from "@/components/BotonesConexion";
import { FilaPersona } from "@/components/FilaPersona";
import { PersonasRecomendadas } from "@/components/Recomendaciones";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBusqueda, useConexiones, useSolicitudes } from "@/lib/conexiones";
import { useRetrasado } from "@/lib/useRetrasado";

const Aviso = ({ texto }: { texto: string }) => (
  <p className="py-3 text-center text-sm text-muted-foreground">{texto}</p>
);

function Resultados({ q }: { q: string }) {
  const busqueda = useBusqueda(q);
  const items = busqueda.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Card>
      <CardContent>
        {busqueda.isPending && <Aviso texto="Buscando..." />}
        {busqueda.error && <Aviso texto={busqueda.error.message} />}
        {busqueda.data && items.length === 0 && (
          <Aviso texto="No encontramos a nadie con ese nombre." />
        )}
        <ul className="divide-y">
          {items.map((persona) => (
            <FilaPersona key={persona.id} persona={persona}>
              <BotonesConexion
                usuarioId={persona.id}
                relacion={persona.relacion_conexion}
              />
            </FilaPersona>
          ))}
        </ul>
        {busqueda.hasNextPage && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => busqueda.fetchNextPage()}
          >
            Cargar más
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function MiRed() {
  const solicitudes = useSolicitudes();
  const conexiones = useConexiones();
  const recibidas = solicitudes.data?.recibidas ?? [];
  const enviadas = solicitudes.data?.enviadas ?? [];
  const mias = conexiones.data?.pages.flatMap((p) => p.items) ?? [];
  const grupos = [
    { titulo: "Solicitudes recibidas", lista: recibidas, relacion: "RECIBIDA" },
    { titulo: "Solicitudes enviadas", lista: enviadas, relacion: "ENVIADA" },
  ] as const;

  return (
    <>
      {solicitudes.error && <Aviso texto={solicitudes.error.message} />}
      {grupos.map(
        ({ titulo, lista, relacion }) =>
          lista.length > 0 && (
            <Card key={relacion}>
              <CardContent>
                <h2 className="text-lg">{titulo}</h2>
                <ul className="divide-y">
                  {lista.map(({ usuario }) => (
                    <FilaPersona key={usuario.id} persona={usuario}>
                      <BotonesConexion
                        usuarioId={usuario.id}
                        relacion={relacion}
                      />
                    </FilaPersona>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ),
      )}
      <PersonasRecomendadas limite={5} />
      <Card>
        <CardContent>
          <h2 className="text-lg">
            Mis conexiones ({conexiones.data?.pages[0].total ?? 0})
          </h2>
          {conexiones.isPending && <Aviso texto="Cargando..." />}
          {conexiones.error && <Aviso texto={conexiones.error.message} />}
          {conexiones.data && mias.length === 0 && (
            <Aviso texto="Todavía no tienes conexiones. Busca a alguien por su nombre." />
          )}
          <ul className="divide-y">
            {mias.map((persona) => (
              <FilaPersona key={persona.id} persona={persona}>
                <BotonesConexion usuarioId={persona.id} relacion="CONECTADOS" />
              </FilaPersona>
            ))}
          </ul>
          {conexiones.hasNextPage && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => conexiones.fetchNextPage()}
            >
              Cargar más
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export function Buscar() {
  const [params, setParams] = useSearchParams();
  const texto = params.get("q") ?? "";
  const q = useRetrasado(texto.trim());

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Buscar personas</h1>
      <Input
        type="search"
        aria-label="Buscar personas"
        placeholder="Nombre o apellido (mínimo 2 letras)"
        className="h-10 bg-card"
        value={texto}
        onChange={(e) =>
          setParams(e.target.value ? { q: e.target.value } : {}, {
            replace: true,
          })
        }
      />
      {q.length >= 2 ? <Resultados q={q} /> : <MiRed />}
    </div>
  );
}
