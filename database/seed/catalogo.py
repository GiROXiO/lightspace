PERIODO_VIGENTE = "202630"   
PERIODO_ANTERIOR = "202610"   
PASSWORD_DEMO = "Lightspace123!"
DOMINIO_EMAIL = "lightspace.test"

PROGRAMAS = {
    "SIS": ("Ingeniería de Sistemas y Computación", "Ingenierías"),
    "IND": ("Ingeniería Industrial", "Ingenierías"),
    "CIV": ("Ingeniería Civil", "Ingenierías"),
    "ELE": ("Ingeniería Eléctrica", "Ingenierías"),
    "ADM": ("Administración de Empresas", "Ciencias Económicas y Administrativas"),
    "DER": ("Derecho", "Ciencias Jurídicas"),
    "PSI": ("Psicología", "Ciencias Humanas y Sociales"),
    "MED": ("Medicina", "Ciencias de la Salud"),
}

# Peso relativo: cuántos estudiantes tiene cada programa
PESO_PROGRAMA = {
    "SIS": 22, "IND": 14, "CIV": 10, "ELE": 8,
    "ADM": 14, "DER": 10, "PSI": 10, "MED": 12,
}

_ALIAS_PROGRAMAS = {
    "ING": "SIS IND CIV ELE",
    "ALL": " ".join(PROGRAMAS),
}


DEPARTAMENTOS = {
    "IST": "Ingeniería de Sistemas y Computación",
    "MAT": "Matemáticas y Estadística",
    "FIS": "Física y Geociencias",
    "IGL": "Lenguas Extranjeras",
    "IIN": "Ingeniería Industrial",
    "ICI": "Ingeniería Civil y Ambiental",
    "IEL": "Ingeniería Eléctrica y Electrónica",
    "ADM": "Administración de Empresas",
    "ECO": "Economía",
    "LEY": "Derecho",
    "PSI": "Psicología",
    "CBM": "Medicina",
    "HUM": "Humanidades",
}


INTERESES = [
    "Programación", "Inteligencia Artificial", "Ciencia de Datos", "Desarrollo Web",
    "Ciberseguridad", "Videojuegos", "Robótica", "Electrónica", "Matemáticas",
    "Física", "Investigación", "Emprendimiento", "Finanzas", "Marketing",
    "Liderazgo", "Sostenibilidad", "Diseño", "Música", "Cine", "Fotografía",
    "Psicología", "Salud", "Derecho", "Debate", "Idiomas", "Deportes",
    "Voluntariado", "Logística",
]


INTERESES_PROGRAMA = {
    "SIS": ["Programación", "Inteligencia Artificial", "Ciencia de Datos",
            "Desarrollo Web", "Ciberseguridad", "Videojuegos"],
    "IND": ["Logística", "Emprendimiento", "Sostenibilidad", "Liderazgo",
            "Ciencia de Datos", "Finanzas"],
    "CIV": ["Sostenibilidad", "Diseño", "Física", "Deportes", "Voluntariado",
            "Matemáticas"],
    "ELE": ["Electrónica", "Robótica", "Física", "Programación", "Matemáticas",
            "Videojuegos"],
    "ADM": ["Emprendimiento", "Finanzas", "Marketing", "Liderazgo", "Idiomas",
            "Voluntariado"],
    "DER": ["Derecho", "Debate", "Liderazgo", "Idiomas", "Voluntariado", "Cine"],
    "PSI": ["Psicología", "Salud", "Investigación", "Voluntariado", "Música",
            "Cine"],
    "MED": ["Salud", "Investigación", "Deportes", "Voluntariado", "Música",
            "Fotografía"],
}

