// Recomendaciones simuladas. Las fórmulas reales viven en la base de datos.
import { relacion } from "./conexiones";
import { catalogoPara } from "./cursos";
import { usuarios } from "./datos";
import { ok, ruta } from "./servidor";

const limite = (consulta: URLSearchParams) =>
  Number(consulta.get("limite") ?? 10);

ruta("GET", "/recomendaciones/personas", ({ consulta, usuarioId }) => {
  const yo = usuarios.find((u) => u.id === usuarioId)!;
  const personas = usuarios
    .filter((u) => u.id !== yo.id && relacion(yo.id, u.id) === "NINGUNA")
    .map((u) => {
      const intereses_comunes = u.intereses.filter((i) =>
        yo.intereses.includes(i),
      );
      const conexiones_comunes = usuarios.filter(
        (x) =>
          relacion(yo.id, x.id) === "CONECTADOS" &&
          relacion(u.id, x.id) === "CONECTADOS",
      ).length;
      const mismoPrograma = u.programa.codigo === yo.programa.codigo;
      return {
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        semestre: u.semestre,
        foto_url: u.foto_url ?? null,
        programas: [u.programa.nombre],
        score:
          intereses_comunes.length * 0.3 +
          conexiones_comunes * 0.2 +
          (mismoPrograma ? 0.25 : 0),
        intereses_comunes,
        cursos_comunes: [],
        conexiones_comunes,
      };
    })
    .sort((a, b) => b.score - a.score);
  return ok(personas.slice(0, limite(consulta)));
});

ruta("GET", "/recomendaciones/cursos", ({ consulta, usuarioId }) => {
  const yo = usuarios.find((u) => u.id === usuarioId)!;
  const recomendados = catalogoPara(yo.id)
    .filter(
      (c) =>
        !c.relacion &&
        !c.matriculado &&
        c.programas.includes(yo.programa.codigo),
    )
    .map(({ matriculado: _m, relacion: _r, programas: _p, ...c }) => {
      const intereses_comunes = c.intereses.filter((i) =>
        yo.intereses.includes(i),
      );
      return {
        ...c,
        intereses_comunes,
        seguidores_parecidos: c.estrellas % 4,
        score: intereses_comunes.length * 0.45 + c.estrellas * 0.02,
      };
    })
    .sort((a, b) => b.score - a.score);
  return ok(recomendados.slice(0, limite(consulta)));
});
