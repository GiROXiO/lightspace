import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { TIPOS_IMAGEN } from "@/lib/imagenes";

interface Props {
  nombre: string;
  apellido: string;
  foto: string | null;
  subiendo: boolean;
  error?: string;
  elegir: (archivo: File) => void;
  quitar: () => void;
}

export function SelectorFoto({
  nombre,
  apellido,
  foto,
  subiendo,
  error,
  elegir,
  quitar,
}: Props) {
  return (
    <div className="flex items-center gap-4">
      <Avatar nombre={nombre} apellido={apellido} foto={foto} tamano="lg" />
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant="outline"
            className="cursor-pointer has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
          >
            <label>
              {subiendo ? "Subiendo..." : foto ? "Cambiar foto" : "Subir foto"}
              <input
                type="file"
                accept={TIPOS_IMAGEN}
                disabled={subiendo}
                className="sr-only"
                onChange={(e) => {
                  const archivo = e.target.files?.[0];
                  if (archivo) elegir(archivo);
                  e.target.value = ""; // permite volver a elegir el mismo
                }}
              />
            </label>
          </Button>
          {foto && (
            <Button
              type="button"
              variant="ghost"
              disabled={subiendo}
              onClick={quitar}
            >
              Quitar foto
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG o WebP de hasta 10 MB
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
