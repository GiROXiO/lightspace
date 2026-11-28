// Caja para publicar en el muro. Lo que se puede publicar depende de la relación.
import { useState, type SubmitEvent } from "react";
import { BotonImagen, VistaPrevia } from "@/components/Adjuntos";
import { CLASE_SELECT } from "@/components/SelectorSemestre";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCambioMuro } from "@/lib/muro";
import { useImagenes } from "@/lib/useImagenes";
import type { CursoDetalle, TipoPublicacion } from "@/types/api";

type Tipo = Exclude<TipoPublicacion, "GENERAL">;

const TIPOS: Record<Tipo, { texto: string; ayuda: string }> = {
  PREGUNTA: { texto: "Pregunta", ayuda: "¿Qué quieres preguntar?" },
  MATERIAL: { texto: "Material", ayuda: "¿Qué material compartes?" },
  BUSCA_GRUPO: { texto: "Busco grupo", ayuda: "Cuenta qué grupo buscas" },
};

function Formulario({ cursoId, tipos }: { cursoId: string; tipos: Tipo[] }) {
  const [tipo, setTipo] = useState<Tipo>("PREGUNTA");
  const [contenido, setContenido] = useState("");
  const [enlace, setEnlace] = useState("");
  const [actividad, setActividad] = useState("");
  const [cupos, setCupos] = useState(3);
  const imagenes = useImagenes(4);
  const cambio = useCambioMuro();
  // Si deja de estar inscrito, las otras opciones desaparecen
  const actual = tipos.includes(tipo) ? tipo : "PREGUNTA";

  const enviar = (evento: SubmitEvent) => {
    evento.preventDefault();
    cambio.mutate(
      {
        metodo: "POST",
        ruta: `/${cursoId}/publicaciones`,
        cuerpo: {
          tipo: actual,
          contenido: contenido.trim(),
          imagenes: imagenes.urls,
          enlace: actual === "MATERIAL" ? enlace.trim() : null,
          actividad: actual === "BUSCA_GRUPO" ? actividad.trim() : null,
          cupos: actual === "BUSCA_GRUPO" ? cupos : null,
        },
      },
      {
        onSuccess: () => {
          setContenido("");
          setEnlace("");
          setActividad("");
          imagenes.vaciar();
        },
      },
    );
  };

  return (
    <form onSubmit={enviar} className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tipos.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={actual === t}
            onClick={() => setTipo(t)}
            className={`rounded-full border px-3 py-1 text-sm ${
              actual === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input hover:bg-muted"
            }`}
          >
            {TIPOS[t].texto}
          </button>
        ))}
      </div>
      <Textarea
        aria-label="Publicar en el curso"
        placeholder={TIPOS[actual].ayuda}
        required
        maxLength={2000}
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
      />
      {actual === "MATERIAL" && (
        <Input
          type="url"
          aria-label="Enlace del material"
          placeholder="https://..."
          required
          pattern="https?://.+"
          value={enlace}
          onChange={(e) => setEnlace(e.target.value)}
        />
      )}
      {actual === "BUSCA_GRUPO" && (
        <div className="grid grid-cols-[1fr_8rem] gap-2">
          <Input
            aria-label="Actividad"
            placeholder="¿Para qué actividad?"
            required
            maxLength={100}
            className="h-10"
            value={actividad}
            onChange={(e) => setActividad(e.target.value)}
          />
          <select
            aria-label="Cupos"
            className={CLASE_SELECT}
            value={cupos}
            onChange={(e) => setCupos(Number(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? "cupo" : "cupos"}
              </option>
            ))}
          </select>
        </div>
      )}
      <VistaPrevia imagenes={imagenes} />
      {cambio.error && (
        <p role="alert" className="text-xs text-destructive">
          {cambio.error.message}
        </p>
      )}
      <div className="flex items-center justify-between">
        <BotonImagen imagenes={imagenes} />
        <Button
          type="submit"
          disabled={!contenido.trim() || imagenes.subiendo || cambio.isPending}
        >
          {cambio.isPending ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </form>
  );
}

export function PublicarEnCurso({ curso }: { curso: CursoDetalle }) {
  const tipos: Tipo[] =
    curso.relacion === "INSCRITO"
      ? ["PREGUNTA", "MATERIAL", "BUSCA_GRUPO"]
      : curso.relacion === "SIGUE"
        ? ["PREGUNTA"]
        : [];

  return (
    <Card>
      <CardContent>
        {tipos.length > 0 ? (
          <Formulario cursoId={curso.id} tipos={tipos} />
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Sigue el curso para preguntar, o inscríbete para compartir material
            y buscar grupo.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
