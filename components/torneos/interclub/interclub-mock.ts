import type { CategoriaInterclub, Club, Partido } from "./CategoriasInterclub"

// ─── Clubes ──────────────────────────────────────────────────────────────────

export const CLUB_A: Club = {
  nombre: "Voleando",
  color: "#0f172a",
  abbr: "VOL",
  logoUrl: "/clubes/voleando.logo.png",
}

export const CLUB_B: Club = {
  nombre: "+ Pádel",
  color: "#b45309",
  abbr: "+P",
  logoUrl: "/clubes/mas-padel.logo.png",
}

// ─── Jugadores ────────────────────────────────────────────────────────────────
// Convención: pairA = pareja de Voleando (A1/A2), pairB = pareja de + Pádel (B1/B2).

export type Jugador = { nombre: string; apellido: string }
export type Pareja  = [Jugador, Jugador]

export const formatPareja = (p: Pareja): string =>
  `${p[0].nombre[0]}.${p[0].apellido} / ${p[1].nombre[0]}.${p[1].apellido}`

const j = (nombre: string, apellido: string): Jugador => ({ nombre, apellido })

// ─── Helpers para armar categorías ────────────────────────────────────────────

type SlotPendiente = { fecha: string; hora: string; sede: string; cancha: number }
type SlotFinal     = SlotPendiente & { resultado: string; ganador: "A" | "B" }
type SlotVivo      = SlotPendiente & { resultado: string }

function partidoPend(id: string, A: Pareja, B: Pareja, slot: SlotPendiente): Partido {
  return {
    id, pairA: formatPareja(A), pairB: formatPareja(B),
    resultado: null, ganador: null, estado: "pendiente",
    fecha: slot.fecha, horaInicio: slot.hora, sede: slot.sede, cancha: slot.cancha,
  }
}

function partidoFin(id: string, A: Pareja, B: Pareja, slot: SlotFinal): Partido {
  return {
    id, pairA: formatPareja(A), pairB: formatPareja(B),
    resultado: slot.resultado, ganador: slot.ganador, estado: "finalizado",
    fecha: slot.fecha, horaInicio: slot.hora, sede: slot.sede, cancha: slot.cancha,
  }
}

function partidoVivo(id: string, A: Pareja, B: Pareja, slot: SlotVivo): Partido {
  return {
    id, pairA: formatPareja(A), pairB: formatPareja(B),
    resultado: slot.resultado, ganador: null, estado: "en_vivo",
    fecha: slot.fecha, horaInicio: slot.hora, sede: slot.sede, cancha: slot.cancha,
  }
}

// ─── Rosters por categoría ───────────────────────────────────────────────────

// Cat 1 — Caballeros Segunda (1 pareja / club)
const C2da_A  : Pareja = [j("Martín",    "Pérez"),    j("Santiago", "López")]
const C2da_B  : Pareja = [j("Federico",  "García"),   j("Nicolás",  "Ramos")]

// Cat 2 — Caballeros Tercera
const C3ra_A1 : Pareja = [j("Lucas",     "Fernández"),j("Diego",    "Romero")]
const C3ra_A2 : Pareja = [j("Matías",    "Sosa"),     j("Tomás",    "Vega")]
const C3ra_B1 : Pareja = [j("Juan",      "Álvarez"),  j("Pablo",    "Torres")]
const C3ra_B2 : Pareja = [j("Nicolás",   "Méndez"),   j("Ezequiel", "Herrera")]

// Cat 3 — Caballeros Cuarta
const C4ta_A1 : Pareja = [j("Ignacio",   "Ríos"),     j("Mariano",  "Castro")]
const C4ta_A2 : Pareja = [j("Facundo",   "Morales"),  j("Julián",   "Peralta")]
const C4ta_B1 : Pareja = [j("Gastón",    "Figueroa"), j("Emiliano", "Quiroga")]
const C4ta_B2 : Pareja = [j("Bruno",     "Ortiz"),    j("Alejandro","Molina")]

// Cat 4 — Caballeros Quinta
const C5ta_A1 : Pareja = [j("Franco",    "Giménez"),  j("Luciano",  "Cabrera")]
const C5ta_A2 : Pareja = [j("Axel",      "Soria"),    j("Rodrigo",  "Navarro")]
const C5ta_B1 : Pareja = [j("Sebastián", "Benítez"),  j("Tobías",   "Paz")]
const C5ta_B2 : Pareja = [j("Joaquín",   "Aguirre"),  j("Thiago",   "Ledesma")]

