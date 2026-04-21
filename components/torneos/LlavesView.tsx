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
  cuartos:      { label: "Cuartos de Final", icon: "sports_tennis" },
  semis:        { label: "Semifinales",       icon: "vertical_split" },
  semifinal:    { label: "Semifinales",       icon: "vertical_split" },
  semifinales:  { label: "Semifinales",       icon: "vertical_split" },
  final:        { label: "Final",             icon: "emoji_events" },
  "3er_puesto": { label: "3er Puesto",        icon: "military_tech" },
  "3ro":        { label: "3er Puesto",        icon: "military_tech" },
}

export function LlavesView({ partidos, categorias }: {
  partidos: Partido[]
  categorias: { id: string; nombre: string }[]
  initialCatId?: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selCatId = searchParams.get("cat") ?? categorias[0]?.id ?? null

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

  const rondas = useMemo(() => detectRonda(filtrados), [filtrados])

  return (
    <div style={{ paddingBottom: 100, background: "#f8fafc", minHeight: "100vh" }}>

      {/* Chips sticky */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "rgba(248,250,252,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0", padding: "10px 0",
      }}>
        <div style={{
          display: "flex", gap: 6, overflowX: "auto", padding: "0 16px", scrollbarWidth: "none",
          WebkitMaskImage: "linear-gradient(to right, black calc(100% - 40px), transparent 100%)",
          maskImage: "linear-gradient(to right, black calc(100% - 40px), transparent 100%)",
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

      <div style={{ padding: "16px 16px 0" }}>
        {rondas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 48, color: "#e2e8f0", display: "block", lineHeight: 1 }}>
              account_tree
            </span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, color: "#94a3b8", marginTop: 12 }}>
              Las llaves se publicarán<br />cuando terminen los grupos
            </p>
          </div>
        ) : (
          rondas.map(([ronda, rondaPartidos]) => (
            <RondaSection key={ronda} ronda={ronda} partidos={rondaPartidos} />
          ))
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

// ── Ronda Section ─────────────────────────────────────────────────────────────

function RondaSection({ ronda, partidos }: { ronda: string; partidos: Partido[] }) {
  const meta    = ROUND_META[ronda] ?? { label: ronda, icon: "sports_tennis" }
  const isFinal = ronda === "final"

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{
          fontFamily: "'Material Symbols Outlined'",
          fontSize: 18, lineHeight: 1,
          color: isFinal ? "#bcff00" : "#0f172a",
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
      background: isFinal ? "#0f172a" : "#fff",
      border: isFinal ? "none" : "1px solid #e2e8f0",
      boxShadow: isFinal
        ? "0 16px 40px rgba(15,23,42,0.25), 0 0 0 1px rgba(188,255,0,0.2)"
        : "0 2px 8px rgba(0,0,0,0.04)",
      animation: "fadeUp 300ms cubic-bezier(0.23, 1, 0.32, 1) both",
      animationDelay: `${index * 60}ms`,
    }}>

      {/* Meta row (hora, cancha, estado) */}
      {(p.horario || p.cancha || isLive) && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          background: isFinal ? "rgba(255,255,255,0.05)" : "#f8fafc",
          borderBottom: `1px solid ${isFinal ? "rgba(255,255,255,0.07)" : "#f1f5f9"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {p.horario && (
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 700,
                color: isFinal ? "#94a3b8" : "#64748b",
              }}>
                {formatFecha(p.horario)} · {formatHora(p.horario)}
              </span>
            )}
            {p.cancha && (
              <span style={{
                fontSize: 10, fontWeight: 800,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                color: isFinal ? "#bcff00" : "#0f172a",
                background: isFinal ? "rgba(188,255,0,0.12)" : "#f1f5f9",
                padding: "2px 8px", borderRadius: 4,
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                C{p.cancha}
              </span>
            )}
          </div>
          <StatusPill estado={p.estado} isFinal={isFinal} />
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

      {/* Sede (si no hay score) */}
      {!res && !isLive && p.sedes?.nombre && (
        <div style={{
          padding: "8px 16px",
          borderTop: `1px solid ${isFinal ? "rgba(255,255,255,0.06)" : "#f1f5f9"}`,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, color: "#64748b", lineHeight: 1 }}>
            location_on
          </span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 700, color: "#64748b",
          }}>
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
  const name = formatPareja(pareja)
  const isLoser = isFin && !isWinner

  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "14px 16px",
      borderBottom: showDivider
        ? `1px solid ${isFinal ? "rgba(255,255,255,0.07)" : "#f1f5f9"}`
        : "none",
      opacity: isLoser ? (isFinal ? 0.35 : 0.45) : 1,
      gap: 10,
    }}>
      {/* Trophy / live dot */}
      <div style={{ width: 18, flexShrink: 0, display: "flex", justifyContent: "center" }}>
        {isWinner && isFin ? (
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1, color: "#bcff00" }}>
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
        color: isFinal
          ? (isWinner ? "#fff" : "#64748b")
          : (isWinner ? "#0f172a" : "#475569"),
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {name}
      </span>

      {/* Score */}
      {score !== undefined && (
        <div style={{
          minWidth: 40, textAlign: "center",
          background: isWinner
            ? (isFinal ? "#bcff00" : "#f1f5f9")
            : "transparent",
          borderRadius: 8, padding: "4px 8px",
        }}>
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 24, fontWeight: 400, lineHeight: 1,
            color: isWinner
              ? (isFinal ? "#0f172a" : "#0f172a")
              : (isFinal ? "#334155" : "#94a3b8"),
          }}>
            {score}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Status Pill ───────────────────────────────────────────────────────────────

function StatusPill({ estado, isFinal }: { estado: string; isFinal: boolean }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pendiente:   { label: "Por jugar",  color: "#64748b", bg: isFinal ? "rgba(255,255,255,0.08)" : "#f1f5f9" },
    en_vivo:     { label: "En vivo",    color: "#0f172a", bg: "#bcff00" },
    finalizado:  { label: "Finalizado", color: isFinal ? "#94a3b8" : "#64748b", bg: isFinal ? "rgba(255,255,255,0.06)" : "#f1f5f9" },
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
