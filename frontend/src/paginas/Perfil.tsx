import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router";
import { Avatar } from "@/components/Avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useSesion } from "@/sesion/contexto";

const mesYAnio = new Intl.DateTimeFormat("es-CO", {
  month: "long",
  year: "numeric",
});

export function Perfil() {
  const { usuario, cerrarSesion } = useSesion();
  const eliminar = useMutation({
    mutationFn: () => api<void>("DELETE", "/usuarios/me"),
    onSuccess: cerrarSesion,
  });

  if (!usuario) return null;

  const datos = [
    ["Facultad", usuario.programa.facultad],
    ["Correo", usuario.email],
    ["Código", usuario.codigo],
    ["En Lightspace desde", mesYAnio.format(new Date(usuario.fecha_registro))],
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <Avatar
              nombre={usuario.nombre}
              apellido={usuario.apellido}
              tamano="lg"
              foto={usuario.foto_url}
            />
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl break-words">
                {usuario.nombre} {usuario.apellido}
              </h1>
              <p className="text-sm font-semibold">{usuario.programa.nombre}</p>
              <p className="text-sm text-muted-foreground">
                Semestre {usuario.semestre}
              </p>
            </div>
          </div>
          <p className="text-sm break-words whitespace-pre-line">
            {usuario.bio || (
              <span className="text-muted-foreground">
                Todavía no has escrito tu biografía.
              </span>
            )}
          </p>
          {usuario.intereses.length > 0 && (
            <ul aria-label="Intereses" className="flex flex-wrap gap-2">
              {usuario.intereses.map((interes) => (
                <li
                  key={interes}
                  className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground"
                >
                  {interes}
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="secondary" className="h-9 w-full">
            <Link to="/perfil/editar">Editar perfil</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <dl className="space-y-2 text-sm">
            {datos.map(([nombre, valor]) => (
              <div
                key={nombre}
                className="flex flex-wrap justify-between gap-x-4"
              >
                <dt className="text-muted-foreground">{nombre}</dt>
                <dd className="break-all">{valor}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <div className="text-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="text-destructive">
              Eliminar mi cuenta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription>
                Se borran tus publicaciones, comentarios, conexiones y cursos.
                No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => eliminar.mutate()}
              >
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {eliminar.error && (
          <p role="alert" className="text-sm text-destructive">
            {eliminar.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
