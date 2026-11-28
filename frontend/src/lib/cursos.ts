// Consultas y acciones de cursos. Todas las claves empiezan por "cursos".
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { CursoDetalle, CursoItem, MiCurso, Paginado } from "@/types/api";
import { api, type Metodo } from "./api";

export interface FiltrosCursos {
  q: string;
  programa: string;
  semestre: string;
}

export const useCursos = (filtros: FiltrosCursos) =>
  useInfiniteQuery({
    queryKey: ["cursos", "lista", filtros],
    queryFn: ({ pageParam }) =>
      api<Paginado<CursoItem>>("GET", "/cursos", {
        consulta: { ...filtros, pagina: pageParam, tamano: 24 },
      }),
    initialPageParam: 1,
    // Mientras busca, deja a la vista los resultados anteriores
    placeholderData: keepPreviousData,
    getNextPageParam: (ultima) =>
      ultima.pagina * ultima.tamano < ultima.total
        ? ultima.pagina + 1
        : undefined,
  });

export const useCurso = (id: string) =>
  useQuery({
    queryKey: ["cursos", "detalle", id],
    queryFn: () => api<CursoDetalle>("GET", `/cursos/${id}`),
  });

export const useMisCursos = () =>
  useQuery({
    queryKey: ["cursos", "mios"],
    queryFn: () => api<MiCurso[]>("GET", "/cursos/mios"),
  });

export interface AccionCurso {
  metodo: Metodo;
  accion: "seguir" | "inscripcion" | "estrella";
}

export function useAccionCurso(id: string) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ metodo, accion }: AccionCurso) =>
      api<unknown>(metodo, `/cursos/${id}/${accion}`),
    // Se devuelve la promesa para que el botón siga ocupado hasta ver el cambio
    onSettled: () => cliente.invalidateQueries({ queryKey: ["cursos"] }),
  });
}
