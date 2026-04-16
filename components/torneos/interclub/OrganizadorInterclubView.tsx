"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import { MOCK_CATEGORIAS } from "./interclub-mock"
import { cerrarSesionVeedorAction, moverPartidoInterclubAction, swapPartidosInterclubAction } from "@/actions/partidos.actions"

// ─── Types ────────────────────────────────────────────────────────────────────

type PartidoFlat = {
  id: string
  categoria: string
  genero: "masc" | "dam" | "mixto"
  pairA: string
  pairB: string
  resultado: string | null
  ganador: "A" | "B" | null
  estado: "pendiente" | "en_vivo" | "finalizado"
  fecha: string
  hora: string
  sede: string
  cancha: number
}

// ─── Live row type (campos mutables de Supabase) ──────────────────────────────

export type OrganizadorLiveRow = {
  id:        string
  resultado: string | null
  ganador:   string | null
  estado:    string
  hora:      string | null
  cancha:    number | null
  fecha:     string | null
  sede:      string | null
}

// ─── Build partidos mergeando mock + live data ────────────────────────────────

function buildPartidos(liveRows: OrganizadorLiveRow[]): PartidoFlat[] {
  const liveMap = new Map(liveRows.map(r => [r.id, r]))
  return MOCK_CATEGORIAS.flatMap(cat =>
    cat.partidos.map(p => {
      const live = liveMap.get(p.id)
      return {
        id:        p.id,
        categoria: cat.nombre,
        genero:    cat.genero,
        pairA:     p.pairA,
        pairB:     p.pairB,
        resultado: live?.resultado ?? p.resultado,
        ganador:   (live?.ganador  ?? p.ganador) as "A" | "B" | null,
        estado:    (live?.estado   ?? p.estado)  as PartidoFlat["estado"],
        fecha:     live?.fecha     ?? p.fecha      ?? "2026-04-17",
        hora:      live?.hora      ?? p.horaInicio ?? "10:00",
        sede:      live?.sede      ?? p.sede       ?? "Voleando",
        cancha:    live?.cancha    ?? p.cancha     ?? 1,
      }
    })
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FECHAS  = ["2026-04-17", "2026-04-18", "2026-04-19"]
const SEDES   = ["Voleando", "+ Pádel"]
const CANCHAS = [1, 2]
const HORAS   = ["10:00","11:30","13:00","14:30","15:00","15:30","16:30","17:00","18:30","20:00"]
const DIAS    = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]

const SEDE_COLOR: Record<string, string> = { "Voleando": "#0f172a", "+ Pádel": "#b45309" }
const SEDE_ABBR:  Record<string, string> = { "Voleando": "VOL",     "+ Pádel": "+P"      }

const GENERO_COLOR: Record<string, string> = { masc: "#64748b", dam: "#be185d", mixto: "#4338ca" }
const GENERO_LABEL: Record<string, string> = { masc: "Masc",    dam: "Dam",     mixto: "Mix"     }

function fmtFecha(f: string) {
  const d = new Date(f + "T12:00:00")
  return `${DIAS[d.getDay()]} ${d.getDate()} Abr`
}
function fmtFechaCorta(f: string) {
  const d = new Date(f + "T12:00:00")
  return `${DIAS[d.getDay()]} ${d.getDate()}`
}

function matchesSearch(p: PartidoFlat, q: string): boolean {
  if (!q.trim()) return true
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  const text  = `${p.pairA} ${p.pairB} ${p.categoria}`.toLowerCase()
  return terms.every(t => text.includes(t))
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

function FilterChip({
  active, onClick, children, activeColor, activeFg,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  activeColor?: string
  activeFg?: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px", borderRadius: 100, flexShrink: 0,
        border: active ? "none" : "1px solid #e2e8f0",
        background: active ? (activeColor ?? "#0f172a") : "#ffffff",
        color: active ? (activeFg ?? "#ffffff") : "#64748b",
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 10, fontWeight: 800,
        textTransform: "uppercase", letterSpacing: "0.06em",
        cursor: "pointer", transition: "all 150ms ease",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  )
}

// ─── Slot Grid ────────────────────────────────────────────────────────────────

function SlotGrid({
  partidos, movendoId, fecha, sede, onMover, onSwap,
}: {
  partidos:  PartidoFlat[]
  movendoId: string
  fecha:     string
  sede:      string
  onMover:   (hora: string, cancha: number) => void
  onSwap:    (idB: string) => void
}) {
  const moviendo = partidos.find(p => p.id === movendoId)!

  const ocupados = new Map<string, PartidoFlat>()
  for (const p of partidos) {
    if (p.id !== movendoId && p.fecha === fecha && p.sede === sede) {
      ocupados.set(`${p.hora}__${p.cancha}`, p)
    }
  }

  const isActual = (hora: string, cancha: number) =>
    moviendo.fecha === fecha && moviendo.sede === sede &&
    moviendo.hora === hora   && moviendo.cancha === cancha

  // Filtrar horas pasadas — siempre mostrar la hora actual del partido
  const ahora = new Date()
  const horasFiltradas = HORAS.filter(hora => {
    if (CANCHAS.some(c => isActual(hora, c))) return true   // siempre mostrar slot actual
    const slotTime = new Date(`${fecha}T${hora}:00`)
    return slotTime > ahora
  })

  // First name of each player in a pair: "Gómez / Ruiz" → ["Gómez", "Ruiz"]
  const pairNames = (pair: string) => pair.split(" / ").map(s => s.trim())

  if (horasFiltradas.length === 0) return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 32, color: "#cbd5e1", display: "block" }}>schedule</span>
      <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
        Todos los horarios de este día ya pasaron
      </p>
    </div>
  )

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { color: "#16a34a", bg: "#f0fdf4", border: "1.5px dashed #86efac", label: "Libre — mover acá" },
          { color: "#64748b", bg: "#f8fafc", border: "1.5px solid #e2e8f0",  label: "Pendiente — intercambiar" },
          { color: "#94a3b8", bg: "#f8fafc", border: "1px solid #f1f5f9",    label: "Bloqueado" },
        ].map(({ color, bg, border, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: bg, border, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 600, color }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Header canchas */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div style={{ width: 44, flexShrink: 0 }} />
        {CANCHAS.map(c => (
          <div key={c} style={{
            flex: 1, textAlign: "center",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 900, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>Cancha {c}</div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {horasFiltradas.map(hora => (
          <div key={hora} style={{ display: "flex", alignItems: "stretch", gap: 6 }}>
            <div style={{
              width: 44, flexShrink: 0, display: "flex", alignItems: "center",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 700, color: "#94a3b8",
            }}>{hora}</div>

            {CANCHAS.map(cancha => {
              const ocupante = ocupados.get(`${hora}__${cancha}`)
              const actual   = isActual(hora, cancha)

              // ── Slot actual del partido que estamos moviendo ──
              if (actual) return (
                <div key={cancha} style={{
                  flex: 1, minHeight: 68, borderRadius: 10,
                  border: "2px dashed #fbbf24", background: "#fffbeb",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 3, padding: "6px 4px",
                }}>
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 13, color: "#d97706", lineHeight: 1 }}>schedule</span>
                  <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.08em" }}>Actual</span>
                </div>
              )

              // ── Slot ocupado ──
              if (ocupante) {
                const canSwap = ocupante.estado === "pendiente"
                const isLive  = ocupante.estado === "en_vivo"
                const [pA1, pA2] = pairNames(ocupante.pairA)
                const [pB1, pB2] = pairNames(ocupante.pairB)

                if (canSwap) return (
                  <motion.button key={cancha} whileTap={{ scale: 0.96 }} onClick={() => onSwap(ocupante.id)}
                    style={{
                      flex: 1, minHeight: 68, borderRadius: 10,
                      border: "1.5px solid #cbd5e1", background: "#ffffff",
                      display: "flex", flexDirection: "column",
                      alignItems: "flex-start", justifyContent: "center",
                      padding: "6px 7px", gap: 2,
                      cursor: "pointer", WebkitTapHighlightColor: "transparent",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 2 }}>
                      <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 7, fontWeight: 900, color: GENERO_COLOR[ocupante.genero], textTransform: "uppercase", letterSpacing: "0.06em" }}>{ocupante.categoria}</span>
                      <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 10, color: "#cbd5e1", lineHeight: 1 }}>swap_horiz</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 700, color: "#0f172a", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{pA1} · {pA2}</span>
                    <div style={{ height: 1, background: "#f1f5f9", width: "100%", margin: "1px 0" }} />
                    <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 700, color: "#0f172a", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{pB1} · {pB2}</span>
                  </motion.button>
                )

                // Bloqueado (en_vivo o finalizado)
                return (
                  <div key={cancha} style={{
                    flex: 1, minHeight: 68, borderRadius: 10,
                    border: isLive ? "1.5px solid #bcff00" : "1px solid #f1f5f9",
                    background: isLive ? "#f0fdf4" : "#f8fafc",
                    display: "flex", flexDirection: "column",
                    alignItems: "flex-start", justifyContent: "center",
                    padding: "6px 7px", gap: 2,
                    opacity: 0.65,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 2 }}>
                      <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 7, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{ocupante.categoria}</span>
                      {isLive
                        ? <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 10, color: "#16a34a", lineHeight: 1 }}>sports_tennis</span>
                        : <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 10, color: "#22c55e", lineHeight: 1, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      }
                    </div>
                    <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 700, color: "#94a3b8", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{pA1} · {pA2}</span>
                    <div style={{ height: 1, background: "#e2e8f0", width: "100%", margin: "1px 0" }} />
                    <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 700, color: "#94a3b8", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{pB1} · {pB2}</span>
                  </div>
                )
              }

              // ── Slot libre ──
              return (
                <motion.button key={cancha} whileTap={{ scale: 0.95 }} onClick={() => onMover(hora, cancha)} style={{
                  flex: 1, minHeight: 68, borderRadius: 10,
                  border: "1.5px dashed #86efac", background: "#f0fdf4",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 3,
                  cursor: "pointer", WebkitTapHighlightColor: "transparent",
                }}>
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#16a34a", lineHeight: 1 }}>add</span>
                  <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.08em" }}>Libre</span>
                </motion.button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Mover Sheet ──────────────────────────────────────────────────────────────

type Confirmacion =
  | { tipo: "mover"; hora: string; cancha: number; fecha: string; sede: string }
  | { tipo: "swap";  idB: string; partidoB: PartidoFlat }

function MoverSheet({
  partido, partidos, onClose, onMover, onSwap,
}: {
  partido:  PartidoFlat
  partidos: PartidoFlat[]
  onClose:  () => void
  onMover:  (id: string, hora: string, cancha: number, fecha: string, sede: string) => void
  onSwap:   (idA: string, idB: string) => void
}) {
  const [fecha,        setFecha]       = useState(partido.fecha)
  const [sede,         setSede]        = useState(partido.sede)
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)

  const handleMover = (hora: string, cancha: number) =>
    setConfirmacion({ tipo: "mover", hora, cancha, fecha, sede })

  const handleSwap = (idB: string) => {
    const partidoB = partidos.find(p => p.id === idB)!
    setConfirmacion({ tipo: "swap", idB, partidoB })
  }

  const confirmar = () => {
    if (!confirmacion) return
    if (confirmacion.tipo === "mover") {
      onMover(partido.id, confirmacion.hora, confirmacion.cancha, confirmacion.fecha, confirmacion.sede)
    } else {
      onSwap(partido.id, confirmacion.idB)
    }
    setConfirmacion(null)
  }

  return (
    <AnimatePresence>
      <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.55)" }}
      />
      <motion.div key="sh"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301,
          background: "#ffffff", borderRadius: "20px 20px 0 0",
          maxHeight: "92dvh", display: "flex", flexDirection: "column",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>

        {/* Partido que se mueve */}
        <div style={{ padding: "8px 20px 14px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span style={{ display: "inline-flex", alignItems: "center", background: SEDE_COLOR[partido.sede] ?? "#0f172a", color: "#fff", padding: "2px 7px", borderRadius: 4, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, textTransform: "uppercase" }}>
              {SEDE_ABBR[partido.sede] ?? partido.sede}
            </span>
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#0f172a" }}>C{partido.cancha} · {partido.hora}</span>
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 700, color: "#94a3b8" }}>{fmtFecha(partido.fecha)}</span>
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: GENERO_COLOR[partido.genero], textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {partido.categoria} · {GENERO_LABEL[partido.genero]}
            </span>
          </div>
          <div>
            <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 15, color: "#0f172a", textTransform: "uppercase", lineHeight: 1.2 }}>{partido.pairA}</span>
            <span style={{ display: "block", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.1em", margin: "2px 0" }}>vs</span>
            <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 15, color: "#0f172a", textTransform: "uppercase", lineHeight: 1.2 }}>{partido.pairB}</span>
          </div>
        </div>

        {/* Fecha + Sede selectors */}
        <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {FECHAS.map(f => (
              <button key={f} onClick={() => setFecha(f)} style={{
                flex: 1, padding: "7px 0", borderRadius: 8, border: "none",
                background: fecha === f ? "#0f172a" : "#f1f5f9",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 9, fontWeight: 800,
                color: fecha === f ? "#bcff00" : "#64748b",
                textTransform: "uppercase", letterSpacing: "0.06em",
                cursor: "pointer", transition: "all 150ms ease",
                WebkitTapHighlightColor: "transparent",
              }}>{fmtFechaCorta(f)}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {SEDES.map(s => (
              <button key={s} onClick={() => setSede(s)} style={{
                flex: 1, padding: "8px 0", borderRadius: 8,
                border: sede === s ? `2px solid ${SEDE_COLOR[s]}` : "1.5px solid #e2e8f0",
                background: sede === s ? `${SEDE_COLOR[s]}10` : "transparent",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10, fontWeight: 800,
                color: sede === s ? (SEDE_COLOR[s] ?? "#0f172a") : "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.06em",
                cursor: "pointer", transition: "all 150ms ease",
                WebkitTapHighlightColor: "transparent",
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Grid unificado */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
          <SlotGrid
            partidos={partidos}
            movendoId={partido.id}
            fecha={fecha}
            sede={sede}
            onMover={handleMover}
            onSwap={handleSwap}
          />
        </div>

        {/* ── Overlay de confirmación ── */}
        <AnimatePresence>
          {confirmacion && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              style={{
                position: "absolute", inset: 0, zIndex: 10,
                background: "rgba(255,255,255,0.97)",
                backdropFilter: "blur(4px)",
                borderRadius: "20px 20px 0 0",
                display: "flex", flexDirection: "column",
                padding: "24px 24px 32px",
                paddingBottom: "max(32px, env(safe-area-inset-bottom, 32px))",
              }}
            >
              {/* Tipo de acción */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: confirmacion.tipo === "mover" ? "#f0fdf4" : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: confirmacion.tipo === "mover" ? "#16a34a" : "#0f172a", lineHeight: 1 }}>
                    {confirmacion.tipo === "mover" ? "schedule" : "swap_horiz"}
                  </span>
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    {confirmacion.tipo === "mover" ? "Mover partido" : "Intercambiar slots"}
                  </p>
                  <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#94a3b8", margin: 0 }}>
                    Confirmá antes de aplicar
                  </p>
                </div>
              </div>

              {confirmacion.tipo === "mover" ? (
                /* ── Resumen mover ── */
                <div style={{ flex: 1 }}>
                  {/* De */}
                  <div style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
                    <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>De</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ background: SEDE_COLOR[partido.sede] ?? "#0f172a", color: "#fff", padding: "2px 6px", borderRadius: 3, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, textTransform: "uppercase" }}>{SEDE_ABBR[partido.sede]}</span>
                      <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#0f172a" }}>C{partido.cancha} · {partido.hora}</span>
                      <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>{fmtFechaCorta(partido.fecha)}</span>
                    </div>
                  </div>
                  {/* Flecha */}
                  <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: "#cbd5e1", lineHeight: 1 }}>arrow_downward</span>
                  </div>
                  {/* A */}
                  <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
                    <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>A</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ background: SEDE_COLOR[confirmacion.sede] ?? "#0f172a", color: "#fff", padding: "2px 6px", borderRadius: 3, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, textTransform: "uppercase" }}>{SEDE_ABBR[confirmacion.sede] ?? confirmacion.sede}</span>
                      <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#0f172a" }}>C{confirmacion.cancha} · {confirmacion.hora}</span>
                      <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>{fmtFechaCorta(confirmacion.fecha)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Resumen swap ── */
                <div style={{ flex: 1 }}>
                  {[
                    { p: partido,               label: "Partido A" },
                    { p: confirmacion.partidoB, label: "Partido B" },
                  ].map(({ p, label }, i) => (
                    <div key={label}>
                      <div style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 14px" }}>
                        <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px" }}>{label}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ background: SEDE_COLOR[p.sede] ?? "#0f172a", color: "#fff", padding: "2px 6px", borderRadius: 3, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, textTransform: "uppercase" }}>{SEDE_ABBR[p.sede]}</span>
                          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#0f172a" }}>C{p.cancha} · {p.hora}</span>
                          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#94a3b8" }}>{fmtFechaCorta(p.fecha)}</span>
                        </div>
                        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}>{p.categoria}</span>
                        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#64748b", display: "block", marginTop: 1 }}>{p.pairA} vs {p.pairB}</span>
                      </div>
                      {i === 0 && (
                        <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
                          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: "#cbd5e1", lineHeight: 1 }}>swap_vert</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div style={{ height: 16 }} />
                </div>
              )}

              {/* Botones */}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setConfirmacion(null)} style={{
                  flex: 1, padding: "13px 0", borderRadius: 12,
                  border: "1.5px solid #e2e8f0", background: "transparent",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, fontWeight: 800, color: "#64748b",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  cursor: "pointer", WebkitTapHighlightColor: "transparent",
                }}>Cancelar</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={confirmar} style={{
                  flex: 2, padding: "13px 0", borderRadius: 12,
                  border: "none", background: "#0f172a",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, fontWeight: 800, color: "#bcff00",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  cursor: "pointer", WebkitTapHighlightColor: "transparent",
                }}>Confirmar</motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Partido Card ─────────────────────────────────────────────────────────────

function PartidoCard({
  partido, onMover, isConflicto,
}: {
  partido:     PartidoFlat
  onMover:     () => void
  isConflicto: boolean
}) {
  const isLive  = partido.estado === "en_vivo"
  const isFin   = partido.estado === "finalizado"
  const canMove = !isFin

  return (
    <div style={{
      background: isConflicto ? "#fff7ed" : "#ffffff",
      border: isConflicto
        ? "1.5px solid #f97316"
        : isLive ? "1.5px solid #bcff00" : "1px solid #f1f5f9",
      borderRadius: 12,
      padding: "11px 14px",
      opacity: isFin ? 0.55 : 1,
      transition: "opacity 200ms",
    }}>

      {/* Fila 1: sede + cancha + hora + fecha + estado/conflicto */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <span style={{
          display: "inline-flex", alignItems: "center",
          background: SEDE_COLOR[partido.sede] ?? "#0f172a", color: "#fff",
          padding: "2px 6px", borderRadius: 3,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0,
        }}>{SEDE_ABBR[partido.sede] ?? partido.sede}</span>
        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 700, color: "#0f172a" }}>
          C{partido.cancha} · {partido.hora}
        </span>
        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 600, color: "#94a3b8" }}>
          {fmtFechaCorta(partido.fecha)}
        </span>

        {isConflicto && (
          <span style={{
            marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3,
            background: "#f97316", color: "#fff",
            padding: "2px 8px", borderRadius: 100,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900, textTransform: "uppercase",
          }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 10, lineHeight: 1 }}>warning</span>
            Conflicto
          </span>
        )}
        {!isConflicto && isLive && (
          <span style={{
            marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4,
            background: "#bcff00", color: "#000",
            padding: "2px 8px", borderRadius: 100,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900, textTransform: "uppercase",
          }}>
            <span className="live-dot" style={{ width: 4, height: 4, borderRadius: "50%", background: "#000", flexShrink: 0 }} />
            En Vivo
          </span>
        )}
        {!isConflicto && isFin && (
          <span style={{ marginLeft: "auto", fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#22c55e", lineHeight: 1, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        )}
      </div>

      {/* Fila 2: categoría + género */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {partido.categoria}
        </span>
        <span style={{
          display: "inline-flex",
          background: `${GENERO_COLOR[partido.genero]}14`,
          color: GENERO_COLOR[partido.genero],
          padding: "1px 6px", borderRadius: 4,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 7, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em",
        }}>{GENERO_LABEL[partido.genero]}</span>
      </div>

      {/* Fila 3: parejas */}
      <div style={{ marginBottom: canMove ? 10 : 0 }}>
        <span style={{ display: "block", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{partido.pairA}</span>
        <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
        <span style={{ display: "block", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{partido.pairB}</span>
        {isFin && partido.resultado && (
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 600, color: "#94a3b8", display: "block", marginTop: 3 }}>{partido.resultado}</span>
        )}
      </div>

      {canMove && (
        <button onClick={onMover} style={{
          width: "100%", padding: "8px 0", borderRadius: 8,
          border: isConflicto ? "1.5px solid #f97316" : isLive ? "1.5px solid #bcff00" : "1.5px solid #e2e8f0",
          background: isConflicto ? "rgba(249,115,22,0.06)" : isLive ? "rgba(188,255,0,0.06)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 800,
          color: isConflicto ? "#c2410c" : isLive ? "#4d6a00" : "#64748b",
          textTransform: "uppercase", letterSpacing: "0.08em",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 13, lineHeight: 1 }}>schedule</span>
          {isConflicto ? "Resolver conflicto" : "Mover partido"}
        </button>
      )}
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function OrganizadorInterclubView({ initialLiveData = [] }: { initialLiveData?: OrganizadorLiveRow[] }) {
  const router = useRouter()
  const [partidos, setPartidos]         = useState<PartidoFlat[]>(() => buildPartidos(initialLiveData))
  const [moviendoId, setMoviendoId]     = useState<string | null>(null)
  const [search, setSearch]             = useState("")
  const [selSede, setSelSede]           = useState<string | null>(null)
  const [selGenero, setSelGenero]       = useState<string | null>(null)
  const [selFecha, setSelFecha]         = useState<string | null>(null)
  const [selCat, setSelCat]             = useState<string | null>(null)
  const [showFinalizados, setShowFin]   = useState(false)
  const [, startSalir]                  = useTransition()

  const moviendoPartido = moviendoId ? (partidos.find(p => p.id === moviendoId) ?? null) : null

  // Categorías únicas
  const categorias = useMemo(() =>
    [...new Set(MOCK_CATEGORIAS.map(c => c.nombre))].sort()
  , [])

  // Conflictos de slot
  const conflictos = useMemo(() => {
    const slotMap = new Map<string, string[]>()
    for (const p of partidos) {
      const key = `${p.sede}__${p.fecha}__${p.cancha}__${p.hora}`
      if (!slotMap.has(key)) slotMap.set(key, [])
      slotMap.get(key)!.push(p.id)
    }
    const ids = new Set<string>()
    for (const group of slotMap.values()) {
      if (group.length > 1) group.forEach(id => ids.add(id))
    }
    return ids
  }, [partidos])

  // Partidos filtrados
  const filtered = useMemo(() => {
    let list = partidos
    if (selSede)    list = list.filter(p => p.sede === selSede)
    if (selGenero)  list = list.filter(p => p.genero === selGenero)
    if (selFecha)   list = list.filter(p => p.fecha === selFecha)
    if (selCat)     list = list.filter(p => p.categoria === selCat)
    if (search.trim()) list = list.filter(p => matchesSearch(p, search))
    return list
  }, [partidos, selSede, selGenero, selFecha, selCat, search])

  const sort = (list: PartidoFlat[]) =>
    [...list].sort((a, b) =>
      a.fecha.localeCompare(b.fecha) ||
      a.hora.localeCompare(b.hora)   ||
      a.sede.localeCompare(b.sede)   ||
      a.cancha - b.cancha
    )

  const active      = sort(filtered.filter(p => p.estado !== "finalizado"))
  const finalizados = sort(filtered.filter(p => p.estado === "finalizado"))

  // Activos agrupados por fecha
  const activeByFecha = FECHAS.map(f => ({
    fecha:    f,
    partidos: active.filter(p => p.fecha === f),
  })).filter(g => g.partidos.length > 0)

  // Stats
  const enVivo     = partidos.filter(p => p.estado === "en_vivo").length
  const pendientes = partidos.filter(p => p.estado === "pendiente").length
  const nFin       = partidos.filter(p => p.estado === "finalizado").length

  const hasFilters = !!(selSede || selGenero || selFecha || selCat || search.trim())

  const clearFilters = () => {
    setSearch(""); setSelSede(null); setSelGenero(null)
    setSelFecha(null); setSelCat(null)
  }

  const mover = (id: string, hora: string, cancha: number, fecha: string, sede: string) => {
    setPartidos(prev => prev.map(p => p.id === id ? { ...p, hora, cancha, fecha, sede } : p))
    setMoviendoId(null)
    moverPartidoInterclubAction({ id, hora, cancha, fecha, sede })
  }

  const swap = (idA: string, idB: string) => {
    setPartidos(prev => {
      const a = prev.find(p => p.id === idA)!
      const b = prev.find(p => p.id === idB)!
      swapPartidosInterclubAction({
        idA, horaA: b.hora, canchaA: b.cancha, fechaA: b.fecha, sedeA: b.sede,
        idB, horaB: a.hora, canchaB: a.cancha, fechaB: a.fecha, sedeB: a.sede,
      })
      return prev.map(p => {
        if (p.id === idA) return { ...p, hora: b.hora, cancha: b.cancha, fecha: b.fecha, sede: b.sede }
        if (p.id === idB) return { ...p, hora: a.hora, cancha: a.cancha, fecha: a.fecha, sede: a.sede }
        return p
      })
    })
    setMoviendoId(null)
  }

  const handleSalir = () => {
    startSalir(async () => {
      await cerrarSesionVeedorAction({ club: "organizador" })
      router.push("/veedor/organizador/login")
    })
  }

  const PAGE_BG = "radial-gradient(ellipse at 0% 100%, rgba(188,255,0,0.18) 0%, transparent 60%), radial-gradient(ellipse at 100% 0%, rgba(180,83,9,0.12) 0%, transparent 55%), #f8fafc"

  return (
    <div style={{ background: "#f8fafc", minHeight: "100dvh" }}>

      {/* ── Header ── */}
      <div style={{
        background: PAGE_BG,
        padding: "16px 20px 20px",
        paddingTop: "max(16px, env(safe-area-inset-top))",
        borderBottom: "1px solid #e2e8f0",
        position: "relative", overflow: "hidden",
      }}>
        <div aria-hidden style={{ position: "absolute", left: -20, bottom: -20, pointerEvents: "none", opacity: 0.06, zIndex: 0 }}>
          <Image src="/clubes/voleando.logo.png" alt="" width={160} height={160} style={{ objectFit: "contain" }} />
        </div>
        <div aria-hidden style={{ position: "absolute", right: -20, bottom: -20, pointerEvents: "none", opacity: 0.06, zIndex: 0 }}>
          <Image src="/clubes/mas-padel.logo.png" alt="" width={160} height={160} style={{ objectFit: "contain" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={() => router.push("/torneos/123/interclub")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", WebkitTapHighlightColor: "transparent" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>arrow_back</span>
            Torneo
          </button>
          <button onClick={handleSalir} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", WebkitTapHighlightColor: "transparent" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>logout</span>
            Salir
          </button>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", background: "#0f172a", borderRadius: 3, padding: "4px 10px", marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: "#bcff00", textTransform: "uppercase", letterSpacing: "0.14em" }}>Organizador</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 28, fontWeight: 400, lineHeight: 1, color: "#0f172a", textTransform: "uppercase", margin: "0 0 2px" }}>Cristian</h1>
          <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            Torneo Interclubes · Abr 2026
          </p>
        </div>

        {/* Stats */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 8, marginTop: 16 }}>
          {[
            { label: "Total",      value: partidos.length,    color: "#0f172a", live: false },
            { label: "En Vivo",    value: enVivo,             color: "#16a34a", live: true  },
            { label: "Pendientes", value: pendientes,         color: "#64748b", live: false },
            { label: "Finaliz.",   value: nFin,               color: "#94a3b8", live: false },
            ...(conflictos.size > 0 ? [{ label: "Conflictos", value: conflictos.size, color: "#ea580c", live: false }] : []),
          ].map(({ label, value, color, live }) => (
            <div key={label} style={{ flex: 1, background: label === "Conflictos" ? "#fff7ed" : "#ffffff", borderRadius: 10, padding: "8px 10px", border: label === "Conflictos" ? "1px solid #fdba74" : "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                {live && <span className="live-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />}
                <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 20, lineHeight: 1, color }}>{value}</span>
              </div>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky search + filters ── */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "rgba(248,250,252,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        paddingTop: 10,
      }}>
        {/* Search */}
        <div style={{ padding: "0 16px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "9px 12px" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1 }}>search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por jugador o categoría..."
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#94a3b8", lineHeight: 1 }}>close</span>
              </button>
            )}
          </div>
        </div>

        {/* Chips: fechas · sede · género */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "0 16px 10px", scrollbarWidth: "none", alignItems: "center" }}>
          {FECHAS.map(f => (
            <FilterChip key={f} active={selFecha === f} onClick={() => setSelFecha(selFecha === f ? null : f)}
              activeColor="#0f172a" activeFg="#bcff00">
              {fmtFechaCorta(f)}
            </FilterChip>
          ))}

          <div style={{ width: 1, alignSelf: "stretch", background: "#e2e8f0", flexShrink: 0, margin: "2px 4px" }} />

          {SEDES.map(s => (
            <FilterChip key={s} active={selSede === s} onClick={() => setSelSede(selSede === s ? null : s)}
              activeColor={SEDE_COLOR[s]} activeFg={s === "Voleando" ? "#bcff00" : "#ffffff"}>
              {SEDE_ABBR[s]}
            </FilterChip>
          ))}

          <div style={{ width: 1, alignSelf: "stretch", background: "#e2e8f0", flexShrink: 0, margin: "2px 4px" }} />

          {(["masc", "dam", "mixto"] as const).map(g => (
            <FilterChip key={g} active={selGenero === g} onClick={() => setSelGenero(selGenero === g ? null : g)}
              activeColor={GENERO_COLOR[g]}>
              {GENERO_LABEL[g]}
            </FilterChip>
          ))}
        </div>

        {/* Chips: categorías */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "0 16px 10px", scrollbarWidth: "none", alignItems: "center" }}>
          {categorias.map(cat => (
            <FilterChip key={cat} active={selCat === cat} onClick={() => setSelCat(selCat === cat ? null : cat)}>
              {cat}
            </FilterChip>
          ))}
          {hasFilters && (
            <>
              <div style={{ width: 1, alignSelf: "stretch", background: "#e2e8f0", flexShrink: 0, margin: "2px 4px" }} />
              <FilterChip active={false} onClick={clearFilters} activeColor="#ef4444">
                Limpiar
              </FilterChip>
            </>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "14px 14px 80px" }}>

        {/* Activos por fecha */}
        {activeByFecha.map(({ fecha, partidos: pList }, gi) => (
          <div key={fecha} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 20, fontWeight: 400, lineHeight: 1, color: "#0f172a", textTransform: "uppercase" }}>
                {fmtFecha(fecha)}
              </span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {pList.length} partidos
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pList.map((p, idx) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.03 + idx * 0.01, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                >
                  <PartidoCard partido={p} onMover={() => setMoviendoId(p.id)} isConflicto={conflictos.has(p.id)} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {/* Finalizados — al fondo, expandible */}
        {finalizados.length > 0 && (
          <>
            <button
              onClick={() => setShowFin(v => !v)}
              style={{
                width: "100%", padding: "14px", background: "none", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 12, fontWeight: 700, color: "#94a3b8",
                borderTop: activeByFecha.length > 0 ? "1px solid #f1f5f9" : "none",
              }}
            >
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1, transform: showFinalizados ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms cubic-bezier(0.23,1,0.32,1)" }}>expand_more</span>
              {showFinalizados ? "Ocultar" : "Ver"} finalizados · {finalizados.length}
            </button>

            {showFinalizados && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 20, height: 1, background: "#e2e8f0" }} />
                  <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 900, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Finalizados · {finalizados.length}
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {finalizados.map((p, idx) => (
                    <motion.div key={p.id}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.01, duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <PartidoCard partido={p} onMover={() => setMoviendoId(p.id)} isConflicto={conflictos.has(p.id)} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, color: "#cbd5e1", display: "block" }}>sports_tennis</span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
              {search.trim() ? `Sin resultados para "${search}"` : "Sin partidos con estos filtros"}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} style={{ marginTop: 12, background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Mover Sheet ── */}
      {moviendoPartido && (
        <MoverSheet
          partido={moviendoPartido}
          partidos={partidos}
          onClose={() => setMoviendoId(null)}
          onMover={mover}
          onSwap={swap}
        />
      )}

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  )
}
