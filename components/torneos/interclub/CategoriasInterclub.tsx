"use client"

import Link from "next/link"
import { useState } from "react"

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

export function CategoriasInterclub({ categorias, clubA, clubB, torneoId }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todas")

  const filtradas =
    filtro === "todas" ? categorias : categorias.filter((c) => c.estado === filtro)

  // Separar activas (live/fin) de pendientes para layout distinto
  const activasFiltradas = filtradas.filter((c) => c.estado !== "pendiente")
  const pendientesFiltradas = filtradas.filter((c) => c.estado === "pendiente")

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "en_vivo", label: "En juego" },
    { key: "finalizado", label: "Fin" },
    { key: "pendiente", label: "Pendientes" },
  ]

  return (
    <div style={{ background: "#f8fafc", padding: "24px 18px 32px" }}>
      {/* Header */}
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

      {/* Filtros */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 16,
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

      {/* Sin resultados */}
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

      {/* ── Cards activas (live/finalizadas) — full width ── */}
      {activasFiltradas.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activasFiltradas.map((cat) => {
            const isLive = cat.estado === "en_vivo"
            const isFin = cat.estado === "finalizado"
            const jugados = cat.partidos.filter((p) => p.estado === "finalizado").length
            const liderA = cat.ptsA > cat.ptsB
            const liderB = cat.ptsB > cat.ptsA
            const empate = cat.ptsA === cat.ptsB && jugados > 0

            return (
              <Link
                key={cat.id}
                href={`/torneos/${torneoId}/interclub/${cat.id}` as never}
                style={{
                  display: "block", textDecoration: "none",
                  background: "#ffffff", borderRadius: 10,
                  border: isLive ? "2px solid #BCFF00" : "1px solid #e2e8f0",
                  padding: isLive ? "15px 16px" : "16px",
                  WebkitTapHighlightColor: "transparent",
                  boxShadow: isLive ? "0 2px 12px rgba(188,255,0,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "transform 160ms cubic-bezier(0.23,1,0.32,1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Nombre + badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{
                        fontFamily: "var(--font-anton), Anton, sans-serif",
                        fontSize: 17, fontWeight: 400,
                        color: "#0f172a", textTransform: "uppercase",
                        letterSpacing: "0.02em",
                      }}>
                        {cat.nombre}
                      </span>
                      {isLive && (
                        <span style={{
                          background: "#BCFF00", color: "#000",
                          padding: "2px 7px", borderRadius: 2,
                          fontSize: 8, fontWeight: 900,
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          textTransform: "uppercase", letterSpacing: "0.1em",
                          display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#000", flexShrink: 0 }} />
                          Vivo
                        </span>
                      )}
                      {isFin && (
                        <span style={{
                          background: "#f1f5f9", color: "#64748b",
                          padding: "2px 7px", borderRadius: 2,
                          fontSize: 8, fontWeight: 900,
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0,
                        }}>Finalizado</span>
                      )}
                    </div>

                    {/* Score chips */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Club A */}
                      <div style={{
                        display: "inline-flex", alignItems: "baseline", gap: 5,
                        background: liderA ? clubA.color : "#f1f5f9",
                        borderRadius: 6, padding: "5px 10px",
                      }}>
                        <span style={{
                          fontFamily: "var(--font-anton), Anton, sans-serif",
                          fontSize: 28, lineHeight: 1,
                          color: liderA ? "#ffffff" : "#cbd5e1",
                        }}>
                          {cat.ptsA}
                        </span>
                        <span style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 8, fontWeight: 900,
                          color: liderA ? "rgba(255,255,255,0.6)" : "#b8c4d0",
                          textTransform: "uppercase", letterSpacing: "0.08em",
                        }}>
                          {clubA.abbr}
                        </span>
                      </div>

                      <span style={{ color: "#e2e8f0", fontSize: 14 }}>—</span>

                      {/* Club B */}
                      <div style={{
                        display: "inline-flex", alignItems: "baseline", gap: 5,
                        background: liderB ? clubB.color : "#f1f5f9",
                        borderRadius: 6, padding: "5px 10px",
                      }}>
                        <span style={{
                          fontFamily: "var(--font-anton), Anton, sans-serif",
                          fontSize: 28, lineHeight: 1,
                          color: liderB ? "#ffffff" : "#cbd5e1",
                        }}>
                          {cat.ptsB}
                        </span>
                        <span style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 8, fontWeight: 900,
                          color: liderB ? "rgba(255,255,255,0.6)" : "#b8c4d0",
                          textTransform: "uppercase", letterSpacing: "0.08em",
                        }}>
                          {clubB.abbr}
                        </span>
                      </div>

                      {empate && (
                        <span style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 8, fontWeight: 900, color: "#64748b",
                          textTransform: "uppercase", letterSpacing: "0.08em",
                          background: "#f1f5f9", borderRadius: 4, padding: "3px 6px",
                        }}>
                          Empate
                        </span>
                      )}

                      <span style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 9, fontWeight: 700, color: "#cbd5e1",
                        marginLeft: "auto",
                      }}>
                        {jugados}/{cat.partidos.length}
                      </span>
                    </div>
                  </div>

                  <span style={{
                    fontFamily: "'Material Symbols Outlined'",
                    fontSize: 20, lineHeight: 1, flexShrink: 0,
                    color: isLive ? "#0f172a" : "#d1d5db",
                  }}>
                    chevron_right
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* ── Cards pendientes — grilla 2 columnas ── */}
      {pendientesFiltradas.length > 0 && (
        <>
          {activasFiltradas.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 10px" }}>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 8, fontWeight: 900, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.12em",
                flexShrink: 0,
              }}>
                Pendientes
              </span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {pendientesFiltradas.map((cat) => (
              <Link
                key={cat.id}
                href={`/torneos/${torneoId}/interclub/${cat.id}` as never}
                style={{
                  display: "block", textDecoration: "none",
                  background: "#ffffff", borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  padding: "14px 12px",
                  WebkitTapHighlightColor: "transparent",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  transition: "transform 160ms cubic-bezier(0.23,1,0.32,1)",
                }}
              >
                {/* Nombre categoría */}
                <div style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 15, fontWeight: 400,
                  color: "#0f172a", textTransform: "uppercase",
                  letterSpacing: "0.02em", marginBottom: 10,
                  lineHeight: 1.1,
                }}>
                  {cat.nombre}
                </div>

                {/* Info fila */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 8, fontWeight: 900, color: "#94a3b8",
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    background: "#f8fafc", border: "1px solid #e2e8f0",
                    borderRadius: 3, padding: "2px 6px",
                  }}>
                    Pendiente
                  </span>
                  <span style={{
                    fontFamily: "'Material Symbols Outlined'",
                    fontSize: 16, lineHeight: 1, color: "#d1d5db",
                  }}>
                    chevron_right
                  </span>
                </div>

                {/* Conteo partidos */}
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 9, fontWeight: 700, color: "#cbd5e1",
                  marginTop: 6,
                }}>
                  {cat.partidos.length} partidos
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
