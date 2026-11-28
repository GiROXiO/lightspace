const tamanos = {
  sm: "size-8 text-xs",
  md: "size-11 text-sm",
  lg: "size-20 text-2xl sm:size-28 sm:text-3xl",
};

interface Props {
  nombre: string;
  apellido: string;
  tamano?: keyof typeof tamanos;
}

export function Avatar({ nombre, apellido, tamano = "md" }: Props) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full bg-linear-to-tr from-primary-oscuro via-primary to-estrella p-0.5"
    >
      <span
        className={`flex items-center justify-center rounded-full border-2 border-card bg-accent font-heading text-accent-foreground ${tamanos[tamano]}`}
      >
        {`${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()}
      </span>
    </span>
  );
}
