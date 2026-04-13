import Link from "next/link"
import { notFound } from "next/navigation"
import type { CategoriaInterclub, Club } from "@/components/torneos/interclub/CategoriasInterclub"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

const CLUB_A: Club = { nombre: "Voleando", color: "#0f172a", abbr: "VOL", logoUrl: "/clubes/voleando.logo.png" }
const CLUB_B: Club = { nombre: "Más Pádel", color: "#b45309", abbr: "MP", logoUrl: "/clubes/mas-padel.logo.png" }

// Mismo mock que la página padre — en producción vendrá de Supabase
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
      { id: "p7", pairA: "Peralta / Luna", pairB: "Campos / Bravo", resultado: "4-3", ganador: null, estado: "en_vivo" },
      { id: "p8", pairA: "Peralta / Luna", pairB: "Herrera / Sosa", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "3", nombre: "Mixtos A", estado: "en_vivo", ptsA: 0, ptsB: 2,
    partidos: [
      { id: "p9", pairA: "García / Vega", pairB: "Martín / Paz", resultado: "3-6 2-6", ganador: "B", estado: "finalizado" },
      { id: "p10", pairA: "García / Vega", pairB: "Núñez / Reyes", resultado: "1-6 2-6", ganador: "B", estado: "finalizado" },
      { id: "p11", pairA: "Castro / Medina", pairB: "Martín / Paz", resultado: "5-4", ganador: null, estado: "en_vivo" },
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
      { id: "p22", pairA: "Molina / Quiroga", pairB: "Aguilar / Rojas", resultado: "4-2", ganador: null, estado: "en_vivo" },
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

export default async function CategoriaInterclubPage({
  params,
}: {
  params: Promise<{ id: string; catId: string }>
}) {
  const { id, catId } = await params
  const cat = MOCK_CATEGORIAS.find((c) => c.id === catId)
  if (!cat) notFound()

  const isLive = cat.estado === "en_vivo"
  const isFin = cat.estado === "finalizado"
  const liderA = cat.ptsA > cat.ptsB
  const liderB = cat.ptsB > cat.ptsA

  // Parejas únicas por club
  const parejasA = [...new Set(cat.partidos.map((p) => p.pairA))]
  const parejasB = [...new Set(cat.partidos.map((p) => p.pairB))]

  const enVivo = cat.partidos.filter((p) => p.estado === "en_vivo")
  const finalizados = cat.partidos.filter((p) => p.estado === "finalizado")
  const pendientes = cat.partidos.filter((p) => p.estado === "pendiente")

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: "#0d0d0d", padding: "12px 18px 0", position: "sticky", top: 0, zIndex: 10 }}>
        <Link
          href={`/torneos/${id}/interclub` as AnyHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "rgba(255,255,255,0.4)", textDecoration: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.06em",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>arrow_back</span>
          Interclubes
        </Link>
      </div>

      {/* Hero categoría */}
      <div style={{ padding: "20px 18px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Badge estado */}
        <div style={{ marginBottom: 12 }}>
          {isLive && (
            <span style={{
              background: "#BCFF00", color: "#000",
              padding: "3px 10px", borderRadius: 2,
              fontSize: 9, fontWeight: 900,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              textTransform: "uppercase", letterSpacing: "0.12em",
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#000" }} />
              En juego
            </span>
          )}
          {isFin && (
            <span style={{
              background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)",
              padding: "3px 10px", borderRadius: 2,
              fontSize: 9, fontWeight: 900,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              textTransform: "uppercase", letterSpacing: "0.12em",
              display: "inline-block",
            }}>
              Finalizado
            </span>
          )}
          {cat.estado === "pendiente" && (
            <span style={{
              background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)",
              padding: "3px 10px", borderRadius: 2,
              fontSize: 9, fontWeight: 900,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              textTransform: "uppercase", letterSpacing: "0.12em",
              display: "inline-block",
            }}>
              Pendiente
            </span>
          )}
        </div>

        {/* Nombre categoría */}
        <h1 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 36, fontWeight: 400, lineHeight: 1,
          color: "#ffffff", textTransform: "uppercase",
          margin: "0 0 20px",
        }}>
          {cat.nombre}
        </h1>

        {/* Marcador */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 72, fontWeight: 400, lineHeight: 1,
              color: liderA ? "#BCFF00" : "rgba(255,255,255,0.2)",
              letterSpacing: "-0.03em",
            }}>
              {cat.ptsA}
            </div>
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 900,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4,
            }}>
              {CLUB_A.nombre}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.15)",
              textTransform: "uppercase",
            }}>VS</span>
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)" }} />
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 72, fontWeight: 400, lineHeight: 1,
              color: liderB ? "#BCFF00" : "rgba(255,255,255,0.2)",
              letterSpacing: "-0.03em",
            }}>
              {cat.ptsB}
            </div>
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 900,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4,
            }}>
              {CLUB_B.nombre}
            </div>
          </div>
        </div>
      </div>

      {/* Parejas */}
      <div style={{ padding: "24px 18px 0" }}>
        <SectionTitle>Parejas</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {/* Club A */}
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)", padding: "14px 14px",
          }}>
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900,
              color: liderA ? "#BCFF00" : "rgba(255,255,255,0.35)",
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10,
            }}>
              {CLUB_A.nombre}
            </div>
            {parejasA.map((pareja) => (
              <div key={pareja} style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 12, fontWeight: 700,
                color: "#ffffff", marginBottom: 6,
                lineHeight: 1.3,
              }}>
                {pareja.replace(" / ", "\n")}
              </div>
            ))}
          </div>

          {/* Club B */}
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)", padding: "14px 14px",
          }}>
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900,
              color: liderB ? "#BCFF00" : "rgba(255,255,255,0.35)",
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10,
            }}>
              {CLUB_B.nombre}
            </div>
            {parejasB.map((pareja) => (
              <div key={pareja} style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 12, fontWeight: 700,
                color: "#ffffff", marginBottom: 6,
                lineHeight: 1.3,
              }}>
                {pareja.replace(" / ", "\n")}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partidos en vivo */}
      {enVivo.length > 0 && (
        <div style={{ padding: "24px 18px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#BCFF00",
              display: "inline-block", boxShadow: "0 0 8px #BCFF00",
            }} />
            <SectionTitle>En cancha</SectionTitle>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {enVivo.map((p) => (
              <PartidoCard key={p.id} pairA={p.pairA} pairB={p.pairB}
                resultado={p.resultado} estado="en_vivo" ganador={null} />
            ))}
          </div>
        </div>
      )}

      {/* Próximos */}
      {pendientes.length > 0 && (
        <div style={{ padding: "24px 18px 0" }}>
          <SectionTitle>Próximos partidos</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {pendientes.map((p) => (
              <PartidoCard key={p.id} pairA={p.pairA} pairB={p.pairB}
                resultado={null} estado="pendiente" ganador={null} />
            ))}
          </div>
        </div>
      )}

      {/* Resultados */}
      {finalizados.length > 0 && (
        <div style={{ padding: "24px 18px 0" }}>
          <SectionTitle>Resultados</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {finalizados.map((p) => (
              <PartidoCard key={p.id} pairA={p.pairA} pairB={p.pairB}
                resultado={p.resultado} estado="finalizado" ganador={p.ganador} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--font-anton), Anton, sans-serif",
      fontSize: 20, fontWeight: 400, textTransform: "uppercase",
      letterSpacing: "0.05em", margin: 0, color: "#ffffff",
    }}>
      {children}
    </h2>
  )
}

