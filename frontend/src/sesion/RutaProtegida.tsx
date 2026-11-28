import { Navigate, Outlet, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { useSesion } from "./contexto";

export function RutaProtegida() {
  const { autenticado, cargando, error, cerrarSesion } = useSesion();
  const ubicacion = useLocation();

  if (!autenticado)
    return (
      <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
    );
  if (cargando)
    return <p className="p-8 text-center text-muted-foreground">Cargando...</p>;
  if (error) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p className="text-destructive">{error.message}</p>
        <Button variant="outline" onClick={cerrarSesion}>
          Cerrar sesión
        </Button>
      </div>
    );
  }
  return <Outlet />;
}
