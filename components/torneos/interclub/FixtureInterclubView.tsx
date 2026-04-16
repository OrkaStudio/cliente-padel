"use client"

import React, { useState, useMemo } from "react"
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

function parseSets(resultado: string | null): { a: string; b: string }[] {
  if (!resultado) return []
  return resultado.trim().split(/\s+/).map(s => {
    const [a, b] = s.split("-")
    return { a: a ?? "–", b: b ?? "–" }
  })
}

function normalize(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function matchSearch(p: Partido, term: string): boolean {
  if (!term.trim()) return true
  const haystack = normalize(`${p.pairA ?? ""} ${p.pairB ?? ""}`)
  const words = normalize(term).trim().split(/\s+/).filter(Boolean)
  return words.every(w => haystack.includes(w))
}

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const HOY  = new Date().toISOString().split("T")[0]

function formatFecha(fecha?: string): string | null {
  if (!fecha || fecha === HOY) return null
  const d = new Date(fecha + "T12:00:00")
  return `${DIAS[d.getDay()]} ${d.getDate()}`
}

// ── Chip ──────────────────────────────────────────────────────────────────────

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
          background: active ? "#bcff00" : "#bcff00",
        }} />
      )}
      {children}
    </button>
  )
}

// ── LiveCard ──────────────────────────────────────────────────────────────────

