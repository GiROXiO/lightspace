// Publicaciones, "me gusta" y comentarios. Todas las claves empiezan por "publicaciones".
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Comentario, Paginado, Publicacion } from "@/types/api";
import { api, type Metodo } from "./api";

const siguiente = (p: Paginado<unknown>) =>
  p.pagina * p.tamano < p.total ? p.pagina + 1 : undefined;

// `ruta` es el feed, las de una persona o el muro de un curso
export const useListaPublicaciones = (
  ruta: string,
  consulta: Record<string, string> = {},
) =>
  useInfiniteQuery({
    queryKey: ["publicaciones", "lista", ruta, consulta],
    queryFn: ({ pageParam }) =>
      api<Paginado<Publicacion>>("GET", ruta, {
        consulta: { ...consulta, pagina: pageParam },
      }),
    initialPageParam: 1,
    getNextPageParam: siguiente,
  });

export const usePublicacion = (id: string) =>
  useQuery({
    queryKey: ["publicaciones", "una", id],
    queryFn: () => api<Publicacion>("GET", `/publicaciones/${id}`),
  });

export const useComentarios = (publicacionId: string) =>
  useInfiniteQuery({
    queryKey: ["publicaciones", "comentarios", publicacionId],
    queryFn: ({ pageParam }) =>
      api<Paginado<Comentario>>(
        "GET",
        `/publicaciones/${publicacionId}/comentarios`,
        { consulta: { pagina: pageParam } },
      ),
    initialPageParam: 1,
    getNextPageParam: siguiente,
  });

interface Cambio {
  metodo: Metodo;
  ruta: string; // lo que va después de /publicaciones
  cuerpo?: unknown;
}

// Una sola mutación para crear, editar, borrar, dar "me gusta" y comentar
export function useCambioPublicacion() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ metodo, ruta, cuerpo }: Cambio) =>
      api<unknown>(metodo, `/publicaciones${ruta}`, { cuerpo }),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["publicaciones"] }),
  });
}
