// Las claves empiezan por "social" y "cursos": así se actualizan solas al
// conectar con alguien o al seguir un curso.
import { useQuery } from "@tanstack/react-query";
import type { CursoRecomendado, PersonaRecomendada } from "@/types/api";
import { api } from "./api";

export const usePersonasRecomendadas = (limite: number) =>
  useQuery({
    queryKey: ["social", "recomendadas", limite],
    queryFn: () =>
      api<PersonaRecomendada[]>("GET", "/recomendaciones/personas", {
        consulta: { limite },
      }),
  });

export const useCursosRecomendados = (limite: number) =>
  useQuery({
    queryKey: ["cursos", "recomendados", limite],
    queryFn: () =>
      api<CursoRecomendado[]>("GET", "/recomendaciones/cursos", {
        consulta: { limite },
      }),
  });
