"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"

export type Partido = {
  id: string
  pairA: string
  pairB: string
  resultado: string | null
  ganador: "A" | "B" | null
  estado: "pendiente" | "en_vivo" | "finalizado"
}

export type CategoriaInterclub = {
  id: string
  nombre: string
  estado: "pendiente" | "en_vivo" | "finalizado"
  ptsA: number
  ptsB: number
  partidos: Partido[]
}

export type Club = { nombre: string; color: string; abbr: string; logoUrl?: string }

type Filtro = "todas" | "en_vivo" | "finalizado" | "pendiente"

type Props = {
  categorias: CategoriaInterclub[]
  clubA: Club
  clubB: Club
  torneoId: string
}

// ─────────────────────────────────────────
// Helpers de color
// ─────────────────────────────────────────
function accentStyle(liderA: boolean, liderB: boolean, colorA: string, colorB: string) {
  if (liderA) return { background: colorA }
  if (liderB) return { background: colorB }
  return { background: `linear-gradient(to right, ${colorA} 50%, ${colorB} 50%)` }
}

function progressColor(isLive: boolean, liderA: boolean, liderB: boolean, colorA: string, colorB: string) {
  if (isLive) return "#BCFF00"
  if (liderA) return colorA
  if (liderB) return colorB
  return "#cbd5e1"
}

