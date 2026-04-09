"use client"

import { useState } from "react"

type Jugador = {
  id: string
  nombre: string
  apellido: string
  telefono: string | null
  categoria_id: string | null
  categorias: { nombre: string } | null
}

type Props = {
  jugadores: Jugador[]
}

export function JugadoresView({ jugadores }: Props) {
  const [query, setQuery] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos")

  const categorias = Array.from(
    new Map(
      jugadores
        .filter(j => j.categoria_id && j.categorias)
        .map(j => [j.categoria_id!, j.categorias!.nombre])
    ).entries()
  )

  const filtered = jugadores.filter(j => {
    const matchQuery =
      query.length < 2 ||
      `${j.nombre} ${j.apellido}`.toLowerCase().includes(query.toLowerCase()) ||
      (j.telefono ?? "").includes(query)
    const matchCat = filtroCategoria === "todos" || j.categoria_id === filtroCategoria
    return matchQuery && matchCat
  })

  return (
    <div style={{ padding: "12px 16px 100px" }}>
      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#fff", border: "1px solid #e2e8f0",
        borderRadius: 10, padding: "10px 12px", marginBottom: 12,
      }}>
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1, flexShrink: 0 }}>search</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, color: "#0f172a",
          }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#94a3b8", lineHeight: 1 }}>close</span>
          </button>
        )}
      </div>

      {/* Categoría chips */}
      {categorias.length > 0 && (
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
          <button
            onClick={() => setFiltroCategoria("todos")}
            style={{
              flexShrink: 0, padding: "6px 14px", borderRadius: 20,
              border: "1.5px solid",
              borderColor: filtroCategoria === "todos" ? "#0f172a" : "#e2e8f0",
              background: filtroCategoria === "todos" ? "#0f172a" : "#fff",
              color: filtroCategoria === "todos" ? "#fff" : "#64748b",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}
          >
            Todos
          </button>
          {categorias.map(([id, nombre]) => (
            <button
              key={id}
              onClick={() => setFiltroCategoria(id)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 20,
                border: "1.5px solid",
                borderColor: filtroCategoria === id ? "#0f172a" : "#e2e8f0",
                background: filtroCategoria === id ? "#0f172a" : "#fff",
                color: filtroCategoria === id ? "#fff" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}
            >
              {nombre}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "40px 0",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, color: "#94a3b8",
          }}>
            No hay jugadores que coincidan
          </div>
        ) : (
          filtered.map((j, i) => (
            <div
              key={j.id}
              style={{
                background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
                padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                animation: `fadeUp 200ms ${i * 30}ms both`,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#f1f5f9", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 14, color: "#64748b", fontWeight: 400,
                }}>
                  {j.nombre[0]}{j.apellido[0]}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 700, color: "#0f172a",
                  margin: 0, lineHeight: 1.2,
                }}>
                  {j.apellido}, {j.nombre}
                </p>
                {j.telefono && (
                  <p style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 11, color: "#94a3b8", margin: "3px 0 0",
                  }}>
                    {j.telefono}
                  </p>
                )}
              </div>
              {j.categorias && (
                <span style={{
                  flexShrink: 0,
                  fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 4,
                  background: "#f0fff4", color: "#166534",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {j.categorias.nombre}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