# Cursos (asignaturas):
# (materia, numero, nombre, creditos, semestre_sugerido, programas, intereses)
# `programas` admite alias: ING = ingenierías, ALL = todos los programas
CURSOS = [
    # Ingeniería de Sistemas y Computación
    ("IST", "1010", "Algoritmia y Programación I", 3, 1, "SIS", ["Programación"]),
    ("IST", "2040", "Estructuras de Datos I", 3, 3, "SIS", ["Programación", "Matemáticas"]),
    ("IST", "2050", "Programación Orientada a Objetos", 3, 3, "SIS", ["Programación"]),
    ("IST", "2060", "Algoritmos y Complejidad", 3, 5, "SIS", ["Matemáticas", "Programación"]),
    ("IST", "3010", "Bases de Datos", 3, 6, "SIS", ["Ciencia de Datos", "Programación"]),
    ("IST", "3020", "Redes de Computación", 3, 6, "SIS", ["Ciberseguridad", "Electrónica"]),
    ("IST", "3030", "Diseño Digital", 3, 5, "SIS", ["Electrónica", "Programación"]),
    ("IST", "3040", "Sistemas Operativos", 3, 7, "SIS", ["Programación", "Ciberseguridad"]),
    ("IST", "4010", "Algoritmia y Programación II", 3, 2, "SIS", ["Programación", "Matemáticas"]),
    ("IST", "4360", "Soluciones Computacionales a Problemas en Ingeniería", 3, 6, "SIS IND CIV ELE", ["Programación", "Matemáticas"]),
    # Matemáticas y Estadística
    ("MAT", "1010", "Cálculo I", 4, 1, "ING", ["Matemáticas"]),
    ("MAT", "1020", "Cálculo II", 4, 2, "ING", ["Matemáticas"]),
    ("MAT", "2010", "Cálculo III", 4, 3, "ING", ["Matemáticas", "Física"]),
    ("MAT", "2020", "Álgebra Lineal", 3, 1, "ING", ["Matemáticas", "Inteligencia Artificial"]),
    ("MAT", "2030", "Ecuaciones Diferenciales", 3, 4, "ING", ["Matemáticas", "Física"]),
    ("MAT", "2050", "Matemáticas Discretas", 3, 4, "SIS", ["Matemáticas"]),
    # Física y Geociencias
    ("FIS", "1010", "Física Mecánica", 4, 2, "ING", ["Física"]),
    ("FIS", "1020", "Física Electricidad y Magnetismo", 4, 3, "ING MED", ["Física", "Electrónica"]),
    ("FIS", "1030", "Física Calor y Ondas", 4, 4, "ING", ["Física"]),
    # Lenguas Extranjeras
    ("IGL", "1010", "Inglés I", 2, 1, "ALL", ["Idiomas"]),
    ("IGL", "1020", "Inglés II", 2, 2, "ALL", ["Idiomas"]),
    ("IGL", "2010", "Inglés III", 2, 3, "ALL", ["Idiomas", "Debate"]),
    # Ingeniería Industrial
    ("IIN", "2010", "Investigación de Operaciones I", 3, 6, "IND SIS", ["Matemáticas", "Logística"]),
    ("IIN", "2020", "Sistemas de Costos de Producción", 3, 5, "IND", ["Finanzas", "Logística"]),
    ("IIN", "3010", "Estrategia de Operaciones", 4, 4, "IND ADM", ["Logística", "Liderazgo"]),
    # Ingeniería Civil
    ("ICI", "2010", "Topografía y Geoinformación", 2, 3, "CIV", ["Sostenibilidad", "Física"]),
    ("ICI", "2020", "Mecánica de Sólidos", 3, 4, "CIV", ["Física", "Matemáticas"]),
    ("ICI", "3010", "Análisis Estructural", 3, 6, "CIV", ["Diseño", "Matemáticas"]),
    # Ingeniería Eléctrica
    ("IEL", "2010", "Circuitos I", 3, 5, "ELE SIS", ["Electrónica", "Física"]),
    ("IEL", "2020", "Lógica Digital", 3, 6, "ELE", ["Electrónica", "Programación"]),
    ("IEL", "3010", "Electrónica III", 3, 7, "ELE SIS", ["Electrónica", "Robótica"]),
    # Administración y Economía
    ("ADM", "1010", "Fundamentos de Administración", 3, 1, "ADM IND", ["Liderazgo", "Emprendimiento"]),
    ("ADM", "2010", "Contabilidad General", 3, 3, "ADM IND", ["Finanzas"]),
    ("ADM", "2020", "Mercadeo", 3, 4, "ADM IND", ["Marketing", "Emprendimiento"]),
    ("ECO", "1010", "Microeconomía", 3, 2, "ADM IND", ["Finanzas", "Investigación"]),
    # Derecho
    ("LEY", "1010", "Introducción al Derecho", 3, 1, "DER", ["Derecho", "Debate"]),
    ("LEY", "2010", "Derecho Civil", 3, 3, "DER", ["Derecho"]),
    ("LEY", "2020", "Derecho Constitucional", 3, 4, "DER", ["Derecho", "Debate"]),
    # Psicología
    ("PSI", "1010", "Psicología General", 3, 1, "PSI MED", ["Psicología"]),
    ("PSI", "2010", "Psicología del Desarrollo", 3, 3, "PSI", ["Psicología", "Salud"]),
    ("PSI", "2020", "Neuropsicología", 3, 5, "PSI MED", ["Psicología", "Salud", "Investigación"]),
    # Medicina
    ("CBM", "1010", "Anatomía Humana", 5, 1, "MED", ["Salud"]),
    ("CBM", "1020", "Fisiología", 5, 3, "MED", ["Salud", "Investigación"]),
    ("CBM", "2010", "Bioquímica", 4, 4, "MED PSI", ["Salud", "Investigación"]),
    # Humanidades (transversales)
    ("HUM", "1010", "Comunicación Oral y Escrita", 2, 1, "ALL", ["Debate", "Liderazgo"]),
    ("HUM", "1020", "Ética Profesional", 2, 6, "ALL", ["Voluntariado", "Liderazgo"]),
    ("HUM", "2010", "Emprendimiento", 2, 5, "ALL", ["Emprendimiento", "Liderazgo"]),
]


