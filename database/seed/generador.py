from __future__ import annotations

import random
import unicodedata
import uuid
from datetime import datetime, timedelta, timezone

from . import catalogo as cat

_NS = uuid.UUID("6f0f3c1e-5b7a-4d2e-9a53-0c1d2e3f4a5b")
_UTC = timezone.utc
ANCLA = datetime(2026, 11, 14, 12, 0, 0, tzinfo=_UTC)            
INICIO_PERIODO = datetime(2026, 8, 3, 8, 0, 0, tzinfo=_UTC)      

TIPOS_PUBLICACION = {"GENERAL", "MATERIAL", "PREGUNTA", "BUSCA_GRUPO"}
TIPOS_NOTIFICACION = {
    "SOLICITUD_CONEXION", "CONEXION_ACEPTADA", "COMENTARIO", "LIKE", "RESPUESTA_GRUPO",
}


def _id(*partes: str) -> str:
    return str(uuid.uuid5(_NS, ":".join(partes)))


def _iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def _slug(texto: str) -> str:
    ascii_ = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return "".join(ch for ch in ascii_.lower() if ch.isalnum())


def _entre(rng: random.Random, inicio: datetime, fin: datetime) -> datetime:
    if fin <= inicio:
        return inicio
    return inicio + timedelta(seconds=rng.randint(0, int((fin - inicio).total_seconds())))


def _ponderada(rng: random.Random, items: list, pesos: list, k: int) -> list:
    items, pesos, elegidos = list(items), list(pesos), []
    for _ in range(min(k, len(items))):
        i = rng.choices(range(len(items)), weights=pesos)[0]
        elegidos.append(items.pop(i))
        pesos.pop(i)
    return elegidos


