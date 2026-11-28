// Estructura común: barra lateral en computador, barras arriba y abajo en celular.
import { Bell, BookOpen, House, LogOut, Search, User } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useSesion } from "@/sesion/contexto";

const enlaces = [
  { ruta: "/", texto: "Inicio", Icono: House },
  { ruta: "/buscar", texto: "Buscar", Icono: Search },
  { ruta: "/cursos", texto: "Cursos", Icono: BookOpen },
  { ruta: "/notificaciones", texto: "Notificaciones", Icono: Bell },
  { ruta: "/perfil", texto: "Perfil", Icono: User },
];

function Marca() {
  return (
    <Link
      to="/"
      className="font-heading text-2xl font-semibold tracking-wide text-primary uppercase"
    >
      Lightspace
    </Link>
  );
}

export function Disposicion() {
  const { cerrarSesion } = useSesion();

  const { pathname } = useLocation();
  const ancho = pathname.startsWith("/cursos")
    ? "max-w-6xl"
    : pathname === "/"
      ? "max-w-5xl"
      : "max-w-2xl";

  return (
    <div className="min-h-screen md:pl-60">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-t-4 border-r border-t-primary-oscuro bg-card p-4 md:flex">
        <div className="px-3 py-4">
          <Marca />
        </div>
        <nav className="flex-1 space-y-1">
          {enlaces.map(({ ruta, texto, Icono }) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={ruta === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isActive
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "hover:bg-muted"
                }`
              }
            >
              <Icono className="size-5" />
              {texto}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted"
        >
          <LogOut className="size-5" />
          Cerrar sesión
        </button>
      </aside>

      <header className="sticky top-0 z-10 flex items-center justify-between border-t-4 border-b border-t-primary-oscuro bg-card px-4 py-2 md:hidden">
        <Marca />
        <button
          type="button"
          onClick={cerrarSesion}
          aria-label="Cerrar sesión"
          className="rounded-lg p-2 hover:bg-muted"
        >
          <LogOut className="size-5" />
        </button>
      </header>

      <main className={`mx-auto w-full px-4 py-6 pb-24 md:pb-6 ${ancho}`}>
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t bg-card py-1 md:hidden">
        {enlaces.map(({ ruta, texto, Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            end={ruta === "/"}
            aria-label={texto}
            className={({ isActive }) =>
              `rounded-lg p-3 ${isActive ? "text-primary" : "text-muted-foreground"}`
            }
          >
            <Icono className="size-6" />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
