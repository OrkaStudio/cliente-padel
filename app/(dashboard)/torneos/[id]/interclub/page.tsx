import Link from "next/link"
import { HeroMarcador } from "@/components/torneos/interclub/HeroMarcador"
import { CategoriasInterclub } from "@/components/torneos/interclub/CategoriasInterclub"
import { PartidosEnVivoCarousel } from "@/components/torneos/interclub/PartidosEnVivoCarousel"
import type { CategoriaInterclub, Club } from "@/components/torneos/interclub/CategoriasInterclub"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

const CLUB_A: Club = { nombre: "Voleando", color: "#0f172a", abbr: "VOL", logoUrl: "/clubes/voleando.logo.png" }
const CLUB_B: Club = { nombre: "+ Pádel", color: "#b45309", abbr: "MP", logoUrl: "/clubes/mas-padel.logo.png" }

const MOCK_CATEGORIAS: CategoriaInterclub[] = [
  {
    id: "1", nombre: "Suma 12", estado: "finalizado", ptsA: 3, ptsB: 1,
    partidos: [
      { id: "p1", pairA: "Gómez / Ruiz", pairB: "López / Torres", resultado: "6-3 7-5", ganador: "A", estado: "finalizado" },
      { id: "p2", pairA: "Gómez / Ruiz", pairB: "Díaz / Funes", resultado: "6-1 6-3", ganador: "A", estado: "finalizado" },
      { id: "p3", pairA: "Silva / Mora", pairB: "López / Torres", resultado: "6-4 6-2", ganador: "A", estado: "finalizado" },
      { id: "p4", pairA: "Silva / Mora", pairB: "Díaz / Funes", resultado: "4-6 3-6", ganador: "B", estado: "finalizado" },
    ],
  },
  {
    id: "2", nombre: "Suma 10", estado: "en_vivo", ptsA: 1, ptsB: 1,
    partidos: [
      { id: "p5", pairA: "Ferreyra / Ríos", pairB: "Campos / Bravo", resultado: "6-3 6-4", ganador: "A", estado: "finalizado" },
      { id: "p6", pairA: "Ferreyra / Ríos", pairB: "Herrera / Sosa", resultado: "3-6 4-6", ganador: "B", estado: "finalizado" },
      { id: "p7", pairA: "Peralta / Luna", pairB: "Campos / Bravo", resultado: "6-3 4-3", ganador: null, estado: "en_vivo", horaInicio: "14:30", sede: "Voleando" },
      { id: "p8", pairA: "Peralta / Luna", pairB: "Herrera / Sosa", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "3", nombre: "Mixtos A", estado: "en_vivo", ptsA: 0, ptsB: 2,
    partidos: [
      { id: "p9", pairA: "García / Vega", pairB: "Martín / Paz", resultado: "3-6 2-6", ganador: "B", estado: "finalizado" },
      { id: "p10", pairA: "García / Vega", pairB: "Núñez / Reyes", resultado: "1-6 2-6", ganador: "B", estado: "finalizado" },
      { id: "p11", pairA: "Castro / Medina", pairB: "Martín / Paz", resultado: "5-4", ganador: null, estado: "en_vivo", horaInicio: "14:30", sede: "+Pádel" },
      { id: "p12", pairA: "Castro / Medina", pairB: "Núñez / Reyes", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "4", nombre: "Séptima", estado: "finalizado", ptsA: 4, ptsB: 0,
    partidos: [
      { id: "p13", pairA: "Romero / Pinto", pairB: "Acosta / Vera", resultado: "6-0 6-1", ganador: "A", estado: "finalizado" },
      { id: "p14", pairA: "Romero / Pinto", pairB: "Blanco / Ibáñez", resultado: "6-2 6-3", ganador: "A", estado: "finalizado" },
      { id: "p15", pairA: "Vargas / Cruz", pairB: "Acosta / Vera", resultado: "6-4 7-5", ganador: "A", estado: "finalizado" },
      { id: "p16", pairA: "Vargas / Cruz", pairB: "Blanco / Ibáñez", resultado: "7-6 6-3", ganador: "A", estado: "finalizado" },
    ],
  },
  {
    id: "5", nombre: "Sexta", estado: "finalizado", ptsA: 2, ptsB: 2,
    partidos: [
      { id: "p17", pairA: "Domínguez / Soto", pairB: "Flores / Gil", resultado: "6-3 6-4", ganador: "A", estado: "finalizado" },
      { id: "p18", pairA: "Domínguez / Soto", pairB: "Ortega / Ramos", resultado: "4-6 3-6", ganador: "B", estado: "finalizado" },
      { id: "p19", pairA: "Benítez / Ojeda", pairB: "Flores / Gil", resultado: "7-5 4-6 1-6", ganador: "B", estado: "finalizado" },
      { id: "p20", pairA: "Benítez / Ojeda", pairB: "Ortega / Ramos", resultado: "6-4 6-3", ganador: "A", estado: "finalizado" },
    ],
  },
  {
    id: "6", nombre: "Quinta", estado: "en_vivo", ptsA: 1, ptsB: 0,
    partidos: [
      { id: "p21", pairA: "Molina / Quiroga", pairB: "Espinoza / Vidal", resultado: "6-2 6-3", ganador: "A", estado: "finalizado" },
      { id: "p22", pairA: "Molina / Quiroga", pairB: "Aguilar / Rojas", resultado: "4-2", ganador: null, estado: "en_vivo", horaInicio: "15:00", sede: "Voleando" },
      { id: "p23", pairA: "Navarro / Palacios", pairB: "Espinoza / Vidal", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p24", pairA: "Navarro / Palacios", pairB: "Aguilar / Rojas", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "7", nombre: "Cuarta", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p25", pairA: "Álvarez / Carrizo", pairB: "Cabrera / Delgado", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p26", pairA: "Álvarez / Carrizo", pairB: "Fuentes / Guerrero", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p27", pairA: "Méndez / Peña", pairB: "Cabrera / Delgado", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p28", pairA: "Méndez / Peña", pairB: "Fuentes / Guerrero", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "8", nombre: "Tercera", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p29", pairA: "Heredia / Ávila", pairB: "Paredes / Solís", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p30", pairA: "Heredia / Ávila", pairB: "Tapia / Contreras", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p31", pairA: "Salas / Figueroa", pairB: "Paredes / Solís", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p32", pairA: "Salas / Figueroa", pairB: "Tapia / Contreras", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "9", nombre: "Segunda", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p33", pairA: "Córdoba / Mena", pairB: "Ríos / Sandoval", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p34", pairA: "Córdoba / Mena", pairB: "Zamora / Villareal", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p35", pairA: "Lagos / Bustos", pairB: "Ríos / Sandoval", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p36", pairA: "Lagos / Bustos", pairB: "Zamora / Villareal", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "10", nombre: "Primera", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p37", pairA: "Muñoz / Serrano", pairB: "Cáceres / Valdivia", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p38", pairA: "Muñoz / Serrano", pairB: "Jiménez / Pedraza", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p39", pairA: "Arce / Escobar", pairB: "Cáceres / Valdivia", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p40", pairA: "Arce / Escobar", pairB: "Jiménez / Pedraza", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "11", nombre: "Mixtos B", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p41", pairA: "Ibarra / Leiva", pairB: "Neira / Poblete", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p42", pairA: "Ibarra / Leiva", pairB: "Quintero / Robles", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p43", pairA: "Trujillo / Uribe", pairB: "Neira / Poblete", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p44", pairA: "Trujillo / Uribe", pairB: "Quintero / Robles", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
]

export default async function InterclubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const ptsA = MOCK_CATEGORIAS.reduce((s, c) => s + c.ptsA, 0)
  const ptsB = MOCK_CATEGORIAS.reduce((s, c) => s + c.ptsB, 0)
  const enJuego = MOCK_CATEGORIAS.filter((c) => c.estado === "en_vivo").length
  const finalizadas = MOCK_CATEGORIAS.filter((c) => c.estado === "finalizado").length

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 40 }}>
      {/* Back */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        padding: "12px 18px 0", background: "#ffffff", borderBottom: "1px solid #f1f5f9",
      }}>
        <Link
          href={`/torneos/${id}` as AnyHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#64748b", textDecoration: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.06em",
            WebkitTapHighlightColor: "transparent",
            paddingBottom: 12,
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>
            arrow_back
          </span>
          Volver al torneo
        </Link>
      </div>

      {/* Hero */}
      <HeroMarcador
        torneoNombre="Torneo Interclubes Abril"
        torneoFecha="Abr 17–19, 2026"
        clubA={CLUB_A}
        clubB={CLUB_B}
        ptsA={ptsA}
        ptsB={ptsB}
        totalCategorias={MOCK_CATEGORIAS.length}
        categoriasEnJuego={enJuego}
        categoriasFinalizadas={finalizadas}
      />

      {/* Carrusel en vivo */}
      <PartidosEnVivoCarousel
        categorias={MOCK_CATEGORIAS}
        clubA={CLUB_A}
        clubB={CLUB_B}
      />

      {/* Categorías */}
      <CategoriasInterclub
        categorias={MOCK_CATEGORIAS}
        clubA={CLUB_A}
        clubB={CLUB_B}
        torneoId={id}
      />
    </div>
  )
}