def generar(n_usuarios: int = 120, semilla: int = 42, password_hash: str = "HASH_DE_PRUEBA") -> dict[str, list[dict]]:
    cat.validar_catalogo()
    if n_usuarios < len(cat.DEMOS):
        raise ValueError(f"Se necesitan al menos {len(cat.DEMOS)} usuarios (las cuentas demo)")

    rng = random.Random(semilla)
    ds: dict[str, list[dict]] = {}


    # Programas e intereses
    prog_id = {clave: _id("programa", clave) for clave in cat.PROGRAMAS}
    ds["programas"] = [
        {"id": prog_id[clave], "codigo": clave, "nombre": nombre, "facultad": facultad}
        for clave, (nombre, facultad) in cat.PROGRAMAS.items()
    ]
    ds["intereses"] = [{"nombre": nombre} for nombre in cat.INTERESES]


    # Cursos (asignaturas). Los NRC se asignan por periodo: 3 secciones cada uno.
    cursos: list[dict] = []
    ds["cursos"], ds["curso_programa"], ds["curso_interes"] = [], [], []
    for i, (materia, numero, nombre, creditos, semestre, progs, intereses) in enumerate(cat.CURSOS):
        codigo = f"{materia} {numero}"
        cid = _id("curso", codigo)
        claves = cat.resolver_programas(progs)
        departamento = cat.DEPARTAMENTOS[materia]
        cursos.append({
            "id": cid, "codigo": codigo, "semestre": semestre,
            "programas": claves, "intereses": intereses,
            "nrc": {
                cat.PERIODO_VIGENTE: [str(10000 + i * 10 + s) for s in range(3)],
                cat.PERIODO_ANTERIOR: [str(20000 + i * 10 + s) for s in range(3)],
            },
        })
        ds["cursos"].append({
            "id": cid, "codigo": codigo, "materia": materia, "numero": numero,
            "nombre": nombre,
            "descripcion": f"{nombre}: curso de {creditos} créditos del departamento de {departamento}.",
            "creditos": creditos, "nivel": "Pregrado", "semestre_sugerido": semestre,
            "departamento": departamento,
        })
        ds["curso_programa"] += [{"curso": cid, "programa": prog_id[c]} for c in claves]
        ds["curso_interes"] += [{"curso": cid, "interes": x} for x in intereses]


    # Usuarios (las primeras cuentas son las demo)
    claves_prog = list(cat.PROGRAMAS)
    pesos_prog = [cat.PESO_PROGRAMA[c] for c in claves_prog]
    usuarios: list[dict] = []
    ds["usuarios"], ds["usuario_interes"] = [], []
    emails: set[str] = set()

    for i in range(n_usuarios):
        if i < len(cat.DEMOS):
            d = cat.DEMOS[i]
            nombre, apellido, prog, semestre = d["nombre"], d["apellido"], d["programa"], d["semestre"]
            local, nuevo, inscribe_todo = d["email"], d["nuevo"], d["inscribe_todo"]
            registro = ANCLA - timedelta(days=1) if nuevo else datetime(2026, 1, 15, 10, 0, tzinfo=_UTC)
        else:
            nombre = rng.choice(cat.NOMBRES)
            apellido = f"{rng.choice(cat.APELLIDOS)} {rng.choice(cat.APELLIDOS)}"
            prog = rng.choices(claves_prog, weights=pesos_prog)[0]
            semestre = rng.randint(1, 9)
            local = f"{_slug(nombre)}.{_slug(apellido.split()[0])}"
            nuevo = inscribe_todo = False
            registro = _entre(rng, datetime(2022, 1, 10, tzinfo=_UTC), datetime(2026, 10, 31, tzinfo=_UTC))
        if local in emails:
            local = f"{local}{i}"
        emails.add(local)

        elegidos = rng.sample(cat.INTERESES_PROGRAMA[prog], rng.randint(2, 3))
        extras = [x for x in rng.sample(cat.INTERESES, rng.randint(1, 2)) if x not in elegidos]
        intereses = elegidos + extras
        bio = rng.choice(cat.BIOS).format(
            programa=cat.PROGRAMAS[prog][0], interes=intereses[0], semestre=semestre)

        uid = _id("usuario", str(i))
        usuarios.append({
            "id": uid, "programa": prog, "semestre": semestre, "nuevo": nuevo,
            "inscribe_todo": inscribe_todo, "intereses": intereses,
            "nombre": f"{nombre} {apellido.split()[0]}",
        })
        ds["usuarios"].append({
            "programa": prog_id[prog],
            "fecha_registro": _iso(registro),
            "props": {
                "id": uid, "nombre": nombre, "apellido": apellido,
                "email": f"{local}@{cat.DOMINIO_EMAIL}", "codigo": str(200100000 + i),
                "semestre": semestre, "bio": bio, "password_hash": password_hash,
            },
        })
        ds["usuario_interes"] += [{"usuario": uid, "interes": x} for x in intereses]

    nombre_de = {u["id"]: u["nombre"] for u in usuarios}


    # Matrículas, inscripciones, seguidos y estrellas
    ds["matriculas"], ds["inscripciones"], ds["sigue"], ds["estrellas"] = [], [], [], []
    inscritos = {c["id"]: [] for c in cursos}
    seguidores = {c["id"]: [] for c in cursos}
    cursos_actuales: dict[str, set[str]] = {}
    inscrito_en: dict[str, set[str]] = {}
    desde_de: dict[tuple[str, str], datetime] = {}

    for u in usuarios:
        cursos_actuales[u["id"]] = set()
        inscrito_en[u["id"]] = set()
        if u["nuevo"]:
            continue

        elegibles = [c for c in cursos if u["programa"] in c["programas"]]
        pesos = [1 / (1 + abs(c["semestre"] - u["semestre"])) for c in elegibles]
        actuales = _ponderada(rng, elegibles, pesos, rng.randint(4, 6))
        ids_actuales = {c["id"] for c in actuales}

        # Historial: cursos de semestres anteriores matriculados en 202610
        previos_posibles = [c for c in elegibles
                            if c["id"] not in ids_actuales and c["semestre"] < u["semestre"]]
        for c in rng.sample(previos_posibles, min(rng.randint(2, 4), len(previos_posibles))):
            ds["matriculas"].append({
                "usuario": u["id"], "curso": c["id"], "periodo": cat.PERIODO_ANTERIOR,
                "nrc": rng.choice(c["nrc"][cat.PERIODO_ANTERIOR]),
            })

        # Periodo vigente: matrícula y, en la mayoría, inscripción en la plataforma
        for c in actuales:
            nrc = rng.choice(c["nrc"][cat.PERIODO_VIGENTE])
            ds["matriculas"].append({
                "usuario": u["id"], "curso": c["id"], "periodo": cat.PERIODO_VIGENTE, "nrc": nrc,
            })
            cursos_actuales[u["id"]].add(c["id"])
            if u["inscribe_todo"] or rng.random() < 0.75:
                desde = _entre(rng, INICIO_PERIODO, INICIO_PERIODO + timedelta(days=40))
                ds["inscripciones"].append({
                    "usuario": u["id"], "curso": c["id"], "periodo": cat.PERIODO_VIGENTE,
                    "nrc": nrc, "desde": _iso(desde),
                })
                inscritos[c["id"]].append(u["id"])
                inscrito_en[u["id"]].add(c["id"])
                desde_de[(u["id"], c["id"])] = desde

        # Cursos que sigue (excluyente con estar inscrito)
        candidatos = [c for c in cursos if c["id"] not in inscrito_en[u["id"]]]
        pesos = [
            (3 if u["programa"] in c["programas"] else 1)
            + (2 if set(c["intereses"]) & set(u["intereses"]) else 0)
            for c in candidatos
        ]
        k = rng.randint(2, 3) if u["inscribe_todo"] else rng.randint(0, 3)
        for c in _ponderada(rng, candidatos, pesos, k):
            desde = _entre(rng, INICIO_PERIODO - timedelta(days=30), ANCLA)
            ds["sigue"].append({"usuario": u["id"], "curso": c["id"], "desde": _iso(desde)})
            seguidores[c["id"]].append(u["id"])
            desde_de[(u["id"], c["id"])] = desde

    # Estrellas: solo quien sigue o está inscrito
    for (uid, cid), desde in desde_de.items():
        if rng.random() < 0.3:
            ds["estrellas"].append({
                "usuario": uid, "curso": cid, "fecha": _iso(_entre(rng, desde, ANCLA)),
            })


    # Conexiones (el origen es quien envía la solicitud)
    activos = [u for u in usuarios if not u["nuevo"]]
    pares: set[frozenset] = set()
    ds["conexiones"] = []

    def conectar(a: dict, b: dict, estado: str) -> None:
        clave = frozenset((a["id"], b["id"]))
        if a["id"] == b["id"] or clave in pares:
            return
        pares.add(clave)
        desde = _entre(rng, datetime(2026, 6, 1, tzinfo=_UTC), ANCLA)
        ds["conexiones"].append({
            "origen": a["id"], "destino": b["id"], "estado": estado, "desde": _iso(desde),
        })

    for u in activos:
        otros = [o for o in activos if o["id"] != u["id"]]
        pesos = [
            1 + (3 if o["programa"] == u["programa"] else 0)
            + 2 * len(cursos_actuales[u["id"]] & cursos_actuales[o["id"]])
            for o in otros
        ]
        for o in _ponderada(rng, otros, pesos, rng.randint(3, 8)):
            conectar(u, o, "PENDIENTE" if rng.random() < 0.2 else "ACEPTADA")

    # La cuenta demo principal siempre tiene solicitudes pendientes por responder
    demo0 = usuarios[0]
    posibles = [o for o in activos
                if o["id"] != demo0["id"] and frozenset((o["id"], demo0["id"])) not in pares]
    for o in rng.sample(posibles, min(3, len(posibles))):
        conectar(o, demo0, "PENDIENTE")


    # Publicaciones, comentarios, "me gusta", uniones a grupos y notificaciones
    for clave in ("publicaciones", "publicacion_curso", "comentarios", "likes", "uniones",
                  "notificaciones", "notificacion_publicacion"):
        ds[clave] = []
    n_post = {"n": 0}
    n_com = {"n": 0}

    def notificar(tipo: str, destinatario: str, origen: str, fecha: datetime,
                  clave: str, mensaje: str, publicacion: str | None = None) -> None:
        if destinatario == origen:
            return
        nid = _id("notificacion", tipo, clave)
        ds["notificaciones"].append({
            "id": nid, "tipo": tipo, "mensaje": mensaje, "leida": rng.random() < 0.6,
            "fecha": _iso(fecha), "destinatario": destinatario, "origen": origen,
        })
        if publicacion:
            ds["notificacion_publicacion"].append({"notificacion": nid, "publicacion": publicacion})

    def crear_publicacion(autor: str, tipo: str, contenido: str, curso_id: str | None,
                          extra: dict | None = None) -> tuple[str, datetime]:
        n_post["n"] += 1
        pid = _id("publicacion", str(n_post["n"]))
        fecha = _entre(rng, ANCLA - timedelta(days=60), ANCLA - timedelta(days=1))
        props = {"id": pid, "tipo": tipo, "contenido": contenido, "fecha": _iso(fecha)}
        props.update(extra or {})
        ds["publicaciones"].append({"autor": autor, "props": props})
        if curso_id:
            ds["publicacion_curso"].append({"publicacion": pid, "curso": curso_id})
        return pid, fecha

    def comentar(pid: str, autor_post: str, autor: str, texto: str, fecha: datetime) -> None:
        n_com["n"] += 1
        cid = _id("comentario", str(n_com["n"]))
        ds["comentarios"].append({
            "id": cid, "autor": autor, "publicacion": pid, "contenido": texto, "fecha": _iso(fecha),
        })
        if rng.random() < 0.7:
            notificar("COMENTARIO", autor_post, autor, fecha, cid,
                      f"{nombre_de[autor]} comentó tu publicación", pid)

    def interacciones(pid: str, fecha: datetime, autor: str, pool: list[str], textos: list[str]) -> None:
        candidatos = [x for x in pool if x != autor]
        if not candidatos:
            return
        for _ in range(rng.choices(range(5), weights=[2, 3, 3, 2, 1])[0]):
            comentar(pid, autor, rng.choice(candidatos), rng.choice(textos), _entre(rng, fecha, ANCLA))
        for x in rng.sample(candidatos, min(rng.randint(0, 6), len(candidatos))):
            f = _entre(rng, fecha, ANCLA)
            ds["likes"].append({"usuario": x, "publicacion": pid, "fecha": _iso(f)})
            if rng.random() < 0.5:
                notificar("LIKE", autor, x, f, f"{pid}-{x}",
                          f"A {nombre_de[x]} le gustó tu publicación", pid)

    # Publicaciones en el muro de cada curso
    for c in cursos:
        ins, seg = inscritos[c["id"]], seguidores[c["id"]]
        if len(ins) < 3:
            continue
        for _ in range(rng.randint(1, 2 + len(ins) // 10)):
            tipo = rng.choices(["MATERIAL", "PREGUNTA", "BUSCA_GRUPO"], weights=[3, 4, 3])[0]
            if tipo == "MATERIAL":
                autor = rng.choice(ins)
                enlace = f"https://material.{cat.DOMINIO_EMAIL}/{_slug(c['codigo'])}/{n_post['n'] + 1}"
                pid, f = crear_publicacion(
                    autor, tipo, rng.choice(cat.POSTS_MATERIAL).format(curso=c["codigo"]),
                    c["id"], {"enlace": enlace})
                interacciones(pid, f, autor, ins + seg, cat.COMENTARIOS_GENERAL)
            elif tipo == "PREGUNTA":
                autor = rng.choice(ins + seg)
                pid, f = crear_publicacion(
                    autor, tipo, rng.choice(cat.POSTS_PREGUNTA).format(curso=c["codigo"]), c["id"])
                interacciones(pid, f, autor, ins + seg, cat.COMENTARIOS_PREGUNTA)
            else:
                autor = rng.choice(ins)
                cupos = rng.randint(2, 4)
                actividad = rng.choice(cat.ACTIVIDADES)
                otros = [x for x in ins if x != autor]
                unidos = rng.sample(otros, min(rng.randint(0, cupos), len(otros)))
                estado = "CERRADA" if len(unidos) >= cupos else "ABIERTA"
                pid, f = crear_publicacion(
                    autor, tipo,
                    cat.POST_GRUPO.format(actividad=actividad, curso=c["codigo"], cupos=cupos),
                    c["id"], {"actividad": actividad, "cupos": cupos, "estado": estado})
                for x in unidos:
                    fu = _entre(rng, f, ANCLA)
                    ds["uniones"].append({"usuario": x, "publicacion": pid, "fecha": _iso(fu)})
                    notificar("RESPUESTA_GRUPO", autor, x, fu, f"{pid}-{x}",
                              f"{nombre_de[x]} se unió a tu grupo en {c['codigo']}", pid)
                    if rng.random() < 0.6:
                        comentar(pid, autor, x, rng.choice(cat.COMENTARIOS_GRUPO), fu)
                # En un grupo solo responden los inscritos del curso (regla del modelo)
                interacciones(pid, f, autor, ins, cat.COMENTARIOS_GRUPO)

    # Las cuentas demo principales tienen publicaciones propias para probar "mis publicaciones"
    for u in usuarios[:2]:
        propios = [c for c in cursos if c["id"] in inscrito_en[u["id"]]]
        if not propios:
            continue
        c = propios[0]
        pid, f = crear_publicacion(
            u["id"], "MATERIAL", rng.choice(cat.POSTS_MATERIAL).format(curso=c["codigo"]), c["id"],
            {"enlace": f"https://material.{cat.DOMINIO_EMAIL}/{_slug(c['codigo'])}/{n_post['n'] + 1}"})
        interacciones(pid, f, u["id"], inscritos[c["id"]] + seguidores[c["id"]], cat.COMENTARIOS_GENERAL)

    # Publicaciones generales (sin curso)
    ids_activos = [u["id"] for u in activos]
    for _ in range(max(10, int(n_usuarios * 0.4))):
        autor = rng.choice(ids_activos)
        pid, f = crear_publicacion(autor, "GENERAL", rng.choice(cat.POSTS_GENERAL), None)
        interacciones(pid, f, autor, ids_activos, cat.COMENTARIOS_GENERAL)

    # Notificaciones de conexiones
    for x in ds["conexiones"]:
        fecha = datetime.strptime(x["desde"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=_UTC)
        clave = f"{x['origen']}-{x['destino']}"
        if x["estado"] == "PENDIENTE":
            notificar("SOLICITUD_CONEXION", x["destino"], x["origen"], fecha, clave,
                      f"{nombre_de[x['origen']]} quiere conectar contigo")
        elif rng.random() < 0.6:
            notificar("CONEXION_ACEPTADA", x["origen"], x["destino"], fecha, clave,
                      f"{nombre_de[x['destino']]} aceptó tu solicitud de conexión")

    errores = validar(ds)
    if errores:
        raise AssertionError("El dataset generado rompe reglas del modelo:\n- " + "\n- ".join(errores))
    return ds


def validar(ds: dict[str, list[dict]]) -> list[str]:
    """Comprueba las reglas de negocio de docs/modelo-grafo.md. Devuelve los errores."""
    errores: list[str] = []

    def unico(nombre: str, valores: list) -> None:
        if len(valores) != len(set(valores)):
            errores.append(f"Valores repetidos en {nombre}")

    usuarios = [r["props"] for r in ds["usuarios"]]
    unico("usuario.id", [u["id"] for u in usuarios])
    unico("usuario.email", [u["email"] for u in usuarios])
    unico("usuario.codigo", [u["codigo"] for u in usuarios])
    unico("programa.id", [p["id"] for p in ds["programas"]])
    unico("programa.nombre", [p["nombre"] for p in ds["programas"]])
    unico("curso.id", [c["id"] for c in ds["cursos"]])
    unico("curso.codigo", [c["codigo"] for c in ds["cursos"]])
    unico("publicacion.id", [p["props"]["id"] for p in ds["publicaciones"]])
    unico("comentario.id", [c["id"] for c in ds["comentarios"]])
    unico("notificacion.id", [n["id"] for n in ds["notificaciones"]])

    ids_usuario = {u["id"] for u in usuarios}
    ids_curso = {c["id"] for c in ds["cursos"]}
    ids_post = {p["props"]["id"] for p in ds["publicaciones"]}
    fecha_post = {p["props"]["id"]: p["props"]["fecha"] for p in ds["publicaciones"]}

    # Un NRC identifica una sola sección (un solo curso) dentro de un periodo
    nrc_curso: dict[tuple[str, str], str] = {}
    for m in ds["matriculas"]:
        if nrc_curso.setdefault((m["periodo"], m["nrc"]), m["curso"]) != m["curso"]:
            errores.append(f"El NRC {m['nrc']} de {m['periodo']} aparece en dos cursos")
    unico("matricula (usuario, curso, periodo)",
          [(m["usuario"], m["curso"], m["periodo"]) for m in ds["matriculas"]])

    mat_vigente = {(m["usuario"], m["curso"]): m["nrc"]
                   for m in ds["matriculas"] if m["periodo"] == cat.PERIODO_VIGENTE}
    insc = {(i["usuario"], i["curso"]) for i in ds["inscripciones"]}
    sigue = {(s["usuario"], s["curso"]) for s in ds["sigue"]}
    unico("inscripcion (usuario, curso)", [(i["usuario"], i["curso"]) for i in ds["inscripciones"]])
    unico("sigue (usuario, curso)", [(s["usuario"], s["curso"]) for s in ds["sigue"]])

    for i in ds["inscripciones"]:
        if mat_vigente.get((i["usuario"], i["curso"])) != i["nrc"] or i["periodo"] != cat.PERIODO_VIGENTE:
            errores.append("Inscripción sin matrícula vigente o con NRC distinto")
            break
    if insc & sigue:
        errores.append("Hay usuarios que siguen e están inscritos en el mismo curso")
    for e in ds["estrellas"]:
        if (e["usuario"], e["curso"]) not in insc | sigue:
            errores.append("Estrella de alguien que no sigue ni está inscrito")
            break
    unico("estrella (usuario, curso)", [(e["usuario"], e["curso"]) for e in ds["estrellas"]])

    pares = [frozenset((c["origen"], c["destino"])) for c in ds["conexiones"]]
    unico("conexion (par de usuarios)", pares)
    for c in ds["conexiones"]:
        if c["origen"] == c["destino"] or c["estado"] not in {"PENDIENTE", "ACEPTADA"}:
            errores.append("Conexión inválida")
            break

    curso_de_post = {p["publicacion"]: p["curso"] for p in ds["publicacion_curso"]}
    unidos: dict[str, list[str]] = {}
    for u in ds["uniones"]:
        unidos.setdefault(u["publicacion"], []).append(u["usuario"])
    for p in ds["publicaciones"]:
        pr, autor = p["props"], p["autor"]
        curso = curso_de_post.get(pr["id"])
        if pr["tipo"] not in TIPOS_PUBLICACION:
            errores.append(f"Tipo de publicación inválido: {pr['tipo']}")
        elif pr["tipo"] == "GENERAL":
            if curso is not None:
                errores.append("Una publicación GENERAL no debe tener curso")
        else:
            if curso is None:
                errores.append(f"Publicación {pr['tipo']} sin curso")
            elif pr["tipo"] in {"MATERIAL", "BUSCA_GRUPO"} and (autor, curso) not in insc:
                errores.append(f"{pr['tipo']} publicada por alguien no inscrito")
            elif pr["tipo"] == "PREGUNTA" and (autor, curso) not in insc | sigue:
                errores.append("PREGUNTA publicada por alguien que no sigue ni está inscrito")
        if pr["tipo"] == "BUSCA_GRUPO":
            lista = unidos.get(pr["id"], [])
            if len(lista) > pr["cupos"] or (pr["estado"] == "CERRADA") != (len(lista) >= pr["cupos"]):
                errores.append("Estado o cupos inconsistentes en un BUSCA_GRUPO")
            if any((x, curso) not in insc or x == autor for x in lista):
                errores.append("Se unió a un grupo alguien no inscrito (o el autor)")

    tipo_post = {p["props"]["id"]: p["props"]["tipo"] for p in ds["publicaciones"]}
    for c in ds["comentarios"]:
        if c["autor"] not in ids_usuario or c["publicacion"] not in ids_post:
            errores.append("Comentario con referencias rotas")
            break
        if c["fecha"] < fecha_post[c["publicacion"]]:
            errores.append("Comentario anterior a su publicación")
            break
        if (tipo_post[c["publicacion"]] == "BUSCA_GRUPO"
                and (c["autor"], curso_de_post[c["publicacion"]]) not in insc):
            errores.append("Comentario en un BUSCA_GRUPO de alguien no inscrito")
            break
    for n in ds["notificaciones"]:
        if (n["tipo"] not in TIPOS_NOTIFICACION or n["destinatario"] == n["origen"]
                or n["destinatario"] not in ids_usuario or n["origen"] not in ids_usuario):
            errores.append("Notificación inválida")
            break
    for r in ds["publicacion_curso"]:
        if r["curso"] not in ids_curso or r["publicacion"] not in ids_post:
            errores.append("EN_CURSO con referencias rotas")
            break
    return errores


def resumen(ds: dict[str, list[dict]]) -> str:
    lineas = ["Dataset generado:"]
    for clave, filas in ds.items():
        lineas.append(f"  {clave:<26}{len(filas):>6}")
    return "\n".join(lineas)