function PartidoCard({
  pairA, pairB, resultado, estado, ganador,
}: {
  pairA: string
  pairB: string
  resultado: string | null
  estado: "pendiente" | "en_vivo" | "finalizado"
  ganador: "A" | "B" | null
}) {
  const isLive = estado === "en_vivo"
  const isFin = estado === "finalizado"

  return (
    <div style={{
      background: isLive ? "rgba(188,255,0,0.05)" : "rgba(255,255,255,0.03)",
      border: isLive ? "1px solid rgba(188,255,0,0.2)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: 8, padding: "12px 14px",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
        {/* Pareja A */}
        <div>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4,
          }}>
            {CLUB_A.abbr}
          </div>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: ganador === "A" ? 900 : 700,
            color: ganador === "A" ? "#ffffff" : ganador === "B" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.7)",
            lineHeight: 1.3,
          }}>
            {pairA}
          </div>
        </div>

        {/* Score / estado */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          {isFin && (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, fontWeight: 900,
              color: "#ffffff", letterSpacing: "0.04em",
            }}>
              {resultado}
            </span>
          )}
          {isLive && (
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 18, fontWeight: 400,
              color: "#BCFF00", letterSpacing: "0.02em",
            }}>
              {resultado ?? "–"}
            </span>
          )}
          {estado === "pendiente" && (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, color: "rgba(255,255,255,0.15)",
            }}>—</span>
          )}
        </div>

        {/* Pareja B */}
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4,
          }}>
            {CLUB_B.abbr}
          </div>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: ganador === "B" ? 900 : 700,
            color: ganador === "B" ? "#ffffff" : ganador === "A" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.7)",
            lineHeight: 1.3,
          }}>
            {pairB}
          </div>
        </div>
      </div>
    </div>
  )
}
