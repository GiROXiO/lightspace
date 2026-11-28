import { Link } from "react-router";
import { Portada } from "@/components/Portada";
import { Card } from "@/components/ui/card";
import type { CursoItem, RelacionCurso } from "@/types/api";

interface Estado {
  matriculado: boolean;
  relacion: RelacionCurso;
}

export function EtiquetasCurso({ matriculado, relacion }: Estado) {
  const base = "rounded-full px-2 py-0.5 text-xs font-semibold";
  return (
    <span className="flex flex-wrap gap-1 empty:hidden">
      {matriculado && (
        <span className={`${base} bg-secondary`}>Matriculado</span>
      )}
      {relacion === "INSCRITO" && (
        <span className={`${base} bg-primary text-primary-foreground`}>
          Inscrito
        </span>
      )}
      {relacion === "SIGUE" && (
        <span className={`${base} bg-accent text-accent-foreground`}>
          Siguiendo
        </span>
      )}
    </span>
  );
}

export function TarjetaCurso({ curso }: { curso: CursoItem }) {
  return (
    <Link
      to={`/cursos/${curso.id}`}
      className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full gap-2 pt-0 pb-3 transition-shadow hover:shadow-md">
        <Portada url={curso.portada_url} materia={curso.materia} alta />
        <div className="space-y-1 px-3">
          <p className="text-xs text-muted-foreground">
            {curso.codigo} · {curso.creditos} créditos
          </p>
          <h2 className="text-base leading-snug">{curso.nombre}</h2>
          <EtiquetasCurso
            matriculado={curso.matriculado}
            relacion={curso.relacion}
          />
        </div>
      </Card>
    </Link>
  );
}
