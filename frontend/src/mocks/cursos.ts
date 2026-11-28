// Cursos simulados (una muestra del catálogo del seed) y sus rutas.
import type { CursoItem, Matricula, RelacionCurso } from "@/types/api";
import { programas, usuarios } from "./datos";
import { fallo, ok, paginar, ruta, sinContenido } from "./servidor";

const DEPARTAMENTOS: Record<string, string> = {
  IST: "Ingeniería de Sistemas y Computación",
  MAT: "Matemáticas y Estadística",
  FIS: "Física y Geociencias",
  IGL: "Lenguas Extranjeras",
  IIN: "Ingeniería Industrial",
  ADM: "Administración de Empresas",
  LEY: "Derecho",
  PSI: "Psicología",
  HUM: "Humanidades",
};

// [codigo, nombre, créditos, semestre, programas, intereses]
type Fila = [string, string, number, number, string, string[]];
const TODOS = "SIS IND ADM DER PSI MED";

const filas: Fila[] = [
  ["IST 1010", "Algoritmia y Programación I", 3, 1, "SIS", ["Programación"]],
  [
    "IST 2040",
    "Estructuras de Datos I",
    3,
    3,
    "SIS",
    ["Programación", "Matemáticas"],
  ],
  [
    "IST 2050",
    "Programación Orientada a Objetos",
    3,
    3,
    "SIS",
    ["Programación"],
  ],
  [
    "IST 2060",
    "Algoritmos y Complejidad",
    3,
    5,
    "SIS",
    ["Matemáticas", "Programación"],
  ],
  [
    "IST 3010",
    "Bases de Datos",
    3,
    6,
    "SIS",
    ["Ciencia de Datos", "Programación"],
  ],
  ["IST 3020", "Redes de Computación", 3, 6, "SIS", ["Ciberseguridad"]],
  ["IST 3030", "Diseño Digital", 3, 5, "SIS", ["Programación"]],
  [
    "IST 3040",
    "Sistemas Operativos",
    3,
    7,
    "SIS",
    ["Programación", "Ciberseguridad"],
  ],
  ["IST 4010", "Algoritmia y Programación II", 3, 2, "SIS", ["Programación"]],
  [
    "IST 4360",
    "Soluciones Computacionales a Problemas en Ingeniería",
    3,
    6,
    "SIS IND",
    ["Programación", "Matemáticas"],
  ],
  ["MAT 1010", "Cálculo I", 4, 1, "SIS IND", ["Matemáticas"]],
  [
    "MAT 2020",
    "Álgebra Lineal",
    3,
    1,
    "SIS IND",
    ["Matemáticas", "Inteligencia Artificial"],
  ],
  ["MAT 2050", "Matemáticas Discretas", 3, 4, "SIS", ["Matemáticas"]],
  ["FIS 1010", "Física Mecánica", 4, 2, "SIS IND", ["Matemáticas"]],
  ["IGL 1010", "Inglés I", 2, 1, TODOS, ["Idiomas"]],
  ["IGL 1020", "Inglés II", 2, 2, TODOS, ["Idiomas"]],
  [
    "IIN 2010",
    "Investigación de Operaciones I",
    3,
    6,
    "IND SIS",
    ["Matemáticas"],
  ],
  ["IIN 3010", "Estrategia de Operaciones", 4, 4, "IND ADM", ["Liderazgo"]],
  [
    "ADM 1010",
    "Fundamentos de Administración",
    3,
    1,
    "ADM IND",
    ["Liderazgo", "Emprendimiento"],
  ],
  ["ADM 2020", "Mercadeo", 3, 4, "ADM IND", ["Emprendimiento"]],
  ["LEY 1010", "Introducción al Derecho", 3, 1, "DER", ["Debate"]],
  ["PSI 1010", "Psicología General", 3, 1, "PSI MED", ["Salud"]],
  [
    "HUM 1010",
    "Comunicación Oral y Escrita",
    2,
    1,
    TODOS,
    ["Debate", "Liderazgo"],
  ],
  ["HUM 1020", "Ética Profesional", 2, 6, TODOS, ["Liderazgo"]],
  ["HUM 2010", "Emprendimiento", 2, 5, TODOS, ["Emprendimiento", "Liderazgo"]],
];

