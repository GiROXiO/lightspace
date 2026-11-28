import { useState, type SubmitEvent } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { Campo } from "@/components/Campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { USAR_MOCKS } from "@/lib/api";
import { useSesion } from "@/sesion/contexto";
import { PantallaAcceso } from "./PantallaAcceso";

export function Login() {
  const { autenticado, iniciarSesion } = useSesion();
  const ubicacion = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Si venía de una pantalla protegida, vuelve a ella
  const desde = (ubicacion.state as { desde?: string } | null)?.desde ?? "/";
  if (autenticado) return <Navigate to={desde} replace />;

  const entrar = async (evento: SubmitEvent) => {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await iniciarSesion(email.trim(), password);
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  };

  const usarDemo = () => {
    setEmail("demo.sistemas@lightspace.example.com");
    setPassword("Lightspace123!");
  };

  return (
    <PantallaAcceso titulo="Iniciar sesión">
      <form onSubmit={entrar} className="space-y-4">
        <Campo etiqueta="Correo" id="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="h-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Contraseña" id="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Campo>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="h-10 w-full" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </Button>
        {USAR_MOCKS && (
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full"
            onClick={usarDemo}
          >
            Rellenar con la cuenta demo
          </Button>
        )}
      </form>
      <p className="text-center text-sm">
        ¿No tienes cuenta?{" "}
        <Link
          to="/registro"
          className="font-semibold text-primary hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </PantallaAcceso>
  );
}
