// Mini servidor simulado: cada archivo de rutas las registra con `ruta()`.
import type { Metodo } from "@/lib/api";

export interface Peticion {
  partes: Record<string, string>;
  consulta: URLSearchParams;
  cuerpo: unknown;
  usuarioId: string | null;
}

export interface Respuesta {
  estado: number;
  datos?: unknown;
}

interface Ruta {
  metodo: Metodo;
  patron: string[];
  protegida: boolean;
  manejar: (peticion: Peticion) => Respuesta;
}

const rutas: Ruta[] = [];

export function ruta(
  metodo: Metodo,
  patron: string,
  manejar: Ruta["manejar"],
  protegida = true,
) {
  rutas.push({ metodo, patron: patron.split("/"), protegida, manejar });
}

export const ok = (datos: unknown, estado = 200): Respuesta => ({
  estado,
  datos,
});
export const sinContenido = (): Respuesta => ({ estado: 204 });
export const fallo = (estado: number, detail: string): Respuesta => ({
  estado,
  datos: { detail },
});

export function paginar<T>(lista: T[], consulta: URLSearchParams) {
  const pagina = Number(consulta.get("pagina") ?? 1);
  const tamano = Number(consulta.get("tamano") ?? 20);
  return {
    total: lista.length,
    pagina,
    tamano,
    items: lista.slice((pagina - 1) * tamano, pagina * tamano),
  };
}

function coincidir(patron: string[], partes: string[]) {
  if (patron.length !== partes.length) return null;
  const valores: Record<string, string> = {};
  for (let i = 0; i < patron.length; i++) {
    if (patron[i].startsWith(":"))
      valores[patron[i].slice(1)] = decodeURIComponent(partes[i]);
    else if (patron[i] !== partes[i]) return null;
  }
  return valores;
}

const parametros = (r: Ruta) =>
  r.patron.filter((p) => p.startsWith(":")).length;

export function despachar(
  metodo: Metodo,
  url: string,
  cuerpo: unknown,
  usuarioId: string | null,
): Respuesta {
  const [camino, query = ""] = url.split("?");
  const partes = camino.split("/");
  // Las rutas fijas ganan a las que tienen parámetros (ej. /cursos/mios antes que /cursos/:id)
  const ordenadas = [...rutas].sort((a, b) => parametros(a) - parametros(b));
  for (const candidata of ordenadas) {
    if (candidata.metodo !== metodo) continue;
    const valores = coincidir(candidata.patron, partes);
    if (!valores) continue;
    if (candidata.protegida && !usuarioId) return fallo(401, "Falta el token");
    return candidata.manejar({
      partes: valores,
      consulta: new URLSearchParams(query),
      cuerpo,
      usuarioId,
    });
  }
  return fallo(404, "La ruta no existe");
}
