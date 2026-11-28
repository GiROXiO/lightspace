import { Navigate, Route, Routes } from "react-router";
import { Inicio } from "@/paginas/Inicio";
import { Login } from "@/paginas/Login";
import { RutaProtegida } from "@/sesion/RutaProtegida";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RutaProtegida />}>
        <Route path="/" element={<Inicio />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
