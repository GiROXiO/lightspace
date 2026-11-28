// Detalle de un curso: seguir, inscribirse y dar estrella.
import { ArrowLeft, Star } from "lucide-react";
import { Link, useParams } from "react-router";
import { Portada } from "@/components/Portada";
import { EtiquetasCurso } from "@/components/TarjetaCurso";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAccionCurso, useCurso } from "@/lib/cursos";
import type { CursoDetalle } from "@/types/api";

function Acciones({ curso }: { curso: CursoDetalle }) {
  const accion = useAccionCurso(curso.id);
  const inscrito = curso.relacion === "INSCRITO";
  const sigue = curso.relacion === "SIGUE";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(curso.matriculado || inscrito) && (
          <Button
            variant={inscrito ? "outline" : "default"}
            className="h-9"
            disabled={accion.isPending}
            onClick={() =>
              accion.mutate({
                metodo: inscrito ? "DELETE" : "POST",
                accion: "inscripcion",
              })
            }
          >
            {inscrito ? "Cancelar inscripción" : "Inscribirme"}
          </Button>
        )}
        {/* Seguir e inscribirse son excluyentes */}
        {!inscrito && (
          <Button
            variant={sigue ? "outline" : "secondary"}
            className="h-9"
            disabled={accion.isPending}
            onClick={() =>
              accion.mutate({
                metodo: sigue ? "DELETE" : "POST",
                accion: "seguir",
              })
            }
          >
            {sigue ? "Dejar de seguir" : "Seguir"}
          </Button>
        )}
        {/* La estrella no depende de seguirlo ni de estar inscrito, como en GitHub */}
        <Button
          variant="outline"
          className="h-9"
          aria-pressed={curso.dio_estrella}
          aria-label={curso.dio_estrella ? "Quitar estrella" : "Dar estrella"}
          disabled={accion.isPending}
          onClick={() =>
            accion.mutate({
              metodo: curso.dio_estrella ? "DELETE" : "POST",
              accion: "estrella",
            })
          }
        >
          <Star
            className={curso.dio_estrella ? "fill-estrella text-estrella" : ""}
          />
          {curso.total_estrellas}
        </Button>
      </div>
      {!curso.matriculado && !inscrito && (
        <p className="text-xs text-muted-foreground">
          Para inscribirte necesitas tenerlo matriculado en el periodo vigente.
        </p>
      )}
      {accion.error && (
        <p role="alert" className="text-sm text-destructive">
          {accion.error.message}
        </p>
      )}
    </div>
  );
}

export function Curso() {
  const { id = "" } = useParams();
  const { data: curso, isPending, error } = useCurso(id);

  return (
    <div className="space-y-4">
      <Link
        to="/cursos"
        className="inline-flex items-center gap-1 text-sm hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Cursos
      </Link>
      {isPending && (
        <p className="py-8 text-center text-muted-foreground">Cargando...</p>
      )}
      {error && (
        <p className="py-8 text-center text-destructive">{error.message}</p>
      )}
      {curso && (
        <div className="grid items-start gap-4 lg:grid-cols-[24rem_1fr]">
          <Card className="pt-0">
            <Portada url={curso.portada_url} materia={curso.materia} />
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {curso.codigo} · {curso.creditos} créditos · {curso.nivel} ·
                  Semestre {curso.semestre_sugerido}
                </p>
                <h1 className="text-2xl">{curso.nombre}</h1>
                <p className="text-sm font-semibold">{curso.departamento}</p>
                <EtiquetasCurso
                  matriculado={curso.matriculado}
                  relacion={curso.relacion}
                />
                {curso.matricula && (
                  <p className="text-xs text-muted-foreground">
                    Periodo {curso.matricula.periodo} · NRC{" "}
                    {curso.matricula.nrc}
                  </p>
                )}
              </div>
              <Acciones curso={curso} />
              <p className="text-sm">{curso.descripcion}</p>
              <p className="text-sm text-muted-foreground">
                {curso.total_inscritos} inscritos · {curso.total_seguidores}{" "}
                seguidores
              </p>
              <ul
                aria-label="Temas"
                className="flex flex-wrap gap-2 empty:hidden"
              >
                {curso.intereses.map((interes) => (
                  <li
                    key={interes}
                    className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"
                  >
                    {interes}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">
                Programas: {curso.programas.map((p) => p.nombre).join(", ")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6 text-center">
              <h2 className="text-lg">Muro del curso</h2>
              <p className="text-sm text-muted-foreground">
                Todavía está en construcción.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
