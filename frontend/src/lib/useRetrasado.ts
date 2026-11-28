import { useEffect, useState } from "react";

// Devuelve el valor cuando deja de cambiar, para no buscar en cada letra
export function useRetrasado(valor: string, ms = 300) {
  const [retrasado, setRetrasado] = useState(valor);
  useEffect(() => {
    const espera = setTimeout(() => setRetrasado(valor), ms);
    return () => clearTimeout(espera);
  }, [valor, ms]);
  return retrasado;
}
