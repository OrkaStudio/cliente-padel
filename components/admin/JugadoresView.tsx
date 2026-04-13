"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import { crearJugadorAction } from "@/actions/jugadores.actions"

type Jugador = {
  id: string
  nombre: string
  apellido: string
  telefono: string | null
  categoria_id: string | null
  categorias: { nombre: string }[] | { nombre: string } | null
}

type Categoria = {
  id: string
  nombre: string
}

type Props = {
  jugadores: Jugador[]
  categorias: Categoria[]
}

export function JugadoresView({ jugadores: jugadoresIniciales, categorias }: Props) {
  const [jugadores, setJugadores] = useState<Jugador[]>(jugadoresIniciales)
  const [query, setQuery] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos")
  const [formAbierto, setFormAbierto] = useState(false)
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [telefono, setTelefono] = useState("")
  const [catId, setCatId] = useState(categorias[0]?.id ?? "")
  const [pending, startTransition] = useTransition()

  const handleCrear = () => {
    if (!nombre || !apellido || !catId) return
    startTransition(async () => {
      const [data, err] = await crearJugadorAction({
        nombre, apellido,
        telefono: telefono || null,
        categoria_id: catId,
        email: null,
        fecha_nacimiento: null,
      })
      if (!err && data) {
        const cat = categorias.find(c => c.id === catId) ?? null
        setJugadores(prev => [...prev, {
          ...(data as Jugador),
          categorias: cat ? { nombre: cat.nombre } : null,
        }].sort((a, b) => a.apellido.localeCompare(b.apellido)))
        setNombre("")
        setApellido("")
        setTelefono("")
        setFormAbierto(false)
      }
    })
  }

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

      {/* Botón agregar */}
      <button
        onClick={() => setFormAbierto(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: formAbierto ? "#f1f5f9" : "#0f172a",
          border: "none", borderRadius: 12, padding: "12px",
          cursor: "pointer", marginBottom: 12,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: formAbierto ? "#64748b" : "#bcff00", lineHeight: 1 }}>
          {formAbierto ? "close" : "person_add"}
        </span>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 12, fontWeight: 900,
          color: formAbierto ? "#64748b" : "#bcff00",
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          {formAbierto ? "Cancelar" : "Agregar jugador"}
        </span>
      </button>

      {/* Form inline */}
      <AnimatePresence>
        {formAbierto && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
              padding: 16, marginBottom: 12,
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <p style={labelStyle}>Nombre</p>
                <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} placeholder="Martín" />
              </div>
              <div>
                <p style={labelStyle}>Apellido</p>
                <input value={apellido} onChange={e => setApellido(e.target.value)} style={inputStyle} placeholder="García" />
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <p style={labelStyle}>Teléfono <span style={{ color: "#cbd5e1", fontWeight: 400 }}>(opcional)</span></p>
              <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} style={inputStyle} placeholder="1155550000" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <p style={labelStyle}>Categoría</p>
              <select value={catId} onChange={e => setCatId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <motion.button
              onClick={handleCrear}
              disabled={!nombre || !apellido || pending}
              whileTap={nombre && apellido ? { scale: 0.97 } : {}}
              transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
              style={{
                width: "100%", padding: "12px", borderRadius: 10, border: "none",
                background: nombre && apellido && !pending ? "#0f172a" : "#e2e8f0",
                color: nombre && apellido && !pending ? "#bcff00" : "#94a3b8",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 13, fontWeight: 900,
                cursor: nombre && apellido ? "pointer" : "not-allowed",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {pending ? "Guardando..." : "Guardar jugador"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

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
          {categorias.map(c => (
            <button
              key={c.id}
              onClick={() => setFiltroCategoria(c.id)}
              style={{
                flexShrink: 0, padding: "6px 14px", borderRadius: 20,
                border: "1.5px solid",
                borderColor: filtroCategoria === c.id ? "#0f172a" : "#e2e8f0",
                background: filtroCategoria === c.id ? "#0f172a" : "#fff",
                color: filtroCategoria === c.id ? "#fff" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}
            >
              {c.nombre}
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
                  {Array.isArray(j.categorias) ? j.categorias[0]?.nombre : j.categorias.nombre}
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

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontSize: 10, fontWeight: 900, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.06em",
  margin: "0 0 6px",
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  border: "1px solid #e2e8f0", borderRadius: 10,
  background: "#f8fafc", outline: "none",
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontSize: 13, color: "#0f172a",
  boxSizing: "border-box",
}
