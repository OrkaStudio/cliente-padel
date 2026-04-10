"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import { inscribirParejaAction, eliminarParejaAction } from "@/actions/inscripcion.actions"
import { crearJugadorAction } from "@/actions/jugadores.actions"
import { JugadorSearch } from "@/components/torneos/shared/JugadorSearch"
import type { Categoria } from "@/types/torneo"
import type { Jugador } from "@/types/jugador"

type Pareja = {
  id: string
  jugador1: Jugador
  jugador2: Jugador | null
  categoria_id: string
}

type Props = {
  torneoId: string
  categorias: Categoria[]
  parejasIniciales: Pareja[]
}

export function PanelInscripcion({ torneoId, categorias, parejasIniciales }: Props) {
  const [catActiva, setCatActiva] = useState(categorias[0]?.id ?? "")
  const [parejas, setParejas] = useState<Pareja[]>(parejasIniciales)
  const [jugador1, setJugador1] = useState<Jugador | null>(null)
  const [jugador2, setJugador2] = useState<Jugador | null>(null)
  const [crearSlot, setCrearSlot] = useState<{ slot: "jugador1" | "jugador2"; nombre: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const [, startEliminar] = useTransition()

  const parejasCategoria = parejas.filter(p => p.categoria_id === catActiva)
  const [verJugadores, setVerJugadores] = useState(false)

  const jugadoresDelTorneo = Array.from(
    new Map(
      parejas.flatMap(p => [p.jugador1, ...(p.jugador2 ? [p.jugador2] : [])])
        .map(j => [j.id, j])
    ).values()
  ).sort((a, b) => a.apellido.localeCompare(b.apellido))

  const handleInscribir = () => {
    if (!jugador1) return
    startTransition(async () => {
      const [data, err] = await inscribirParejaAction({
        torneo_id: torneoId,
        categoria_id: catActiva,
        jugador1_id: jugador1.id,
        jugador2_id: jugador2?.id ?? null,
        club_id: null,
      })
      if (!err && data) {
        setParejas(prev => [...prev, { id: data.id, jugador1, jugador2, categoria_id: catActiva }])
        setJugador1(null)
        setJugador2(null)
      }
    })
  }

  const handleEliminar = (parejaId: string) => {
    const snapshot = parejas
    setParejas(prev => prev.filter(p => p.id !== parejaId))
    startEliminar(async () => {
      const [, err] = await eliminarParejaAction({ parejaId })
      if (err) setParejas(snapshot)
    })
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: "#0f172a", padding: "20px 16px 18px" }}>
        <p style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 900, color: "#bcff00",
          textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px",
        }}>
          Panel Admin
        </p>
        <h1 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 28, fontWeight: 400, color: "#fff",
          textTransform: "uppercase", margin: 0, lineHeight: 1,
        }}>
          Inscripción
        </h1>
      </div>

      {/* Tabs de categorías */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        padding: "10px 16px", display: "flex", gap: 8, overflowX: "auto",
      }}>
        {categorias.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setCatActiva(cat.id); setJugador1(null); setJugador2(null) }}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "none", flexShrink: 0,
              background: catActiva === cat.id ? "#0f172a" : "#f1f5f9",
              color: catActiva === cat.id ? "#bcff00" : "#64748b",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, fontWeight: 900, cursor: "pointer",
              textTransform: "uppercase", letterSpacing: "0.04em",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px" }}>

        {/* Contador de parejas */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{
            background: "#0f172a", borderRadius: 6, padding: "3px 10px",
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 16, color: "#bcff00",
          }}>
            {parejasCategoria.length}
          </div>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, fontWeight: 900, color: "#64748b",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            pareja{parejasCategoria.length !== 1 ? "s" : ""} inscripta{parejasCategoria.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Formulario agregar pareja */}
        <div style={{
          background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0",
          padding: "16px", marginBottom: 16,
        }}>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 900, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px",
          }}>
            Agregar pareja
          </p>

          {/* Jugador 1 */}
          <div style={{ marginBottom: 10 }}>
            <p style={labelStyle}>Jugador 1</p>
            {jugador1 ? (
              <JugadorTag jugador={jugador1} onRemove={() => setJugador1(null)} />
            ) : (
              <JugadorSearch
                categoriaId={catActiva}
                categorias={categorias}
                onSelect={setJugador1}
                onCrear={n => setCrearSlot({ slot: "jugador1", nombre: n })}
                placeholder="Buscar jugador 1..."
              />
            )}
          </div>

          {/* Jugador 2 — aparece solo cuando J1 está elegido */}
          {jugador1 && (
            <div style={{ marginBottom: 16 }}>
              <p style={labelStyle}>
                Jugador 2
                <span style={{ color: "#cbd5e1", fontWeight: 400, marginLeft: 4 }}>(opcional)</span>
              </p>
              {jugador2 ? (
                <JugadorTag jugador={jugador2} onRemove={() => setJugador2(null)} />
              ) : (
                <JugadorSearch
                  categoriaId={catActiva}
                  categorias={categorias}
                  onSelect={setJugador2}
                  onCrear={n => setCrearSlot({ slot: "jugador2", nombre: n })}
                  placeholder="Buscar jugador 2..."
                />
              )}
            </div>
          )}

          <motion.button
            onClick={handleInscribir}
            disabled={!jugador1 || pending}
            whileTap={jugador1 ? { scale: 0.97 } : {}}
            transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
            style={{
              width: "100%", padding: "13px",
              borderRadius: 10, border: "none",
              background: jugador1 && !pending ? "#0f172a" : "#e2e8f0",
              color: jugador1 && !pending ? "#bcff00" : "#94a3b8",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, fontWeight: 900,
              cursor: jugador1 && !pending ? "pointer" : "not-allowed",
              letterSpacing: "0.05em", textTransform: "uppercase",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {pending ? "Inscribiendo..." : !jugador1 ? "Seleccioná un jugador" : jugador2 ? "Inscribir pareja" : "Inscribir jugador solo"}
          </motion.button>
        </div>

        {/* Lista de parejas */}
        {parejasCategoria.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {parejasCategoria.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
                style={{
                  background: "#fff", borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  padding: "12px 14px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontFamily: "var(--font-anton), Anton, sans-serif",
                    fontSize: 18, color: "#0f172a", lineHeight: 1, minWidth: 20,
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <p style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0,
                    }}>
                      {p.jugador1.nombre} {p.jugador1.apellido}
                    </p>
                    {p.jugador2 ? (
                      <p style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 12, color: "#64748b", margin: "1px 0 0",
                      }}>
                        {p.jugador2.nombre} {p.jugador2.apellido}
                      </p>
                    ) : (
                      <span style={{
                        fontSize: 9, fontWeight: 900, color: "#92400e",
                        background: "#fef3c7", padding: "2px 7px", borderRadius: 4,
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        textTransform: "uppercase",
                      }}>
                        Incompleta
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleEliminar(p.id)}
                  style={{
                    background: "none", border: "none", padding: 4,
                    cursor: "pointer", display: "flex",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: "#cbd5e1", lineHeight: 1 }}>
                    delete
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {parejasCategoria.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 36, display: "block", marginBottom: 8 }}>group</span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12 }}>
              Todavía no hay parejas en esta categoría
            </p>
          </div>
        )}
      </div>

      {/* Sección jugadores inscriptos */}
      <div style={{ padding: "0 16px 16px" }}>
        <button
          onClick={() => setVerJugadores(v => !v)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
            padding: "12px 14px", cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#64748b", lineHeight: 1 }}>group</span>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, fontWeight: 900, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              Jugadores inscriptos
            </span>
            <span style={{
              background: "#0f172a", color: "#bcff00", borderRadius: 6,
              padding: "1px 7px",
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 13,
            }}>
              {jugadoresDelTorneo.length}
            </span>
          </div>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: "#94a3b8", lineHeight: 1 }}>
            {verJugadores ? "expand_less" : "expand_more"}
          </span>
        </button>

        <AnimatePresence>
          {verJugadores && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}
            >
              {jugadoresDelTorneo.map(j => (
                <div key={j.id} style={{
                  background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
                  padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: "#f1f5f9", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-anton), Anton, sans-serif",
                      fontSize: 11, color: "#64748b",
                    }}>
                      {j.nombre[0]}{j.apellido[0]}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 13, fontWeight: 700, color: "#0f172a",
                  }}>
                    {j.apellido}, {j.nombre}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sheet crear jugador */}
      <AnimatePresence>
        {crearSlot && (
          <CrearJugadorSheet
            nombrePrefill={crearSlot.nombre}
            categoriaId={catActiva}
            categorias={categorias}
            onClose={() => setCrearSlot(null)}
            onCreado={jugador => {
              if (crearSlot.slot === "jugador1") setJugador1(jugador)
              else setJugador2(jugador)
              setCrearSlot(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontSize: 10, fontWeight: 900, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.06em",
  margin: "0 0 6px",
}

function JugadorTag({ jugador, onRemove }: { jugador: Jugador; onRemove: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#f1f5f9", border: "1px solid #e2e8f0",
      borderRadius: 10, padding: "10px 12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#bcff00", lineHeight: 1 }}>
          person
        </span>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 13, fontWeight: 700, color: "#0f172a",
        }}>
          {jugador.nombre} {jugador.apellido}
        </span>
      </div>
      <button onClick={onRemove}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1 }}>close</span>
      </button>
    </div>
  )
}

