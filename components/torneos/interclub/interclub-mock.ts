import type { CategoriaInterclub, Club } from "./CategoriasInterclub"

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

export const MOCK_CATEGORIAS: CategoriaInterclub[] = [
  {
    id: "1", nombre: "Suma 12", genero: "masc", estado: "finalizado", ptsA: 3, ptsB: 1,
    partidos: [
      { id: "p1", pairA: "Gómez / Ruiz",  pairB: "López / Torres", resultado: "6-3 7-5", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "10:00", sede: "Voleando",  cancha: 1 },
      { id: "p2", pairA: "Gómez / Ruiz",  pairB: "Díaz / Funes",   resultado: "6-1 6-3", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "10:00", sede: "+ Pádel", cancha: 1 },
      { id: "p3", pairA: "Silva / Mora",  pairB: "López / Torres", resultado: "6-4 6-2", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "11:30", sede: "+ Pádel", cancha: 2 },
      { id: "p4", pairA: "Silva / Mora",  pairB: "Díaz / Funes",   resultado: "4-6 3-6", ganador: "B", estado: "finalizado", fecha: "2026-04-17", horaInicio: "11:30", sede: "Voleando",  cancha: 2 },
    ],
  },
  {
    id: "2", nombre: "Suma 10", genero: "masc", estado: "en_vivo", ptsA: 1, ptsB: 1,
    partidos: [
      { id: "p5", pairA: "Ferreyra / Ríos", pairB: "Campos / Bravo", resultado: "6-3 6-4", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "13:00", sede: "Voleando",  cancha: 1 },
      { id: "p6", pairA: "Ferreyra / Ríos", pairB: "Herrera / Sosa", resultado: "3-6 4-6", ganador: "B", estado: "finalizado", fecha: "2026-04-17", horaInicio: "13:00", sede: "+ Pádel", cancha: 1 },
      { id: "p7", pairA: "Peralta / Luna",  pairB: "Campos / Bravo", resultado: "6-4",     ganador: null, estado: "en_vivo",   fecha: "2026-04-17", horaInicio: "16:00", sede: "Voleando",  cancha: 1 },
      { id: "p8", pairA: "Peralta / Luna",  pairB: "Herrera / Sosa", resultado: null,       ganador: null, estado: "pendiente", fecha: "2026-04-17", horaInicio: "17:30", sede: "+ Pádel", cancha: 1 },
    ],
  },
  {
    id: "3", nombre: "Mixtos A", genero: "mixto", estado: "en_vivo", ptsA: 0, ptsB: 2,
    partidos: [
      { id: "p9",  pairA: "García / Vega",   pairB: "Martín / Paz",  resultado: "3-6 2-6", ganador: "B", estado: "finalizado", fecha: "2026-04-17", horaInicio: "13:00", sede: "+ Pádel", cancha: 2 },
      { id: "p10", pairA: "García / Vega",   pairB: "Núñez / Reyes", resultado: "1-6 2-6", ganador: "B", estado: "finalizado", fecha: "2026-04-17", horaInicio: "13:00", sede: "Voleando",  cancha: 2 },
      { id: "p11", pairA: "Castro / Medina", pairB: "Martín / Paz",  resultado: null,       ganador: null, estado: "en_vivo",   fecha: "2026-04-17", horaInicio: "16:00", sede: "+ Pádel", cancha: 2 },
      { id: "p12", pairA: "Castro / Medina", pairB: "Núñez / Reyes", resultado: null,       ganador: null, estado: "pendiente", fecha: "2026-04-17", horaInicio: "17:30", sede: "Voleando",  cancha: 2 },
    ],
  },
  {
    id: "4", nombre: "Séptima", genero: "masc", estado: "finalizado", ptsA: 4, ptsB: 0,
    partidos: [
      { id: "p13", pairA: "Romero / Pinto", pairB: "Acosta / Vera",   resultado: "6-0 6-1", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "10:00", sede: "Voleando",  cancha: 2 },
      { id: "p14", pairA: "Romero / Pinto", pairB: "Blanco / Ibáñez", resultado: "6-2 6-3", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "10:00", sede: "+ Pádel", cancha: 2 },
      { id: "p15", pairA: "Vargas / Cruz",  pairB: "Acosta / Vera",   resultado: "6-4 7-5", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "11:30", sede: "+ Pádel", cancha: 1 },
      { id: "p16", pairA: "Vargas / Cruz",  pairB: "Blanco / Ibáñez", resultado: "7-6 6-3", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "11:30", sede: "Voleando",  cancha: 1 },
    ],
  },
  {
    id: "5", nombre: "Sexta", genero: "masc", estado: "finalizado", ptsA: 2, ptsB: 2,
    partidos: [
      { id: "p17", pairA: "Domínguez / Soto", pairB: "Flores / Gil",   resultado: "6-3 6-4",     ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "13:00", sede: "Voleando",  cancha: 1 },
      { id: "p18", pairA: "Domínguez / Soto", pairB: "Ortega / Ramos", resultado: "4-6 3-6",     ganador: "B", estado: "finalizado", fecha: "2026-04-17", horaInicio: "13:00", sede: "+ Pádel", cancha: 2 },
      { id: "p19", pairA: "Benítez / Ojeda",  pairB: "Flores / Gil",   resultado: "7-5 4-6 1-6", ganador: "B", estado: "finalizado", fecha: "2026-04-17", horaInicio: "14:30", sede: "+ Pádel", cancha: 1 },
      { id: "p20", pairA: "Benítez / Ojeda",  pairB: "Ortega / Ramos", resultado: "6-4 6-3",     ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "14:30", sede: "Voleando",  cancha: 2 },
    ],
  },
  {
    id: "6", nombre: "Quinta", genero: "masc", estado: "en_vivo", ptsA: 1, ptsB: 0,
    partidos: [
      { id: "p21", pairA: "Molina / Quiroga",  pairB: "Espinoza / Vidal", resultado: "6-2 6-3", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "14:30", sede: "Voleando",  cancha: 1 },
      { id: "p22", pairA: "Molina / Quiroga",  pairB: "Aguilar / Rojas",  resultado: "6-2",     ganador: null, estado: "en_vivo",   fecha: "2026-04-17", horaInicio: "16:00", sede: "Voleando",  cancha: 2 },
      { id: "p23", pairA: "Navarro / Palacios", pairB: "Espinoza / Vidal", resultado: null,      ganador: null, estado: "pendiente", fecha: "2026-04-17", horaInicio: "16:00", sede: "+ Pádel", cancha: 1 },
      { id: "p24", pairA: "Navarro / Palacios", pairB: "Aguilar / Rojas",  resultado: null,      ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "10:00", sede: "Voleando",  cancha: 1 },
    ],
  },
  {
    id: "7", nombre: "Cuarta", genero: "masc", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p25", pairA: "Álvarez / Carrizo", pairB: "Cabrera / Delgado",  resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-17", horaInicio: "16:00", sede: "Voleando",  cancha: 1 },
      { id: "p26", pairA: "Álvarez / Carrizo", pairB: "Fuentes / Guerrero", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-17", horaInicio: "16:00", sede: "+ Pádel", cancha: 2 },
      { id: "p27", pairA: "Méndez / Peña",     pairB: "Cabrera / Delgado",  resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "10:00", sede: "+ Pádel", cancha: 1 },
      { id: "p28", pairA: "Méndez / Peña",     pairB: "Fuentes / Guerrero", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "10:00", sede: "Voleando",  cancha: 2 },
    ],
  },
  {
    id: "8", nombre: "Tercera", genero: "masc", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p29", pairA: "Heredia / Ávila",  pairB: "Paredes / Solís",   resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-17", horaInicio: "16:00", sede: "+ Pádel", cancha: 1 },
      { id: "p30", pairA: "Heredia / Ávila",  pairB: "Tapia / Contreras", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-17", horaInicio: "16:00", sede: "Voleando",  cancha: 2 },
      { id: "p31", pairA: "Salas / Figueroa", pairB: "Paredes / Solís",   resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "11:30", sede: "Voleando",  cancha: 1 },
      { id: "p32", pairA: "Salas / Figueroa", pairB: "Tapia / Contreras", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "11:30", sede: "+ Pádel", cancha: 2 },
    ],
  },
  {
    id: "9", nombre: "Segunda", genero: "masc", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p33", pairA: "Córdoba / Mena", pairB: "Ríos / Sandoval",    resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "13:00", sede: "Voleando",  cancha: 2 },
      { id: "p34", pairA: "Córdoba / Mena", pairB: "Zamora / Villareal", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "13:00", sede: "+ Pádel", cancha: 1 },
      { id: "p35", pairA: "Lagos / Bustos",  pairB: "Ríos / Sandoval",   resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "14:30", sede: "+ Pádel", cancha: 2 },
      { id: "p36", pairA: "Lagos / Bustos",  pairB: "Zamora / Villareal", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "14:30", sede: "Voleando",  cancha: 1 },
    ],
  },
  {
    id: "10", nombre: "Primera", genero: "masc", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p37", pairA: "Muñoz / Serrano", pairB: "Cáceres / Valdivia", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "16:00", sede: "+ Pádel", cancha: 2 },
      { id: "p38", pairA: "Muñoz / Serrano", pairB: "Jiménez / Pedraza",  resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "16:00", sede: "Voleando",  cancha: 1 },
      { id: "p39", pairA: "Arce / Escobar",  pairB: "Cáceres / Valdivia", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-19", horaInicio: "10:00", sede: "Voleando",  cancha: 2 },
      { id: "p40", pairA: "Arce / Escobar",  pairB: "Jiménez / Pedraza",  resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-19", horaInicio: "10:00", sede: "+ Pádel", cancha: 1 },
    ],
  },
  {
    id: "11", nombre: "Mixtos B", genero: "mixto", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p41", pairA: "Ibarra / Leiva",   pairB: "Neira / Poblete",   resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-19", horaInicio: "11:30", sede: "Voleando",  cancha: 1 },
      { id: "p42", pairA: "Ibarra / Leiva",   pairB: "Quintero / Robles", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-19", horaInicio: "11:30", sede: "+ Pádel", cancha: 2 },
      { id: "p43", pairA: "Trujillo / Uribe", pairB: "Neira / Poblete",   resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-19", horaInicio: "13:00", sede: "+ Pádel", cancha: 1 },
      { id: "p44", pairA: "Trujillo / Uribe", pairB: "Quintero / Robles", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-19", horaInicio: "13:00", sede: "Voleando",  cancha: 2 },
    ],
  },
  // ─── Damas (mock para testear diferenciación) ─────────────────────────────
  {
    id: "12", nombre: "Sexta", genero: "dam", estado: "finalizado", ptsA: 1, ptsB: 3,
    partidos: [
      { id: "d1", pairA: "Ríos / Castillo",    pairB: "Medina / Bravo",    resultado: "3-6 4-6", ganador: "B", estado: "finalizado", fecha: "2026-04-17", horaInicio: "10:00", sede: "Voleando",  cancha: 2 },
      { id: "d2", pairA: "Ríos / Castillo",    pairB: "Godoy / Páez",      resultado: "6-3 6-2", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "10:00", sede: "+ Pádel", cancha: 2 },
      { id: "d3", pairA: "Torres / Figueroa",  pairB: "Medina / Bravo",    resultado: "2-6 1-6", ganador: "B", estado: "finalizado", fecha: "2026-04-17", horaInicio: "11:30", sede: "+ Pádel", cancha: 1 },
      { id: "d4", pairA: "Torres / Figueroa",  pairB: "Godoy / Páez",      resultado: "1-6 2-6", ganador: "B", estado: "finalizado", fecha: "2026-04-17", horaInicio: "11:30", sede: "Voleando",  cancha: 1 },
    ],
  },
  {
    id: "13", nombre: "Quinta", genero: "dam", estado: "en_vivo", ptsA: 1, ptsB: 0,
    partidos: [
      { id: "d5", pairA: "Álvarez / Soria",    pairB: "Vera / Reina",      resultado: "6-4 6-3", ganador: "A", estado: "finalizado", fecha: "2026-04-17", horaInicio: "13:00", sede: "Voleando",  cancha: 2 },
      { id: "d6", pairA: "Álvarez / Soria",    pairB: "Ledesma / Ponce",   resultado: "5-3",     ganador: null, estado: "en_vivo",  fecha: "2026-04-17", horaInicio: "16:00", sede: "+ Pádel", cancha: 2 },
      { id: "d7", pairA: "Campos / Suárez",    pairB: "Vera / Reina",      resultado: null,      ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "10:00", sede: "+ Pádel", cancha: 1 },
      { id: "d8", pairA: "Campos / Suárez",    pairB: "Ledesma / Ponce",   resultado: null,      ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "10:00", sede: "Voleando",  cancha: 1 },
    ],
  },
  {
    id: "14", nombre: "Primera", genero: "dam", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "d9",  pairA: "Benítez / Chávez",  pairB: "Romero / Aguirre",  resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-18", horaInicio: "16:00", sede: "Voleando",  cancha: 2 },
      { id: "d10", pairA: "Benítez / Chávez",  pairB: "Salazar / Herrero", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-19", horaInicio: "10:00", sede: "+ Pádel", cancha: 2 },
      { id: "d11", pairA: "Vidal / Carrasco",  pairB: "Romero / Aguirre",  resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-19", horaInicio: "10:00", sede: "Voleando",  cancha: 1 },
      { id: "d12", pairA: "Vidal / Carrasco",  pairB: "Salazar / Herrero", resultado: null, ganador: null, estado: "pendiente", fecha: "2026-04-19", horaInicio: "11:30", sede: "+ Pádel", cancha: 1 },
    ],
  },
]