// Cat 5 — Caballeros Sexta
const C6ta_A1 : Pareja = [j("Mauro",     "Medina"),   j("Ramiro",   "Salas")]
const C6ta_A2 : Pareja = [j("Valentín",  "Ponce"),    j("Ariel",    "Flores")]
const C6ta_B1 : Pareja = [j("Iván",      "Bravo"),    j("Leonardo", "Vidal")]
const C6ta_B2 : Pareja = [j("Cristian",  "Campos"),   j("Martín",   "Acosta")]

// Cat 6 — Caballeros Séptima
const C7ma_A1 : Pareja = [j("Damián",    "Ocampo"),   j("Santino",  "Rivas")]
const C7ma_A2 : Pareja = [j("Manuel",    "Blanco"),   j("Simón",    "Correa")]
const C7ma_B1 : Pareja = [j("Ulises",    "Mansilla"), j("Benjamín", "Funes")]
const C7ma_B2 : Pareja = [j("Hernán",    "Cabral"),   j("Gabriel",  "Domínguez")]

// Cat 7 — Damas Cuarta
const D4ta_A1 : Pareja = [j("Camila",    "Ruiz"),     j("Sofía",    "Núñez")]
const D4ta_A2 : Pareja = [j("Valentina", "Rojas"),    j("Julieta",  "Vera")]
const D4ta_B1 : Pareja = [j("Martina",   "Reyes"),    j("Agustina", "Miranda")]
const D4ta_B2 : Pareja = [j("Lucía",     "Acuña"),    j("Florencia","Luna")]

// Cat 8 — Damas Quinta
const D5ta_A1 : Pareja = [j("Micaela",   "Duarte"),   j("Antonella","Piñeiro")]
const D5ta_A2 : Pareja = [j("Paula",     "Godoy"),    j("Rocío",    "Ibarra")]
const D5ta_B1 : Pareja = [j("Delfina",   "Silva"),    j("Candela",  "Peña")]
const D5ta_B2 : Pareja = [j("Emilia",    "Guzmán"),   j("Carolina", "Leal")]

// Cat 9 — Damas Sexta
const D6ta_A1 : Pareja = [j("Brenda",    "Ávila"),    j("Mía",      "Aguilar")]
const D6ta_A2 : Pareja = [j("Sabrina",   "Toledo"),   j("Bianca",   "Páez")]
const D6ta_B1 : Pareja = [j("Victoria",  "Ferrer"),   j("Milagros", "Ojeda")]
const D6ta_B2 : Pareja = [j("Ámbar",     "Rodríguez"),j("Isabella", "Carrasco")]

// Cat 10 — Mixto Suma 12
const M12_A1  : Pareja = [j("Agustín",   "Chávez"),   j("Renata",   "Zárate")]
const M12_A2  : Pareja = [j("Leandro",   "Suárez"),   j("Paloma",   "Bustos")]
const M12_B1  : Pareja = [j("Enzo",      "Barrios"),  j("Josefina", "Ávalos")]
const M12_B2  : Pareja = [j("Fabrizio",  "Maldonado"),j("Luna",     "Villar")]

// Cat 11 — Mixto Suma 10
const M10_A1  : Pareja = [j("Dante",     "Reinoso"),  j("Guadalupe","Arias")]
const M10_A2  : Pareja = [j("Lautaro",   "Espinoza"), j("Pilar",    "Gallardo")]
const M10_B1  : Pareja = [j("Nahuel",    "Grimaldi"), j("Nerea",    "Cortez")]
const M10_B2  : Pareja = [j("Ciro",      "Robles"),   j("Miranda",  "Uriarte")]

// ─── Fixture ──────────────────────────────────────────────────────────────────

