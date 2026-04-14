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

function parseSets(resultado: string | null): string[] {
  if (!resultado) return []
  return resultado.trim().split(/\s+/)
}

export function PartidosEnVivoCarousel({ categorias }: Props) {
  const partidos: PartidoVivo[] = categorias.flatMap((cat) =>
    cat.partidos
      .filter((p) => p.estado === "en_vivo")
      .map((p) => ({
        ...p,
        categoriaNombre: cat.nombre,
        horaInicio: p.horaInicio,
        sede: p.sede,
      }))
  )

  if (partidos.length === 0) return null

  return (
    <div style={{
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      padding: "0 14px 14px",
    }}>
      {/* Header */}
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
              width: 280,
              background: "#BCFF00",
              borderRadius: 14,
              padding: "14px 16px 12px",
              scrollSnapAlign: "start",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Ghost "VIVO" */}
              <span aria-hidden style={{
                position: "absolute",
                right: -6, bottom: -10,
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 52, fontWeight: 400, lineHeight: 1,
                color: "rgba(0,0,0,0.07)",
                letterSpacing: "-0.02em",
                pointerEvents: "none", userSelect: "none",
                textTransform: "uppercase",
              }}>
                VIVO
              </span>

              {/* Categoría */}
              <div style={{
                display: "flex", alignItems: "center", gap: 5,
                marginBottom: 10,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: "#000", flexShrink: 0,
                  display: "inline-block",
                }} />
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 8, fontWeight: 900,
                  color: "rgba(0,0,0,0.55)",
                  textTransform: "uppercase", letterSpacing: "0.12em",
                }}>
                  {partido.categoriaNombre}
                </span>
              </div>

              {/* Parejas + score */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 8, alignItems: "center",
                marginBottom: 12,
              }}>
                {/* Pareja A */}
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900,
                  color: "#000",
                  lineHeight: 1.25,
                  textTransform: "uppercase",
                }}>
                  {partido.pairA}
                </div>

                {/* Score central */}
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 3,
                }}>
                  {sets.length === 0 ? (
                    <span style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 11, fontWeight: 700,
                      color: "rgba(0,0,0,0.4)",
                    }}>vs</span>
                  ) : (
                    <>
                      {/* Sets anteriores (completados) */}
                      {sets.slice(0, -1).map((set, idx) => (
                        <span key={idx} style={{
                          fontFamily: "var(--font-anton), Anton, sans-serif",
                          fontSize: 10, fontWeight: 400,
                          color: "rgba(255,255,255,0.85)",
                          background: "rgba(0,0,0,0.45)",
                          borderRadius: 4, padding: "1px 6px",
                          display: "inline-block", whiteSpace: "nowrap",
                          letterSpacing: "0.02em",
                        }}>{set}</span>
                      ))}
                      {/* Set en curso */}
                      <span style={{
                        fontFamily: "var(--font-anton), Anton, sans-serif",
                        fontSize: 15, fontWeight: 400,
                        color: "#fff",
                        background: "#000",
                        borderRadius: 6, padding: "2px 9px",
                        display: "inline-block", whiteSpace: "nowrap",
                        letterSpacing: "0.02em",
                      }}>{sets[sets.length - 1]}</span>
                    </>
                  )}
                </div>

                {/* Pareja B */}
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900,
                  color: "#000",
                  lineHeight: 1.25,
                  textTransform: "uppercase",
                  textAlign: "right",
                }}>
                  {partido.pairB}
                </div>
              </div>

              {/* Footer: sede + hora */}
              <div style={{
                display: "flex", alignItems: "center", gap: 4,
                position: "relative", zIndex: 1,
              }}>
                <span style={{
                  fontFamily: "'Material Symbols Outlined'",
                  fontSize: 11, lineHeight: 1,
                  color: "rgba(0,0,0,0.5)",
                }}>location_on</span>
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 9, fontWeight: 700,
                  color: "rgba(0,0,0,0.55)",
                  letterSpacing: "0.04em",
                }}>
                  {[partido.sede, partido.horaInicio].filter(Boolean).join(" · ")}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
