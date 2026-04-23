"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface Categoria { id: string; nombre: string; tipo: string; tcId: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Grupo { id: string; nombre: string; torneo_categoria_id: string; grupo_parejas: any[] }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Partido { id: string; pareja1_id: string; pareja2_id: string; resultado: any; estado: string; categoria_id: string }

function formatPareja(pareja: { jugador1: { nombre: string; apellido: string } | null; jugador2: { nombre: string; apellido: string } | null } | null) {
  if (!pareja) return "—"
  const j1 = pareja.jugador1 ? `${pareja.jugador1.apellido}` : ""
  const j2 = pareja.jugador2 ? pareja.jugador2.apellido : ""
  return j1 && j2 ? `${j1} / ${j2}` : j1 || j2 || "—"
}

function calcStats(parejaId: string, partidos: Partido[]) {
  const propios = partidos.filter(p => p.pareja1_id === parejaId || p.pareja2_id === parejaId)
  let mp = 0, w = 0, l = 0, gf = 0, gc = 0
  propios.forEach(p => {
    if (!p.resultado || typeof p.resultado.sets_pareja1 !== "number" || typeof p.resultado.sets_pareja2 !== "number") return
    mp++
    const soy1 = p.pareja1_id === parejaId
    const s1 = p.resultado.sets_pareja1, s2 = p.resultado.sets_pareja2
    if (soy1) { gf += s1; gc += s2; if (s1 > s2) w++; else l++ }
    else       { gf += s2; gc += s1; if (s2 > s1) w++; else l++ }
  })
  return { mp, w, l, sd: gf - gc, pts: w * 3 }
}

export function TablaView({ categorias, grupos, partidos }: {
  categorias: Categoria[]
  grupos: Grupo[]
  partidos: Partido[]
  initialCatId?: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selCatId = searchParams.get("cat")

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

  const activeCats = selCatId ? categorias.filter(c => c.id === selCatId) : categorias

  return (
    <div style={{ background: "#f8fafc" }}>

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
          <CatChip active={!selCatId} onClick={() => selectCat(null)}>Todas</CatChip>
          {categorias.map(c => (
            <CatChip key={c.id} active={selCatId === c.id} onClick={() => selectCat(c.id)}>
              {c.nombre}
            </CatChip>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {activeCats.map(cat => {
          const catGrupos = grupos.filter(g => g.torneo_categoria_id === cat.tcId)
          return (
            <div key={cat.id} style={{ marginBottom: 32 }}>
              <CatHeader cat={cat} />
              {catGrupos.length === 0 ? (
                <div style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 16, padding: "24px", textAlign: "center",
                }}>
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 28, color: "#e2e8f0", display: "block" }}>
                    hourglass_empty
                  </span>
                  <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "var(--font-space-grotesk), sans-serif", margin: "8px 0 0" }}>
                    Sin grupos generados aún
                  </p>
                </div>
              ) : (
                catGrupos.map((grupo, i) => (
                  <GrupoTable
                    key={grupo.id}
                    grupo={grupo}
                    partidos={partidos.filter(p => p.categoria_id === cat.id)}
                    showClassify={i === 0}
                  />
                ))
              )}
            </div>
          )
        })}

        {activeCats.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, display: "block" }}>leaderboard</span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, marginTop: 8 }}>
              Sin datos de tabla todavía
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Chips ─────────────────────────────────────────────────────────────────────

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

// ── Cat Header ────────────────────────────────────────────────────────────────

function CatHeader({ cat }: { cat: Categoria }) {
  const TAG: Record<string, { label: string; color: string; bg: string }> = {
    caballeros: { label: "MASC", color: "#1d4ed8", bg: "#dbeafe" },
    damas:      { label: "FEM",  color: "#9333ea", bg: "#f3e8ff" },
    especial:   { label: "ESP",  color: "#d97706", bg: "#fef3c7" },
  }
  const tag = TAG[cat.tipo] ?? { label: "CAT", color: "#64748b", bg: "#f1f5f9" }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <h2 style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 22, fontWeight: 400, color: "#0f172a",
        textTransform: "uppercase", letterSpacing: "0.02em", margin: 0,
      }}>
        {cat.nombre}
      </h2>
      <span style={{
        background: tag.bg, color: tag.color,
        padding: "2px 8px", borderRadius: 6,
        fontSize: 9, fontWeight: 900,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        letterSpacing: "0.06em",
      }}>
        {tag.label}
      </span>
    </div>
  )
}

