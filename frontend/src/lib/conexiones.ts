// Búsqueda, perfiles públicos y conexiones. Todas las claves empiezan por "social".
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  Paginado,
  PerfilPublico,
  ResultadoBusqueda,
  Solicitudes,
  UsuarioResumen,
} from "@/types/api";
import { api } from "./api";

const siguiente = (p: Paginado<unknown>) =>
  p.pagina * p.tamano < p.total ? p.pagina + 1 : undefined;

export const useBusqueda = (q: string) =>
  useInfiniteQuery({
    queryKey: ["social", "busqueda", q],
    queryFn: ({ pageParam }) =>
      api<Paginado<ResultadoBusqueda>>("GET", "/busqueda/usuarios", {
        consulta: { q, pagina: pageParam },
      }),
    initialPageParam: 1,
    getNextPageParam: siguiente,
    enabled: q.length >= 2, // mínimo que pide el contrato
  });

export const useConexiones = () =>
  useInfiniteQuery({
    queryKey: ["social", "conexiones"],
    queryFn: ({ pageParam }) =>
      api<Paginado<UsuarioResumen & { desde: string }>>("GET", "/conexiones", {
        consulta: { pagina: pageParam },
      }),
    initialPageParam: 1,
    getNextPageParam: siguiente,
  });

export const useSolicitudes = () =>
  useQuery({
    queryKey: ["social", "solicitudes"],
    queryFn: () => api<Solicitudes>("GET", "/conexiones/solicitudes"),
  });

export const usePerfilPublico = (id: string) =>
  useQuery({
    queryKey: ["social", "perfil", id],
    queryFn: () => api<PerfilPublico>("GET", `/usuarios/${id}`),
  });

export type AccionConexion = "enviar" | "aceptar" | "quitar";

export function useAccionConexion(usuarioId: string) {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (accion: AccionConexion) => {
      if (accion === "enviar")
        return api<unknown>("POST", "/conexiones", {
          cuerpo: { usuario_id: usuarioId },
        });
      if (accion === "aceptar")
        return api<unknown>("POST", `/conexiones/${usuarioId}/aceptar`);
      // Sirve para rechazar, cancelar o eliminar
      return api<unknown>("DELETE", `/conexiones/${usuarioId}`);
    },
    onSettled: () => cliente.invalidateQueries({ queryKey: ["social"] }),
  });
}
