// Publicar en el muro de un curso y manejar los grupos de estudio.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UsuarioResumen } from "@/types/api";
import { api, type Metodo } from "./api";

export const useMiembros = (publicacionId: string, activo: boolean) =>
  useQuery({
    queryKey: ["publicaciones", "miembros", publicacionId],
    queryFn: () =>
      api<UsuarioResumen[]>("GET", `/cursos/grupos/${publicacionId}/miembros`),
    enabled: activo,
  });

interface Cambio {
  metodo: Metodo;
  ruta: string; // lo que va después de /cursos
  cuerpo?: unknown;
}

export function useCambioMuro() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ metodo, ruta, cuerpo }: Cambio) =>
      api<unknown>(metodo, `/cursos${ruta}`, { cuerpo }),
    // También al fallar: si el grupo se llenó, hay que verlo cerrado
    onSettled: () => cliente.invalidateQueries({ queryKey: ["publicaciones"] }),
  });
}
