// Explorar el catálogo y ver mis cursos. Los filtros viven en la dirección,
// así que se conservan al volver desde el detalle.
import { useSearchParams } from "react-router";
import { CLASE_SELECT } from "@/components/SelectorSemestre";
import { TarjetaCurso } from "@/components/TarjetaCurso";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgramas } from "@/lib/catalogos";
import { useCursos, useMisCursos, type FiltrosCursos } from "@/lib/cursos";
import type { CursoItem } from "@/types/api";
import { useRetrasado } from "@/lib/useRetrasado";

const REJILLA = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
const Aviso = ({ texto }: { texto: string }) => (
  <p className="py-8 text-center text-muted-foreground">{texto}</p>
);

function Lista({ cursos }: { cursos: CursoItem[] }) {
  return (
    <div className={REJILLA}>
      {cursos.map((curso) => (
        <TarjetaCurso key={curso.id} curso={curso} />
      ))}
    </div>
  );
}

function Explorar() {
  const [params, setParams] = useSearchParams();
  const programas = useProgramas();
  const texto = params.get("q") ?? "";
  const filtros: FiltrosCursos = {
    q: useRetrasado(texto.trim()),
    programa: params.get("programa") ?? "",
    semestre: params.get("semestre") ?? "",
  };
  const cursos = useCursos(filtros);

  const cambiar = (clave: keyof FiltrosCursos, valor: string) =>
    setParams(
      (actuales) => {
        if (valor) actuales.set(clave, valor);
        else actuales.delete(clave);
        return actuales;
      },
      { replace: true },
    );

  const items = cursos.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-2 lg:grid-cols-[1fr_auto]">
        <Input
          type="search"
          aria-label="Buscar cursos"
          placeholder="Buscar por nombre o código"
          className="h-10 bg-card"
          value={texto}
          onChange={(e) => cambiar("q", e.target.value)}
        />
        <div className="grid grid-cols-[2fr_1fr] gap-2 lg:grid-cols-[18rem_10rem]">
          <select
            aria-label="Programa"
            className={CLASE_SELECT}
            value={filtros.programa}
            onChange={(e) => cambiar("programa", e.target.value)}
          >
            <option value="">Todos los programas</option>
            {programas.data?.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.nombre}
              </option>
            ))}
          </select>
          <select
            aria-label="Semestre sugerido"
            className={CLASE_SELECT}
            value={filtros.semestre}
            onChange={(e) => cambiar("semestre", e.target.value)}
          >
            <option value="">Semestre</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Semestre {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cursos.isPending && <Aviso texto="Cargando cursos..." />}
      {cursos.error && <Aviso texto={cursos.error.message} />}
      {cursos.data && items.length === 0 && (
        <Aviso texto="Ningún curso coincide con la búsqueda." />
      )}
      <Lista cursos={items} />
      {cursos.hasNextPage && (
        <Button
          variant="outline"
          className="h-10 w-full"
          disabled={cursos.isFetchingNextPage}
          onClick={() => cursos.fetchNextPage()}
        >
          {cursos.isFetchingNextPage ? "Cargando..." : "Cargar más"}
        </Button>
      )}
    </div>
  );
}

function MisCursos() {
  const { data, isPending, error } = useMisCursos();
  if (isPending) return <Aviso texto="Cargando cursos..." />;
  if (error) return <Aviso texto={error.message} />;
  if (data.length === 0) {
    return <Aviso texto="Todavía no sigues ni tienes cursos inscritos." />;
  }
  return <Lista cursos={data} />;
}

export function Cursos() {
  const [params, setParams] = useSearchParams();
  const mios = params.get("vista") === "mios";
  const pestanas = [
    { texto: "Explorar", activa: !mios, destino: "" },
    { texto: "Mis cursos", activa: mios, destino: "vista=mios" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Cursos</h1>
      <div className="flex gap-6 border-b">
        {pestanas.map(({ texto, activa, destino }) => (
          <button
            key={texto}
            type="button"
            aria-pressed={activa}
            onClick={() => setParams(destino, { replace: true })}
            className={`border-b-2 px-1 py-2 text-sm font-semibold ${
              activa
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {texto}
          </button>
        ))}
      </div>
      {mios ? <MisCursos /> : <Explorar />}
    </div>
  );
}
