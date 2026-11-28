// Subida simulada: la imagen se achica y su "dirección" es ella misma (data:).
import { fallo, ok, ruta } from "./servidor";

const LADO_MAXIMO = 480; // pequeña para que quepa en localStorage

export async function aDataUrl(archivo: File) {
  try {
    const imagen = await createImageBitmap(archivo);
    const escala = Math.min(
      1,
      LADO_MAXIMO / Math.max(imagen.width, imagen.height),
    );
    const lienzo = document.createElement("canvas");
    lienzo.width = Math.round(imagen.width * escala);
    lienzo.height = Math.round(imagen.height * escala);
    lienzo
      .getContext("2d")!
      .drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    return lienzo.toDataURL("image/webp", 0.8);
  } catch {
    return null; // no era una imagen
  }
}

ruta("POST", "/archivos", ({ cuerpo }) => {
  const { url } = cuerpo as { url: string | null };
  return url
    ? ok({ url, url_miniatura: url }, 201)
    : fallo(400, "El archivo no es una imagen JPG, PNG o WebP válida");
});
