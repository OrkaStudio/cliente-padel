"use client"

import { useState, useMemo } from "react"
import type { CategoriaInterclub, Club } from "./CategoriasInterclub"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any

const STATE_ORDER: Record<string, number> = { en_vivo: 0, pendiente: 1, finalizado: 2 }

function sortPartidos(partidos: Partido[]) {
  return [...partidos].sort((a, b) => {
    const s = (STATE_ORDER[a.estado] ?? 99) - (STATE_ORDER[b.estado] ?? 99)
    if (s !== 0) return s
    if (!a.horaInicio && !b.horaInicio) return 0
    if (!a.horaInicio) return 1
    if (!b.horaInicio) return -1
    return a.horaInicio.localeCompare(b.horaInicio)
  })
}

// Parsea "6-3 7-5" → [{a:"6",b:"3"},{a:"7",b:"5"}]
function parseSets(resultado: string | null): { a: string; b: string }[] {
  if (!resultado) return []
  return resultado.trim().split(/\s+/).map(s => {
    const parts = s.split("-")
    return { a: parts[0] ?? "–", b: parts[1] ?? "–" }
  })
}

export function FixtureInterclubView({
  categorias,
  clubA,
  clubB,
}: {
  categorias: CategoriaInterclub[]
  clubA: Club
  clubB: Club
}) {
  const [selCat, setSelCat]           = useState<string | null>(null)
  const [showFinalizados, setShowFin] = useState(false)

  const allPartidos = useMemo(() => categorias.flatMap(c => c.partidos), [categorias])
  const liveCount   = allPartidos.filter(p => p.estado === "en_vivo").length
  const pendCount   = allPartidos.filter(p => p.estado === "pendiente").length
  const finCount    = allPartidos.filter(p => p.estado === "finalizado").length

  const filteredCats = selCat ? categorias.filter(c => c.id === selCat) : categorias

  return (
    <div style={{ paddingBottom: 100 }}>

      {/* ── Chips de categoría ── */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "rgba(248,250,252,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0", padding: "10px 0",
      }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "0 16px", scrollbarWidth: "none" }}>
          <Chip active={!selCat} onClick={() => setSelCat(null)}>Todas</Chip>
          {categorias.map(c => (
            <Chip key={c.id} active={selCat === c.id} hasLive={c.estado === "en_vivo"} onClick={() => setSelCat(c.id)}>
              {c.nombre}
            </Chip>
          ))}
        </div>
      </div>

      {/* ── Status bar ── */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 16px 0", flexWrap: "wrap" }}>
        {liveCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulseLive 2s infinite" }} />
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 700, color: "#15803d" }}>
              {liveCount} en vivo
            </span>
          </div>
        )}
        {liveCount > 0 && pendCount > 0 && <span style={{ color: "#cbd5e1", fontSize: 11 }}>·</span>}
        {pendCount > 0 && (
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, color: "#64748b" }}>
            {pendCount} por jugar
          </span>
        )}
        {finCount > 0 && (
          <>
            <span style={{ color: "#cbd5e1", fontSize: 11 }}>·</span>
            <button
              onClick={() => setShowFin(v => !v)}
              style={{
                background: "none", border: "none", padding: 0, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 3,
                fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, color: "#64748b",
              }}
            >
              {showFinalizados ? "Ocultar" : "Ver"} {finCount} finalizados
              <span style={{
                fontFamily: "'Material Symbols Outlined'", fontSize: 13, lineHeight: 1,
                display: "inline-block",
                transform: showFinalizados ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 200ms cubic-bezier(0.23,1,0.32,1)",
              }}>expand_more</span>
            </button>
          </>
        )}
      </div>

      {/* ── Lista de partidos por categoría ── */}
      <div style={{ padding: "12px 16px 0" }}>
        {filteredCats.map(cat => {
          const sorted  = sortPartidos(cat.partidos)
          const visible = sorted.filter(p => showFinalizados || p.estado !== "finalizado")
          if (visible.length === 0) return null

          return (
            <div key={cat.id} style={{ marginBottom: 24 }}>

              {/* Header de categoría */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 4, height: 16, borderRadius: 2, flexShrink: 0,
                  background: cat.estado === "en_vivo" ? "#22c55e" : "#e2e8f0",
                }} />
                <span style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 13, textTransform: "uppercase", color: "#0f172a", letterSpacing: "0.05em",
                }}>
                  {cat.nombre}
                </span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 9, fontWeight: 900, color: "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {clubA.abbr} <span style={{ color: "#0f172a" }}>{cat.ptsA}–{cat.ptsB}</span> {clubB.abbr}
                </span>
              </div>

              {/* Cards */}
              {visible.map((p, i) => (
                <PartidoCard key={p.id} partido={p} clubA={clubA} clubB={clubB} index={i} />
              ))}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseLive {
          0%,100% { opacity:1; transform:scale(1); box-shadow:0 0 0 2px rgba(34,197,94,.25); }
          50%     { opacity:.6; transform:scale(1.1); box-shadow:0 0 0 6px rgba(34,197,94,.1); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

// ── Chip ──────────────────────────────────────────────────────────────────

function Chip({ active, hasLive, onClick, children }: {
  active: boolean
  hasLive?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: "flex", alignItems: "center", gap: 5,
        padding: "5px 13px", borderRadius: 20,
        border: `1.5px solid ${active ? "#0f172a" : "#e2e8f0"}`,
        background: active ? "#0f172a" : "#fff",
        color: active ? "#fff" : "#64748b",
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 11, fontWeight: 700, cursor: "pointer",
        textTransform: "uppercase", letterSpacing: "0.04em",
        transition: "all 160ms cubic-bezier(0.23,1,0.32,1)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {hasLive && (
        <div style={{
          width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
          background: active ? "#bcff00" : "#22c55e",
        }} />
      )}
      {children}
    </button>
  )
}

// ── Partido Card ──────────────────────────────────────────────────────────

function PartidoCard({ partido: p, clubA, clubB, index }: {
  partido: Partido
  clubA: Club
  clubB: Club
  index: number
}) {
  const isLive  = p.estado === "en_vivo"
  const isFin   = p.estado === "finalizado"
  const winnerA = isFin && p.ganador === "A"
  const winnerB = isFin && p.ganador === "B"
  const sets    = parseSets(p.resultado)

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${isLive ? "#bcff00" : "#e2e8f0"}`,
      borderRadius: 10,
      marginBottom: 6,
      overflow: "hidden",
      boxShadow: isLive ? "0 0 0 1px #bcff00" : "none",
      animation: "fadeUp 220ms cubic-bezier(0.23,1,0.32,1) both",
      animationDelay: `${Math.min(index, 6) * 35}ms`,
    }}>

      {/* ── Top row: hora · sede · estado ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "5px 10px",
        background: isLive ? "#0f172a" : "#f8fafc",
        borderBottom: `1px solid ${isLive ? "#1e293b" : "#f1f5f9"}`,
      }}>

        {/* Hora + Sede */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {p.horaInicio ? (
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 13, lineHeight: 1,
              color: isLive ? "#fff" : "#0f172a",
            }}>
              {p.horaInicio}
            </span>
          ) : (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, color: isLive ? "#475569" : "#cbd5e1",
            }}>
              --:--
            </span>
          )}
          {p.sede && (
            <>
              <span style={{ color: isLive ? "#334155" : "#cbd5e1", fontSize: 10 }}>·</span>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10, fontWeight: 600,
                color: isLive ? "#94a3b8" : "#64748b",
              }}>
                {p.sede}
              </span>
            </>
          )}
        </div>

        {/* Estado */}
        {isLive ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#bcff00", animation: "pulseLive 2s infinite",
            }} />
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900, color: "#bcff00",
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>
              En vivo
            </span>
          </div>
        ) : isFin ? (
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Final
          </span>
        ) : (
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 700, color: "#cbd5e1",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Pendiente
          </span>
        )}
      </div>

      {/* ── Filas de equipos ── */}
      <div style={{ padding: "9px 10px" }}>

        {/* Equipo A */}
        <TeamRow
          abbr={clubA.abbr}
          color={clubA.color}
          name={p.pairA}
          sets={sets.map(s => s.a)}
          isWinner={winnerA}
          isLoser={isFin && !winnerA}
          isLive={isLive}
        />

        {/* Divisor */}
        <div style={{ height: 1, background: "#f1f5f9", margin: "5px 0 5px 48px" }} />

        {/* Equipo B */}
        <TeamRow
          abbr={clubB.abbr}
          color={clubB.color}
          name={p.pairB}
          sets={sets.map(s => s.b)}
          isWinner={winnerB}
          isLoser={isFin && !winnerB}
          isLive={isLive}
        />
      </div>
    </div>
  )
}

// ── Team Row ──────────────────────────────────────────────────────────────

function TeamRow({ abbr, color, name, sets, isWinner, isLoser, isLive }: {
  abbr: string
  color: string
  name: string
  sets: string[]
  isWinner: boolean
  isLoser: boolean
  isLive: boolean
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

      {/* Club abbr */}
      <span style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 8, fontWeight: 900,
        color, textTransform: "uppercase", letterSpacing: "0.06em",
        flexShrink: 0, minWidth: 22, textAlign: "right",
        opacity: isLoser ? 0.4 : 1,
      }}>
        {abbr}
      </span>

      {/* Separador vertical */}
      <div style={{
        width: 1.5, alignSelf: "stretch", minHeight: 14,
        background: color, borderRadius: 1, flexShrink: 0,
        opacity: isLoser ? 0.25 : 1,
      }} />

      {/* Nombre */}
      <span style={{
        flex: 1, minWidth: 0,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 12, fontWeight: isWinner ? 800 : 600,
        color: isLoser ? "#94a3b8" : "#0f172a",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {isWinner && (
          <span style={{ color: "#bcff00", fontSize: 9, marginRight: 4 }}>★</span>
        )}
        {name}
      </span>

      {/* Sets */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0, minWidth: 20 }}>
        {sets.length > 0 ? (
          sets.map((s, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 16, fontWeight: 400, lineHeight: 1,
              color: isWinner ? "#0f172a" : isLoser ? "#cbd5e1" : "#64748b",
              minWidth: 12, textAlign: "center",
            }}>
              {s}
            </span>
          ))
        ) : (
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, color: isLive ? "#0f172a" : "#e2e8f0", fontWeight: 700,
          }}>
            {isLive ? "–" : "—"}
          </span>
        )}
      </div>
    </div>
  )
}
