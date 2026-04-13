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

export function PartidosEnVivoCarousel({ categorias, clubA, clubB }: Props) {
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
        {partidos.map((partido) => (
          <div key={partido.id} style={{
            flexShrink: 0, width: 280,
            background: "#ffffff",
            border: "2px solid #BCFF00",
            borderRadius: 10, padding: "12px 14px",
            scrollSnapAlign: "start",
            boxShadow: "0 2px 8px rgba(188,255,0,0.15)",
          }}>
            {/* Categoría */}
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900,
              color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.12em",
              marginBottom: 8,
            }}>
              {partido.categoriaNombre}
            </div>

            {/* Parejas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
              <div style={{
                borderLeft: `2px solid ${clubA.color}`,
                paddingLeft: 8,
              }}>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 8, fontWeight: 900,
                  color: clubA.color,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  marginBottom: 3,
                }}>
                  {clubA.abbr}
                </div>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, fontWeight: 800,
                  color: "#0f172a", lineHeight: 1.3,
                }}>
                  {partido.pairA}
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 22, fontWeight: 400,
                  color: "#0f172a", lineHeight: 1,
                  background: "#BCFF00",
                  borderRadius: 6,
                  padding: "2px 8px",
                }}>
                  {partido.resultado ?? "–"}
                </div>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 7, fontWeight: 900,
                  color: "#16a34a",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  marginTop: 4,
                }}>
                  en vivo
                </div>
              </div>

              <div style={{
                textAlign: "right",
                borderRight: `2px solid ${clubB.color}`,
                paddingRight: 8,
              }}>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 8, fontWeight: 900,
                  color: clubB.color,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  marginBottom: 3,
                }}>
                  {clubB.abbr}
                </div>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, fontWeight: 800,
                  color: "#0f172a", lineHeight: 1.3, textAlign: "right",
                }}>
                  {partido.pairB}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
