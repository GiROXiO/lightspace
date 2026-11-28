import { createContext, useContext } from "react";
import type { DatosRegistro, MiPerfil } from "@/types/api";

export interface Sesion {
  usuario: MiPerfil | undefined;
  autenticado: boolean;
  cargando: boolean;
  error: Error | null;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrarse: (datos: DatosRegistro) => Promise<void>;
  cerrarSesion: () => void;
}

export const ContextoSesion = createContext<Sesion | null>(null);

export function useSesion() {
  const sesion = useContext(ContextoSesion);
  if (!sesion)
    throw new Error("useSesion debe usarse dentro de ProveedorSesion");
  return sesion;
}
