"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { moverPartidoAction } from "@/actions/partidos.actions"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any
type Sede = { id: string; nombre: string; canchas_count: number; horario_inicio: string; horario_fin: string; duracion_turno: number }

function generarSlots(sede: Sede, horarioActual: string): string[] {
  const slots: string[] = []
  const base = new Date(horarioActual)
  const fecha = base.toISOString().slice(0, 10)
  const [hIni, mIni] = sede.horario_inicio.split(":").map(Number)
  const [hFin, mFin] = sede.horario_fin.split(":").map(Number)
  let minutos = (hIni ?? 0) * 60 + (mIni ?? 0)
  const finMinutos = (hFin ?? 0) * 60 + (mFin ?? 0)
  while (minutos < finMinutos) {
    const h = String(Math.floor(minutos / 60)).padStart(2, "0")
    const m = String(minutos % 60).padStart(2, "0")
    slots.push(`${fecha}T${h}:${m}:00-03:00`)
    minutos += sede.duracion_turno
  }
  return slots
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

function nombrePareja(p: { jugador1: { apellido: string } | null; jugador2: { apellido: string } | null } | null) {
  if (!p) return "—"
  return [p.jugador1?.apellido, p.jugador2?.apellido].filter(Boolean).join(" / ") || "—"
}

export function FixtureEditSheet({ partido, sede, todosPartidos, onClose }: {
  partido: Partido
  sede: Sede
  todosPartidos: Partido[]
  onClose: () => void
}) {
  const slots = generarSlots(sede, partido.horario)
  const canchas = Array.from({ length: sede.canchas_count }, (_, i) => i + 1)

  const [selHorario, setSelHorario] = useState<string>(partido.horario)
  const [selCancha, setSelCancha] = useState<number>(partido.cancha)
  const [, setConflicto] = useState<Partido | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Detectar conflicto localmente para UX inmediata
  const partidoEnDestino = todosPartidos.find(p =>
    p.id !== partido.id &&
    p.cancha === selCancha &&
    new Date(p.horario).toISOString().slice(0, 16) === new Date(selHorario).toISOString().slice(0, 16)
  )

  const hayConflicto = Boolean(partidoEnDestino)
  const sinCambios = selHorario === partido.horario && selCancha === partido.cancha

  const handleMover = () => {
    setError(null)
    startTransition(async () => {
      const [res, err] = await moverPartidoAction({
        partidoId: partido.id,
        nuevoHorario: selHorario,
        nuevaCancha: selCancha,
      })
      if (err) { setError(err.message); return }
      if (res?.conflicto) {
        setConflicto(todosPartidos.find(p => p.id === res.conflicto.partidoId) ?? null)
        return
      }
      router.refresh()
      onClose()
    })
  }

  const handleSwap = () => {
    if (!partidoEnDestino) return
    setError(null)
    startTransition(async () => {
      const [, err] = await moverPartidoAction({
        partidoId: partido.id,
        nuevoHorario: selHorario,
        nuevaCancha: selCancha,
        intercambiarCon: partidoEnDestino.id,
      })
      if (err) { setError(err.message); return }
      router.refresh()
      onClose()
    })
  }

  return (
    <AnimatePresence>
      <>
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 60,
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          }}
        />

        {/* Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: "fixed", bottom: 0, left: "50%",
            transform: "translateX(-50%)",
            width: "100%", maxWidth: 430, zIndex: 70,
            background: "#fff", borderRadius: "20px 20px 0 0",
            padding: "20px 20px 40px",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
            maxHeight: "85vh", overflowY: "auto",
          }}
        >
          {/* Handle */}
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 20px" }} />

          <h3 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 18, fontWeight: 400, color: "#0f172a",
            textTransform: "uppercase", margin: "0 0 4px",
          }}>
            Editar partido
          </h3>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, color: "#64748b", margin: "0 0 20px",
          }}>
            {nombrePareja(partido.pareja1)} vs {nombrePareja(partido.pareja2)}
          </p>

          {/* Selector de horario */}
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 900, color: "#64748b",
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
          }}>
            Horario
          </p>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
            {slots.map(slot => (
              <button
                key={slot}
                onClick={() => setSelHorario(slot)}
                style={{
                  padding: "8px 14px", borderRadius: 8, border: "none", flexShrink: 0,
                  background: selHorario === slot ? "#0f172a" : "#f1f5f9",
                  color: selHorario === slot ? "#fff" : "#64748b",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {formatHora(slot)}
              </button>
            ))}
          </div>

          {/* Selector de cancha */}
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 900, color: "#64748b",
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
          }}>
            Cancha
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {canchas.map(c => (
              <button
                key={c}
                onClick={() => setSelCancha(c)}
                style={{
                  width: 48, height: 48, borderRadius: 10, border: "none",
                  background: selCancha === c ? "#0f172a" : "#f1f5f9",
                  color: selCancha === c ? "#fff" : "#64748b",
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 20, fontWeight: 400, cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Aviso de conflicto */}
          {hayConflicto && !sinCambios && (
            <div style={{
              background: "#fef3c7", borderRadius: 10, border: "1px solid #fcd34d",
              padding: "12px 14px", marginBottom: 16,
            }}>
              <p style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 12, fontWeight: 700, color: "#92400e", margin: "0 0 4px",
              }}>
                ⚠ Ese slot ya tiene un partido
              </p>
              <p style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, color: "#92400e", margin: 0,
              }}>
                {nombrePareja(partidoEnDestino?.pareja1)} vs {nombrePareja(partidoEnDestino?.pareja2)}
              </p>
            </div>
          )}

          {error && (
            <p style={{
              fontSize: 12, color: "#ef4444",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              marginBottom: 12,
            }}>
              {error}
            </p>
          )}

          {/* Botones */}
          <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
            {hayConflicto && !sinCambios ? (
              <motion.button
                onClick={handleSwap}
                disabled={pending}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  padding: "14px", borderRadius: 10, border: "none",
                  background: pending ? "#94a3b8" : "#0f172a", color: "#fff",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900, cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {pending ? "Intercambiando..." : "↕ Intercambiar partidos"}
              </motion.button>
            ) : (
              <motion.button
                onClick={handleMover}
                disabled={pending || sinCambios}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  padding: "14px", borderRadius: 10, border: "none",
                  background: (pending || sinCambios) ? "#94a3b8" : "#0f172a",
                  color: "#fff",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900,
                  cursor: (pending || sinCambios) ? "not-allowed" : "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {pending ? "Moviendo..." : sinCambios ? "Sin cambios" : "Mover partido"}
              </motion.button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: "14px", borderRadius: 10, border: "1px solid #e2e8f0",
                background: "#f8fafc", color: "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}
