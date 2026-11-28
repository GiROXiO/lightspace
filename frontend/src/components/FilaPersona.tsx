import type { ReactNode } from "react";
import { Link } from "react-router";
import { Avatar } from "@/components/Avatar";
import type { UsuarioResumen } from "@/types/api";

interface Props {
  persona: UsuarioResumen;
  children?: ReactNode; // botones a la derecha
}

export function FilaPersona({ persona, children }: Props) {
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <Link
        to={`/usuarios/${persona.id}`}
        className="flex min-w-0 flex-1 basis-40 items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Avatar
          nombre={persona.nombre}
          apellido={persona.apellido}
          foto={persona.foto_url}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {persona.nombre} {persona.apellido}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {persona.programa.nombre} · Semestre {persona.semestre}
          </span>
        </span>
      </Link>
      {children}
    </li>
  );
}
