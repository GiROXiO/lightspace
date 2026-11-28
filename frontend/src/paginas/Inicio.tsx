// Pantalla provisional: el bloque 4 la reemplaza.
import { Button } from "@/components/ui/button";
import { useSesion } from "@/sesion/contexto";

export function Inicio() {
  const { usuario, cerrarSesion } = useSesion();
  return (
    <main className="space-y-4 p-8 text-center">
      <h1 className="text-3xl">
        Hola, {usuario?.nombre} {usuario?.apellido}
      </h1>
      <p className="text-muted-foreground">{usuario?.programa.nombre}</p>
      <Button variant="outline" onClick={cerrarSesion}>
        Cerrar sesión
      </Button>
    </main>
  );
}