// ─────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────
export function CategoriasInterclub({ categorias, clubA, clubB, torneoId }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todas")

  const filtradas =
    filtro === "todas" ? categorias : categorias.filter((c) => c.estado === filtro)

  const activasFiltradas  = filtradas.filter((c) => c.estado !== "pendiente")
  const pendientesFiltradas = filtradas.filter((c) => c.estado === "pendiente")

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todas",      label: "Todas" },
    { key: "en_vivo",    label: "En juego" },
    { key: "finalizado", label: "Fin" },
    { key: "pendiente",  label: "Pendientes" },
  ]

  return (
    <div style={{ background: "#f8fafc", padding: "24px 18px 40px" }}>

      {/* ── Título ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 24, textTransform: "uppercase",
          letterSpacing: "0.05em", fontWeight: 400, margin: 0,
          color: "#0f172a",
        }}>
          Categorías
        </h2>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>

      {/* ── Filtros ── */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20,
        overflowX: "auto", paddingBottom: 4,
        msOverflowStyle: "none", scrollbarWidth: "none",
      }}>
        {filtros.map((f) => {
          const count = f.key === "todas"
            ? categorias.length
            : categorias.filter((c) => c.estado === f.key).length
          const isActive = filtro === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              style={{
                padding: "5px 12px", borderRadius: 4,
                border: isActive ? "none" : "1px solid #e2e8f0",
                cursor: "pointer", flexShrink: 0,
                background: isActive ? "#0f172a" : "#ffffff",
                color: isActive ? "#ffffff" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10, fontWeight: 900,
                textTransform: "uppercase", letterSpacing: "0.08em",
                WebkitTapHighlightColor: "transparent",
                transition: "background 150ms, color 150ms",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {f.label}
              <span style={{
                background: isActive ? "rgba(255,255,255,0.15)" : "#f1f5f9",
                borderRadius: 2, padding: "0 4px",
                fontSize: 9, lineHeight: "16px",
                color: isActive ? "#fff" : "#94a3b8",
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Sin resultados ── */}
      {filtradas.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 700,
            textTransform: "uppercase", color: "#94a3b8",
          }}>
            Sin categorías en este estado
          </span>
        </div>
      )}

      {/* ── Cards activas (live / finalizadas) — full width ── */}
      {activasFiltradas.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activasFiltradas.map((cat, i) => {
            const isLive  = cat.estado === "en_vivo"
            const isFin   = cat.estado === "finalizado"
            const liderA  = cat.ptsA > cat.ptsB
            const liderB  = cat.ptsB > cat.ptsA
            const empate  = !liderA && !liderB
            const jugados = cat.partidos.filter((p) => p.estado === "finalizado").length
            const pct     = cat.partidos.length > 0 ? (jugados / cat.partidos.length) * 100 : 0
            const accent  = accentStyle(liderA, liderB, clubA.color, clubB.color)
            const progColor = progressColor(isLive, liderA, liderB, clubA.color, clubB.color)

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.055, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              >
                <Link
                  href={`/torneos/${torneoId}/interclub/${cat.id}` as never}
                  style={{
                    display: "block", textDecoration: "none",
                    background: "#ffffff",
                    borderRadius: 12,
                    border: isLive ? "1.5px solid rgba(188,255,0,0.5)" : "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: isLive
                      ? "0 4px 20px rgba(188,255,0,0.12), 0 1px 4px rgba(0,0,0,0.04)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                    WebkitTapHighlightColor: "transparent",
                    transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms",
                  }}
                >
                  {/* Top accent strip — 5px, leader's color */}
                  <div style={{ height: 5, ...accent }} />

                  <div style={{ padding: "14px 16px 16px" }}>

                    {/* Row 1: nombre + badge */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <span style={{
                        fontFamily: "var(--font-anton), Anton, sans-serif",
                        fontSize: 18, fontWeight: 400,
                        color: "#0f172a", textTransform: "uppercase",
                        letterSpacing: "0.03em", lineHeight: 1,
                      }}>
                        {cat.nombre}
                      </span>

                      {isLive && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: "#BCFF00", color: "#000",
                          padding: "3px 8px", borderRadius: 3,
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 8, fontWeight: 900,
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          flexShrink: 0,
                        }}>
                          <span className="live-dot" style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: "#000", flexShrink: 0,
                            display: "inline-block",
                          }} />
                          En vivo
                        </span>
                      )}
                      {isFin && (
                        <span style={{
                          background: "#f1f5f9", color: "#64748b",
                          padding: "3px 8px", borderRadius: 3,
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 8, fontWeight: 900,
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          flexShrink: 0,
                        }}>
                          Finalizado
                        </span>
                      )}
                    </div>

                    {/* Row 2: score boxes */}
                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 10,
                      marginBottom: 14,
                    }}>
                      {/* Club A */}
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        background: liderA ? clubA.color : "#f8fafc",
                        borderRadius: 10, padding: "10px 20px",
                        flex: 1, border: liderA ? "none" : "1px solid #f1f5f9",
                        transition: "background 200ms",
                      }}>
                        <span style={{
                          fontFamily: "var(--font-anton), Anton, sans-serif",
                          fontSize: 40, lineHeight: 1, fontWeight: 400,
                          color: liderA ? "#ffffff" : "#d1d9e0",
                          letterSpacing: "-0.02em",
                        }}>
                          {cat.ptsA}
                        </span>
                        <span style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 9, fontWeight: 900,
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          color: liderA ? "rgba(255,255,255,0.55)" : "#b8c4d0",
                          marginTop: 4,
                        }}>
                          {clubA.abbr}
                        </span>
                      </div>

                      {/* Separador */}
                      <span style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 16, fontWeight: 300,
                        color: "#d1d5db", flexShrink: 0,
                        lineHeight: 1,
                      }}>
                        —
                      </span>

                      {/* Club B */}
                      <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        background: liderB ? clubB.color : "#f8fafc",
                        borderRadius: 10, padding: "10px 20px",
                        flex: 1, border: liderB ? "none" : "1px solid #f1f5f9",
                        transition: "background 200ms",
                      }}>
                        <span style={{
                          fontFamily: "var(--font-anton), Anton, sans-serif",
                          fontSize: 40, lineHeight: 1, fontWeight: 400,
                          color: liderB ? "#ffffff" : "#d1d9e0",
                          letterSpacing: "-0.02em",
                        }}>
                          {cat.ptsB}
                        </span>
                        <span style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 9, fontWeight: 900,
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          color: liderB ? "rgba(255,255,255,0.55)" : "#b8c4d0",
                          marginTop: 4,
                        }}>
                          {clubB.abbr}
                        </span>
                      </div>
                    </div>

                    {/* Row 3: progress + empate label + fraction + chevron */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Mini progress bar */}
                      <div style={{
                        flex: 1, height: 4, background: "#f1f5f9",
                        borderRadius: 4, overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${pct}%`, height: "100%",
                          background: progColor,
                          borderRadius: 4,
                          transition: "width 400ms cubic-bezier(0.23,1,0.32,1)",
                        }} />
                      </div>

                      {empate && jugados > 0 && (
                        <span style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 8, fontWeight: 900, color: "#94a3b8",
                          textTransform: "uppercase", letterSpacing: "0.08em",
                          background: "#f1f5f9", borderRadius: 3,
                          padding: "2px 5px", flexShrink: 0,
                        }}>
                          Empate
                        </span>
                      )}

                      <span style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 9, fontWeight: 700, color: "#94a3b8",
                        flexShrink: 0,
                      }}>
                        {jugados}/{cat.partidos.length}
                      </span>

                      <span style={{
                        fontFamily: "'Material Symbols Outlined'",
                        fontSize: 18, lineHeight: 1, flexShrink: 0,
                        color: isLive ? "#0f172a" : "#d1d5db",
                      }}>
                        chevron_right
                      </span>
                    </div>

                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Sección pendientes ── */}
      {pendientesFiltradas.length > 0 && (
        <>
          {activasFiltradas.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0 12px" }}>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 8, fontWeight: 900, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.12em", flexShrink: 0,
              }}>
                Pendientes
              </span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {pendientesFiltradas.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: (activasFiltradas.length * 0.055) + i * 0.04,
                  duration: 0.24,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                <Link
                  href={`/torneos/${torneoId}/interclub/${cat.id}` as never}
                  style={{
                    display: "block", textDecoration: "none",
                    background: "#ffffff", borderRadius: 12,
                    border: "1px solid #e2e8f0", overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    WebkitTapHighlightColor: "transparent",
                    transition: "transform 160ms cubic-bezier(0.23,1,0.32,1)",
                    height: "100%",
                  }}
                >
                  {/* Dual-color strip — balanced, both clubs */}
                  <div style={{ height: 4, display: "flex" }}>
                    <div style={{ flex: 1, background: clubA.color, opacity: 0.35 }} />
                    <div style={{ flex: 1, background: clubB.color, opacity: 0.45 }} />
                  </div>

                  <div style={{ padding: "12px 12px 14px" }}>
                    {/* Nombre */}
                    <div style={{
                      fontFamily: "var(--font-anton), Anton, sans-serif",
                      fontSize: 15, fontWeight: 400,
                      color: "#0f172a", textTransform: "uppercase",
                      letterSpacing: "0.02em", lineHeight: 1.1,
                      marginBottom: 10,
                    }}>
                      {cat.nombre}
                    </div>

                    {/* Club pills */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                      <span style={{
                        background: clubA.color,
                        color: "#fff",
                        padding: "2px 7px", borderRadius: 3,
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 8, fontWeight: 900,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        opacity: 0.8,
                      }}>
                        {clubA.abbr}
                      </span>
                      <span style={{
                        background: clubB.color,
                        color: "#fff",
                        padding: "2px 7px", borderRadius: 3,
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 8, fontWeight: 900,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        opacity: 0.8,
                      }}>
                        {clubB.abbr}
                      </span>
                    </div>

                    {/* Footer: partidos + chevron */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 9, fontWeight: 700, color: "#b0bec5",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        {cat.partidos.length} partidos
                      </span>
                      <span style={{
                        fontFamily: "'Material Symbols Outlined'",
                        fontSize: 15, lineHeight: 1, color: "#d1d5db",
                      }}>
                        chevron_right
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
