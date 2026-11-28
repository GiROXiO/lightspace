// Botón para elegir imágenes y vista previa de las elegidas.
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TIPOS_IMAGEN, urlImagen } from "@/lib/imagenes";
import type { Imagenes } from "@/lib/useImagenes";

export function BotonImagen({ imagenes }: { imagenes: Imagenes }) {
  const lleno = imagenes.urls.length >= imagenes.maximo;
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="cursor-pointer has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
    >
      <label
        title={lleno ? `Máximo ${imagenes.maximo}` : "Añadir imagen"}
        className={lleno || imagenes.subiendo ? "opacity-50" : ""}
      >
        <ImagePlus />
        <input
          type="file"
          aria-label="Añadir imagen"
          accept={TIPOS_IMAGEN}
          multiple={imagenes.maximo > 1}
          disabled={lleno || imagenes.subiendo}
          className="sr-only"
          onChange={(e) => {
            const archivos = Array.from(e.target.files ?? []);
            if (archivos.length) imagenes.elegir(archivos);
            e.target.value = "";
          }}
        />
      </label>
    </Button>
  );
}

export function VistaPrevia({ imagenes }: { imagenes: Imagenes }) {
  return (
    <>
      {imagenes.urls.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {imagenes.urls.map((url, i) => (
            <li key={`${i}-${url.slice(-20)}`} className="relative">
              <img
                src={urlImagen(url, true)}
                alt={`Imagen adjunta ${i + 1}`}
                className="size-20 rounded-lg border object-cover"
              />
              <button
                type="button"
                aria-label={`Quitar imagen ${i + 1}`}
                onClick={() => imagenes.quitar(i)}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-foreground p-0.5 text-background"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {imagenes.subiendo && (
        <p className="text-xs text-muted-foreground">Subiendo imagen...</p>
      )}
      {imagenes.error && (
        <p role="alert" className="text-xs text-destructive">
          {imagenes.error}
        </p>
      )}
    </>
  );
}