function LiveCard({ partido: p, clubA, clubB }: { partido: Partido; clubA: Club; clubB: Club }) {
  const parsed = parseSets(p.resultado)

  return (
    <div style={{
      background: "#ffffff",
      border: "1.5px solid #bcff00",
      borderRadius: 14, padding: "13px 14px",
      position: "relative", overflow: "hidden",
      boxShadow: "0 2px 12px rgba(188,255,0,0.12)",
      animation: "fadeUp 220ms cubic-bezier(0.23,1,0.32,1) both",
    }}>
      {/* Ghost VIVO */}
      <span aria-hidden style={{
        position: "absolute", zIndex: 0,
        right: -4, bottom: -10,
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 58, fontWeight: 400, lineHeight: 1,
        color: "rgba(188,255,0,0.32)", letterSpacing: "-0.02em",
        pointerEvents: "none", userSelect: "none", textTransform: "uppercase",
      }}>VIVO</span>
      <div aria-hidden style={{
        position: "absolute", zIndex: 1, inset: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom right, transparent 40%, rgba(255,255,255,0.6) 100%)",
      }} />

      {/* Top row */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 12,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 900, color: "#15803d",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          <span className="live-dot" style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "#22c55e", display: "inline-block", flexShrink: 0,
          }} />
          En cancha
        </div>
        {(p.sede || p.horaInicio) && (() => {
          const sedeColor = p.sede === clubA.nombre ? clubA.color : p.sede ? clubB.color : "#94a3b8"
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              {p.horaInicio && (
                <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#64748b" }}>
                  {p.horaInicio}
                </span>
              )}
              {p.sede && <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, lineHeight: 1, color: sedeColor }}>location_on</span>}
              {p.sede && (
                <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: sedeColor }}>
                  {p.sede}{p.cancha ? ` C${p.cancha}` : ""}
                </span>
              )}
            </div>
          )
        })()}
      </div>

      {/* Scoreboard */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Fila A */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            minWidth: 28, height: 18, padding: "0 5px",
            border: "1px solid #e2e8f0", borderRadius: 4, flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900,
              color: clubA.color, textTransform: "uppercase",
            }}>{clubA.abbr}</span>
          </div>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 900, color: "#0f172a",
            lineHeight: 1.2, textTransform: "uppercase",
            flex: 1, minWidth: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{p.pairA}</span>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {parsed.map((s, i) => (
              <span key={i} style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 18, lineHeight: 1, color: "#0f172a",
                minWidth: 16, textAlign: "center",
              }}>{s.a}</span>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "#f1f5f9", margin: "0 0 8px 38px" }} />

        {/* Fila B */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            minWidth: 28, height: 18, padding: "0 5px",
            border: "1px solid #e2e8f0", borderRadius: 4, flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900,
              color: clubB.color, textTransform: "uppercase",
            }}>{clubB.abbr}</span>
          </div>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 900, color: "#0f172a",
            lineHeight: 1.2, textTransform: "uppercase",
            flex: 1, minWidth: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{p.pairB}</span>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {parsed.map((s, i) => (
              <span key={i} style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 18, lineHeight: 1, color: "#0f172a",
                minWidth: 16, textAlign: "center",
              }}>{s.b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PartidoCard ───────────────────────────────────────────────────────────────

function PartidoCard({ partido: p, clubA, clubB, index }: {
  partido: Partido
  clubA: Club
  clubB: Club
  index: number
}) {
  const isFin    = p.estado === "finalizado"
  const ganadorA = p.ganador === "A"
  const ganadorB = p.ganador === "B"
  const parsed   = parseSets(p.resultado)
  const sedeColor = p.sede === clubA.nombre ? clubA.color : p.sede ? clubB.color : "#cbd5e1"

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #f1f5f9",
      borderRadius: 12, padding: "12px 14px",
      animation: "fadeUp 220ms cubic-bezier(0.23,1,0.32,1) both",
      animationDelay: `${Math.min(index, 8) * 35}ms`,
    }}>

      {/* Top row: estado ← → hora/lugar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: isFin ? 900 : 600,
          color: isFin ? "#64748b" : "#cbd5e1",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: isFin ? "#cbd5e1" : "#e2e8f0",
            display: "inline-block", flexShrink: 0,
          }} />
          {isFin ? "Finalizado" : "Pendiente"}
        </div>
        {(p.sede || p.horaInicio) && (() => {
          const diaStr = formatFecha(p.fecha)
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: "auto" }}>
              {diaStr && <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, lineHeight: 1, color: "#94a3b8" }}>calendar_today</span>}
              {(diaStr || p.horaInicio) && (
                <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#64748b" }}>
                  {[diaStr, p.horaInicio].filter(Boolean).join(" · ")}
                </span>
              )}
              {p.sede && <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, lineHeight: 1, color: sedeColor }}>location_on</span>}
              {p.sede && (
                <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: sedeColor }}>
                  {p.sede}{p.cancha ? ` C${p.cancha}` : ""}
                </span>
              )}
            </div>
          )
        })()}
      </div>

      {/* Fila A */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          minWidth: 28, height: 18, padding: "0 5px",
          border: "1px solid #e2e8f0", borderRadius: 4, flexShrink: 0,
          opacity: isFin && ganadorB ? 0.4 : 1,
        }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900,
            color: clubA.color, textTransform: "uppercase",
          }}>{clubA.abbr}</span>
        </div>
        <span style={{
          flex: 1, minWidth: 0,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 12, fontWeight: ganadorA ? 800 : 600,
          color: isFin && ganadorB ? "#94a3b8" : "#0f172a",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{p.pairA}</span>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, minWidth: 12 }}>
          {parsed.length > 0 ? parsed.map((s, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 16, lineHeight: 1,
              color: ganadorA ? "#0f172a" : ganadorB ? "#cbd5e1" : "#64748b",
              minWidth: 12, textAlign: "center",
            }}>{s.a}</span>
          )) : (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, color: "#e2e8f0", fontWeight: 700,
            }}>—</span>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: "#f1f5f9", margin: "0 0 8px 36px" }} />

      {/* Fila B */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          minWidth: 28, height: 18, padding: "0 5px",
          border: "1px solid #e2e8f0", borderRadius: 4, flexShrink: 0,
          opacity: isFin && ganadorA ? 0.4 : 1,
        }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900,
            color: clubB.color, textTransform: "uppercase",
          }}>{clubB.abbr}</span>
        </div>
        <span style={{
          flex: 1, minWidth: 0,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 12, fontWeight: ganadorB ? 800 : 600,
          color: isFin && ganadorA ? "#94a3b8" : "#0f172a",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{p.pairB}</span>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, minWidth: 12 }}>
          {parsed.length > 0 ? parsed.map((s, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 16, lineHeight: 1,
              color: ganadorB ? "#0f172a" : ganadorA ? "#cbd5e1" : "#64748b",
              minWidth: 12, textAlign: "center",
            }}>{s.b}</span>
          )) : (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, color: "#e2e8f0", fontWeight: 700,
            }}>—</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Vista principal ───────────────────────────────────────────────────────────

