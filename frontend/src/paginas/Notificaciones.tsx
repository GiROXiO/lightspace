import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hace } from "@/lib/fecha";
import { useCambioNotificacion, useNotificaciones } from "@/lib/notificaciones";
import type { Notificacion } from "@/types/api";

// A dónde lleva cada aviso
function destino(n: Notificacion) {
  if (n.publicacion_id) return `/publicaciones/${n.publicacion_id}`;
  if (n.tipo === "SOLICITUD_CONEXION") return "/buscar";
  return `/usuarios/${n.origen.id}`;
}

export function Notificaciones() {
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const lista = useNotificaciones(soloNoLeidas);
  const cambio = useCambioNotificacion();
  const navegar = useNavigate();
  const items = lista.data?.pages.flatMap((p) => p.items) ?? [];
  const sinLeer = lista.data?.pages[0].no_leidas ?? 0;
  const aviso = lista.isPending
    ? "Cargando..."
    : (lista.error?.message ??
      (items.length === 0 ? "No tienes notificaciones." : null));

  const abrir = (n: Notificacion) => {
    if (!n.leida) cambio.mutate({ metodo: "PATCH", ruta: `/${n.id}/leida` });
    navegar(destino(n));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Notificaciones</h1>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant={soloNoLeidas ? "default" : "outline"}
          aria-pressed={soloNoLeidas}
          onClick={() => setSoloNoLeidas(!soloNoLeidas)}
        >
          Solo no leídas ({sinLeer})
        </Button>
        <Button
          variant="ghost"
          disabled={sinLeer === 0 || cambio.isPending}
          onClick={() => cambio.mutate({ metodo: "POST", ruta: "/leidas" })}
        >
          Marcar todas como leídas
        </Button>
      </div>
      {cambio.error && (
        <p role="alert" className="text-sm text-destructive">
          {cambio.error.message}
        </p>
      )}

      <Card>
        <CardContent>
          {aviso && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {aviso}
            </p>
          )}
          <ul className="divide-y">
            {items.map((n) => (
              <li key={n.id} className="flex items-center gap-2 py-2">
                <button
                  type="button"
                  onClick={() => abrir(n)}
                  className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                    n.leida ? "hover:bg-muted" : "bg-accent"
                  }`}
                >
                  <Avatar
                    nombre={n.origen.nombre}
                    apellido={n.origen.apellido}
                    foto={n.origen.foto_url}
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm break-words ${n.leida ? "" : "font-semibold"}`}
                    >
                      {n.mensaje}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {hace(n.fecha)}
                      {!n.leida && " · Sin leer"}
                    </span>
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Eliminar notificación"
                  onClick={() =>
                    cambio.mutate({ metodo: "DELETE", ruta: `/${n.id}` })
                  }
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
          {lista.hasNextPage && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => lista.fetchNextPage()}
            >
              Cargar más
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
