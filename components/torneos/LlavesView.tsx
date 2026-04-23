"use client"

import { useMemo, useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any

function formatPareja(pareja: { jugador1: { nombre: string; apellido: string } | null; jugador2: { nombre: string; apellido: string } | null } | null) {
  if (!pareja) return "—"
  const j1 = pareja.jugador1?.apellido ?? ""
  const j2 = pareja.jugador2?.apellido ?? ""
  return j1 && j2 ? `${j1} / ${j2}` : j1 || j2 || "—"
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}
function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })
}

const TERCERA_KEYS = new Set(["3er_puesto", "3ro"])

function detectRonda(partidos: Partido[]) {
  const byRonda = new Map<string, Partido[]>()
  partidos.forEach((p: Partido) => {
    const r = p.ronda ?? "final"
    if (!byRonda.has(r)) byRonda.set(r, [])
    byRonda.get(r)!.push(p)
  })
  const ORDER = ["cuartos", "semis", "semifinal", "semifinales", "final", "3er_puesto", "3ro"]
  return Array.from(byRonda.entries()).sort(([a], [b]) => {
    const ai = ORDER.indexOf(a), bi = ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1; if (bi === -1) return -1
    return ai - bi
  })
}

const ROUND_META: Record<string, { label: string; icon: string }> = {
  cuartos:      { label: "Cuartos",    icon: "sports_tennis" },
  semis:        { label: "Semis",      icon: "vertical_split" },
  semifinal:    { label: "Semis",      icon: "vertical_split" },
  semifinales:  { label: "Semis",      icon: "vertical_split" },
  final:        { label: "Final",      icon: "emoji_events" },
  "3er_puesto": { label: "3er Puesto", icon: "military_tech" },
  "3ro":        { label: "3er Puesto", icon: "military_tech" },
}

// ── Bracket layout constants ───────────────────────────────────────────────────
const CARD_H = 84
const CARD_W = 162
const SLOT_H = CARD_H + 12   // gap between cards in same round
const CONN_W = 34
const HDR_H  = 44

function computeCenters(rondas: [string, Partido[]][]): number[][] {
  const centers: number[][] = []
  const n = rondas[0][1].length
  centers.push(Array.from({ length: n }, (_, i) => i * SLOT_H + CARD_H / 2))

  for (let r = 1; r < rondas.length; r++) {
    const count = rondas[r][1].length
    const prev  = centers[r - 1]
    const ratio = prev.length / count
    centers.push(
      Array.from({ length: count }, (_, i) => {
        const a = Math.floor(i * ratio)
        const b = Math.min(Math.ceil((i + 1) * ratio) - 1, prev.length - 1)
        return (prev[a] + prev[b]) / 2
      })
    )
  }
  return centers
}

// ── Main Component ────────────────────────────────────────────────────────────

