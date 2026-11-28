// Marco compartido por el inicio de sesión y el registro.
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function PantallaAcceso({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
      <section className="flex flex-col justify-center gap-3 bg-linear-to-br from-primary to-primary-oscuro px-6 py-8 text-primary-foreground lg:px-16">
        <p className="font-heading text-4xl font-semibold uppercase lg:text-6xl">
          Lightspace
        </p>
        <p className="h-1 w-16 bg-estrella" />
        <p className="max-w-md text-sm lg:text-lg">
          La red universitaria para compartir cursos, encontrar grupo de estudio
          y conocer a tu gente.
        </p>
      </section>
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-5">
            <h1 className="text-2xl">{titulo}</h1>
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
