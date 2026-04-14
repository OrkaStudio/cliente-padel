import Link from "next/link"
import Image from "next/image"
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
      { id: "p7", pairA: "Peralta / Luna", pairB: "Campos / Bravo", resultado: "6-3 4-3", ganador: null, estado: "en_vivo", horaInicio: "14:30", cancha: "Cancha 1" },
      { id: "p8", pairA: "Peralta / Luna", pairB: "Herrera / Sosa", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "3", nombre: "Mixtos A", estado: "en_vivo", ptsA: 0, ptsB: 2,
    partidos: [
      { id: "p9", pairA: "García / Vega", pairB: "Martín / Paz", resultado: "3-6 2-6", ganador: "B", estado: "finalizado" },
      { id: "p10", pairA: "García / Vega", pairB: "Núñez / Reyes", resultado: "1-6 2-6", ganador: "B", estado: "finalizado" },
      { id: "p11", pairA: "Castro / Medina", pairB: "Martín / Paz", resultado: "5-4", ganador: null, estado: "en_vivo", horaInicio: "14:30", cancha: "Cancha 2" },
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
      { id: "p22", pairA: "Molina / Quiroga", pairB: "Aguilar / Rojas", resultado: "4-2", ganador: null, estado: "en_vivo", horaInicio: "15:00", cancha: "Cancha 3" },
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

  const enVivo = cat.partidos.filter((p) => p.estado === "en_vivo")
  const finalizados = cat.partidos.filter((p) => p.estado === "finalizado")
  const pendientes = cat.partidos.filter((p) => p.estado === "pendiente")

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 60 }}>

      {/* Sticky header */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "12px 18px",
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Link
          href={`/torneos/${id}/interclub` as AnyHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            color: "#64748b", textDecoration: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 700,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>
            arrow_back
          </span>
          Interclubes
        </Link>

        {/* Badge en header */}
        {isLive && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "#BCFF00", color: "#000",
            padding: "2px 8px", borderRadius: 100,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            <span className="live-dot" style={{
              width: 5, height: 5, borderRadius: "50%", background: "#000",
            }} />
            En vivo
          </span>
        )}
        {isFin && (
          <span style={{
            background: "#f1f5f9", color: "#64748b",
            padding: "2px 8px", borderRadius: 100,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            Finalizado
          </span>
        )}
      </div>

      {/* Hero categoría — marcador limpio */}
      <div style={{
        background: "#0f172a",
        padding: "28px 20px 32px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Nombre categoría */}
        <h1 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 14, fontWeight: 400, lineHeight: 1,
          color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
          letterSpacing: "0.16em", margin: "0 0 8px",
        }}>
          {cat.nombre}
        </h1>

        {/* Marcador */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16, marginBottom: 24,
        }}>
          {/* Club A score */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 72, fontWeight: 400, lineHeight: 1,
                color: liderA ? "#ffffff" : "rgba(255,255,255,0.25)",
                letterSpacing: "-0.04em",
              }}>
                {cat.ptsA}
              </span>
              {/* Logo */}
              {CLUB_A.logoUrl && (
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "rgba(255,255,255,0.08)",
                  position: "relative", overflow: "hidden", flexShrink: 0,
                  border: liderA ? "1.5px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
                }}>
                  <Image src={CLUB_A.logoUrl} alt={CLUB_A.nombre} fill style={{ objectFit: "contain", padding: 4 }} />
                </div>
              )}
            </div>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 900,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase", letterSpacing: "0.12em",
            }}>
              {CLUB_A.nombre}
            </span>
          </div>

          {/* Divisor VS */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            flex: 0, minWidth: 28,
          }}>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.2)",
              textTransform: "uppercase",
            }}>VS</span>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Club B score */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 72, fontWeight: 400, lineHeight: 1,
                color: liderB ? "#ffffff" : "rgba(255,255,255,0.25)",
                letterSpacing: "-0.04em",
              }}>
                {cat.ptsB}
              </span>
              {CLUB_B.logoUrl && (
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "rgba(255,255,255,0.08)",
                  position: "relative", overflow: "hidden", flexShrink: 0,
                  border: liderB ? "1.5px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
                }}>
                  <Image src={CLUB_B.logoUrl} alt={CLUB_B.nombre} fill style={{ objectFit: "contain", padding: 4 }} />
                </div>
              )}
            </div>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 900,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase", letterSpacing: "0.12em",
            }}>
              {CLUB_B.nombre}
            </span>
          </div>
        </div>

        {/* Progress de partidos */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            flex: 1, height: 3,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2, overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${cat.partidos.length > 0 ? (finalizados.length / cat.partidos.length) * 100 : 0}%`,
              background: isLive ? "#BCFF00" : "rgba(255,255,255,0.3)",
              borderRadius: 2,
              transition: "width 800ms ease",
            }} />
          </div>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            whiteSpace: "nowrap",
          }}>
            {finalizados.length}/{cat.partidos.length} jugados
          </span>
        </div>
      </div>

      <div style={{ padding: "0 14px" }}>

        {/* 1. EN CANCHA AHORA — prioridad máxima */}
        {enVivo.length > 0 && (
          <section style={{ paddingTop: 24 }}>
            <SectionLabel label="En cancha ahora" accent />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {enVivo.map((p) => (
                <PartidoCard
                  key={p.id}
                  pairA={p.pairA}
                  pairB={p.pairB}
                  resultado={p.resultado}
                  estado="en_vivo"
                  ganador={null}
                  horaInicio={p.horaInicio}
                  cancha={p.cancha}
                />
              ))}
            </div>
          </section>
        )}

        {/* 2. PRÓXIMOS */}
        {pendientes.length > 0 && (
          <section style={{ paddingTop: 24 }}>
            <SectionLabel label="Próximos" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {pendientes.map((p) => (
                <PartidoCard
                  key={p.id}
                  pairA={p.pairA}
                  pairB={p.pairB}
                  resultado={null}
                  estado="pendiente"
                  ganador={null}
                />
              ))}
            </div>
          </section>
        )}

        {/* 3. RESULTADOS */}
        {finalizados.length > 0 && (
          <section style={{ paddingTop: 24 }}>
            <SectionLabel label="Resultados" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {finalizados.map((p) => (
                <PartidoCard
                  key={p.id}
                  pairA={p.pairA}
                  pairB={p.pairB}
                  resultado={p.resultado}
                  estado="finalizado"
                  ganador={p.ganador}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}

// ─── Sub-componentes ────────────────────────────────────────────────────────

function SectionLabel({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
      {accent ? (
        <span className="live-dot" style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#16a34a", flexShrink: 0,
          display: "inline-block",
          boxShadow: "0 0 6px rgba(22,163,74,0.6)",
        }} />
      ) : (
        <div style={{
          width: 12, height: 2, borderRadius: 1,
          background: "#cbd5e1", flexShrink: 0,
        }} />
      )}
      <span style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 10, fontWeight: 900,
        textTransform: "uppercase", letterSpacing: "0.1em",
        color: accent ? "#16a34a" : "#94a3b8",
      }}>{label}</span>
    </div>
  )
}

function parseSets(resultado: string | null): string[] {
  if (!resultado) return []
  return resultado.trim().split(/\s+/)
}

function PartidoCard({
  pairA, pairB, resultado, estado, ganador, horaInicio, cancha,
}: {
  pairA: string
  pairB: string
  resultado: string | null
  estado: "pendiente" | "en_vivo" | "finalizado"
  ganador: "A" | "B" | null
  horaInicio?: string
  cancha?: string
}) {
  const isLive = estado === "en_vivo"
  const isFin = estado === "finalizado"
  const isPending = estado === "pendiente"

  const ganadorA = ganador === "A"
  const ganadorB = ganador === "B"

  const sets = parseSets(resultado)

  return (
    <div style={{
      background: isLive ? "#0f172a" : "#ffffff",
      border: isLive
        ? "1.5px solid rgba(188,255,0,0.4)"
        : isFin
        ? "1px solid #e2e8f0"
        : "1px solid #edf0f4",
      borderRadius: 12,
      padding: "14px 16px",
      boxShadow: isLive
        ? "0 4px 20px rgba(0,0,0,0.15)"
        : "0 1px 4px rgba(0,0,0,0.04)",
    }}>

      {/* Hora + cancha (solo en vivo o pendiente con datos) */}
      {(horaInicio || cancha) && (
        <div style={{
          display: "flex", gap: 8, alignItems: "center",
          marginBottom: 10,
        }}>
          {horaInicio && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 700,
              color: isLive ? "rgba(255,255,255,0.4)" : "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 10, lineHeight: 1 }}>
                schedule
              </span>
              {horaInicio}
            </span>
          )}
          {horaInicio && cancha && (
            <span style={{ color: isLive ? "rgba(255,255,255,0.15)" : "#e2e8f0", fontSize: 8 }}>·</span>
          )}
          {cancha && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 700,
              color: isLive ? "rgba(255,255,255,0.4)" : "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 10, lineHeight: 1 }}>
                sports_tennis
              </span>
              {cancha}
            </span>
          )}
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: 12, alignItems: "center",
      }}>

        {/* Pareja A */}
        <div>
          <span style={{
            display: "inline-block",
            background: isLive ? "rgba(255,255,255,0.12)" : CLUB_A.color,
            border: isLive ? "1.5px solid rgba(255,255,255,0.25)" : "none",
            color: "#ffffff",
            padding: "1px 6px", borderRadius: 3,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: 5,
          }}>
            {CLUB_A.abbr}
          </span>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12,
            fontWeight: ganadorA ? 900 : 700,
            color: isLive
              ? (ganadorA ? "#ffffff" : "rgba(255,255,255,0.6)")
              : ganadorA
              ? "#0f172a"
              : ganadorB
              ? "#94a3b8"
              : "#334155",
            lineHeight: 1.3,
          }}>
            {pairA}
          </div>
          {ganadorA && isFin && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              marginTop: 4,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900,
              color: "#16a34a",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 10, lineHeight: 1 }}>
                check
              </span>
              Ganó
            </span>
          )}
        </div>

        {/* Score central */}
        <div style={{ textAlign: "center", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          {isLive && (
            <>
              {sets.length === 0 ? (
                <span style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 18, fontWeight: 400,
                  color: "#000", background: "#BCFF00",
                  borderRadius: 6, padding: "2px 10px",
                  display: "inline-block", letterSpacing: "0.02em",
                }}>–</span>
              ) : (
                sets.map((set, idx) => {
                  const isCurrent = idx === sets.length - 1
                  return isCurrent ? (
                    <span key={idx} style={{
                      fontFamily: "var(--font-anton), Anton, sans-serif",
                      fontSize: 18, fontWeight: 400,
                      color: "#000", background: "#BCFF00",
                      borderRadius: 6, padding: "2px 10px",
                      display: "inline-block", letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}>{set}</span>
                  ) : (
                    <span key={idx} style={{
                      fontFamily: "var(--font-anton), Anton, sans-serif",
                      fontSize: 11, fontWeight: 400,
                      color: "rgba(255,255,255,0.5)",
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 4, padding: "1px 7px",
                      display: "inline-block", whiteSpace: "nowrap",
                    }}>{set}</span>
                  )
                })
              )}
              <div style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 7, fontWeight: 900,
                color: "#16a34a", marginTop: 1,
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                en vivo
              </div>
            </>
          )}
          {isFin && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              {sets.map((set, idx) => (
                <span key={idx} style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900,
                  color: "#0f172a", letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}>{set}</span>
              ))}
              {sets.length === 0 && (
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900,
                  color: "#0f172a",
                }}>–</span>
              )}
            </div>
          )}
          {isPending && (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 18, fontWeight: 300,
              color: "#e2e8f0",
            }}>—</span>
          )}
        </div>

        {/* Pareja B */}
        <div style={{ textAlign: "right" }}>
          <span style={{
            display: "inline-block",
            background: CLUB_B.color,
            color: "#ffffff",
            padding: "1px 6px", borderRadius: 3,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: 5,
          }}>
            {CLUB_B.abbr}
          </span>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12,
            fontWeight: ganadorB ? 900 : 700,
            color: isLive
              ? (ganadorB ? "#ffffff" : "rgba(255,255,255,0.6)")
              : ganadorB
              ? "#0f172a"
              : ganadorA
              ? "#94a3b8"
              : "#334155",
            lineHeight: 1.3, textAlign: "right",
          }}>
            {pairB}
          </div>
          {ganadorB && isFin && (
            <div style={{ textAlign: "right", marginTop: 4 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 8, fontWeight: 900,
                color: "#16a34a",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 10, lineHeight: 1 }}>
                  check
                </span>
                Ganó
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
