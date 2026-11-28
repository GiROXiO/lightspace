// La parte de "busco grupo" dentro de una publicación.
import { useState } from "react";
import { FilaPersona } from "@/components/FilaPersona";
import { Button } from "@/components/ui/button";
import { useCambioMuro, useMiembros } from "@/lib/muro";
import { useSesion } from "@/sesion/contexto";
import type { Publicacion } from "@/types/api";

export function Grupo({ publicacion }: { publicacion: Publicacion }) {
  const { usuario } = useSesion();
  const cambio = useCambioMuro();
  const [verIntegrantes, setVerIntegrantes] = useState(false);
  const miembros = useMiembros(publicacion.id, verIntegrantes);
  const mio = publicacion.autor.id === usuario?.id;
  const abierto = publicacion.estado === "ABIERTA";
  const ruta = `/grupos/${publicacion.id}`;

  return (
    <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm">
          <span className="font-semibold">{publicacion.actividad}</span>
          <br />
          <button
            type="button"
            aria-expanded={verIntegrantes}
            onClick={() => setVerIntegrantes(!verIntegrantes)}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            {publicacion.total_unidos} de {publicacion.cupos} cupos ocupados
          </button>
          <span
            className={`ml-2 text-xs font-semibold ${abierto ? "text-primary" : "text-muted-foreground"}`}
          >
            {abierto ? "Abierto" : "Cerrado"}
          </span>
        </p>
        {mio ? (
          <Button
            variant="outline"
            disabled={cambio.isPending}
            onClick={() =>
              cambio.mutate({
                metodo: "PATCH",
                ruta,
                cuerpo: { estado: abierto ? "CERRADA" : "ABIERTA" },
              })
            }
          >
            {abierto ? "Cerrar grupo" : "Abrir grupo"}
          </Button>
        ) : (
          <Button
            variant={publicacion.unido ? "outline" : "default"}
            disabled={cambio.isPending || (!publicacion.unido && !abierto)}
            onClick={() =>
              cambio.mutate({
                metodo: publicacion.unido ? "DELETE" : "POST",
                ruta: `${ruta}/miembros`,
              })
            }
          >
            {publicacion.unido ? "Salirme" : "Unirme"}
          </Button>
        )}
      </div>
      {cambio.error && (
        <p role="alert" className="text-xs text-destructive">
          {cambio.error.message}
        </p>
      )}
      {verIntegrantes && (
        <ul className="divide-y">
          {miembros.data?.map((persona) => (
            <FilaPersona key={persona.id} persona={persona} />
          ))}
          {miembros.data?.length === 0 && (
            <li className="py-2 text-xs text-muted-foreground">
              Todavía no se ha unido nadie.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
