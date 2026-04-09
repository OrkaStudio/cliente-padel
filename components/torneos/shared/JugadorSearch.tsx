"use client"

import { useState, useRef, useTransition } from "react"
import { buscarJugadoresAction } from "@/actions/jugadores.actions"
import type { Jugador } from "@/types/jugador"
import type { Categoria } from "@/types/torneo"

type Props = {
  categoriaId: string
  categorias: Categoria[]
  onSelect: (jugador: Jugador) => void
  onCrear: (nombre: string) => void
  placeholder?: string
}

export function JugadorSearch({ categoriaId, categorias, onSelect, onCrear, placeholder }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Jugador[]>([])
  const [open, setOpen] = useState(false)
  const [filtroCategoria, setFiltroCategoria] = useState<string>(categoriaId)
  const [mostrarOtraCat, setMostrarOtraCat] = useState(false)
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]))

  function search(q: string, catId: string) {
    if (q.length < 2) { setResults([]); setOpen(false); return }
    startTransition(async () => {
      const [data] = await buscarJugadoresAction({ query: q, categoria_id: catId })
      if (data) { setResults(data as Jugador[]); setOpen(true) }
    })
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q, filtroCategoria), 300)
  }

  function handleSelect(jugador: Jugador) {
    const esOtraCat = jugador.categoria_id && jugador.categoria_id !== categoriaId
    if (esOtraCat) {
      const catJ = catMap[jugador.categoria_id!]
      const catT = catMap[categoriaId]
      if (catJ && catT && catJ.orden > catT.orden) {
        if (!window.confirm(`${catJ.nombre} inscribiendo en ${catT.nombre} — ¿confirmar?`)) return
      }
    }
    onSelect(jugador)
    setQuery(`${jugador.nombre} ${jugador.apellido}`)
    setOpen(false)
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: 10, padding: "10px 12px",
      }}>
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1, flexShrink: 0 }}>search</span>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder ?? "Buscar jugador..."}
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, color: "#0f172a",
          }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false) }}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#94a3b8", lineHeight: 1 }}>close</span>
          </button>
        )}
      </div>

      {open && (
        <div style={{
          position: "absolute", zIndex: 50, width: "100%", top: "calc(100% + 4px)",
          background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden",
        }}>
          {results.map((j) => {
            const catJ = j.categoria_id ? catMap[j.categoria_id] : null
            const esOtraCat = j.categoria_id && j.categoria_id !== categoriaId
            return (
              <button key={j.id} type="button" onClick={() => handleSelect(j)}
                style={{
                  width: "100%", padding: "12px 14px", border: "none",
                  background: "transparent", cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderBottom: "1px solid #f8fafc",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  {j.nombre} {j.apellido}
                </span>
                {catJ && (
                  <span style={{
                    fontSize: 9, fontWeight: 900, padding: "3px 8px", borderRadius: 4,
                    background: esOtraCat ? "#fef3c7" : "#f0fff4",
                    color: esOtraCat ? "#92400e" : "#166534",
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    textTransform: "uppercase", letterSpacing: "0.04em",
                  }}>
                    {catJ.nombre}
                  </span>
                )}
              </button>
            )
          })}

          {!mostrarOtraCat && (
            <button type="button" onClick={() => setMostrarOtraCat(true)}
              style={{
                width: "100%", padding: "10px 14px", border: "none",
                background: "#f8fafc", cursor: "pointer", textAlign: "left",
                borderTop: "1px solid #f1f5f9",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, color: "#94a3b8",
              }}>
              Buscar en otra categoría
            </button>
          )}

          {mostrarOtraCat && (
            <div style={{ padding: "10px 14px", borderTop: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <select
                value={filtroCategoria}
                onChange={e => { setFiltroCategoria(e.target.value); search(query, e.target.value) }}
                style={{
                  width: "100%", padding: "6px 8px", borderRadius: 6,
                  border: "1px solid #e2e8f0", background: "#fff",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, color: "#0f172a",
                }}
              >
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          )}

          {query.trim().length >= 2 && (
            <button type="button"
              onClick={() => { onCrear(query.trim()); setOpen(false) }}
              style={{
                width: "100%", padding: "12px 14px", border: "none",
                background: "transparent", cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 10,
                borderTop: "1px solid #e2e8f0",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: "#bcff00", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#0f172a", lineHeight: 1 }}>add</span>
              </div>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                Crear &quot;{query.trim()}&quot;
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
