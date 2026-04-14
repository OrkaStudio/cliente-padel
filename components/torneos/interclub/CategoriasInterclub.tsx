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
  horaInicio?: string  // "14:30"
  cancha?: string      // "Cancha 1"
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

const ACCENT_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#f43f5e", "#06b6d4"]

const ORDINAL_MAP: Record<string, number> = {
  PRIMER: 1, PRIMERA: 1,
  SEGUND: 2, SEGUNDA: 2,
  TERCER: 3, TERCERA: 3,
  CUART:  4, CUARTA:  4,
  QUINT:  5, QUINTA:  5,
  SEXT:   6, SEXTA:   6,
  SEPTIM: 7, SÉPTIM:  7, SEPTIMA: 7, SÉPTIMA: 7,
  OCTAV:  8, OCTAVA:  8,
  NOVEN:  9, NOVENA:  9,
  DECIM: 10, DÉCIM:  10, DECIMA: 10, DÉCIMA: 10,
}

function getSortKey(nombre: string): number {
  const n = nombre.toUpperCase()
  const isDamas = n.includes("DAMA")
  const suffix = isDamas ? 1 : 0

  // Categorías especiales al final
  if (n.includes("SUMA") || n.includes("MIXTO")) return 900 + suffix

  // Nombres ordinales (PRIMERA, SEGUNDA, etc.)
  for (const [word, num] of Object.entries(ORDINAL_MAP)) {
    if (n.includes(word)) return num * 10 + suffix
  }

  // Numérico abreviado (2DA, 4TA, 4+5, etc.)
  const numMatch = n.match(/\d+/)
  if (numMatch) return parseInt(numMatch[0]) * 10 + suffix

  return 990
}

function sortCategorias(cats: CategoriaInterclub[]): CategoriaInterclub[] {
  return [...cats].sort((a, b) => getSortKey(a.nombre) - getSortKey(b.nombre))
}

// Ghost text: MASC para caballeros, FEM para damas
function getGhostText(nombre: string): string {
  return nombre.toUpperCase().includes("DAMA") ? "FEM" : "MASC"
}

// Resultado del matchup de una categoría (para saber ganador)
function getResultLabel(cat: CategoriaInterclub, clubA: Club, clubB: Club): string | null {
  if (cat.estado !== "finalizado") return null
  if (cat.ptsA > cat.ptsB) return `Ganó ${clubA.abbr}`
  if (cat.ptsB > cat.ptsA) return `Ganó ${clubB.abbr}`
  return "Empate"
}

export function CategoriasInterclub({ categorias, clubA, clubB, torneoId }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todas")

  const sorted = sortCategorias(categorias)
  const accentMap = new Map(sorted.map((c, i) => [c.id, ACCENT_COLORS[i % ACCENT_COLORS.length]]))

  // Primera y última del sorted son featured (full width, dark)
  const featuredIds = new Set([sorted[0]?.id, sorted[sorted.length - 1]?.id].filter(Boolean))

  const filtradas =
    filtro === "todas" ? sorted : sorted.filter((c) => c.estado === filtro)

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "en_vivo", label: "En juego" },
    { key: "finalizado", label: "Fin." },
    { key: "pendiente", label: "Pendientes" },
  ]

  return (
    <div style={{ background: "#f8fafc", padding: "20px 14px 48px" }}>

      {/* Filtros */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 18,
        overflowX: "auto", paddingBottom: 2,
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
                padding: "6px 14px", borderRadius: 100,
                border: isActive ? "none" : "1.5px solid #e2e8f0",
                cursor: "pointer", flexShrink: 0,
                background: isActive ? "#0f172a" : "#ffffff",
                color: isActive ? "#ffffff" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 700,
                letterSpacing: "0.02em",
                WebkitTapHighlightColor: "transparent",
                transition: "all 150ms ease",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              {f.label}
              <span style={{
                background: isActive ? "rgba(255,255,255,0.15)" : "#f1f5f9",
                borderRadius: 100, padding: "1px 6px",
                fontSize: 9, lineHeight: "16px",
                color: isActive ? "#fff" : "#94a3b8",
                fontWeight: 700,
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sin resultados */}
      {filtradas.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 700,
            textTransform: "uppercase", color: "#94a3b8",
            letterSpacing: "0.08em",
          }}>
            Sin categorías en este estado
          </span>
        </div>
      )}

      {/* Grid — 2 columnas, featured full-width */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {filtradas.map((cat, i) => {
          const isFeatured = featuredIds.has(cat.id)
          const accent     = accentMap.get(cat.id) ?? "#3b82f6"
          const ghost      = getGhostText(cat.nombre)
          const resultLabel = getResultLabel(cat, clubA, clubB)
          const statusText  = resultLabel
            ? resultLabel
            : cat.estado === "pendiente"
            ? `${cat.partidos.length} partidos`
            : `${cat.partidos.filter(p => p.estado === "en_vivo").length} en cancha`

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
              style={{ gridColumn: isFeatured ? "1 / -1" : undefined }}
            >
              <Link
                href={`/torneos/${torneoId}/interclub/${cat.id}` as never}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 14,
                  WebkitTapHighlightColor: "transparent",
                  minHeight: isFeatured ? 120 : 108,
                  padding: isFeatured ? "22px 22px" : "16px 16px",
                  background: isFeatured ? "#0f172a" : "#ffffff",
                  border: isFeatured ? "none" : "1px solid #f1f5f9",
                  boxShadow: isFeatured
                    ? "0 4px 20px rgba(0,0,0,0.15)"
                    : "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "transform 150ms cubic-bezier(0.23,1,0.32,1)",
                }}
              >
                {/* Ghost text */}
                <span aria-hidden style={{
                  position: "absolute",
                  right: -12, bottom: -8,
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: isFeatured ? 86 : 62,
                  fontWeight: 400, lineHeight: 1,
                  letterSpacing: "-0.04em",
                  color: isFeatured ? "rgba(255,255,255,0.06)" : `${accent}22`,
                  pointerEvents: "none",
                  userSelect: "none",
                  textTransform: "uppercase",
                }}>
                  {ghost}
                </span>

                {/* Nombre */}
                <div style={{
                  position: "relative", zIndex: 1, flex: 1,
                  display: "flex", alignItems: "center",
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: isFeatured ? 28 : 20,
                  fontWeight: 400,
                  color: isFeatured ? "#ffffff" : "#0f172a",
                  textTransform: "uppercase",
                  letterSpacing: "0.01em",
                  lineHeight: 1,
                }}>
                  {cat.nombre}
                </div>

                {/* Footer */}
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 14,
                  position: "relative", zIndex: 1,
                }}>
                  <span style={{
                    display: "inline-block",
                    background: isFeatured ? "rgba(255,255,255,0.1)" : "#f1f5f9",
                    color: isFeatured ? "rgba(255,255,255,0.65)" : "#64748b",
                    padding: "5px 12px",
                    borderRadius: 100,
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 9, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>
                    {statusText}
                  </span>
                  <span style={{
                    fontFamily: "'Material Symbols Outlined'",
                    fontSize: 20, lineHeight: 1,
                    color: "#BCFF00",
                  }}>
                    arrow_forward
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
