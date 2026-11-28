// Caja para publicar: texto, hasta 4 imágenes, o ambos.
import { useState, type SubmitEvent } from "react";
import { BotonImagen, VistaPrevia } from "@/components/Adjuntos";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCambioPublicacion } from "@/lib/publicaciones";
import { useImagenes } from "@/lib/useImagenes";

export function NuevaPublicacion() {
  const [texto, setTexto] = useState("");
  const imagenes = useImagenes(4);
  const cambio = useCambioPublicacion();
  const vacia = !texto.trim() && imagenes.urls.length === 0;

  const enviar = (evento: SubmitEvent) => {
    evento.preventDefault();
    cambio.mutate(
      {
        metodo: "POST",
        ruta: "",
        cuerpo: { contenido: texto.trim(), imagenes: imagenes.urls },
      },
      {
        onSuccess: () => {
          setTexto("");
          imagenes.vaciar();
        },
      },
    );
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={enviar} className="space-y-3">
          <Textarea
            aria-label="Nueva publicación"
            placeholder="¿Qué quieres compartir?"
            maxLength={2000}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
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
              disabled={vacia || imagenes.subiendo || cambio.isPending}
            >
              {cambio.isPending ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
