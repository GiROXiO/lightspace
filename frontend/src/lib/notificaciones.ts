// Las notificaciones las crean los triggers; aquí solo se leen y se marcan.
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { PaginaNotificaciones } from "@/types/api";
import { api, type Metodo } from "./api";

export const useNotificaciones = (soloNoLeidas: boolean) =>
  useInfiniteQuery({
    queryKey: ["notificaciones", "lista", soloNoLeidas],
    queryFn: ({ pageParam }) =>
      api<PaginaNotificaciones>("GET", "/notificaciones", {
        consulta: { solo_no_leidas: soloNoLeidas, pagina: pageParam },
      }),
    initialPageParam: 1,
    getNextPageParam: (p) =>
      p.pagina * p.tamano < p.total ? p.pagina + 1 : undefined,
  });

// El número de la campana: se vuelve a pedir cada 30 segundos
export const useSinLeer = () =>
  useQuery({
    queryKey: ["notificaciones", "sin-leer"],
    queryFn: () =>
      api<PaginaNotificaciones>("GET", "/notificaciones", {
        consulta: { tamano: 1 },
      }),
    select: (p) => p.no_leidas,
    refetchInterval: 30_000,
  });

interface Cambio {
  metodo: Metodo;
  ruta: string; // lo que va después de /notificaciones
}

export function useCambioNotificacion() {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ metodo, ruta }: Cambio) =>
      api<unknown>(metodo, `/notificaciones${ruta}`),
    onSuccess: () =>
      cliente.invalidateQueries({ queryKey: ["notificaciones"] }),
  });
}
