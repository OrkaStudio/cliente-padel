"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export type Partido = {
  id: string
  pairA: string
  pairB: string
  resultado: string | null
  ganador: "A" | "B" | null
  estado: "pendiente" | "en_vivo" | "finalizado"
  horaInicio?: string
  sede?: string
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


type Props = {
  categorias: CategoriaInterclub[]
  clubA: Club
  clubB: Club
  torneoId: string
}

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

function getResultLabel(cat: CategoriaInterclub, clubA: Club, clubB: Club): string | null {
  if (cat.estado !== "finalizado") return null
  if (cat.ptsA > cat.ptsB) return `Ganó ${clubA.abbr}`
  if (cat.ptsB > cat.ptsA) return `Ganó ${clubB.abbr}`
  return "Empate"
}

export function CategoriasInterclub({ categorias, clubA, clubB, torneoId }: Props) {
  const sorted = sortCategorias(categorias)

  return (
    <div style={{ background: "#f8fafc", padding: "20px 14px 48px" }}>

      {/* Label sección */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 28, fontWeight: 400, lineHeight: 1,
          color: "#0f172a", textTransform: "uppercase",
          letterSpacing: "0.02em", margin: 0,
        }}>Categorías</h2>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {sorted.map((cat, i) => {
          const dark = i % 3 === 0
          const ghost = cat.nombre.toUpperCase().includes("MIXTO") ? "MIX"
            : cat.nombre.toUpperCase().includes("DAMA") ? "FEM" : "MASC"
          const resultLabel = getResultLabel(cat, clubA, clubB)
          const chipText = cat.estado === "en_vivo" ? "En juego"
            : resultLabel ?? null

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
              style={{ gridColumn: dark ? "1 / -1" : undefined }}
            >
              <Link
                href={`/torneos/${torneoId}/interclub/${cat.id}` as never}
                style={{
                  display: "flex", flexDirection: "column",
                  justifyContent: "space-between",
                  textDecoration: "none", position: "relative", overflow: "hidden",
                  borderRadius: 14,
                  WebkitTapHighlightColor: "transparent",
                  minHeight: dark ? 120 : 108,
                  padding: dark ? "22px 22px" : "16px 16px",
                  background: dark ? "#0f172a" : "#ffffff",
                  border: dark ? "none" : "1px solid #f1f5f9",
                  boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
                  transition: "transform 150ms cubic-bezier(0.23,1,0.32,1)",
                  opacity: 1,
                }}
              >
                {/* Ghost */}
                <span aria-hidden style={{
                  position: "absolute", right: -10, bottom: -8,
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: dark ? 86 : 58,
                  fontWeight: 400, lineHeight: 1, letterSpacing: "-0.04em",
                  color: dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
                  pointerEvents: "none", userSelect: "none", textTransform: "uppercase",
                }}>{ghost}</span>

                {/* Nombre */}
                <div style={{
                  position: "relative", zIndex: 1, flex: 1,
                  display: "flex", alignItems: "center",
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: dark ? 26 : 18,
                  fontWeight: 400, lineHeight: 1,
                  color: dark ? "#ffffff" : "#0f172a",
                  textTransform: "uppercase", letterSpacing: "0.01em",
                }}>{cat.nombre}</div>

                {/* Footer */}
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 14, position: "relative", zIndex: 1,
                }}>
                  {chipText ? (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: cat.estado === "en_vivo"
                        ? "#bcff00"
                        : dark ? "rgba(255,255,255,0.1)" : "#f1f5f9",
                      color: cat.estado === "en_vivo"
                        ? "#000"
                        : dark ? "rgba(255,255,255,0.65)" : "#64748b",
                      padding: "5px 10px", borderRadius: 100,
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 9, fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      {cat.estado === "en_vivo" && (
                        <span className="live-dot" style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: "#000", flexShrink: 0,
                        }} />
                      )}
                      {chipText}
                    </span>
                  ) : <span />}
                  <span style={{
                    fontFamily: "'Material Symbols Outlined'",
                    fontSize: 20, lineHeight: 1,
                    color: dark ? "#bcff00" : "#0f172a",
                  }}>arrow_forward</span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
