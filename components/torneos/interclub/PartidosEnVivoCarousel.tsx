"use client"

import type { CategoriaInterclub, Club } from "./CategoriasInterclub"

type Props = {
  categorias: CategoriaInterclub[]
  clubA: Club
  clubB: Club
}

type PartidoVivo = {
  id: string
  pairA: string
  pairB: string
  resultado: string | null
  categoriaNombre: string
}

export function PartidosEnVivoCarousel({ categorias }: Props) {
  const partidos: PartidoVivo[] = categorias.flatMap((cat) =>
    cat.partidos
      .filter((p) => p.estado === "en_vivo")
      .map((p) => ({ ...p, categoriaNombre: cat.nombre }))
  )

  if (partidos.length === 0) return null

  return (
    <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>
      {/* Header */}
      <div style={{ padding: "16px 18px 10px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%", background: "#16a34a",
          flexShrink: 0, display: "inline-block",
          boxShadow: "0 0 8px rgba(22,163,74,0.5)",
        }} />
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 900,
          color: "#16a34a",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          En cancha ahora · {partidos.length} {partidos.length === 1 ? "partido" : "partidos"}
        </span>
      </div>

      {/* Carrusel */}
      <div style={{
        display: "flex", gap: 10,
        overflowX: "auto", padding: "4px 18px 16px",
        scrollSnapType: "x mandatory",
        msOverflowStyle: "none", scrollbarWidth: "none",
      }}>
        {partidos.map((partido) => {
          // "4-3" → scoreA=4, scoreB=3  |  multi-set "6-3 4-3" → last set
          const lastSet = partido.resultado?.trim().split(/\s+/).at(-1) ?? null
          const [scoreA, scoreB] = lastSet ? lastSet.split("-") : ["–", "–"]

          return (
          <div key={partido.id} style={{
            flexShrink: 0, width: 280,
            background: "#BCFF00",
            borderRadius: 14, padding: "14px 16px",
            scrollSnapAlign: "start",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Ghost VIVO */}
            <span aria-hidden style={{
              position: "absolute",
              right: -4, bottom: -10,
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 58, fontWeight: 400, lineHeight: 1,
              color: "rgba(0,0,0,0.08)",
              letterSpacing: "-0.02em",
              pointerEvents: "none", userSelect: "none",
              textTransform: "uppercase",
            }}>
              VIVO
            </span>

            {/* Categoría */}
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 900,
              color: "rgba(0,0,0,0.5)",
              textTransform: "uppercase", letterSpacing: "0.12em",
              marginBottom: 12,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#000", display: "inline-block", flexShrink: 0,
              }} />
              {partido.categoriaNombre}
            </div>

            {/* Parejas + score — apiladas */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative", zIndex: 1 }}>

              {/* Fila A */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: 10, paddingBottom: 8,
              }}>
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900, color: "#000",
                  lineHeight: 1.2, textTransform: "uppercase",
                  flex: 1, minWidth: 0,
                }}>
                  {partido.pairA}
                </span>
                <span style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 16, fontWeight: 400,
                  color: "#fff", background: "#000",
                  borderRadius: 6, padding: "3px 10px",
                  display: "inline-block", whiteSpace: "nowrap",
                  flexShrink: 0,
                }}>
                  {scoreA}
                </span>
              </div>

              {/* Separador */}
              <div style={{ height: 1, background: "rgba(0,0,0,0.1)", marginBottom: 8 }} />

              {/* Fila B */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                gap: 10,
              }}>
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900, color: "#000",
                  lineHeight: 1.2, textTransform: "uppercase",
                  flex: 1, minWidth: 0,
                }}>
                  {partido.pairB}
                </span>
                <span style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 16, fontWeight: 400,
                  color: "#fff", background: "#000",
                  borderRadius: 6, padding: "3px 10px",
                  display: "inline-block", whiteSpace: "nowrap",
                  flexShrink: 0,
                }}>
                  {scoreB}
                </span>
              </div>

            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
