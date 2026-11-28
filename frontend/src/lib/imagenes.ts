// Subida y direcciones de imágenes (ver "Imágenes" en docs/api.md).
import { api } from "./api";

// El contrato entrega direcciones relativas al gateway
const ORIGEN_API = new URL(
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  window.location.origin,
).origin;

export const TIPOS_IMAGEN = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

export function urlImagen(ruta: string, miniatura = false) {
  // En modo simulado la "dirección" es la propia imagen
  if (ruta.startsWith("data:")) return ruta;
  // Las portadas de curso tienen un solo tamaño
  const conTamano =
    miniatura && !ruta.includes("/portadas/")
      ? ruta.replace(".webp", "_mini.webp")
      : ruta;
  return ORIGEN_API + conTamano;
}

// Devuelve la dirección que se guarda en foto_url, imagenes o imagen_url
export async function subirImagen(archivo: File) {
  // El servidor también lo comprueba; esto evita subir 10 MB para nada
  if (!TIPOS_IMAGEN.split(",").includes(archivo.type))
    throw new Error("Solo se permiten imágenes JPG, PNG o WebP");
  if (archivo.size > MAX_BYTES) throw new Error("La imagen supera los 10 MB");

  const formulario = new FormData();
  formulario.append("archivo", archivo);
  const { url } = await api<{ url: string }>("POST", "/archivos", {
    cuerpo: formulario,
  });
  return url;
}
