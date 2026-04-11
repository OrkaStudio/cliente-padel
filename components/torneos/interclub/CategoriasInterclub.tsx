"use client"

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
}

export function CategoriasInterclub({ categorias, clubA, clubB }: Props) {
  const [filtro, setFiltro] = useState<Filtro>("todas")
  const [abiertos, setAbiertos] = useState<Set<string>>(
    // Abrir las en_vivo por defecto
    new Set(categorias.filter((c) => c.estado === "en_vivo").map((c) => c.id))
  )

  const filtradas =
    filtro === "todas"
      ? categorias
      : categorias.filter((c) => c.estado === filtro)

  const toggle = (id: string) => {
    setAbiertos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtros: { key: Filtro; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "en_vivo", label: "En juego" },
    { key: "finalizado", label: "Fin" },
    { key: "pendiente", label: "Pendientes" },
  ]

  return (
    <div style={{ padding: "28px 18px 0" }}>
      {/* Header de sección */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 24,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontWeight: 400,
            margin: 0,
            color: "#0f172a",
          }}
        >
          Categorías
        </h2>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>

      {/* Chips de filtro */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          overflowX: "auto",
          paddingBottom: 4,
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {filtros.map((f) => {
          const count =
            f.key === "todas"
              ? categorias.length
              : categorias.filter((c) => c.estado === f.key).length
          const isActive = filtro === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              style={{
                padding: "5px 12px",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
                background: isActive ? "#0f172a" : "#e2e8f0",
                color: isActive ? "#bcff00" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                WebkitTapHighlightColor: "transparent",
                transition: "background 150ms, color 150ms",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {f.label}
              <span
                style={{
                  background: isActive ? "rgba(188,255,0,0.2)" : "rgba(0,0,0,0.1)",
                  borderRadius: 2,
                  padding: "0 4px",
                  fontSize: 9,
                  lineHeight: "16px",
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Lista de categorías */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtradas.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <span
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Sin categorías en este estado
            </span>
          </div>
        )}

        {filtradas.map((cat) => {
          const isOpen = abiertos.has(cat.id)
          const isLive = cat.estado === "en_vivo"
          const isFin = cat.estado === "finalizado"
          const isPending = cat.estado === "pendiente"

          // Color del borde izquierdo según quién lidera en la categoría
          let borderColor = "#e2e8f0"
          if (cat.ptsA > cat.ptsB) borderColor = "#bcff00"
          else if (cat.ptsB > cat.ptsA) borderColor = "#b45309"
          else if (isLive) borderColor = "#bcff00"

          return (
            <div
              key={cat.id}
              style={{
                background: "#ffffff",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                borderLeft: `4px solid ${borderColor}`,
                overflow: "hidden",
              }}
            >
              {/* Cabecera clickeable */}
              <button
                onClick={() => toggle(cat.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 14px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  WebkitTapHighlightColor: "transparent",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* Nombre + badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-anton), Anton, sans-serif",
                        fontSize: 16,
                        fontWeight: 400,
                        color: "#0f172a",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {cat.nombre}
                    </span>

                    {isLive && (
                      <span
                        style={{
                          background: "#bcff00",
                          color: "#000",
                          padding: "2px 7px",
                          borderRadius: 2,
                          fontSize: 8,
                          fontWeight: 900,
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#000",
                            flexShrink: 0,
                          }}
                        />
                        En juego
                      </span>
                    )}

                    {isFin && (
                      <span
                        style={{
                          background: "#e2e8f0",
                          color: "#64748b",
                          padding: "2px 7px",
                          borderRadius: 2,
                          fontSize: 8,
                          fontWeight: 900,
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Fin
                      </span>
                    )}

                    {isPending && (
                      <span
                        style={{
                          background: "#f1f5f9",
                          color: "#94a3b8",
                          padding: "2px 7px",
                          borderRadius: 2,
                          fontSize: 8,
                          fontWeight: 900,
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Pendiente
                      </span>
                    )}
                  </div>

                  {/* Mini marcador por categoría */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Club A */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-anton), Anton, sans-serif",
                          fontSize: 28,
                          fontWeight: 400,
                          lineHeight: 1,
                          color: cat.ptsA >= cat.ptsB && (cat.ptsA > 0 || cat.ptsB > 0)
                            ? "#0f172a"
                            : "#94a3b8",
                        }}
                      >
                        {cat.ptsA}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 8,
                          fontWeight: 900,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {clubA.abbr}
                      </span>
                    </div>

                    <span style={{ color: "#cbd5e1", fontSize: 14 }}>—</span>

                    {/* Club B */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span
                        style={{
                          fontFamily: "var(--font-anton), Anton, sans-serif",
                          fontSize: 28,
                          fontWeight: 400,
                          lineHeight: 1,
                          color: cat.ptsB > cat.ptsA ? "#b45309" : "#94a3b8",
                        }}
                      >
                        {cat.ptsB}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: 8,
                          fontWeight: 900,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {clubB.abbr}
                      </span>
                    </div>

                    {/* Partidos jugados */}
                    <span
                      style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#cbd5e1",
                        marginLeft: 4,
                      }}
                    >
                      {cat.partidos.filter((p) => p.estado === "finalizado").length}/
                      {cat.partidos.length} partidos
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <span
                  style={{
                    fontFamily: "'Material Symbols Outlined'",
                    fontSize: 20,
                    color: "#cbd5e1",
                    lineHeight: 1,
                    flexShrink: 0,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                    display: "block",
                  }}
                >
                  expand_more
                </span>
              </button>

              {/* Lista de partidos (accordion) */}
              {isOpen && (
                <div style={{ borderTop: "1px solid #f1f5f9" }}>
                  {/* Subheader con nombres de clubes */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "14px 1fr auto 1fr",
                      gap: 8,
                      padding: "7px 14px",
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      alignItems: "center",
                    }}
                  >
                    <div />
                    <span
                      style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 8,
                        fontWeight: 900,
                        color: "#0f172a",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {clubA.nombre}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 8,
                        fontWeight: 700,
                        color: "#cbd5e1",
                        textAlign: "center",
                      }}
                    >
                      vs
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 8,
                        fontWeight: 900,
                        color: "#b45309",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        textAlign: "right",
                      }}
                    >
                      {clubB.nombre}
                    </span>
                  </div>

                  {cat.partidos.map((partido, idx) => (
                    <PartidoRow
                      key={partido.id}
                      partido={partido}
                      isLast={idx === cat.partidos.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PartidoRow({
  partido,
  isLast,
}: {
  partido: Partido
  isLast: boolean
}) {
  const isLive = partido.estado === "en_vivo"
  const isFin = partido.estado === "finalizado"

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "14px 1fr auto 1fr",
        gap: 8,
        padding: "10px 14px",
        borderBottom: isLast ? "none" : "1px solid #f1f5f9",
        alignItems: "center",
        background: isLive ? "rgba(188,255,0,0.04)" : "#ffffff",
      }}
    >
      {/* Indicador de resultado */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isFin && partido.ganador === "A" && (
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#bcff00",
              flexShrink: 0,
            }}
          />
        )}
        {isFin && partido.ganador === "B" && (
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#b45309",
              flexShrink: 0,
            }}
          />
        )}
        {isLive && (
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#bcff00",
              flexShrink: 0,
            }}
          />
        )}
        {partido.estado === "pendiente" && (
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#e2e8f0",
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Pareja A */}
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 11,
          fontWeight: partido.ganador === "A" ? 900 : 700,
          color:
            partido.ganador === "A"
              ? "#0f172a"
              : partido.estado === "pendiente"
              ? "#94a3b8"
              : "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {partido.pairA}
      </span>

      {/* Score / estado */}
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        {isFin && (
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11,
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            {partido.resultado}
          </span>
        )}
        {isLive && (
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11,
              fontWeight: 900,
              color: "#bcff00",
              letterSpacing: "0.04em",
            }}
          >
            {partido.resultado}
          </span>
        )}
        {partido.estado === "pendiente" && (
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11,
              color: "#e2e8f0",
            }}
          >
            —
          </span>
        )}
      </div>

      {/* Pareja B */}
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 11,
          fontWeight: partido.ganador === "B" ? 900 : 700,
          color:
            partido.ganador === "B"
              ? "#b45309"
              : partido.estado === "pendiente"
              ? "#94a3b8"
              : "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
          textAlign: "right",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {partido.pairB}
      </span>
    </div>
  )
}