const cursos = filas
  .map(([codigo, nombre, creditos, semestre, progs, intereses], i) => {
    const [materia, numero] = codigo.split(" ");
    return {
      id: `c-${materia}${numero}`.toLowerCase(),
      codigo,
      materia,
      numero,
      nombre,
      creditos,
      nivel: "Pregrado",
      semestre_sugerido: semestre,
      departamento: DEPARTAMENTOS[materia],
      programas: progs.split(" "),
      intereses,
      portada_url: `/api/archivos/portadas/${materia}.webp`,
      // Cifras inventadas pero estables de otros estudiantes
      inscritos: 5 + ((i * 7) % 20),
      seguidores: 2 + ((i * 5) % 11),
      estrellas: (i * 3) % 13,
    };
  })
  .sort((a, b) => a.codigo.localeCompare(b.codigo));

type Curso = (typeof cursos)[number];

// Matrícula del registro académico (periodo vigente): curso -> NRC
const MATRICULAS: Record<string, Record<string, string>> = {
  "u-sistemas": {
    "c-ist3010": "1892",
    "c-ist3020": "2417",
    "c-ist4360": "3105",
    "c-hum1020": "5560",
  },
  "u-industrial": {
    "c-iin2010": "4021",
    "c-adm2020": "6188",
    "c-igl1010": "7342",
  },
};

interface Estado {
  inscritos: string[];
  sigue: string[];
  estrellas: string[];
}

const CLAVE = "lightspace.mock.cursos";
const estados: Record<string, Estado> = JSON.parse(
  localStorage.getItem(CLAVE) ?? "null",
) ?? {
  "u-sistemas": {
    inscritos: ["c-ist3010"],
    sigue: ["c-ist2060"],
    estrellas: ["c-ist3010"],
  },
};
const guardar = () => localStorage.setItem(CLAVE, JSON.stringify(estados));
const estadoDe = (uid: string) =>
  (estados[uid] ??= { inscritos: [], sigue: [], estrellas: [] });
const quitar = (lista: string[], id: string) => {
  const posicion = lista.indexOf(id);
  if (posicion >= 0) lista.splice(posicion, 1);
};
const poner = (lista: string[], id: string) => {
  if (!lista.includes(id)) lista.push(id);
};

function matriculaDe(uid: string, id: string): Matricula | null {
  const nrc = MATRICULAS[uid]?.[id];
  return nrc ? { periodo: "202630", nrc } : null;
}

function aItem(c: Curso, uid: string): CursoItem {
  const { inscritos: _i, seguidores: _s, estrellas: _e, ...datos } = c;
  const e = estadoDe(uid);
  const relacion: RelacionCurso = e.inscritos.includes(c.id)
    ? "INSCRITO"
    : e.sigue.includes(c.id)
      ? "SIGUE"
      : null;
  return { ...datos, matriculado: matriculaDe(uid, c.id) !== null, relacion };
}

const totalEstrellas = (c: Curso) =>
  c.estrellas +
  usuarios.filter((u) => estados[u.id]?.estrellas.includes(c.id)).length;

const sencillo = (texto: string) => texto.toLowerCase();
const noExiste = () => fallo(404, "El curso no existe");
const buscar = (id: string) => cursos.find((c) => c.id === id);

