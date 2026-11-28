import { Navigate, Route, Routes } from "react-router";
import { Disposicion } from "@/components/Disposicion";
import { Buscar } from "@/paginas/Buscar";
import { Curso } from "@/paginas/Curso";
import { Cursos } from "@/paginas/Cursos";
import { EditarPerfil } from "@/paginas/EditarPerfil";
import { Inicio } from "@/paginas/Inicio";
import { Login } from "@/paginas/Login";
import { Notificaciones } from "@/paginas/Notificaciones";
import { Perfil } from "@/paginas/Perfil";
import { PerfilPublico } from "@/paginas/PerfilPublico";
import { Registro } from "@/paginas/Registro";
import { VerPublicacion } from "@/paginas/VerPublicacion";
import { RutaProtegida } from "@/sesion/RutaProtegida";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route element={<RutaProtegida />}>
        <Route element={<Disposicion />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/publicaciones/:id" element={<VerPublicacion />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/usuarios/:id" element={<PerfilPublico />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/cursos/:id" element={<Curso />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/editar" element={<EditarPerfil />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
