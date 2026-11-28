import { TarjetaPublicacion } from "@/components/TarjetaPublicacion";
import { Button } from "@/components/ui/button";
import { useListaPublicaciones } from "@/lib/publicaciones";

interface Props {
  ruta: string;
  vacio: string;
}

export function ListaPublicaciones({ ruta, vacio }: Props) {
  const lista = useListaPublicaciones(ruta);
  const items = lista.data?.pages.flatMap((p) => p.items) ?? [];
  const aviso = lista.isPending
    ? "Cargando publicaciones..."
    : (lista.error?.message ?? (items.length === 0 ? vacio : null));

  return (
    <div className="space-y-4">
      {aviso && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {aviso}
        </p>
      )}
      {items.map((publicacion) => (
        <TarjetaPublicacion key={publicacion.id} publicacion={publicacion} />
      ))}
      {lista.hasNextPage && (
        <Button
          variant="outline"
          className="h-10 w-full"
          disabled={lista.isFetchingNextPage}
          onClick={() => lista.fetchNextPage()}
        >
          {lista.isFetchingNextPage ? "Cargando..." : "Cargar más"}
        </Button>
      )}
    </div>
  );
}
