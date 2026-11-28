// Único punto de contacto con el backend. Las pantallas no saben si los datos son simulados o reales.

const URL_API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
export const USAR_MOCKS = import.meta.env.VITE_USAR_MOCKS !== "false";

const CLAVE_TOKEN = "lightspace.token";

export const token = {
  leer: () => localStorage.getItem(CLAVE_TOKEN),
  guardar: (valor: string) => localStorage.setItem(CLAVE_TOKEN, valor),
  borrar: () => localStorage.removeItem(CLAVE_TOKEN),
};

export class ErrorApi extends Error {
  estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
  }
}

export type Metodo = "GET" | "POST" | "PATCH" | "DELETE";

interface Opciones {
  cuerpo?: unknown;
  consulta?: Record<string, string | number | boolean | undefined>;
}

// Se avisa a la sesión cuando el token deja de valer
export const EVENTO_SESION_VENCIDA = "lightspace:sesion-vencida";

function armarRuta(ruta: string, consulta: Opciones["consulta"]) {
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(consulta ?? {})) {
    if (valor !== undefined && valor !== "")
      parametros.set(clave, String(valor));
  }
  const texto = parametros.toString();
  return texto ? `${ruta}?${texto}` : ruta;
}

async function enviar(
  metodo: Metodo,
  ruta: string,
  cuerpo: unknown,
): Promise<{ estado: number; datos?: unknown }> {
  if (USAR_MOCKS) {
    const { atender } = await import("@/mocks");
    return atender(metodo, ruta, cuerpo, token.leer());
  }

  // Los archivos viajan como FormData: el navegador pone el Content-Type
  const esArchivo = cuerpo instanceof FormData;
  const cabeceras: Record<string, string> = {};
  if (cuerpo !== undefined && !esArchivo)
    cabeceras["Content-Type"] = "application/json";
  const actual = token.leer();
  if (actual) cabeceras.Authorization = `Bearer ${actual}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined || esArchivo ? cuerpo : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi(0, "No hay conexión con el servidor");
  }
  const datos =
    respuesta.status === 204
      ? undefined
      : await respuesta.json().catch(() => undefined);
  return { estado: respuesta.status, datos };
}

export async function api<T>(
  metodo: Metodo,
  ruta: string,
  opciones: Opciones = {},
): Promise<T> {
  const { estado, datos } = await enviar(
    metodo,
    armarRuta(ruta, opciones.consulta),
    opciones.cuerpo,
  );

  if (estado >= 200 && estado < 300) return datos as T;

  const detalle = (datos as { detail?: unknown } | undefined)?.detail;
  const mensaje =
    typeof detalle === "string"
      ? detalle
      : estado === 422
        ? "Revisa los datos ingresados"
        : "Algo salió mal";

  // El login con credenciales malas también es 401, pero no es una sesión vencida
  if (estado === 401 && !ruta.startsWith("/auth/"))
    window.dispatchEvent(new Event(EVENTO_SESION_VENCIDA));

  throw new ErrorApi(estado, mensaje);
}
