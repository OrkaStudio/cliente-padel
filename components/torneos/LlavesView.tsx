"use client"

import { useMemo } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Chip } from "@/components/ui/padel/Chip"
import { StatusBadge } from "@/components/ui/padel/StatusBadge"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any

function formatPareja(pareja: { jugador1: { nombre: string; apellido: string } | null; jugador2: { nombre: string; apellido: string } | null } | null) {
  if (!pareja) return "—"
  const j1 = pareja.jugador1 ? pareja.jugador1.apellido : ""
  const j2 = pareja.jugador2 ? pareja.jugador2.apellido : ""
  if (j1 && j2) return `${j1} / ${j2}`
  return j1 || j2 || "—"
}

function formatScore(resultado: { sets_pareja1: number; sets_pareja2: number } | null) {
  if (!resultado) return null
  return { s1: resultado.sets_pareja1, s2: resultado.sets_pareja2 }
}

// Derive bracket rounds from partidos
// Rounds: cuartos (4 matches), semis (2), final (1), 3er puesto (1)
function detectRonda(partidos: Partido[]) {
  // Group by ronda field if it exists, else by count
  const byRonda = new Map<string, Partido[]>()
  partidos.forEach((p: Partido) => {
    const r = p.ronda ?? "final"
    if (!byRonda.has(r)) byRonda.set(r, [])
    byRonda.get(r)!.push(p)
  })

  // Standard order
  const ORDER = ["cuartos", "semis", "semifinal", "semifinales", "final", "3er_puesto", "3ro"]
  const sorted = Array.from(byRonda.entries()).sort(([a], [b]) => {
    const ai = ORDER.indexOf(a), bi = ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
  return sorted
}

const ROUND_LABELS: Record<string, string> = {
  cuartos: "Cuartos de final",
  semis: "Semifinales",
  semifinal: "Semifinales",
  semifinales: "Semifinales",
  final: "Final",
  "3er_puesto": "3er Puesto",
  "3ro": "3er Puesto",
}

export function LlavesView({ partidos, categorias, initialCatId }: {
  partidos: Partido[]
  categorias: { id: string; nombre: string }[]
  initialCatId?: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selCatId = searchParams.get("cat") ?? categorias[0]?.id ?? null

  const selectCat = (id: string | null) => {
    const url = id ? `${pathname}?cat=${id}` : pathname
    router.replace(url, { scroll: false })
  }

  const filtrados = useMemo(
    () => selCatId ? partidos.filter((p: Partido) => p.categorias?.id === selCatId) : partidos,
    [partidos, selCatId]
  )

  const rondas = useMemo(() => detectRonda(filtrados), [filtrados])

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Category chips sticky */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "rgba(248,250,252,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #cbd5e1", padding: "8px 0",
      }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "0 16px" }}>
          {categorias.length > 1 && (
            <Chip small active={!selCatId} onClick={() => selectCat(null)}>Todas</Chip>
          )}
          {categorias.map(c => (
            <Chip key={c.id} small active={selCatId === c.id} onClick={() => selectCat(c.id)}>
              {c.nombre}
            </Chip>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        {rondas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, display: "block" }}>account_tree</span>
            <p style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, marginTop: 8,
            }}>Sin llaves generadas aún</p>
          </div>
        ) : (
          rondas.map(([ronda, rondaPartidos]) => (
            <RondaSection key={ronda} ronda={ronda} partidos={rondaPartidos} />
          ))
        )}
      </div>
    </div>
  )
}