# Usuarios demo: cuentas conocidas para probar. Todas usan PASSWORD_DEMO.
# `nuevo` = recién registrado: sin matrículas, conexiones ni publicaciones.
DEMOS = [
    {"nombre": "Demo", "apellido": "Sistemas", "email": "demo.sistemas", "programa": "SIS", "semestre": 6, "nuevo": False, "inscribe_todo": True},
    {"nombre": "Demo", "apellido": "Industrial", "email": "demo.industrial", "programa": "IND", "semestre": 5, "nuevo": False, "inscribe_todo": True},
    {"nombre": "Demo", "apellido": "Derecho", "email": "demo.derecho", "programa": "DER", "semestre": 4, "nuevo": False, "inscribe_todo": False},
    {"nombre": "Demo", "apellido": "Medicina", "email": "demo.medicina", "programa": "MED", "semestre": 3, "nuevo": False, "inscribe_todo": False},
    {"nombre": "Demo", "apellido": "Nuevo", "email": "demo.nuevo", "programa": "SIS", "semestre": 1, "nuevo": True, "inscribe_todo": False},
]


# Nombres para generar usuarios
NOMBRES = [
    "Valentina", "Sofía", "Isabella", "Camila", "Mariana", "Daniela", "Juliana",
    "Laura", "Natalia", "Paula", "Andrea", "Carolina", "Gabriela", "Manuela",
    "Luisa", "Sara", "Mateo", "Santiago", "Sebastián", "Samuel", "Nicolás",
    "Daniel", "Alejandro", "Felipe", "Andrés", "David", "Juan", "Carlos",
    "Miguel", "Diego", "Tomás", "Esteban", "Camilo", "Julián", "Emilio",
    "Mauricio", "Ricardo", "Fernando", "Jorge", "Luis",
]

APELLIDOS = [
    "García", "Rodríguez", "Martínez", "López", "González", "Pérez", "Sánchez",
    "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Reyes", "Morales",
    "Cruz", "Ortiz", "Gutiérrez", "Chávez", "Ramos", "Vargas", "Castillo",
    "Jiménez", "Moreno", "Romero", "Herrera", "Medina", "Aguilar", "Castro",
    "Mendoza", "Ríos", "Salazar", "Cortés", "Paternina", "Barrios", "Escorcia",
    "Pacheco", "Villalobos", "Arrieta", "Carrizosa",
]

BIOS = [
    "Estudiante de {programa}. Me interesa {interes}.",
    "Apasionado por {interes}. Siempre abierto a conectar.",
    "{programa} en camino. Fan de {interes} y del buen café.",
    "Buscando grupo de estudio y gente con quien hablar de {interes}.",
    "Semestre {semestre} de {programa}. Me encanta {interes}.",
]


