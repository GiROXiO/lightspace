// Edición en el sitio de una publicación o un comentario.
import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  inicial: string;
  maximo: number;
  puedeQuedarVacio: boolean; // solo si tiene imagen
  guardando: boolean;
  guardar: (contenido: string) => void;
  cancelar: () => void;
}

export function EditorTexto(props: Props) {
  const [texto, setTexto] = useState(props.inicial);
  const vacio = !texto.trim() && !props.puedeQuedarVacio;

  const enviar = (evento: SubmitEvent) => {
    evento.preventDefault();
    props.guardar(texto.trim());
  };

  return (
    <form onSubmit={enviar} className="space-y-2">
      <Textarea
        aria-label="Editar texto"
        autoFocus
        maxLength={props.maximo}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={props.cancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={vacio || props.guardando}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
