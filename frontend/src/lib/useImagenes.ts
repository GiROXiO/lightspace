// Imágenes que se van a adjuntar: se suben al elegirlas.
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { subirImagen } from "./imagenes";

export function useImagenes(maximo: number) {
  const [urls, setUrls] = useState<string[]>([]);
  const subida = useMutation({
    mutationFn: async (archivos: File[]) => {
      // Una por una, para conservar el orden en que se eligieron
      for (const archivo of archivos) {
        const url = await subirImagen(archivo);
        setUrls((actuales) => [...actuales, url].slice(0, maximo));
      }
    },
  });

  return {
    urls,
    maximo,
    subiendo: subida.isPending,
    error: subida.error?.message,
    elegir: (archivos: File[]) =>
      subida.mutate(archivos.slice(0, maximo - urls.length)),
    quitar: (posicion: number) =>
      setUrls((actuales) => actuales.filter((_, i) => i !== posicion)),
    vaciar: () => {
      setUrls([]);
      subida.reset();
    },
  };
}

export type Imagenes = ReturnType<typeof useImagenes>;
