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
    <div style={{ background: "#0d0d0d", paddingBottom: 4 }}>
      {/* Header */}
      <div style={{ padding: "20px 18px 10px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%", background: "#BCFF00",
          flexShrink: 0, display: "inline-block",
          boxShadow: "0 0 8px #BCFF00",
        }} />
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 900,
          color: "#BCFF00",
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
            background: "rgba(188,255,0,0.06)",
            border: "1px solid rgba(188,255,0,0.2)",
            borderRadius: 8, padding: "12px 14px",
            scrollSnapAlign: "start",
          }}>
            {/* Categoría */}
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase", letterSpacing: "0.12em",
              marginBottom: 8,
            }}>
              {partido.categoriaNombre}
            </div>

            {/* Parejas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center" }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 8, fontWeight: 900,
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  marginBottom: 3,
                }}>
                  {clubA.abbr}
                </div>
                <div style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 13, fontWeight: 400,
                  color: "#ffffff", lineHeight: 1.2,
                  textTransform: "uppercase",
                }}>
                  {partido.pairA.replace(" / ", "\n")}
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 20, fontWeight: 400,
                  color: "#BCFF00", lineHeight: 1,
                }}>
                  {partido.resultado ?? "–"}
                </div>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 8, fontWeight: 900,
                  color: "rgba(255,255,255,0.25)",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  marginTop: 2,
                }}>
                  en vivo
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 8, fontWeight: 900,
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  marginBottom: 3,
                }}>
                  {clubB.abbr}
                </div>
                <div style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 13, fontWeight: 400,
                  color: "#ffffff", lineHeight: 1.2,
                  textTransform: "uppercase", textAlign: "right",
                }}>
                  {partido.pairB.replace(" / ", "\n")}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Divisor */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 18px" }} />
    </div>
  )
}