ruta("GET", "/cursos", ({ consulta, usuarioId }) => {
  const palabras = sencillo(consulta.get("q") ?? "")
    .split(/\s+/)
    .filter(Boolean);
  const programa = consulta.get("programa");
  const semestre = Number(consulta.get("semestre") ?? 0);
  const filtrados = cursos.filter(
    (c) =>
      palabras.every((p) => sencillo(`${c.codigo} ${c.nombre}`).includes(p)) &&
      (!programa || c.programas.includes(programa)) &&
      (!semestre || c.semestre_sugerido === semestre),
  );
  const pagina = paginar(filtrados, consulta);
  return ok({
    ...pagina,
    items: pagina.items.map((c) => aItem(c, usuarioId!)),
  });
});

ruta("GET", "/cursos/mios", ({ usuarioId }) => {
  const uid = usuarioId!;
  const mios = cursos
    .map((c) => ({ ...aItem(c, uid), matricula: matriculaDe(uid, c.id) }))
    .filter((c) => c.matriculado || c.relacion);
  return ok(mios);
});

ruta("GET", "/cursos/:id", ({ partes, usuarioId }) => {
  const c = buscar(partes.id);
  if (!c) return noExiste();
  const uid = usuarioId!;
  const contar = (campo: keyof Estado) =>
    usuarios.filter((u) => estados[u.id]?.[campo].includes(c.id)).length;
  return ok({
    ...aItem(c, uid),
    descripcion: `${c.nombre}: curso de ${c.creditos} créditos del departamento de ${c.departamento}.`,
    programas: c.programas.map((codigo) => ({
      codigo,
      nombre: programas.find((p) => p.codigo === codigo)?.nombre ?? codigo,
    })),
    matricula: matriculaDe(uid, c.id),
    total_inscritos: c.inscritos + contar("inscritos"),
    total_seguidores: c.seguidores + contar("sigue"),
    total_estrellas: totalEstrellas(c),
    dio_estrella: estadoDe(uid).estrellas.includes(c.id),
  });
});

ruta("POST", "/cursos/:id/seguir", ({ partes, usuarioId }) => {
  if (!buscar(partes.id)) return noExiste();
  const e = estadoDe(usuarioId!);
  if (e.inscritos.includes(partes.id))
    return fallo(409, "Ya estás inscrito en este curso");
  poner(e.sigue, partes.id);
  guardar();
  return ok({ relacion: "SIGUE" });
});

ruta("DELETE", "/cursos/:id/seguir", ({ partes, usuarioId }) => {
  if (!buscar(partes.id)) return noExiste();
  quitar(estadoDe(usuarioId!).sigue, partes.id);
  guardar();
  return sinContenido();
});

ruta("POST", "/cursos/:id/inscripcion", ({ partes, usuarioId }) => {
  if (!buscar(partes.id)) return noExiste();
  const matricula = matriculaDe(usuarioId!, partes.id);
  if (!matricula)
    return fallo(
      403,
      "No estás matriculado en este curso en el periodo vigente",
    );
  const e = estadoDe(usuarioId!);
  poner(e.inscritos, partes.id);
  quitar(e.sigue, partes.id);
  guardar();
  return ok({ relacion: "INSCRITO", matricula });
});

ruta("DELETE", "/cursos/:id/inscripcion", ({ partes, usuarioId }) => {
  if (!buscar(partes.id)) return noExiste();
  quitar(estadoDe(usuarioId!).inscritos, partes.id);
  guardar();
  return sinContenido();
});

function marcarEstrella(id: string, uid: string, dar: boolean) {
  const c = buscar(id);
  if (!c) return noExiste();
  (dar ? poner : quitar)(estadoDe(uid).estrellas, id);
  guardar();
  return ok({ total_estrellas: totalEstrellas(c), dio_estrella: dar });
}

ruta("POST", "/cursos/:id/estrella", ({ partes, usuarioId }) =>
  marcarEstrella(partes.id, usuarioId!, true),
);
ruta("DELETE", "/cursos/:id/estrella", ({ partes, usuarioId }) =>
  marcarEstrella(partes.id, usuarioId!, false),
);
