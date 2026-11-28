import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface Props {
  etiqueta: string;
  id: string;
  ayuda?: string;
  children: ReactNode;
}

export function Campo({ etiqueta, id, ayuda, children }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
    </div>
  );
}