export const MOCK_CATEGORIAS: CategoriaInterclub[] = [
  // 1 — Caballeros Segunda (1 pareja/club → 1 partido, pendiente)
  {
    id: "1", nombre: "Segunda", genero: "masc", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      partidoPend("p1", C2da_A, C2da_B, { fecha: "2026-04-17", hora: "19:00", sede: "Voleando", cancha: 1 }),
    ],
  },

  // 2 — Caballeros Tercera (4 partidos, todos pendientes)
  {
    id: "2", nombre: "Tercera", genero: "masc", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      partidoPend("p2", C3ra_A1, C3ra_B1, { fecha: "2026-04-17", hora: "17:30", sede: "Voleando", cancha: 1 }),
      partidoPend("p3", C3ra_A1, C3ra_B2, { fecha: "2026-04-17", hora: "17:30", sede: "+ Pádel", cancha: 1 }),
      partidoPend("p4", C3ra_A2, C3ra_B1, { fecha: "2026-04-18", hora: "10:00", sede: "Voleando", cancha: 1 }),
      partidoPend("p5", C3ra_A2, C3ra_B2, { fecha: "2026-04-18", hora: "10:00", sede: "+ Pádel", cancha: 1 }),
    ],
  },

  // 3 — Caballeros Cuarta (4 partidos, todos pendientes)
  {
    id: "3", nombre: "Cuarta", genero: "masc", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      partidoPend("p6", C4ta_A1, C4ta_B1, { fecha: "2026-04-17", hora: "17:30", sede: "Voleando", cancha: 2 }),
      partidoPend("p7", C4ta_A1, C4ta_B2, { fecha: "2026-04-17", hora: "17:30", sede: "+ Pádel", cancha: 2 }),
      partidoPend("p8", C4ta_A2, C4ta_B1, { fecha: "2026-04-18", hora: "10:00", sede: "Voleando", cancha: 2 }),
      partidoPend("p9", C4ta_A2, C4ta_B2, { fecha: "2026-04-18", hora: "10:00", sede: "+ Pádel", cancha: 2 }),
    ],
  },

  // 4 — Caballeros Quinta (2 finalizados + 1 en_vivo + 1 pendiente)
  {
    id: "4", nombre: "Quinta", genero: "masc", estado: "en_vivo", ptsA: 1, ptsB: 1,
    partidos: [
      partidoFin ("p10", C5ta_A1, C5ta_B1, { fecha: "2026-04-17", hora: "10:00", sede: "Voleando", cancha: 1, resultado: "6-4 7-5", ganador: "A" }),
      partidoFin ("p11", C5ta_A1, C5ta_B2, { fecha: "2026-04-17", hora: "11:30", sede: "+ Pádel", cancha: 1, resultado: "3-6 2-6", ganador: "B" }),
      partidoVivo("p12", C5ta_A2, C5ta_B1, { fecha: "2026-04-17", hora: "14:30", sede: "Voleando", cancha: 2, resultado: "4-3" }),
      partidoPend("p13", C5ta_A2, C5ta_B2, { fecha: "2026-04-18", hora: "11:30", sede: "+ Pádel", cancha: 1 }),
    ],
  },

  // 5 — Caballeros Sexta (4 finalizados → tabla completa, A gana 3-1)
  {
    id: "5", nombre: "Sexta", genero: "masc", estado: "finalizado", ptsA: 3, ptsB: 1,
    partidos: [
      partidoFin("p14", C6ta_A1, C6ta_B1, { fecha: "2026-04-17", hora: "10:00", sede: "+ Pádel", cancha: 1, resultado: "6-2 6-3",     ganador: "A" }),
      partidoFin("p15", C6ta_A1, C6ta_B2, { fecha: "2026-04-17", hora: "10:00", sede: "+ Pádel", cancha: 2, resultado: "4-6 6-4 7-5", ganador: "A" }),
      partidoFin("p16", C6ta_A2, C6ta_B1, { fecha: "2026-04-17", hora: "11:30", sede: "Voleando", cancha: 1, resultado: "3-6 4-6",     ganador: "B" }),
      partidoFin("p17", C6ta_A2, C6ta_B2, { fecha: "2026-04-17", hora: "11:30", sede: "Voleando", cancha: 2, resultado: "6-4 6-4",     ganador: "A" }),
    ],
  },

  // 6 — Caballeros Séptima (4 pendientes)
  {
    id: "6", nombre: "Séptima", genero: "masc", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      partidoPend("p18", C7ma_A1, C7ma_B1, { fecha: "2026-04-18", hora: "11:30", sede: "Voleando", cancha: 1 }),
      partidoPend("p19", C7ma_A1, C7ma_B2, { fecha: "2026-04-18", hora: "11:30", sede: "+ Pádel", cancha: 2 }),
      partidoPend("p20", C7ma_A2, C7ma_B1, { fecha: "2026-04-18", hora: "13:00", sede: "+ Pádel", cancha: 1 }),
      partidoPend("p21", C7ma_A2, C7ma_B2, { fecha: "2026-04-18", hora: "13:00", sede: "Voleando", cancha: 2 }),
    ],
  },

  // 7 — Damas Cuarta (4 pendientes)
  {
    id: "7", nombre: "Cuarta", genero: "dam", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      partidoPend("p22", D4ta_A1, D4ta_B1, { fecha: "2026-04-18", hora: "13:00", sede: "Voleando", cancha: 1 }),
      partidoPend("p23", D4ta_A1, D4ta_B2, { fecha: "2026-04-18", hora: "13:00", sede: "+ Pádel", cancha: 2 }),
      partidoPend("p24", D4ta_A2, D4ta_B1, { fecha: "2026-04-18", hora: "14:30", sede: "+ Pádel", cancha: 1 }),
      partidoPend("p25", D4ta_A2, D4ta_B2, { fecha: "2026-04-18", hora: "14:30", sede: "Voleando", cancha: 2 }),
    ],
  },

  // 8 — Damas Quinta (1 finalizado + 1 en_vivo + 2 pendientes)
  {
    id: "8", nombre: "Quinta", genero: "dam", estado: "en_vivo", ptsA: 1, ptsB: 0,
    partidos: [
      partidoFin ("p26", D5ta_A1, D5ta_B1, { fecha: "2026-04-17", hora: "13:00", sede: "+ Pádel", cancha: 1, resultado: "7-5 6-3", ganador: "A" }),
      partidoVivo("p27", D5ta_A1, D5ta_B2, { fecha: "2026-04-17", hora: "14:30", sede: "+ Pádel", cancha: 2, resultado: "6-4 3-2" }),
      partidoPend("p28", D5ta_A2, D5ta_B1, { fecha: "2026-04-18", hora: "14:30", sede: "Voleando", cancha: 1 }),
      partidoPend("p29", D5ta_A2, D5ta_B2, { fecha: "2026-04-18", hora: "16:00", sede: "+ Pádel", cancha: 1 }),
    ],
  },

  // 9 — Damas Sexta (4 finalizados → tabla completa, empate 2-2)
  {
    id: "9", nombre: "Sexta", genero: "dam", estado: "finalizado", ptsA: 2, ptsB: 2,
    partidos: [
      partidoFin("p30", D6ta_A1, D6ta_B1, { fecha: "2026-04-17", hora: "10:00", sede: "Voleando", cancha: 2, resultado: "6-3 6-4",     ganador: "A" }),
      partidoFin("p31", D6ta_A1, D6ta_B2, { fecha: "2026-04-17", hora: "11:30", sede: "+ Pádel", cancha: 2, resultado: "2-6 1-6",     ganador: "B" }),
      partidoFin("p32", D6ta_A2, D6ta_B1, { fecha: "2026-04-17", hora: "13:00", sede: "Voleando", cancha: 1, resultado: "6-0 6-1",     ganador: "A" }),
      partidoFin("p33", D6ta_A2, D6ta_B2, { fecha: "2026-04-17", hora: "13:00", sede: "Voleando", cancha: 2, resultado: "4-6 6-4 2-6", ganador: "B" }),
    ],
  },

  // 10 — Mixto Suma 12 (4 pendientes)
  {
    id: "10", nombre: "Suma 12", genero: "mixto", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      partidoPend("p34", M12_A1, M12_B1, { fecha: "2026-04-18", hora: "16:00", sede: "Voleando", cancha: 1 }),
      partidoPend("p35", M12_A1, M12_B2, { fecha: "2026-04-18", hora: "16:00", sede: "Voleando", cancha: 2 }),
      partidoPend("p36", M12_A2, M12_B1, { fecha: "2026-04-18", hora: "17:30", sede: "+ Pádel", cancha: 1 }),
      partidoPend("p37", M12_A2, M12_B2, { fecha: "2026-04-18", hora: "17:30", sede: "+ Pádel", cancha: 2 }),
    ],
  },

  // 11 — Mixto Suma 10 (4 pendientes)
  {
    id: "11", nombre: "Suma 10", genero: "mixto", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      partidoPend("p38", M10_A1, M10_B1, { fecha: "2026-04-19", hora: "10:00", sede: "Voleando", cancha: 1 }),
      partidoPend("p39", M10_A1, M10_B2, { fecha: "2026-04-19", hora: "10:00", sede: "+ Pádel", cancha: 1 }),
      partidoPend("p40", M10_A2, M10_B1, { fecha: "2026-04-19", hora: "11:30", sede: "Voleando", cancha: 2 }),
      partidoPend("p41", M10_A2, M10_B2, { fecha: "2026-04-19", hora: "11:30", sede: "+ Pádel", cancha: 2 }),
    ],
  },
]
