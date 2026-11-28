import type { Metodo } from "@/lib/api";
import { aDataUrl } from "./archivos";
import { despachar } from "./servidor";
// Cada archivo de rutas se importa aquí para que quede registrado
import "./cuenta";
import "./cursos";
import "./conexiones";
import "./publicaciones";
import "./muro";

const RETARDO_MS = 250;

export async function atender(
  metodo: Metodo,
  url: string,
  cuerpo: unknown,
  tokenActual: string | null,
) {
  await new Promise((listo) => setTimeout(listo, RETARDO_MS));
  const usuarioId = tokenActual?.startsWith("mock-")
    ? tokenActual.slice(5)
    : null;
  // Las rutas simuladas son síncronas: el archivo se convierte antes
  const entrada =
    cuerpo instanceof FormData
      ? { url: await aDataUrl(cuerpo.get("archivo") as File) }
      : cuerpo;
  const { estado, datos } = despachar(metodo, url, entrada, usuarioId);
  // Copia para que las pantallas no modifiquen los datos simulados sin querer
  return {
    estado,
    datos: datos === undefined ? undefined : structuredClone(datos),
  };
}
