// Pantalla provisional: el bloque 4 la reemplaza.
import { useState } from "react";
import { Navigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSesion } from "@/sesion/contexto";

export function Login() {
  const { autenticado, iniciarSesion } = useSesion();
  const [error, setError] = useState("");

  if (autenticado) return <Navigate to="/" replace />;

  const entrar = () =>
    iniciarSesion(
      "demo.sistemas@lightspace.example.com",
      "Lightspace123!",
    ).catch((e: Error) => setError(e.message));

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardContent className="space-y-4">
          <h1 className="text-3xl text-primary">Lightspace</h1>
          <Button className="w-full" onClick={entrar}>
            Entrar con la cuenta demo
          </Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </main>
  );
}
