// Botones según la relación con la otra persona.
import { Button } from "@/components/ui/button";
import { useAccionConexion, type AccionConexion } from "@/lib/conexiones";
import type { RelacionConexion } from "@/types/api";

type Boton = [string, AccionConexion, "default" | "outline" | "secondary"];

const BOTONES: Record<RelacionConexion, Boton[]> = {
  NINGUNA: [["Conectar", "enviar", "default"]],
  ENVIADA: [["Cancelar solicitud", "quitar", "outline"]],
  RECIBIDA: [
    ["Aceptar", "aceptar", "default"],
    ["Rechazar", "quitar", "outline"],
  ],
  CONECTADOS: [["Eliminar conexión", "quitar", "secondary"]],
};

interface Props {
  usuarioId: string;
  relacion: RelacionConexion;
}

export function BotonesConexion({ usuarioId, relacion }: Props) {
  const accion = useAccionConexion(usuarioId);

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {BOTONES[relacion].map(([texto, que, variante]) => (
          <Button
            key={que}
            type="button"
            variant={variante}
            disabled={accion.isPending}
            onClick={() => accion.mutate(que)}
          >
            {texto}
          </Button>
        ))}
      </div>
      {accion.error && (
        <p role="alert" className="text-xs text-destructive">
          {accion.error.message}
        </p>
      )}
    </div>
  );
}
