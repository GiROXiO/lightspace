// Imágenes de una publicación, de a una, como en Instagram.
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { urlImagen } from "@/lib/imagenes";

const FLECHA =
  "absolute top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-1.5 shadow hover:bg-card";

export function Carrusel({ imagenes }: { imagenes: string[] }) {
  const [actual, setActual] = useState(0);
  const total = imagenes.length;
  if (total === 0) return null;
  const i = Math.min(actual, total - 1);

  return (
    <div className="relative bg-secondary">
      <img
        src={urlImagen(imagenes[i])}
        alt={`Imagen ${i + 1} de ${total}`}
        loading="lazy"
        className={`max-h-[32rem] w-full object-contain ${total > 1 ? "aspect-4/3" : ""}`}
      />
      {i > 0 && (
        <button
          type="button"
          aria-label="Imagen anterior"
          onClick={() => setActual(i - 1)}
          className={`${FLECHA} left-2`}
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {i < total - 1 && (
        <button
          type="button"
          aria-label="Imagen siguiente"
          onClick={() => setActual(i + 1)}
          className={`${FLECHA} right-2`}
        >
          <ChevronRight className="size-5" />
        </button>
      )}
      {total > 1 && (
        <p className="absolute top-2 right-2 rounded-full bg-foreground/70 px-2 py-0.5 text-xs text-background">
          {i + 1}/{total}
        </p>
      )}
    </div>
  );
}
