import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { api, EVENTO_SESION_VENCIDA, token } from "@/lib/api";
import type { DatosRegistro, MiPerfil, RespuestaAuth } from "@/types/api";
import { ContextoSesion } from "./contexto";

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [actual, setActual] = useState(token.leer);
  const cliente = useQueryClient();

  const perfil = useQuery({
    queryKey: ["yo"],
    queryFn: () => api<MiPerfil>("GET", "/usuarios/me"),
    enabled: actual !== null,
  });

  const cerrarSesion = useCallback(() => {
    token.borrar();
    setActual(null);
    cliente.clear();
  }, [cliente]);

  useEffect(() => {
    window.addEventListener(EVENTO_SESION_VENCIDA, cerrarSesion);
    return () =>
      window.removeEventListener(EVENTO_SESION_VENCIDA, cerrarSesion);
  }, [cerrarSesion]);

  const entrar = useCallback(
    (respuesta: RespuestaAuth) => {
      cliente.clear();
      token.guardar(respuesta.access_token);
      setActual(respuesta.access_token);
    },
    [cliente],
  );

  const iniciarSesion = useCallback(
    async (email: string, password: string) => {
      entrar(
        await api<RespuestaAuth>("POST", "/auth/login", {
          cuerpo: { email, password },
        }),
      );
    },
    [entrar],
  );

  const registrarse = useCallback(
    async (datos: DatosRegistro) => {
      entrar(
        await api<RespuestaAuth>("POST", "/auth/registro", { cuerpo: datos }),
      );
    },
    [entrar],
  );

  return (
    <ContextoSesion.Provider
      value={{
        usuario: perfil.data,
        autenticado: actual !== null,
        cargando: actual !== null && perfil.isPending,
        error: perfil.error,
        iniciarSesion,
        registrarse,
        cerrarSesion,
      }}
    >
      {children}
    </ContextoSesion.Provider>
  );
}
