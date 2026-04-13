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

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "en_vivo", label: "En juego" },
    { key: "finalizado", label: "Fin" },
    { key: "pendiente", label: "Pendientes" },
  ]

  return (
    <div style={{ background: "#0d0d0d", padding: "24px 18px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 24, textTransform: "uppercase",
          letterSpacing: "0.05em", fontWeight: 400, margin: 0,
          color: "#ffffff",
        }}>
          Categorías
        </h2>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Filtros */}
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
                padding: "5px 12px", borderRadius: 4, border: "none",
                cursor: "pointer", flexShrink: 0,
                background: isActive ? "#BCFF00" : "rgba(255,255,255,0.06)",
                color: isActive ? "#000000" : "rgba(255,255,255,0.45)",
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
                background: isActive ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.08)",
                borderRadius: 2, padding: "0 4px",
                fontSize: 9, lineHeight: "16px",
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtradas.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 12, fontWeight: 700,
              textTransform: "uppercase", color: "rgba(255,255,255,0.2)",
            }}>
              Sin categorías en este estado
            </span>
          </div>
        )}

        {filtradas.map((cat, i) => {
          const isLive = cat.estado === "en_vivo"
          const isFin = cat.estado === "finalizado"
          const jugados = cat.partidos.filter((p) => p.estado === "finalizado").length
          const liderA = cat.ptsA > cat.ptsB
          const liderB = cat.ptsB > cat.ptsA

          return (
            <Link
              key={cat.id}
              href={`/torneos/${torneoId}/interclub/${cat.id}` as never}
              style={{
                display: "block", textDecoration: "none",
                background: isLive
                  ? "rgba(188,255,0,0.05)"
                  : "rgba(255,255,255,0.03)",
                borderRadius: 10,
                border: isLive
                  ? "1px solid rgba(188,255,0,0.2)"
                  : "1px solid rgba(255,255,255,0.06)",
                padding: "16px 16px",
                WebkitTapHighlightColor: "transparent",
                transform: "scale(1)",
                transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
                animationDelay: `${i * 40}ms`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                {/* Info izquierda */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Nombre + badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{
                      fontFamily: "var(--font-anton), Anton, sans-serif",
                      fontSize: 17, fontWeight: 400,
                      color: "#ffffff", textTransform: "uppercase",
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
                        display: "flex", alignItems: "center", gap: 4,
                        flexShrink: 0,
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: "#000", flexShrink: 0,
                        }} />
                        Vivo
                      </span>
                    )}

                    {isFin && (
                      <span style={{
                        background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)",
                        padding: "2px 7px", borderRadius: 2,
                        fontSize: 8, fontWeight: 900,
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        flexShrink: 0,
                      }}>
                        Fin
                      </span>
                    )}

                    {cat.estado === "pendiente" && (
                      <span style={{
                        background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.2)",
                        padding: "2px 7px", borderRadius: 2,
                        fontSize: 8, fontWeight: 900,
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        textTransform: "uppercase", letterSpacing: "0.1em",
                        flexShrink: 0,
                      }}>
                        Pendiente
                      </span>
                    )}
                  </div>

                  {/* Marcador por categoría */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Club A */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{
                        fontFamily: "var(--font-anton), Anton, sans-serif",
                        fontSize: 32, fontWeight: 400, lineHeight: 1,
                        color: liderA ? "#BCFF00" : "rgba(255,255,255,0.25)",
                      }}>
                        {cat.ptsA}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 8, fontWeight: 900,
                        color: "rgba(255,255,255,0.3)",
                        textTransform: "uppercase", letterSpacing: "0.08em",
                      }}>
                        {clubA.abbr}
                      </span>
                    </div>

                    <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 16 }}>—</span>

                    {/* Club B */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{
                        fontFamily: "var(--font-anton), Anton, sans-serif",
                        fontSize: 32, fontWeight: 400, lineHeight: 1,
                        color: liderB ? "#BCFF00" : "rgba(255,255,255,0.25)",
                      }}>
                        {cat.ptsB}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 8, fontWeight: 900,
                        color: "rgba(255,255,255,0.3)",
                        textTransform: "uppercase", letterSpacing: "0.08em",
                      }}>
                        {clubB.abbr}
                      </span>
                    </div>

                    <span style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 9, fontWeight: 700,
                      color: "rgba(255,255,255,0.2)", marginLeft: 4,
                    }}>
                      {jugados}/{cat.partidos.length} partidos
                    </span>
                  </div>
                </div>

                {/* Flecha */}
                <span style={{
                  fontFamily: "'Material Symbols Outlined'",
                  fontSize: 20, lineHeight: 1, flexShrink: 0,
                  color: isLive ? "#BCFF00" : "rgba(255,255,255,0.2)",
                }}>
                  chevron_right
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
