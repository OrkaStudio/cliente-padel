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
  horaInicio?: string
  sede?: string
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
          const lastSet = partido.resultado?.trim().split(/\s+/).at(-1) ?? null
          const [scoreA, scoreB] = lastSet ? lastSet.split("-") : ["–", "–"]

          return (
            <div key={partido.id} style={{
              flexShrink: 0, width: 280,
              background: "#ffffff",
              border: "1.5px solid #16a34a",
              borderRadius: 14, padding: "13px 14px",
              scrollSnapAlign: "start",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(22,163,74,0.1)",
            }}>

              {/* Ghost VIVO — grande, abajo a la derecha */}
              <span aria-hidden style={{
                position: "absolute",
                right: -4, bottom: -10,
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 58, fontWeight: 400, lineHeight: 1,
                color: "#BCFF00",
                letterSpacing: "-0.02em",
                pointerEvents: "none", userSelect: "none",
                textTransform: "uppercase",
              }}>
                VIVO
              </span>

              {/* Top row: categoría ← → sede/hora */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                marginBottom: 12,
              }}>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 9, fontWeight: 900,
                  color: "rgba(0,0,0,0.45)",
                  textTransform: "uppercase", letterSpacing: "0.12em",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "#16a34a", display: "inline-block", flexShrink: 0,
                  }} />
                  {partido.categoriaNombre}
                </div>
                {(partido.sede || partido.horaInicio) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{
                      fontFamily: "'Material Symbols Outlined'",
                      fontSize: 10, lineHeight: 1, color: "#16a34a",
                    }}>location_on</span>
                    <span style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 9, fontWeight: 700,
                      color: "#16a34a", letterSpacing: "0.03em",
                    }}>
                      {[partido.sede, partido.horaInicio].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Scoreboard */}
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

                {/* Fila A */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  gap: 10, paddingBottom: 8,
                }}>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 13, fontWeight: 900, color: "#0f172a",
                    lineHeight: 1.2, textTransform: "uppercase",
                    flex: 1, minWidth: 0,
                  }}>
                    {partido.pairA}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-anton), Anton, sans-serif",
                    fontSize: 16, fontWeight: 400,
                    color: "#fff", background: "#16a34a",
                    borderRadius: 6, padding: "3px 10px",
                    display: "inline-block", whiteSpace: "nowrap", flexShrink: 0,
                  }}>
                    {scoreA}
                  </span>
                </div>

                {/* Separador */}
                <div style={{ height: 1, background: "#f1f5f9", marginBottom: 8 }} />

                {/* Fila B */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  gap: 10,
                }}>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 13, fontWeight: 900, color: "#0f172a",
                    lineHeight: 1.2, textTransform: "uppercase",
                    flex: 1, minWidth: 0,
                  }}>
                    {partido.pairB}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-anton), Anton, sans-serif",
                    fontSize: 16, fontWeight: 400,
                    color: "#fff", background: "#16a34a",
                    borderRadius: 6, padding: "3px 10px",
                    display: "inline-block", whiteSpace: "nowrap", flexShrink: 0,
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