// ── Grupo Table ───────────────────────────────────────────────────────────────

function GrupoTable({ grupo, partidos, showClassify }: { grupo: Grupo; partidos: Partido[]; showClassify: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (grupo.grupo_parejas ?? []).map((gp: any) => ({
    pareja: gp.parejas,
    ...calcStats(gp.parejas?.id, partidos),
  })).sort((a, b) => b.pts - a.pts || b.w - a.w || b.sd - a.sd)

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Group header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 8, padding: "0 2px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 16, background: "#0f172a", borderRadius: 2 }} />
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, fontWeight: 900, color: "#0f172a",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Grupo {grupo.nombre}
          </span>
        </div>
        {showClassify && (
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            Top 2 clasifican
          </span>
        )}
      </div>

      {/* Table card */}
      <div style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: "1px solid #e2e8f0",
      }}>
        {/* Column headers */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "8px 14px 8px 42px",
          background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
        }}>
          <span style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 0, alignItems: "center" }}>
            {["PJ", "G", "P", "DS", "PTS"].map(h => (
              <span key={h} style={{
                width: h === "PTS" ? 40 : 28,
                textAlign: "center",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 8, fontWeight: 900, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                {h}
              </span>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "var(--font-space-grotesk), sans-serif" }}>
              Sin parejas asignadas
            </span>
          </div>
        ) : (
          rows.map((r, i) => <TableRow key={i} index={i} r={r} total={rows.length} />)
        )}

      </div>
    </div>
  )
}

// ── Table Row ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TableRow({ r, index, total }: { r: any; index: number; total: number }) {
  const isTop    = index < 2
  const isLast   = index === total - 1
  const posColors = ["#bcff00", "#94a3b8", "#cbd5e1"]
  const posColor  = posColors[index] ?? "#e2e8f0"
  const textOnPos = index === 0 ? "#000" : "#fff"

  return (
    <div data-pressable="true" style={{
      display: "flex", alignItems: "center",
      padding: "11px 14px",
      borderBottom: isLast ? "none" : "1px solid #f1f5f9",
      background: isTop ? `linear-gradient(90deg, ${posColor}10 0%, transparent 50%)` : "#fff",
      position: "relative",
    }}>
      {/* Left accent bar for top 2 */}
      {isTop && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: posColor, borderRadius: "0 0 0 0",
        }} />
      )}

      {/* Position */}
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: isTop ? posColor : "#f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginRight: 10, flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 900,
          color: isTop ? textOnPos : "#94a3b8",
          lineHeight: 1,
        }}>
          {index + 1}
        </span>
      </div>

      {/* Name */}
      <span style={{
        flex: 1,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 12, fontWeight: isTop ? 800 : 700,
        color: isTop ? "#0f172a" : "#334155",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        minWidth: 0,
      }}>
        {formatPareja(r.pareja)}
      </span>

      {/* Stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
        {[
          { val: r.mp,                   color: "#64748b" },
          { val: r.w,                    color: "#16a34a" },
          { val: r.l,                    color: r.l > 0 ? "#ef4444" : "#64748b" },
          { val: r.sd > 0 ? `+${r.sd}` : r.sd, color: r.sd > 0 ? "#16a34a" : r.sd < 0 ? "#ef4444" : "#64748b" },
        ].map((s, i) => (
          <span key={i} style={{
            width: 28, textAlign: "center",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, fontWeight: 700, color: s.color,
          }}>
            {s.val}
          </span>
        ))}
        {/* PTS — destacado */}
        <div style={{
          width: 40, textAlign: "center",
          background: isTop ? posColor : "#f1f5f9",
          borderRadius: 8, padding: "3px 0", marginLeft: 2,
        }}>
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 15, fontWeight: 400,
            color: isTop ? textOnPos : "#64748b",
            lineHeight: 1,
          }}>
            {r.pts}
          </span>
        </div>
      </div>
    </div>
  )
}