export function FixtureInterclubView({
  categorias,
  clubA,
  clubB,
}: {
  categorias: CategoriaInterclub[]
  clubA: Club
  clubB: Club
}) {
  const [selGenero, setSelGenero]     = useState<"masc" | "dam" | "mixto" | null>(null)
  const [selCat, setSelCat]           = useState<string | null>(null)
  const [showFinalizados, setShowFin] = useState(false)
  const [search, setSearch]           = useState("")
  const [kbHeight, setKbHeight]       = useState(0)
  const resultsRef = React.useRef<HTMLDivElement>(null)

  // Detecta altura del teclado virtual vía visualViewport
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return
    const vv = window.visualViewport!
    const update = () => {
      const kh = window.innerHeight - vv.offsetTop - vv.height
      setKbHeight(Math.max(0, kh))
    }
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [])

  const allPartidos = useMemo(() => categorias.flatMap(c => c.partidos), [categorias])
  const liveCount   = allPartidos.filter(p => p.estado === "en_vivo").length
  const pendCount   = allPartidos.filter(p => p.estado === "pendiente").length
  const finCount    = allPartidos.filter(p => p.estado === "finalizado").length

  const isSearching  = search.trim().length > 0
  const byGenero     = selGenero ? categorias.filter(c => c.genero === selGenero) : categorias
  const filteredCats = selCat ? byGenero.filter(c => c.id === selCat) : byGenero
  const extraPad     = kbHeight > 80 ? kbHeight + 24 : 100

  const GENERO_BADGE: Record<string, { bg: string; color: string; label: string }> = {
    masc:  { bg: "rgba(15,23,42,0.06)",    color: "#64748b", label: "Masc" },
    dam:   { bg: "rgba(244,63,94,0.08)",   color: "#be185d", label: "Dam"  },
    mixto: { bg: "rgba(99,102,241,0.08)",  color: "#4338ca", label: "Mix"  },
  }

  return (
    <div style={{ paddingBottom: extraPad, background: "#f8fafc", minHeight: "100vh" }}>

      {/* ── Sticky: chips (colapsados al buscar) + search ── */}
      <div style={{
        position: "sticky", top: 45, zIndex: 40,
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
      }}>
        {/* Chips género */}
        <div style={{
          display: "flex", gap: 6, overflowX: "auto",
          padding: "10px 16px 0", scrollbarWidth: "none",
        }}>
          <Chip active={!selGenero} onClick={() => { setSelGenero(null); setSelCat(null) }}>Todos</Chip>
          {(["masc", "dam", "mixto"] as const).map(g => {
            const hasCats = categorias.some(c => c.genero === g)
            if (!hasCats) return null
            const cfg = GENERO_BADGE[g]
            return (
              <Chip key={g} active={selGenero === g} onClick={() => { setSelGenero(g); setSelCat(null) }}>
                {cfg.label}
              </Chip>
            )
          })}
        </div>

        {/* Chips categoría (filtradas por género) */}
        <div style={{
          display: "flex", gap: 6, overflowX: "auto",
          padding: "6px 16px 0", scrollbarWidth: "none",
        }}>
          <Chip active={!selCat} onClick={() => setSelCat(null)}>Todas</Chip>
          {byGenero.map(c => (
            <Chip
              key={c.id}
              active={selCat === c.id}
              hasLive={c.estado === "en_vivo"}
              onClick={() => setSelCat(c.id)}
            >
              {c.nombre}
            </Chip>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: "8px 16px 10px", position: "relative" }}>
          <span style={{
            position: "absolute", left: 28, top: "50%", transform: "translateY(-50%)",
            fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1,
            color: "#94a3b8", pointerEvents: "none",
          }}>search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar jugador..."
            style={{
              width: "100%", height: 36,
              paddingLeft: 32, paddingRight: isSearching ? 36 : 12,
              border: `1.5px solid ${isSearching ? "#0f172a" : "#e2e8f0"}`,
              borderRadius: 10,
              background: isSearching ? "#fff" : "#f8fafc",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 16, fontWeight: 600, color: "#0f172a",
              outline: "none", boxSizing: "border-box",
              transition: "border-color 160ms cubic-bezier(0.23,1,0.32,1)",
            }}
          />
          {isSearching && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                padding: 2, color: "#94a3b8", display: "flex", alignItems: "center",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>close</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Status bar (solo sin búsqueda activa) ── */}
      {!isSearching && (
        <div style={{
          display: "flex", gap: 8, alignItems: "center",
          padding: "10px 16px 0", flexWrap: "wrap",
        }}>
          {liveCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#22c55e", animation: "pulseLive 2s infinite",
              }} />
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 700, color: "#15803d",
              }}>
                {liveCount} en cancha
              </span>
            </div>
          )}
          {liveCount > 0 && pendCount > 0 && <span style={{ color: "#cbd5e1", fontSize: 11 }}>·</span>}
          {pendCount > 0 && (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, color: "#64748b",
            }}>
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
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 11, color: "#64748b",
                  WebkitTapHighlightColor: "transparent",
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
      )}

      {/* ── Lista ── */}
      <div style={{ padding: "12px 16px 0" }}>
        {filteredCats.map(cat => {
          const sorted  = sortPartidos(cat.partidos)
          const matched = sorted.filter(p => matchSearch(p, search))
          const visible = matched.filter(p => isSearching || showFinalizados || p.estado !== "finalizado")
          if (visible.length === 0) return null

          return (
            <div key={cat.id} style={{ marginBottom: 24 }}>

              {/* Header de categoría */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {cat.estado === "en_vivo" && (
                  <div style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "#bcff00", flexShrink: 0,
                    boxShadow: "0 0 6px rgba(188,255,0,0.6)",
                  }} />
                )}
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 10, fontWeight: 900,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  color: "#0f172a",
                }}>{cat.nombre}</span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 9, fontWeight: 900, color: "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {clubA.abbr}{" "}
                  <span style={{ color: "#0f172a" }}>{cat.ptsA}–{cat.ptsB}</span>
                  {" "}{clubB.abbr}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {visible.map((p, i) =>
                  p.estado === "en_vivo" ? (
                    <LiveCard key={p.id} partido={p} clubA={clubA} clubB={clubB} />
                  ) : (
                    <PartidoCard key={p.id} index={i} partido={p} clubA={clubA} clubB={clubB} />
                  )
                )}
              </div>
            </div>
          )
        })}

        {/* Sin resultados de búsqueda */}
        {isSearching && filteredCats.every(cat =>
          sortPartidos(cat.partidos).filter(p => matchSearch(p, search)).length === 0
        ) && (
          <div style={{ textAlign: "center", padding: "48px 0 32px" }}>
            <span style={{
              fontFamily: "'Material Symbols Outlined'", fontSize: 32,
              color: "#e2e8f0", display: "block", marginBottom: 10,
            }}>person_search</span>
            <p style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, color: "#94a3b8", fontWeight: 600, margin: 0,
            }}>No se encontró &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseLive {
          0%,100% { opacity:1; transform:scale(1); box-shadow:0 0 0 2px rgba(188,255,0,0.3); }
          50%     { opacity:.7; transform:scale(1.15); box-shadow:0 0 0 6px rgba(188,255,0,0.1); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