function RondaSection({ ronda, partidos }: { ronda: string; partidos: Partido[] }) {
  const label = ROUND_LABELS[ronda] ?? ronda
  const isFinal = ronda === "final"

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Ronda header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 4, height: 18, background: isFinal ? "#bcff00" : "#0f172a", borderRadius: 2 }} />
        <h3 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 15, fontWeight: 400, textTransform: "uppercase",
          letterSpacing: "0.05em", margin: 0, color: "#0f172a",
        }}>
          {label}
        </h3>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        <span style={{
          fontSize: 9, fontWeight: 900, color: "#64748b",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          {partidos.length} {partidos.length === 1 ? "partido" : "partidos"}
        </span>
      </div>

      {/* Partidos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {partidos.map((p: Partido, i: number) => (
          <LlavePartidoCard key={p.id} partido={p} index={i} isFinal={isFinal} />
        ))}
      </div>
    </div>
  )
}

function LlavePartidoCard({ partido: p, index, isFinal }: { partido: Partido; index: number; isFinal: boolean }) {
  const score = formatScore(p.resultado)
  const isLive = p.estado === "en_vivo"
  const isFin = p.estado === "finalizado"

  // Determine winner
  let winner: 1 | 2 | null = null
  if (score && isFin) {
    winner = score.s1 > score.s2 ? 1 : 2
  }

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${isFinal ? "#bcff00" : "#e2e8f0"}`,
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: isFinal ? "0 0 0 1px #bcff00" : "none",
      animation: "fadeUp 300ms cubic-bezier(0.23, 1, 0.32, 1) both",
      animationDelay: `${index * 60}ms`,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px",
        background: isFinal ? "#0f172a" : "#f8fafc",
        borderBottom: `1px solid ${isFinal ? "#1e293b" : "#f1f5f9"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {p.horario && (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, color: isFinal ? "#94a3b8" : "#64748b",
            }}>
              {new Date(p.horario).toLocaleDateString("es-AR", { day: "numeric", month: "short" })} ·{" "}
              {new Date(p.horario).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          {p.cancha && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: isFinal ? "#bcff00" : "#64748b",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              background: isFinal ? "rgba(188,255,0,0.12)" : "#f1f5f9",
              padding: "2px 6px", borderRadius: 3,
            }}>
              C{p.cancha}
            </span>
          )}
        </div>
        <StatusBadge status={p.estado} />
      </div>

      {/* Teams */}
      <div style={{ padding: "0 12px" }}>
        <EquipoRow
          pareja={p.pareja1}
          score={score?.s1}
          isWinner={winner === 1}
          isLive={isLive}
          isFin={isFin}
          isFinal={isFinal}
          showDivider
        />
        <EquipoRow
          pareja={p.pareja2}
          score={score?.s2}
          isWinner={winner === 2}
          isLive={isLive}
          isFin={isFin}
          isFinal={isFinal}
          showDivider={false}
        />
      </div>

      {/* If no score yet */}
      {!score && !isLive && (
        <div style={{
          padding: "8px 12px",
          background: "#f8fafc",
          borderTop: "1px solid #f1f5f9",
          textAlign: "center",
        }}>
          <span style={{
            fontSize: 10, color: "#94a3b8",
            fontFamily: "var(--font-space-grotesk), sans-serif",
          }}>
            {p.sedes?.nombre ?? "Por jugar"}
          </span>
        </div>
      )}
    </div>
  )
}

function EquipoRow({
  pareja, score, isWinner, isLive, isFin, isFinal, showDivider,
}: {
  pareja: Partido["pareja1"]
  score: number | undefined
  isWinner: boolean
  isLive: boolean
  isFin: boolean
  isFinal: boolean
  showDivider: boolean
}) {
  const name = formatPareja(pareja)

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: showDivider ? "1px solid #f1f5f9" : "none",
      opacity: isFin && !isWinner ? 0.45 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        {isWinner && (
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#bcff00", lineHeight: 1 }}>
            emoji_events
          </span>
        )}
        <span style={{
          fontSize: 13, fontWeight: isWinner ? 800 : 600,
          color: isWinner ? "#0f172a" : "#334155",
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}>
          {name}
        </span>
      </div>
      {score !== undefined && (
        <span style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 22, fontWeight: 400,
          color: isWinner ? "#0f172a" : "#94a3b8",
          background: isWinner && isFinal ? "#bcff00" : isWinner ? "#f1f5f9" : "transparent",
          padding: isWinner ? "2px 10px" : "2px 10px",
          borderRadius: 4, minWidth: 36, textAlign: "center",
        }}>
          {score}
        </span>
      )}
      {isLive && score !== undefined && (
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#bcff00", marginLeft: 6,
          animation: "pulse 1s ease-in-out infinite",
        }} />
      )}
    </div>
  )
}
