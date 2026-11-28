// Foto de la persona; si no tiene (o no carga), sus iniciales.
import { useState } from "react";
import { urlImagen } from "@/lib/imagenes";

const tamanos = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-20 text-2xl sm:size-28 sm:text-3xl",
};

interface Props {
  nombre: string;
  apellido: string;
  foto?: string | null;
  tamano?: keyof typeof tamanos;
}

export function Avatar({ nombre, apellido, foto, tamano = "md" }: Props) {
  const [rota, setRota] = useState<string | null>(null);
  const forma = `rounded-full border-2 border-card ${tamanos[tamano]}`;

  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full bg-linear-to-tr from-primary-oscuro via-primary to-estrella p-0.5"
    >
      {foto && foto !== rota ? (
        <img
          src={urlImagen(foto, true)}
          alt=""
          onError={() => setRota(foto)}
          className={`${forma} bg-card object-cover`}
        />
      ) : (
        <span
          className={`${forma} flex items-center justify-center bg-accent font-heading text-accent-foreground`}
        >
          {`${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()}
        </span>
      )}
    </span>
  );
}
