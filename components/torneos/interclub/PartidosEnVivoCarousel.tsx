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
  cancha?: string
}

function parseSets(resultado: string | null): string[] {
  if (!resultado) return []
  return resultado.trim().split(/\s+/)
}

export function PartidosEnVivoCarousel({ categorias, clubA, clubB }: Props) {
  const partidos: PartidoVivo[] = categorias.flatMap((cat) =>
    cat.partidos
      .filter((p) => p.estado === "en_vivo")
      .map((p) => ({
        ...p,
        categoriaNombre: cat.nombre,
        horaInicio: p.horaInicio,
        cancha: p.cancha,
      }))
  )

  if (partidos.length === 0) return null

  return (
    <div style={{
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      padding: "0 14px 14px",
    }}>
      {/* Header — sin contador */}
      <div style={{
        padding: "14px 0 10px",
        display: "flex", alignItems: "center", gap: 7,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#16a34a", flexShrink: 0,
          display: "inline-block",
          boxShadow: "0 0 8px rgba(22,163,74,0.6)",
        }} />
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 900,
          color: "#16a34a",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          En cancha
        </span>
      </div>

      {/* Scroll horizontal */}
      <div style={{
        display: "flex", gap: 8,
        overflowX: "auto", paddingBottom: 2,
        scrollSnapType: "x mandatory",
        msOverflowStyle: "none", scrollbarWidth: "none",
      }}>
        {partidos.map((partido) => {
          const sets = parseSets(partido.resultado)

          return (
            <div key={partido.id} style={{
              flexShrink: 0,
              width: 260,
              background: "#0f172a",
              borderRadius: 12,
              padding: "12px 14px",
              scrollSnapAlign: "start",
            }}>
              {/* Categoría + meta */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 8, fontWeight: 900,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase", letterSpacing: "0.12em",
                }}>
                  {partido.categoriaNombre}
                </div>
                {(partido.horaInicio || partido.cancha) && (
                  <div style={{
                    display: "flex", gap: 5, alignItems: "center",
                  }}>
                    {partido.horaInicio && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 2,
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 7, fontWeight: 700,
                        color: "rgba(255,255,255,0.3)",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 9, lineHeight: 1 }}>
                          schedule
                        </span>
                        {partido.horaInicio}
                      </span>
                    )}
                    {partido.cancha && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 2,
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 7, fontWeight: 700,
                        color: "rgba(255,255,255,0.3)",
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 9, lineHeight: 1 }}>
                          sports_tennis
                        </span>
                        {partido.cancha}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Parejas y score */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 10, alignItems: "center",
              }}>
                {/* Club A */}
                <div>
                  <div style={{
                    display: "inline-block",
                    background: "rgba(255,255,255,0.12)",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    color: "#ffffff",
                    padding: "1px 6px", borderRadius: 3,
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 7, fontWeight: 900,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    marginBottom: 3,
                  }}>
                    {clubA.abbr}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 11, fontWeight: 800,
                    color: "#ffffff", lineHeight: 1.3,
                  }}>
                    {partido.pairA}
                  </div>
                </div>

                {/* Score — multi-set */}
                <div style={{
                  textAlign: "center", flexShrink: 0,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 3,
                }}>
                  {sets.length === 0 ? (
                    <span style={{
                      fontFamily: "var(--font-anton), Anton, sans-serif",
                      fontSize: 16, fontWeight: 400,
                      color: "#000", background: "#BCFF00",
                      borderRadius: 6, padding: "2px 8px",
                      display: "inline-block",
                    }}>–</span>
                  ) : (
                    sets.map((set, idx) => {
                      const isCurrent = idx === sets.length - 1
                      return isCurrent ? (
                        <span key={idx} style={{
                          fontFamily: "var(--font-anton), Anton, sans-serif",
                          fontSize: 16, fontWeight: 400,
                          color: "#000", background: "#BCFF00",
                          borderRadius: 6, padding: "2px 8px",
                          display: "inline-block", whiteSpace: "nowrap",
                        }}>{set}</span>
                      ) : (
                        <span key={idx} style={{
                          fontFamily: "var(--font-anton), Anton, sans-serif",
                          fontSize: 10, fontWeight: 400,
                          color: "rgba(255,255,255,0.45)",
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: 4, padding: "1px 6px",
                          display: "inline-block", whiteSpace: "nowrap",
                        }}>{set}</span>
                      )
                    })
                  )}
                </div>

                {/* Club B */}
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    display: "inline-block",
                    background: clubB.color,
                    color: "#ffffff",
                    padding: "1px 6px", borderRadius: 3,
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 7, fontWeight: 900,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                    marginBottom: 3,
                  }}>
                    {clubB.abbr}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 11, fontWeight: 800,
                    color: "#ffffff", lineHeight: 1.3, textAlign: "right",
                  }}>
                    {partido.pairB}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
