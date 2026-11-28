// Catálogos que casi no cambian: se piden una vez y quedan en caché.
import { useQuery } from "@tanstack/react-query";
import type { Programa } from "@/types/api";
import { api } from "./api";

export const useProgramas = () =>
  useQuery({
    queryKey: ["programas"],
    queryFn: () => api<Programa[]>("GET", "/programas"),
    staleTime: Infinity,
  });

export const useIntereses = () =>
  useQuery({
    queryKey: ["intereses"],
    queryFn: () => api<string[]>("GET", "/intereses"),
    staleTime: Infinity,
  });
