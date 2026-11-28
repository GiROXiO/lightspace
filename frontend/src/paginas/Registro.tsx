// Las reglas de cada campo son las de POST /auth/registro en docs/api.md.
import { useState, type SubmitEvent } from "react";
import { Link, Navigate } from "react-router";
import { Campo } from "@/components/Campo";
import { SelectorIntereses } from "@/components/SelectorIntereses";
import { CLASE_SELECT, SelectorSemestre } from "@/components/SelectorSemestre";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgramas } from "@/lib/catalogos";
import { useSesion } from "@/sesion/contexto";
import { PantallaAcceso } from "./PantallaAcceso";

export function Registro() {
  const { autenticado, registrarse } = useSesion();
  const programas = useProgramas();
  const [programa, setPrograma] = useState("");
  const [intereses, setIntereses] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (autenticado) return <Navigate to="/" replace />;

  const enviar = async (evento: SubmitEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const texto = (campo: string) => String(datos.get(campo) ?? "").trim();
    setError("");
    setEnviando(true);
    try {
      await registrarse({
        nombre: texto("nombre"),
        apellido: texto("apellido"),
        email: texto("email"),
        password: String(datos.get("password")),
        codigo: texto("codigo"),
        semestre: Number(datos.get("semestre")),
        programa,
        intereses,
      });
    } catch (e) {
      setError((e as Error).message);
      setEnviando(false);
    }
  };

  return (
    <PantallaAcceso titulo="Crear cuenta">
      <form onSubmit={enviar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre" id="nombre">
            <Input
              id="nombre"
              name="nombre"
              autoComplete="given-name"
              required
              maxLength={60}
              pattern=".*\S.*"
              className="h-10"
            />
          </Campo>
          <Campo etiqueta="Apellido" id="apellido">
            <Input
              id="apellido"
              name="apellido"
              autoComplete="family-name"
              required
              maxLength={60}
              pattern=".*\S.*"
              className="h-10"
            />
          </Campo>
        </div>
        <Campo etiqueta="Correo" id="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-10"
          />
        </Campo>
        <Campo etiqueta="Contraseña" id="password" ayuda="Mínimo 8 caracteres">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="h-10"
          />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Código estudiantil" id="codigo" ayuda="9 dígitos">
            <Input
              id="codigo"
              name="codigo"
              inputMode="numeric"
              required
              pattern="[0-9]{9}"
              maxLength={9}
              className="h-10"
            />
          </Campo>
          <Campo etiqueta="Semestre" id="semestre">
            <SelectorSemestre id="semestre" name="semestre" defaultValue="1" />
          </Campo>
        </div>
        <Campo etiqueta="Programa" id="programa">
          <select
            id="programa"
            required
            className={CLASE_SELECT}
            value={programa}
            onChange={(e) => setPrograma(e.target.value)}
          >
            <option value="" disabled>
              {programas.isPending ? "Cargando..." : "Elige tu programa"}
            </option>
            {programas.data?.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <SelectorIntereses seleccion={intereses} cambiar={setIntereses} />
        {(error || programas.error) && (
          <p role="alert" className="text-sm text-destructive">
            {error || programas.error?.message}
          </p>
        )}
        <Button type="submit" className="h-10 w-full" disabled={enviando}>
          {enviando ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
      <p className="text-center text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </PantallaAcceso>
  );
}
