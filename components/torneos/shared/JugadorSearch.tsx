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
  const [mostrarOtraCategoria, setMostrarOtraCategoria] = useState(false)
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]))

  function search(q: string, catId: string) {
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    startTransition(async () => {
      const [data] = await buscarJugadoresAction({ query: q, categoria_id: catId })
      if (data) {
        setResults(data as Jugador[])
        setOpen(true)
      }
    })
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(q, filtroCategoria), 300)
  }

  function handleSelect(jugador: Jugador) {
    const esCatDistinta = jugador.categoria_id && jugador.categoria_id !== categoriaId
    if (esCatDistinta) {
      const catJugador = catMap[jugador.categoria_id!]
      const catTorneo = catMap[categoriaId]
      if (catJugador && catTorneo && catJugador.orden > catTorneo.orden) {
        const confirmar = window.confirm(
          `${catJugador.nombre} inscribiendo en ${catTorneo.nombre} (categoría inferior) — ¿confirmar?`
        )
        if (!confirmar) return
      }
    }
    onSelect(jugador)
    setQuery(`${jugador.nombre} ${jugador.apellido}`)
    setOpen(false)
  }

  return (
    <div className="relative">
      <input
        type="text"
        className="field-input"
        placeholder={placeholder ?? "Buscar jugador..."}
        value={query}
        onChange={handleInput}
        onFocus={() => results.length > 0 && setOpen(true)}
      />

      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl border shadow-lg overflow-hidden"
          style={{ borderColor: "#e2e8f0", backgroundColor: "#ffffff" }}
        >
          {results.map((j) => {
            const catJugador = j.categoria_id ? catMap[j.categoria_id] : null
            const esOtraCat = j.categoria_id && j.categoria_id !== categoriaId
            return (
              <button
                key={j.id}
                type="button"
                onClick={() => handleSelect(j)}
                className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span
                  className="text-sm font-semibold"
                  style={{ fontFamily: "Space Grotesk, sans-serif", color: "#0f172a" }}
                >
                  {j.nombre} {j.apellido}
                </span>
                {catJugador && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: esOtraCat ? "#fef3c7" : "#f0ffe0",
                      color: esOtraCat ? "#92400e" : "#166534",
                      fontFamily: "Space Grotesk, sans-serif",
                    }}
                  >
                    {catJugador.nombre}
                  </span>
                )}
              </button>
            )
          })}

          {/* Buscar en otra categoría */}
          {!mostrarOtraCategoria && (
            <button
              type="button"
              onClick={() => setMostrarOtraCategoria(true)}
              className="w-full px-4 py-2 text-left text-xs text-slate-400 hover:bg-slate-50 border-t"
              style={{ borderColor: "#f1f5f9", fontFamily: "Space Grotesk, sans-serif" }}
            >
              Buscar en otra categoría
            </button>
          )}

          {mostrarOtraCategoria && (
            <div className="px-4 py-2 border-t" style={{ borderColor: "#f1f5f9" }}>
              <select
                className="w-full text-xs rounded border px-2 py-1"
                style={{ borderColor: "#e2e8f0" }}
                value={filtroCategoria}
                onChange={(e) => {
                  setFiltroCategoria(e.target.value)
                  search(query, e.target.value)
                }}
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Crear nuevo jugador */}
          {query.trim().length >= 2 && (
            <button
              type="button"
              onClick={() => {
                onCrear(query.trim())
                setOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left flex items-center gap-2 border-t hover:bg-slate-50 transition-colors"
              style={{ borderColor: "#e2e8f0" }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "#bcff00", color: "#0f172a" }}
              >
                +
              </span>
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: "Space Grotesk, sans-serif", color: "#0f172a" }}
              >
                Crear &quot;{query.trim()}&quot;
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
