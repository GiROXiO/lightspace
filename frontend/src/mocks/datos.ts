// Datos simulados. Los usuarios se guardan en el navegador para que sobrevivan al recargar.
import type { MiPerfil, Programa } from "@/types/api";

const programa = (
  codigo: string,
  nombre: string,
  facultad: string,
): Programa => ({
  id: `p-${codigo.toLowerCase()}`,
  codigo,
  nombre,
  facultad,
});

const sistemas = programa(
  "SIS",
  "Ingeniería de Sistemas y Computación",
  "Ingenierías",
);
const industrial = programa("IND", "Ingeniería Industrial", "Ingenierías");

export const programas: Programa[] = [
  programa(
    "ADM",
    "Administración de Empresas",
    "Ciencias Económicas y Administrativas",
  ),
  programa("DER", "Derecho", "Ciencias Jurídicas"),
  industrial,
  sistemas,
  programa("MED", "Medicina", "Ciencias de la Salud"),
  programa("PSI", "Psicología", "Ciencias Humanas y Sociales"),
];

export const intereses = [
  "Ciberseguridad",
  "Ciencia de Datos",
  "Cine",
  "Debate",
  "Deportes",
  "Desarrollo Web",
  "Diseño",
  "Emprendimiento",
  "Finanzas",
  "Idiomas",
  "Inteligencia Artificial",
  "Liderazgo",
  "Matemáticas",
  "Música",
  "Programación",
  "Salud",
  "Videojuegos",
];

export interface UsuarioMock extends MiPerfil {
  password: string;
}

const CLAVE = "lightspace.mock.usuarios";

const base = {
  password: "Lightspace123!",
  fecha_registro: "2026-01-15T10:00:00Z",
  apellido: "",
  foto_url: null,
};

const iniciales: UsuarioMock[] = [
  {
    ...base,
    id: "u-sistemas",
    nombre: "Demo",
    apellido: "Sistemas",
    email: "demo.sistemas@lightspace.example.com",
    codigo: "200100000",
    semestre: 6,
    bio: "Estudiante de Ingeniería de Sistemas. Me interesa Programación.",
    programa: sistemas,
    intereses: ["Programación", "Desarrollo Web"],
  },
  {
    ...base,
    id: "u-industrial",
    nombre: "Demo",
    apellido: "Industrial",
    email: "demo.industrial@lightspace.example.com",
    codigo: "200100001",
    semestre: 5,
    bio: "Buscando grupo de estudio.",
    programa: industrial,
    intereses: ["Emprendimiento", "Finanzas"],
  },
];

function cargar(): UsuarioMock[] {
  const guardados = localStorage.getItem(CLAVE);
  return guardados ? (JSON.parse(guardados) as UsuarioMock[]) : iniciales;
}

export const usuarios = cargar();

export function guardarUsuarios() {
  localStorage.setItem(CLAVE, JSON.stringify(usuarios));
}
