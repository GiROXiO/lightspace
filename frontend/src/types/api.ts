// Tipos del contrato (docs/api.md). Si cambia el contrato, se cambia aquí.

export interface Programa {
  id: string;
  codigo: string;
  nombre: string;
  facultad: string;
}

export type ProgramaResumen = Pick<Programa, "codigo" | "nombre">;

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  codigo: string;
  semestre: number;
  bio: string;
  fecha_registro: string;
}

export interface MiPerfil extends Usuario {
  programa: Programa;
  intereses: string[];
}

export interface RespuestaAuth {
  access_token: string;
  token_type: "bearer";
  usuario: Usuario;
}

export interface DatosRegistro {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  codigo: string;
  semestre: number;
  programa: string;
  intereses: string[];
}

export interface CambiosPerfil {
  nombre?: string;
  apellido?: string;
  bio?: string;
  semestre?: number;
  intereses?: string[];
}

export interface Paginado<T> {
  total: number;
  pagina: number;
  tamano: number;
  items: T[];
}

export type RelacionConexion =
  | "NINGUNA"
  | "ENVIADA"
  | "RECIBIDA"
  | "CONECTADOS";

export interface UsuarioResumen {
  id: string;
  nombre: string;
  apellido: string;
  semestre: number;
  programa: ProgramaResumen;
}

export interface PerfilPublico extends UsuarioResumen {
  bio: string;
  intereses: string[];
  total_conexiones: number;
  relacion_conexion: RelacionConexion;
}

export type ResultadoBusqueda = UsuarioResumen & {
  relacion_conexion: RelacionConexion;
};

export interface Solicitud {
  usuario: UsuarioResumen;
  desde: string;
}

export interface Solicitudes {
  recibidas: Solicitud[];
  enviadas: Solicitud[];
}

export type TipoPublicacion =
  | "GENERAL"
  | "MATERIAL"
  | "PREGUNTA"
  | "BUSCA_GRUPO";
export type EstadoGrupo = "ABIERTA" | "CERRADA";

export interface CursoRef {
  id: string;
  codigo: string;
  nombre: string;
}

export interface Publicacion {
  id: string;
  tipo: TipoPublicacion;
  contenido: string;
  fecha: string;
  enlace: string | null;
  actividad: string | null;
  cupos: number | null;
  estado: EstadoGrupo | null;
  autor: UsuarioResumen;
  curso: CursoRef | null;
  total_likes: number;
  total_comentarios: number;
  me_gusta: boolean;
  total_unidos: number | null;
  unido: boolean | null;
}

export interface Comentario {
  id: string;
  contenido: string;
  fecha: string;
  autor: UsuarioResumen;
}

export type RelacionCurso = "INSCRITO" | "SIGUE" | null;

export interface Matricula {
  periodo: string;
  nrc: string;
}

export interface CursoItem {
  id: string;
  codigo: string;
  materia: string;
  numero: string;
  nombre: string;
  creditos: number;
  nivel: string;
  semestre_sugerido: number;
  departamento: string;
  programas: string[];
  intereses: string[];
  matriculado: boolean;
  relacion: RelacionCurso;
}

export interface CursoDetalle extends Omit<CursoItem, "programas"> {
  descripcion: string;
  programas: ProgramaResumen[];
  matricula: Matricula | null;
  total_inscritos: number;
  total_seguidores: number;
  total_estrellas: number;
  dio_estrella: boolean;
}

export type MiCurso = CursoItem & { matricula: Matricula | null };

export interface PersonaRecomendada {
  id: string;
  nombre: string;
  apellido: string;
  semestre: number;
  programas: string[];
  score: number;
  intereses_comunes: string[];
  cursos_comunes: string[];
  conexiones_comunes: number;
}

export interface CursoRecomendado {
  id: string;
  codigo: string;
  materia: string;
  numero: string;
  nombre: string;
  creditos: number;
  nivel: string;
  semestre_sugerido: number;
  departamento: string;
  score: number;
  intereses_comunes: string[];
  seguidores_parecidos: number;
  estrellas: number;
}

export type TipoNotificacion =
  | "SOLICITUD_CONEXION"
  | "CONEXION_ACEPTADA"
  | "COMENTARIO"
  | "LIKE"
  | "RESPUESTA_GRUPO";

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  mensaje: string;
  leida: boolean;
  fecha: string;
  origen: Pick<Usuario, "id" | "nombre" | "apellido">;
  publicacion_id: string | null;
}

export type PaginaNotificaciones = Paginado<Notificacion> & {
  no_leidas: number;
};
