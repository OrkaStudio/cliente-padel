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
  categoriaGenero: "masc" | "dam" | "mixto"
  horaInicio?: string
  sede?: string
}

export function PartidosEnVivoCarousel({ categorias }: Props) {
  const partidos: PartidoVivo[] = categorias.flatMap((cat) =>
    cat.partidos
      .filter((p) => p.estado === "en_vivo")
      .map((p) => ({ ...p, categoriaNombre: cat.nombre, categoriaGenero: cat.genero }))
  )

  if (partidos.length === 0) return null

  return (
    <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>
      {/* Header */}
      <div style={{ padding: "16px 18px 10px", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="live-dot" style={{
          width: 7, height: 7, borderRadius: "50%", background: "#bcff00",
          flexShrink: 0, display: "inline-block",
          boxShadow: "0 0 8px rgba(188,255,0,0.6)",
        }} />
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 900,
          color: "#0f172a",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          En cancha ahora
        </span>
      </div>

      {/* Carrusel */}
      <div style={{
        display: "flex", gap: 10,
        overflowX: "auto", padding: "4px 18px 16px",
        scrollSnapType: "x mandatory",
        scrollPaddingLeft: 18,
        msOverflowStyle: "none", scrollbarWidth: "none",
      }}>
        {partidos.map((partido) => {
          const sets = partido.resultado?.trim().split(/\s+/) ?? []
          const parsed = sets.map(s => { const [a, b] = s.split("-"); return { a: a ?? "–", b: b ?? "–" } })
          return (
            <div key={partido.id} style={{
              flexShrink: 0, width: 280,
              background: "#ffffff",
              border: "1.5px solid #bcff00",
              borderRadius: 14, padding: "13px 14px",
              scrollSnapAlign: "start",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(188,255,0,0.12)",
            }}>

              {/* Ghost VIVO — detrás de todo */}
              {(
                <span aria-hidden style={{
                  position: "absolute", zIndex: 0,
                  right: -4, bottom: -10,
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 58, fontWeight: 400, lineHeight: 1,
                  color: "rgba(188,255,0,0.32)",
                  letterSpacing: "-0.02em",
                  pointerEvents: "none", userSelect: "none",
                  textTransform: "uppercase",
                }}>
                  VIVO
                </span>
              )}

              {/* Degradado sobre VIVO */}
              <div aria-hidden style={{
                position: "absolute", zIndex: 1,
                inset: 0, pointerEvents: "none",
                background: "linear-gradient(to bottom right, transparent 40%, rgba(255,255,255,0.6) 100%)",
              }} />

              {/* Top row: categoría ← → sede/hora */}
              <div style={{
                position: "relative", zIndex: 2,
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                marginBottom: 12,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: "#0f172a", display: "inline-block", flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 9, fontWeight: 900,
                    color: "#0f172a",
                    textTransform: "uppercase", letterSpacing: "0.12em",
                  }}>{partido.categoriaNombre}</span>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 8, fontWeight: 900,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    padding: "2px 5px", borderRadius: 3,
                    background: partido.categoriaGenero === "dam"
                      ? "rgba(244,63,94,0.1)" : partido.categoriaGenero === "mixto"
                      ? "rgba(99,102,241,0.1)" : "rgba(15,23,42,0.06)",
                    color: partido.categoriaGenero === "dam"
                      ? "#be185d" : partido.categoriaGenero === "mixto"
                      ? "#4338ca" : "#64748b",
                  }}>
                    {partido.categoriaGenero === "dam" ? "Dam" : partido.categoriaGenero === "mixto" ? "Mix" : "Masc"}
                  </span>
                </div>
                {(partido.sede || partido.horaInicio) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{
                      fontFamily: "'Material Symbols Outlined'",
                      fontSize: 10, lineHeight: 1, color: "#0f172a",
                    }}>location_on</span>
                    <span style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 9, fontWeight: 700,
                      color: "#0f172a", letterSpacing: "0.03em",
                    }}>
                      {[partido.sede, partido.horaInicio].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Scoreboard */}
              <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 0 }}>

                {/* Fila A */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 13, fontWeight: 900, color: "#0f172a",
                    lineHeight: 1.2, textTransform: "uppercase",
                    flex: 1, minWidth: 0,
                  }}>
                    {partido.pairA}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {parsed.map((s, idx) => (
                      <span key={idx} style={{
                        fontFamily: "var(--font-anton), Anton, sans-serif",
                        fontSize: 18, fontWeight: 400, lineHeight: 1,
                        color: "#0f172a", minWidth: 16, textAlign: "center",
                      }}>{s.a}</span>
                    ))}
                    <span className="live-dot" style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#0f172a", flexShrink: 0,
                    }} />
                  </div>
                </div>

                {/* Separador */}
                <div style={{ height: 1, background: "#f1f5f9", marginBottom: 8 }} />

                {/* Fila B */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 13, fontWeight: 900, color: "#0f172a",
                    lineHeight: 1.2, textTransform: "uppercase",
                    flex: 1, minWidth: 0,
                  }}>
                    {partido.pairB}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {parsed.map((s, idx) => (
                      <span key={idx} style={{
                        fontFamily: "var(--font-anton), Anton, sans-serif",
                        fontSize: 18, fontWeight: 400, lineHeight: 1,
                        color: "#0f172a", minWidth: 16, textAlign: "center",
                      }}>{s.b}</span>
                    ))}
                    <span className="live-dot" style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#0f172a", flexShrink: 0,
                    }} />
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
