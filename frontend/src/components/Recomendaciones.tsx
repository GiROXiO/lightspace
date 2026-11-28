// Personas y cursos recomendados, con el motivo de cada uno.
import { Star } from "lucide-react";
import { Link } from "react-router";
import { Avatar } from "@/components/Avatar";
import { BotonesConexion } from "@/components/BotonesConexion";
import { Portada } from "@/components/Portada";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCursosRecomendados,
  usePersonasRecomendadas,
} from "@/lib/recomendaciones";
import type { CursoRecomendado, PersonaRecomendada } from "@/types/api";

const contar = (n: number, uno: string, varios: string) =>
  n > 0 ? `${n} ${n === 1 ? uno : varios}` : null;

const motivoPersona = (p: PersonaRecomendada) =>
  [
    contar(p.conexiones_comunes, "conexión en común", "conexiones en común"),
    contar(p.cursos_comunes.length, "curso en común", "cursos en común"),
    contar(
      p.intereses_comunes.length,
      "interés en común",
      "intereses en común",
    ),
  ]
    .filter(Boolean)
    .join(" · ") || p.programas.join(", ");

const motivoCurso = (c: CursoRecomendado) =>
  [
    contar(c.intereses_comunes.length, "interés tuyo", "intereses tuyos"),
    contar(c.seguidores_parecidos, "persona afín", "personas afines"),
  ]
    .filter(Boolean)
    .join(" · ") || "De tu programa";

export function PersonasRecomendadas({ limite }: { limite: number }) {
  const { data } = usePersonasRecomendadas(limite);
  if (!data?.length) return null;

  return (
    <Card>
      <CardContent>
        <h2 className="text-base">Quizá conozcas</h2>
        <ul className="divide-y">
          {data.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
              <Link
                to={`/usuarios/${p.id}`}
                className="flex min-w-0 flex-1 basis-40 items-center gap-3"
              >
                <Avatar
                  nombre={p.nombre}
                  apellido={p.apellido}
                  foto={p.foto_url}
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {p.nombre} {p.apellido}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {motivoPersona(p)}
                  </span>
                </span>
              </Link>
              <BotonesConexion usuarioId={p.id} relacion="NINGUNA" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Lista corta para el panel del inicio
export function CursosSugeridos({ limite }: { limite: number }) {
  const { data } = useCursosRecomendados(limite);
  if (!data?.length) return null;

  return (
    <Card>
      <CardContent>
        <h2 className="text-base">Cursos para ti</h2>
        <ul className="divide-y">
          {data.map((c) => (
            <li key={c.id} className="py-2">
              <Link to={`/cursos/${c.id}`} className="block">
                <span className="block text-sm font-semibold">{c.nombre}</span>
                <span className="block text-xs text-muted-foreground">
                  {c.codigo} · {motivoCurso(c)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Pestaña "Recomendados" de Cursos
export function CursosRecomendados() {
  const { data, isPending, error } = useCursosRecomendados(12);
  const aviso = isPending
    ? "Cargando recomendaciones..."
    : (error?.message ??
      (data?.length === 0 ? "Por ahora no hay recomendaciones." : null));

  if (aviso)
    return <p className="py-8 text-center text-muted-foreground">{aviso}</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data?.map((c) => (
        <Link key={c.id} to={`/cursos/${c.id}`}>
          <Card className="h-full gap-2 pt-0 pb-3 transition-shadow hover:shadow-md">
            <Portada url={c.portada_url} materia={c.materia} alta />
            <div className="space-y-1 px-3">
              <p className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {c.codigo} · {c.creditos} créditos
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-estrella text-estrella" />
                  {c.estrellas}
                </span>
              </p>
              <h2 className="text-base leading-snug">{c.nombre}</h2>
              <p className="text-xs font-semibold text-primary">
                {motivoCurso(c)}
              </p>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
