const relativo = new Intl.RelativeTimeFormat("es-CO", { numeric: "auto" });
const corta = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// "hace 5 minutos", "ayer" o la fecha si ya pasó más de una semana
export function hace(iso: string) {
  const segundos = (Date.now() - new Date(iso).getTime()) / 1000;
  if (segundos < 60) return "ahora";
  if (segundos < 3600)
    return relativo.format(-Math.floor(segundos / 60), "minute");
  if (segundos < 86400)
    return relativo.format(-Math.floor(segundos / 3600), "hour");
  if (segundos < 604800)
    return relativo.format(-Math.floor(segundos / 86400), "day");
  return corta.format(new Date(iso));
}