export function LlavesView({ partidos, categorias }: {
  partidos: Partido[]
  categorias: { id: string; nombre: string }[]
  initialCatId?: string | null
}) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const selCatId     = searchParams.get("cat") ?? categorias[0]?.id ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectCat = (id: string | null) => {
    const url = id ? `${pathname}?cat=${id}` : pathname
    router.replace(url as any, { scroll: false })
  }

  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [selCatId])

  const filtrados = useMemo(() => {
    const porCat = selCatId ? partidos.filter((p: Partido) => p.categorias?.id === selCatId) : partidos
    return porCat.filter((p: Partido) => p.ronda != null)
  }, [partidos, selCatId])

  const allRondas  = useMemo(() => detectRonda(filtrados), [filtrados])
  const mainRondas = useMemo(() => allRondas.filter(([r]) => !TERCERA_KEYS.has(r)), [allRondas])
  const terceraRda = useMemo(() => allRondas.filter(([r]) =>  TERCERA_KEYS.has(r)), [allRondas])

  const showBracket = mainRondas.length >= 2

  return (
    <div style={{ background: "#f8fafc" }}>

      {/* Chips sticky */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "rgba(248,250,252,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0", padding: "10px 0",
      }}>
        <div style={{
          display: "flex", gap: 6, overflowX: "auto", padding: "0 16px",
          scrollbarWidth: "none",
          WebkitMaskImage: "linear-gradient(to right, black calc(100% - 40px), transparent 100%)",
          maskImage:        "linear-gradient(to right, black calc(100% - 40px), transparent 100%)",
        }}>
          {categorias.length > 1 && (
            <CatChip active={!selCatId} onClick={() => selectCat(null)}>Todas</CatChip>
          )}
          {categorias.map(c => (
            <CatChip key={c.id} active={selCatId === c.id} onClick={() => selectCat(c.id)}>
              {c.nombre}
            </CatChip>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: 24 }}>
        {allRondas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 48, color: "#e2e8f0", display: "block", lineHeight: 1 }}>
              account_tree
            </span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, color: "#94a3b8", marginTop: 12 }}>
              Las llaves se publicarán<br />cuando terminen los grupos
            </p>
          </div>
        ) : showBracket ? (
          <>
            <BracketScroll rondas={mainRondas} />
            {terceraRda.length > 0 && (
              <div style={{ padding: "8px 16px 0" }}>
                {terceraRda.map(([ronda, rondaPartidos]) => (
                  <RondaSection key={ronda} ronda={ronda} partidos={rondaPartidos} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: "16px 16px 0" }}>
            {allRondas.map(([ronda, rondaPartidos]) => (
              <RondaSection key={ronda} ronda={ronda} partidos={rondaPartidos} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

// ── Cat Chip ──────────────────────────────────────────────────────────────────

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} data-pressable="true" style={{
      flexShrink: 0, padding: "5px 14px", borderRadius: 20,
      border: `1.5px solid ${active ? "#0f172a" : "#e2e8f0"}`,
      background: active ? "#0f172a" : "#fff",
      color: active ? "#fff" : "#64748b",
      fontFamily: "var(--font-space-grotesk), sans-serif",
      fontSize: 11, fontWeight: 700, cursor: "pointer",
      textTransform: "uppercase", letterSpacing: "0.04em",
      WebkitTapHighlightColor: "transparent",
    }}>
      {children}
    </button>
  )
}

// ── Bracket Scroll ────────────────────────────────────────────────────────────

function BracketScroll({ rondas }: { rondas: [string, Partido[]][] }) {
  const centers   = useMemo(() => computeCenters(rondas), [rondas])
  const cardAreaH = centers[0][centers[0].length - 1] + CARD_H / 2

  const cols: React.ReactNode[] = []
  rondas.forEach(([ronda, rondaPartidos], i) => {
    cols.push(
      <RoundColumn
        key={ronda}
        ronda={ronda}
        partidos={rondaPartidos}
        centers={centers[i]}
        cardAreaH={cardAreaH}
      />
    )
    if (i < rondas.length - 1) {
      cols.push(
        <ConnectorCol
          key={`conn-${i}`}
          fromCenters={centers[i]}
          toCenters={centers[i + 1]}
          cardAreaH={cardAreaH}
        />
      )
    }
  })

  return (
    <div style={{ overflowX: "auto", scrollbarWidth: "none" }}>
      <div style={{
        display: "flex", alignItems: "flex-start",
        padding: "16px 16px 12px",
        gap: 0, minWidth: "min-content",
      }}>
        {cols}
      </div>
    </div>
  )
}

// ── Round Column ──────────────────────────────────────────────────────────────

function RoundColumn({
  ronda, partidos, centers, cardAreaH,
}: {
  ronda: string
  partidos: Partido[]
  centers: number[]
  cardAreaH: number
}) {
  const meta    = ROUND_META[ronda] ?? { label: ronda, icon: "sports_tennis" }
  const isFinal = ronda === "final"

  return (
    <div style={{ width: CARD_W, flexShrink: 0 }}>
      {/* Round header */}
      <div style={{ height: HDR_H, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{
          fontFamily: "'Material Symbols Outlined'",
          fontSize: 13, lineHeight: 1,
          color: isFinal ? "#bcff00" : "#64748b",
          background: isFinal ? "#0f172a" : "#f1f5f9",
          padding: "4px", borderRadius: 6,
        }}>
          {meta.icon}
        </span>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 900,
          color: isFinal ? "#0f172a" : "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.07em",
        }}>
          {meta.label}
        </span>
      </div>

      {/* Cards — absolute inside fixed-height area */}
      <div style={{ position: "relative", height: cardAreaH }}>
        {partidos.map((p: Partido, j: number) => (
          <div key={p.id} style={{
            position: "absolute",
            top: centers[j] - CARD_H / 2,
            width: "100%",
            animation: "fadeUp 300ms cubic-bezier(0.23,1,0.32,1) both",
            animationDelay: `${j * 60}ms`,
          }}>
            <BracketCard partido={p} isFinal={isFinal} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Connector Column ──────────────────────────────────────────────────────────

function ConnectorCol({
  fromCenters, toCenters, cardAreaH,
}: {
  fromCenters: number[]
  toCenters: number[]
  cardAreaH: number
}) {
  const W = CONN_W
  const H = HDR_H + cardAreaH

  return (
    <div style={{ width: W, flexShrink: 0, height: H }}>
      <svg width={W} height={H} style={{ display: "block" }}>
        {toCenters.map((_: number, i: number) => {
          const ratio = fromCenters.length / toCenters.length
          const aIdx  = Math.floor(i * ratio)
          const bIdx  = Math.min(Math.ceil((i + 1) * ratio) - 1, fromCenters.length - 1)
          const yA    = fromCenters[aIdx] + HDR_H
          const yB    = fromCenters[bIdx] + HDR_H
          const mid   = (yA + yB) / 2

          if (yA === yB) {
            return (
              <path key={i} d={`M 0 ${yA} H ${W}`}
                stroke="#d1dae6" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            )
          }

          return (
            <g key={i}>
              <path d={`M 0 ${yA} H ${W / 2}`}  stroke="#d1dae6" strokeWidth={1.5} fill="none" strokeLinecap="round" />
              <path d={`M 0 ${yB} H ${W / 2}`}  stroke="#d1dae6" strokeWidth={1.5} fill="none" strokeLinecap="round" />
              <path d={`M ${W/2} ${yA} V ${yB}`} stroke="#d1dae6" strokeWidth={1.5} fill="none" />
              <path d={`M ${W/2} ${mid} H ${W}`} stroke="#d1dae6" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Bracket Card ──────────────────────────────────────────────────────────────

function BracketCard({ partido: p, isFinal }: { partido: Partido; isFinal: boolean }) {
  const isLive = p.estado === "en_vivo"
  const isFin  = p.estado === "finalizado"
  const res    = p.resultado

  let winner: 1 | 2 | null = null
  if (res && isFin) winner = res.sets_pareja1 > res.sets_pareja2 ? 1 : 2

  return (
    <div style={{
      height: CARD_H,
      background: "#fff",
      borderRadius: 14,
      border: isFinal ? "1.5px solid #0f172a" : "1px solid #e8eef4",
      boxShadow: isFinal
        ? "0 6px 20px rgba(15,23,42,0.1), 0 2px 6px rgba(15,23,42,0.06)"
        : "0 1px 4px rgba(0,0,0,0.05)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      {/* Final accent bar */}
      {isFinal && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "#bcff00",
        }} />
      )}

      <BracketTeamRow
        pareja={p.pareja1}
        score={res?.sets_pareja1}
        isWinner={winner === 1}
        isLive={isLive}
        isFin={isFin}
        showBorder
      />
      <BracketTeamRow
        pareja={p.pareja2}
        score={res?.sets_pareja2}
        isWinner={winner === 2}
        isLive={isLive}
        isFin={isFin}
        showBorder={false}
      />
    </div>
  )
}

// ── Bracket Team Row ──────────────────────────────────────────────────────────

function BracketTeamRow({
  pareja, score, isWinner, isLive, isFin, showBorder,
}: {
  pareja: Partido["pareja1"]
  score: number | undefined
  isWinner: boolean
  isLive: boolean
  isFin: boolean
  showBorder: boolean
}) {
  const name    = formatPareja(pareja)
  const isLoser = isFin && !isWinner

  return (
    <div style={{
      flex: 1,
      display: "flex", alignItems: "center",
      padding: "0 10px", gap: 6,
      borderBottom: showBorder ? "1px solid #f1f5f9" : "none",
      opacity: isLoser ? 0.38 : 1,
    }}>
      {/* Indicator */}
      <div style={{ width: 8, flexShrink: 0 }}>
        {isWinner && isFin ? (
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0f172a" }} />
        ) : isLive ? (
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#bcff00" }} />
        ) : null}
      </div>

      {/* Name */}
      <span style={{
        flex: 1,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 11, fontWeight: isWinner ? 800 : 600,
        color: isWinner ? "#0f172a" : "#94a3b8",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {name}
      </span>

      {/* Score */}
      {score !== undefined && (
        <span style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 18, lineHeight: 1,
          color: isWinner ? "#0f172a" : "#d1dae6",
          minWidth: 12, textAlign: "center",
        }}>
          {score}
        </span>
      )}
    </div>
  )
}

// ── Ronda Section (stacked — fallback y 3er puesto) ───────────────────────────

function RondaSection({ ronda, partidos }: { ronda: string; partidos: Partido[] }) {
  const meta    = ROUND_META[ronda] ?? { label: ronda, icon: "sports_tennis" }
  const isFinal = ronda === "final"

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{
          fontFamily: "'Material Symbols Outlined'",
          fontSize: 18, lineHeight: 1,
          color: isFinal ? "#bcff00" : "#64748b",
          background: isFinal ? "#0f172a" : "#f1f5f9",
          padding: "5px", borderRadius: 8,
        }}>
          {meta.icon}
        </span>
        <h3 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 20, fontWeight: 400,
          textTransform: "uppercase", letterSpacing: "0.03em",
          color: "#0f172a", margin: 0,
        }}>
          {meta.label}
        </h3>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {partidos.map((p: Partido, i: number) => (
          <LlaveCard key={p.id} partido={p} index={i} isFinal={isFinal} />
        ))}
      </div>
    </div>
  )
}

// ── Llave Card ────────────────────────────────────────────────────────────────

function LlaveCard({ partido: p, index, isFinal }: { partido: Partido; index: number; isFinal: boolean }) {
  const isLive = p.estado === "en_vivo"
  const isFin  = p.estado === "finalizado"
  const res    = p.resultado

  let winner: 1 | 2 | null = null
  if (res && isFin) winner = res.sets_pareja1 > res.sets_pareja2 ? 1 : 2

  return (
    <div data-pressable="true" style={{
      borderRadius: 18, overflow: "hidden",
      background: "#fff",
      border: isFinal ? "1.5px solid #0f172a" : "1px solid #e2e8f0",
      boxShadow: isFinal
        ? "0 8px 28px rgba(15,23,42,0.1), 0 2px 6px rgba(15,23,42,0.06)"
        : "0 2px 8px rgba(0,0,0,0.04)",
      animation: "fadeUp 300ms cubic-bezier(0.23, 1, 0.32, 1) both",
      animationDelay: `${index * 60}ms`,
      position: "relative",
    }}>
      {/* Final accent bar */}
      {isFinal && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "#bcff00", zIndex: 1,
        }} />
      )}

      {/* Meta row */}
      {(p.horario || p.cancha || isLive) && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          background: "#f8fafc",
          borderBottom: "1px solid #f1f5f9",
          marginTop: isFinal ? 3 : 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {p.horario && (
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                {formatFecha(p.horario)} · {formatHora(p.horario)}
              </span>
            )}
            {p.cancha && (
              <span style={{
                fontSize: 10, fontWeight: 800,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                color: "#0f172a", background: "#f1f5f9",
                padding: "2px 8px", borderRadius: 4,
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                C{p.cancha}
              </span>
            )}
          </div>
          <StatusPill estado={p.estado} />
        </div>
      )}

      {/* Equipo 1 */}
      <EquipoRow
        pareja={p.pareja1}
        score={res?.sets_pareja1}
        isWinner={winner === 1}
        isLive={isLive}
        isFin={isFin}
        isFinal={isFinal}
        showDivider
      />

      {/* Equipo 2 */}
      <EquipoRow
        pareja={p.pareja2}
        score={res?.sets_pareja2}
        isWinner={winner === 2}
        isLive={isLive}
        isFin={isFin}
        isFinal={isFinal}
        showDivider={false}
      />

      {/* Sede */}
      {!res && !isLive && p.sedes?.nombre && (
        <div style={{
          padding: "8px 16px", borderTop: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, color: "#64748b", lineHeight: 1 }}>location_on</span>
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#64748b" }}>
            {p.sedes.nombre}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Equipo Row ────────────────────────────────────────────────────────────────

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
  const name    = formatPareja(pareja)
  const isLoser = isFin && !isWinner

  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "14px 16px",
      borderBottom: showDivider ? "1px solid #f1f5f9" : "none",
      opacity: isLoser ? 0.4 : 1,
      gap: 10,
    }}>
      {/* Trophy / live dot */}
      <div style={{ width: 18, flexShrink: 0, display: "flex", justifyContent: "center" }}>
        {isWinner && isFin ? (
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1, color: isFinal ? "#bcff00" : "#0f172a",
            background: isFinal ? "#0f172a" : "transparent", borderRadius: isFinal ? "50%" : 0, padding: isFinal ? "2px" : 0,
          }}>
            {isFinal ? "emoji_events" : "check_circle"}
          </span>
        ) : isLive ? (
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#bcff00" }} />
        ) : null}
      </div>

      {/* Name */}
      <span style={{
        flex: 1,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 13, fontWeight: isWinner ? 800 : 600,
        color: isWinner ? "#0f172a" : "#94a3b8",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {name}
      </span>

      {/* Score */}
      {score !== undefined && (
        <div style={{
          minWidth: 40, textAlign: "center",
          background: isWinner ? "#f1f5f9" : "transparent",
          borderRadius: 8, padding: "4px 8px",
        }}>
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 24, fontWeight: 400, lineHeight: 1,
            color: isWinner ? "#0f172a" : "#94a3b8",
          }}>
            {score}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Status Pill ───────────────────────────────────────────────────────────────

function StatusPill({ estado }: { estado: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pendiente:  { label: "Por jugar",  color: "#64748b", bg: "#f1f5f9" },
    en_vivo:    { label: "En vivo",    color: "#0f172a", bg: "#bcff00" },
    finalizado: { label: "Finalizado", color: "#64748b", bg: "#f1f5f9" },
  }
  const s = map[estado] ?? map.pendiente

  return (
    <span style={{
      fontFamily: "var(--font-space-grotesk), sans-serif",
      fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em",
      color: s.color, background: s.bg,
      padding: "3px 8px", borderRadius: 100,
    }}>
      {s.label}
    </span>
  )
}