function CrearJugadorSheet({ nombrePrefill, categoriaId, categorias, onClose, onCreado }: {
  nombrePrefill: string
  categoriaId: string
  categorias: Categoria[]
  onClose: () => void
  onCreado: (j: Jugador) => void
}) {
  const partes = nombrePrefill.trim().split(" ")
  const [nombre, setNombre] = useState(partes[0] ?? "")
  const [apellido, setApellido] = useState(partes.slice(1).join(" ") ?? "")
  const [telefono, setTelefono] = useState("")
  const [catId, setCatId] = useState(categoriaId)
  const [pending, startTransition] = useTransition()

  const handleCrear = () => {
    startTransition(async () => {
      const [data, err] = await crearJugadorAction({ nombre, apellido, telefono: telefono || null, categoria_id: catId, email: null, fecha_nacimiento: null })
      if (!err && data) onCreado(data as Jugador)
    })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 430, zIndex: 70,
          background: "#fff", borderRadius: "20px 20px 0 0",
          padding: "20px 20px 40px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 20px" }} />

        <h3 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 20, fontWeight: 400, color: "#0f172a",
          textTransform: "uppercase", margin: "0 0 20px",
        }}>
          Nuevo jugador
        </h3>

        {/* Nombre + Apellido */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <p style={labelStyle}>Nombre</p>
            <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} placeholder="Martín" />
          </div>
          <div>
            <p style={labelStyle}>Apellido</p>
            <input value={apellido} onChange={e => setApellido(e.target.value)} style={inputStyle} placeholder="García" />
          </div>
        </div>

        {/* Teléfono */}
        <div style={{ marginBottom: 12 }}>
          <p style={labelStyle}>Teléfono <span style={{ color: "#cbd5e1", fontWeight: 400 }}>(opcional)</span></p>
          <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} style={inputStyle} placeholder="1155550000" />
        </div>

        {/* Categoría natural */}
        <div style={{ marginBottom: 20 }}>
          <p style={labelStyle}>Categoría natural</p>
          <select value={catId} onChange={e => setCatId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "13px", borderRadius: 10,
            border: "1px solid #e2e8f0", background: "#f8fafc",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}>
            Cancelar
          </button>
          <motion.button
            onClick={handleCrear}
            disabled={!nombre || !apellido || pending}
            whileTap={nombre && apellido ? { scale: 0.97 } : {}}
            transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
            style={{
              flex: 2, padding: "13px", borderRadius: 10, border: "none",
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
        </div>
      </motion.div>
    </>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  border: "1px solid #e2e8f0", borderRadius: 10,
  background: "#f8fafc", outline: "none",
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontSize: 13, color: "#0f172a",
  boxSizing: "border-box",
}
