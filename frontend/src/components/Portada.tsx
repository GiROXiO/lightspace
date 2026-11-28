// Portada del curso; si no carga (o no tiene), un fondo con la materia.
import { useState } from "react";
import { urlImagen } from "@/lib/imagenes";

interface Props {
  url: string | null;
  materia: string;
  alta?: boolean; // para las tarjetas
}

export function Portada({ url, materia, alta }: Props) {
  const [rota, setRota] = useState<string | null>(null);
  const forma = `w-full ${alta ? "aspect-2/1" : "aspect-3/1"}`;

  if (url && url !== rota) {
    return (
      <img
        src={urlImagen(url)}
        alt=""
        loading="lazy"
        onError={() => setRota(url)}
        className={`${forma} object-cover object-left`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`${forma} flex items-end bg-linear-to-br from-primary to-primary-oscuro p-3 font-heading text-3xl text-primary-foreground`}
    >
      {materia}
    </div>
  );
}
