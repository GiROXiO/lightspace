// <select> nativo: se ve como los Input y en el celular abre el selector del sistema.
import type { ComponentProps } from "react";

export const CLASE_SELECT =
  "h-10 w-full rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function SelectorSemestre(props: ComponentProps<"select">) {
  return (
    <select className={CLASE_SELECT} {...props}>
      {Array.from({ length: 10 }, (_, i) => (
        <option key={i + 1} value={i + 1}>
          {i + 1}
        </option>
      ))}
    </select>
  );
}