# Textos de publicaciones y comentarios
POSTS_GENERAL = [
    "¿Alguien conoce un buen lugar para estudiar en el campus?",
    "Abrieron inscripciones para el voluntariado del semestre, ¿quién se apunta?",
    "Busco con quién jugar fútbol los jueves en la tarde.",
    "¿Alguien sabe cómo funciona el proceso de homologación de créditos?",
    "Comparto mi resumen del semestre pasado, por si le sirve a alguien.",
    "¿Recomendaciones de libros para el fin de semana?",
    "Armando un grupo de estudio para las vacaciones, ¿quién se suma?",
    "¿Alguien tiene tips para organizar mejor el tiempo durante parciales?",
]

POSTS_MATERIAL = [
    "Subí mi resumen del primer parcial de {curso}. Espero que les sirva.",
    "Compartí los ejercicios resueltos del taller 2 de {curso}.",
    "Les dejo las notas de clase de {curso} de esta semana.",
    "Encontré un video que explica muy bien el tema de hoy en {curso}.",
]

POSTS_PREGUNTA = [
    "¿Alguien entendió el ejercicio 3 del taller de {curso}?",
    "¿Para cuándo es la entrega del proyecto de {curso}?",
    "¿Qué temas entran en el parcial de {curso}?",
    "¿Alguien tiene recomendaciones para estudiar {curso}?",
]

POST_GRUPO = "Busco grupo para {actividad} de {curso}. Faltan {cupos} integrantes, ¿quién se anima?"

ACTIVIDADES = [
    "el proyecto final", "el taller 2", "el laboratorio 3", "la exposición",
    "el taller en parejas", "el proyecto de semestre",
]

COMENTARIOS_GENERAL = [
    "¡Buena idea!", "Yo también estoy interesado.", "Gracias por compartir.",
    "Me sirve mucho, gracias.", "Cuenta conmigo.", "Buen aporte.",
]

COMENTARIOS_PREGUNTA = [
    "Creo que es para el viernes, pero confírmalo con el profesor.",
    "Revisa las notas de la semana 3, ahí está el tema.",
    "Yo lo resolví con el método visto en clase, te lo explico.",
    "También tengo esa duda.",
]

COMENTARIOS_GRUPO = [
    "Me apunto, ¿cómo coordinamos?", "Tengo disponibilidad en las tardes.",
    "Cuenta conmigo para el grupo.", "¿Ya se llenó el grupo?",
]


# Utilidades y validación del catálogo
def resolver_programas(spec: str) -> list[str]:
    """Convierte 'ING ADM' en la lista de claves de programa."""
    claves: list[str] = []
    for token in spec.split():
        claves += _ALIAS_PROGRAMAS.get(token, token).split()
    return sorted(set(claves))


def validar_catalogo() -> None:
    """Falla si el catálogo tiene referencias rotas o códigos repetidos."""
    codigos = set()
    for materia, numero, _nombre, _cred, semestre, programas, intereses in CURSOS:
        codigo = f"{materia} {numero}"
        assert codigo not in codigos, f"Curso repetido: {codigo}"
        codigos.add(codigo)
        assert materia in DEPARTAMENTOS, f"Materia sin departamento: {materia}"
        assert 1 <= semestre <= 10, f"Semestre inválido en {codigo}"
        for clave in resolver_programas(programas):
            assert clave in PROGRAMAS, f"Programa desconocido en {codigo}: {clave}"
        for interes in intereses:
            assert interes in INTERESES, f"Interés desconocido en {codigo}: {interes}"
    usados = {materia for materia, *_ in CURSOS}
    assert usados == set(DEPARTAMENTOS), (
        f"Departamentos sin cursos: {set(DEPARTAMENTOS) - usados}")
    for clave, lista in INTERESES_PROGRAMA.items():
        assert clave in PROGRAMAS
        for interes in lista:
            assert interes in INTERESES, f"Interés desconocido en {clave}: {interes}"
    assert set(PESO_PROGRAMA) == set(PROGRAMAS)
    for demo in DEMOS:
        assert demo["programa"] in PROGRAMAS
