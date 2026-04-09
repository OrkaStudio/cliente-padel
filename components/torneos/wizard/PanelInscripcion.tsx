"use client"

import { useState } from "react"
import { useServerAction } from "zsa-react"
import { inscribirParejaAction } from "@/actions/inscripcion.actions"
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

type CrearJugadorModal = {
  slot: "jugador1" | "jugador2"
  nombrePrefill: string
} | null

function warningPareja(j1: Jugador, j2: Jugador | null, catTorneoId: string, categorias: Categoria[]): string | null {
  if (!j2?.categoria_id) return null
  const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]))
  const catJ1 = j1.categoria_id ? catMap[j1.categoria_id] : null
  const catJ2 = catMap[j2.categoria_id]
  const catTorneo = catMap[catTorneoId]
  if (!catJ1 || !catJ2 || !catTorneo) return null

  // Categoría base = la de orden menor (más alta)
  const ordenBase = Math.min(catJ1.orden, catJ2.orden)
  if (catTorneo.orden > ordenBase) {
    const catBase = catJ1.orden <= catJ2.orden ? catJ1 : catJ2
    return `Pareja de ${catBase.nombre} inscribiendo en categoría inferior (${catTorneo.nombre})`
  }
  return null
}

export function PanelInscripcion({ torneoId, categorias, parejasIniciales }: Props) {
  const [catActiva, setCatActiva] = useState<string>(categorias[0]?.id ?? "")
  const [parejas, setParejas] = useState<Pareja[]>(parejasIniciales)
  const [jugador1, setJugador1] = useState<Jugador | null>(null)
  const [jugador2, setJugador2] = useState<Jugador | null>(null)
  const [crearModal, setCrearModal] = useState<CrearJugadorModal>(null)
  const { execute: inscribir, isPending } = useServerAction(inscribirParejaAction)

  const parejasCategoria = parejas.filter((p) => p.categoria_id === catActiva)
  const warning = jugador1 ? warningPareja(jugador1, jugador2, catActiva, categorias) : null

  async function handleInscribir() {
    if (!jugador1) return
    const [data, err] = await inscribir({
      torneo_id: torneoId,
      categoria_id: catActiva,
      jugador1_id: jugador1.id,
      jugador2_id: jugador2?.id ?? null,
      club_id: null,
    })
    if (!err && data) {
      setParejas((prev) => [
        ...prev,
        { id: data.id, jugador1, jugador2, categoria_id: catActiva },
      ])
      setJugador1(null)
      setJugador2(null)
    }
  }

  async function handleEliminar(parejaId: string) {
    // Optimistic remove — server action en Spec 2
    setParejas((prev) => prev.filter((p) => p.id !== parejaId))
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-8 pb-4" style={{ backgroundColor: "#0f172a" }}>
        <h1
          className="text-3xl uppercase text-white"
          style={{ fontFamily: "Anton, sans-serif" }}
        >
          Inscripción
        </h1>
      </div>

      {/* Tabs categorías */}
      <div
        className="flex gap-2 px-4 py-3 overflow-x-auto border-b"
        style={{ borderColor: "#e2e8f0", backgroundColor: "#ffffff" }}
      >
        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCatActiva(cat.id)}
            className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              backgroundColor: catActiva === cat.id ? "#0f172a" : "#f1f5f9",
              color: catActiva === cat.id ? "#bcff00" : "#64748b",
            }}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Formulario inscripción */}
        <div
          className="flex flex-col gap-3 p-4 rounded-xl border"
          style={{ borderColor: "#e2e8f0", backgroundColor: "#ffffff" }}
        >
          <p
            className="text-xs font-black uppercase tracking-widest"
            style={{ fontFamily: "Space Grotesk, sans-serif", color: "#64748b" }}
          >
            Agregar pareja
          </p>

          <div className="flex flex-col gap-2">
            <label className="field-label">Jugador 1</label>
            {jugador1 ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border" style={{ borderColor: "#e2e8f0" }}>
                <span className="text-sm font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#0f172a" }}>
                  {jugador1.nombre} {jugador1.apellido}
                </span>
                <button type="button" onClick={() => setJugador1(null)} className="text-slate-400 text-xs hover:text-slate-600">
                  ✕
                </button>
              </div>
            ) : (
              <JugadorSearch
                categoriaId={catActiva}
                categorias={categorias}
                onSelect={setJugador1}
                onCrear={(nombre) => setCrearModal({ slot: "jugador1", nombrePrefill: nombre })}
                placeholder="Buscar jugador 1..."
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="field-label">Jugador 2 (opcional)</label>
            {jugador2 ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border" style={{ borderColor: "#e2e8f0" }}>
                <span className="text-sm font-semibold" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#0f172a" }}>
                  {jugador2.nombre} {jugador2.apellido}
                </span>
                <button type="button" onClick={() => setJugador2(null)} className="text-slate-400 text-xs hover:text-slate-600">
                  ✕
                </button>
              </div>
            ) : (
              <JugadorSearch
                categoriaId={catActiva}
                categorias={categorias}
                onSelect={setJugador2}
                onCrear={(nombre) => setCrearModal({ slot: "jugador2", nombrePrefill: nombre })}
                placeholder="Buscar jugador 2..."
              />
            )}
          </div>

          {warning && (
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
              style={{ backgroundColor: "#fef3c7", color: "#92400e", fontFamily: "Space Grotesk, sans-serif" }}
            >
              <span>⚠️</span>
              <span>{warning}</span>
            </div>
          )}

          <button
            type="button"
            disabled={!jugador1 || isPending}
            onClick={handleInscribir}
            className="w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              backgroundColor: jugador1 && !isPending ? "#0f172a" : "#e2e8f0",
              color: jugador1 && !isPending ? "#bcff00" : "#94a3b8",
              cursor: jugador1 && !isPending ? "pointer" : "not-allowed",
            }}
          >
            {isPending ? "Inscribiendo..." : "Inscribir"}
          </button>
        </div>

        {/* Lista de parejas */}
        {parejasCategoria.length > 0 && (
          <div className="flex flex-col gap-2">
            <p
              className="text-xs font-black uppercase tracking-widest px-1"
              style={{ fontFamily: "Space Grotesk, sans-serif", color: "#64748b" }}
            >
              {parejasCategoria.length} pareja{parejasCategoria.length !== 1 ? "s" : ""}
            </p>
            {parejasCategoria.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-4 py-3 rounded-xl border"
                style={{ borderColor: "#e2e8f0", backgroundColor: "#ffffff" }}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: "Anton, sans-serif", color: "#0f172a", letterSpacing: "0.02em" }}
                  >
                    {i + 1}. {p.jugador1.nombre} {p.jugador1.apellido}
                  </span>
                  {p.jugador2 ? (
                    <span
                      className="text-sm"
                      style={{ fontFamily: "Space Grotesk, sans-serif", color: "#64748b" }}
                    >
                      {p.jugador2.nombre} {p.jugador2.apellido}
                    </span>
                  ) : (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full w-fit"
                      style={{ backgroundColor: "#fef3c7", color: "#92400e", fontFamily: "Space Grotesk, sans-serif" }}
                    >
                      Incompleta
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminar(p.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors text-sm"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear jugador — simplificado */}
      {crearModal && (
        <CrearJugadorModal
          nombrePrefill={crearModal.nombrePrefill}
          categoriaId={catActiva}
          categorias={categorias}
          onClose={() => setCrearModal(null)}
          onCreado={(jugador) => {
            if (crearModal.slot === "jugador1") setJugador1(jugador)
            else setJugador2(jugador)
            setCrearModal(null)
          }}
        />
      )}
    </div>
  )
}

function CrearJugadorModal({
  nombrePrefill,
  categoriaId,
  categorias,
  onClose,
  onCreado,
}: {
  nombrePrefill: string
  categoriaId: string
  categorias: Categoria[]
  onClose: () => void
  onCreado: (j: Jugador) => void
}) {
  const [nombre, setNombre] = useState(nombrePrefill.split(" ")[0] ?? "")
  const [apellido, setApellido] = useState(nombrePrefill.split(" ").slice(1).join(" ") ?? "")
  const [telefono, setTelefono] = useState("")
  const [catId, setCatId] = useState(categoriaId)
  const { execute, isPending } = useServerAction(crearJugadorAction)

  async function handleCrear() {
    const [data, err] = await execute({ nombre, apellido, telefono: telefono || null, categoria_id: catId })
    if (!err && data) onCreado(data as Jugador)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-6 flex flex-col gap-4">
        <p
          className="text-lg font-black uppercase"
          style={{ fontFamily: "Anton, sans-serif", color: "#0f172a" }}
        >
          Nuevo jugador
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="field-label">Nombre</label>
            <input type="text" className="field-input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="field-label">Apellido</label>
            <input type="text" className="field-input" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="field-label">Teléfono (opcional)</label>
          <input type="tel" className="field-input" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="field-label">Categoría natural</label>
          <select className="field-input" value={catId} onChange={(e) => setCatId(e.target.value)}>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border text-sm font-bold" style={{ borderColor: "#e2e8f0", color: "#0f172a", fontFamily: "Space Grotesk, sans-serif" }}>
            Cancelar
          </button>
          <button
            type="button"
            disabled={!nombre || !apellido || isPending}
            onClick={handleCrear}
            className="flex-1 py-3 rounded-xl text-sm font-bold"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              backgroundColor: nombre && apellido ? "#0f172a" : "#e2e8f0",
              color: nombre && apellido ? "#bcff00" : "#94a3b8",
            }}
          >
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  )
}
