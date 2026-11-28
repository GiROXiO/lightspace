import type { Metodo } from "@/lib/api";
import { despachar } from "./servidor";
// Cada archivo de rutas se importa aquí para que quede registrado
import "./cuenta";

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
  const { estado, datos } = despachar(metodo, url, cuerpo, usuarioId);
  // Copia para que las pantallas no modifiquen los datos simulados sin querer
  return {
    estado,
    datos: datos === undefined ? undefined : structuredClone(datos),
  };
}
