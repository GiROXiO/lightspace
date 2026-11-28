// Marcador para las secciones que se construyen en los siguientes bloques.
import { Card, CardContent } from "@/components/ui/card";

export function Proximamente({ titulo }: { titulo: string }) {
  return (
    <Card>
      <CardContent className="space-y-2 py-10 text-center">
        <h1 className="text-2xl">{titulo}</h1>
        <p className="text-muted-foreground">
          Esta sección todavía está en construcción.
        </p>
      </CardContent>
    </Card>
  );
}
