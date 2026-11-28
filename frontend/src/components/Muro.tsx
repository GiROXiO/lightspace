// Muro del curso: lo ve cualquiera con sesión.
import { useState } from "react";
import { ListaPublicaciones } from "@/components/ListaPublicaciones";
import { PublicarEnCurso } from "@/components/PublicarEnCurso";
import type { CursoDetalle } from "@/types/api";

const FILTROS = [
  { tipo: "", texto: "Todo" },
  { tipo: "PREGUNTA", texto: "Preguntas" },
  { tipo: "MATERIAL", texto: "Material" },
  { tipo: "BUSCA_GRUPO", texto: "Busco grupo" },
];

export function Muro({ curso }: { curso: CursoDetalle }) {
  const [tipo, setTipo] = useState("");

  return (
    <section aria-label="Muro del curso" className="space-y-4">
      <h2 className="text-lg">Muro del curso</h2>
      <PublicarEnCurso curso={curso} />
      <div className="flex gap-4 overflow-x-auto border-b">
        {FILTROS.map((filtro) => (
          <button
            key={filtro.texto}
            type="button"
            aria-pressed={tipo === filtro.tipo}
            onClick={() => setTipo(filtro.tipo)}
            className={`shrink-0 border-b-2 px-1 py-2 text-sm font-semibold ${
              tipo === filtro.tipo
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {filtro.texto}
          </button>
        ))}
      </div>
      <ListaPublicaciones
        ruta={`/cursos/${curso.id}/muro`}
        consulta={{ tipo }}
        enCurso
        vacio="Aquí todavía no hay publicaciones."
      />
    </section>
  );
}
