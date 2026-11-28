// Solo se editan los campos que permite PATCH /usuarios/me.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Campo } from "@/components/Campo";
import { SelectorIntereses } from "@/components/SelectorIntereses";
import { SelectorSemestre } from "@/components/SelectorSemestre";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useSesion } from "@/sesion/contexto";
import type { CambiosPerfil, MiPerfil } from "@/types/api";

function Formulario({ usuario }: { usuario: MiPerfil }) {
  const cliente = useQueryClient();
  const navegar = useNavigate();
  const [nombre, setNombre] = useState(usuario.nombre);
  const [apellido, setApellido] = useState(usuario.apellido);
  const [bio, setBio] = useState(usuario.bio);
  const [semestre, setSemestre] = useState(usuario.semestre);
  const [intereses, setIntereses] = useState(usuario.intereses);

  const guardar = useMutation({
    mutationFn: (cambios: CambiosPerfil) =>
      api<MiPerfil>("PATCH", "/usuarios/me", { cuerpo: cambios }),
    onSuccess: (actualizado) => {
      cliente.setQueryData(["yo"], actualizado);
      navegar("/perfil");
    },
  });

  const enviar = (evento: SubmitEvent) => {
    evento.preventDefault();
    guardar.mutate({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      bio: bio.trim(),
      semestre,
      intereses,
    });
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre" id="nombre">
          <Input
            id="nombre"
            required
            maxLength={60}
            pattern=".*\S.*"
            className="h-10"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Campo>
        <Campo etiqueta="Apellido" id="apellido">
          <Input
            id="apellido"
            required
            maxLength={60}
            pattern=".*\S.*"
            className="h-10"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
        </Campo>
      </div>
      <Campo etiqueta="Biografía" id="bio" ayuda={`${bio.length}/500`}>
        <Textarea
          id="bio"
          maxLength={500}
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </Campo>
      <Campo etiqueta="Semestre" id="semestre">
        <SelectorSemestre
          id="semestre"
          value={semestre}
          onChange={(e) => setSemestre(Number(e.target.value))}
        />
      </Campo>
      <SelectorIntereses seleccion={intereses} cambiar={setIntereses} />
      {guardar.error && (
        <p role="alert" className="text-sm text-destructive">
          {guardar.error.message}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button asChild variant="outline" className="h-10">
          <Link to="/perfil">Cancelar</Link>
        </Button>
        <Button type="submit" className="h-10" disabled={guardar.isPending}>
          {guardar.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

export function EditarPerfil() {
  const { usuario } = useSesion();
  if (!usuario) return null;

  return (
    <Card>
      <CardContent className="space-y-4">
        <h1 className="text-2xl">Editar perfil</h1>
        <Formulario usuario={usuario} />
      </CardContent>
    </Card>
  );
}
