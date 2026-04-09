"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import { actualizarResultadoAction } from "@/actions/partidos.actions"

interface Pareja {
  jugador1: { nombre: string; apellido: string } | null
  jugador2: { nombre: string; apellido: string } | null
}

function nombrePareja(p: Pareja | null) {
  if (!p) return "—"
  const j1 = p.jugador1?.apellido ?? ""
  const j2 = p.jugador2?.apellido ?? ""
  return [j1, j2].filter(Boolean).join(" / ") || "—"
}

type SetScore = { p1: number; p2: number }

export function ResultadoSheet({
  partido,
  onClose,
}: {
  partido: { id: string; pareja1: Pareja | null; pareja2: Pareja | null } | null
  onClose: () => void
}) {
  const [sets, setSets] = useState<SetScore[]>([{ p1: 0, p2: 0 }])
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const sets1 = sets.filter(s => s.p1 > s.p2).length
  const sets2 = sets.filter(s => s.p2 > s.p1).length
  const hayGanador = sets1 !== sets2 && (sets1 === 2 || sets2 === 2)

  function updateSet(i: number, side: "p1" | "p2", val: number) {
    setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [side]: Math.max(0, Math.min(99, val)) } : s))
  }

  function addSet() {
    if (sets.length < 3) setSets(prev => [...prev, { p1: 0, p2: 0 }])
  }

  function removeSet(i: number) {
    if (sets.length <= 1) return
    setSets(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleGuardar = () => {
    if (!partido) return
    if (sets1 === sets2) { setError("No puede terminar empatado"); return }
    setError(null)
    startTransition(async () => {
      const [, err] = await actualizarResultadoAction({ partidoId: partido.id, sets })
      if (err) { setError(err.message); return }
      onClose()
    })
  }

  return (
    <AnimatePresence>
      {partido && (
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
              position: "fixed", bottom: 0, left: 0, right: 0,
              zIndex: 70,
              background: "#fff", borderRadius: "20px 20px 0 0",
              padding: "20px 20px 40px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
            }}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 20px" }} />

            <h3 style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 20, fontWeight: 400, color: "#0f172a",
              textTransform: "uppercase", margin: "0 0 4px",
            }}>
              Cargar Resultado
            </h3>

            {/* Equipos */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                {nombrePareja(partido.pareja1)}
              </span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, color: "#cbd5e1", fontWeight: 700 }}>vs</span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#64748b", textAlign: "right" }}>
                {nombrePareja(partido.pareja2)}
              </span>
            </div>

            {/* Header columnas */}
            <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 28px 1fr 28px", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div />
              <span style={{ textAlign: "center", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {nombrePareja(partido.pareja1).split(" / ")[0]}
              </span>
              <div />
              <span style={{ textAlign: "center", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {nombrePareja(partido.pareja2).split(" / ")[0]}
              </span>
              <div />
            </div>

            {/* Sets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {sets.map((s, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 28px 1fr 28px", alignItems: "center", gap: 6 }}>
                  {/* Label set */}
                  <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textAlign: "center", textTransform: "uppercase" }}>
                    S{i + 1}
                  </span>

                  {/* P1 */}
                  <input
                    type="number"
                    inputMode="numeric"
                    value={s.p1}
                    onChange={e => updateSet(i, "p1", parseInt(e.target.value) || 0)}
                    style={{
                      textAlign: "center",
                      fontFamily: "var(--font-anton), Anton, sans-serif",
                      fontSize: 28, fontWeight: 400,
                      color: s.p1 > s.p2 ? "#0f172a" : "#94a3b8",
                      background: s.p1 > s.p2 ? "#f0fdf4" : "#f8fafc",
                      border: `1.5px solid ${s.p1 > s.p2 ? "#22c55e" : "#e2e8f0"}`,
                      borderRadius: 10, padding: "10px 0",
                      outline: "none", width: "100%",
                      WebkitAppearance: "none", MozAppearance: "textfield",
                    }}
                  />

                  {/* Guión */}
                  <span style={{ textAlign: "center", fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 18, color: "#cbd5e1" }}>—</span>

                  {/* P2 */}
                  <input
                    type="number"
                    inputMode="numeric"
                    value={s.p2}
                    onChange={e => updateSet(i, "p2", parseInt(e.target.value) || 0)}
                    style={{
                      textAlign: "center",
                      fontFamily: "var(--font-anton), Anton, sans-serif",
                      fontSize: 28, fontWeight: 400,
                      color: s.p2 > s.p1 ? "#0f172a" : "#94a3b8",
                      background: s.p2 > s.p1 ? "#f0fdf4" : "#f8fafc",
                      border: `1.5px solid ${s.p2 > s.p1 ? "#22c55e" : "#e2e8f0"}`,
                      borderRadius: 10, padding: "10px 0",
                      outline: "none", width: "100%",
                      WebkitAppearance: "none", MozAppearance: "textfield",
                    }}
                  />

                  {/* Borrar set */}
                  <button
                    onClick={() => removeSet(i)}
                    disabled={sets.length <= 1}
                    style={{
                      background: "none", border: "none", padding: 0, cursor: sets.length > 1 ? "pointer" : "default",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: sets.length > 1 ? 1 : 0,
                    }}
                  >
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1 }}>close</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Agregar set */}
            {sets.length < 3 && (
              <button
                onClick={addSet}
                style={{
                  width: "100%", padding: "10px",
                  border: "1.5px dashed #e2e8f0", borderRadius: 10,
                  background: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, fontWeight: 700, color: "#94a3b8",
                  marginBottom: 16,
                }}
              >
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>add</span>
                Agregar set
              </button>
            )}

            {/* Resultado derivado */}
            {(sets1 > 0 || sets2 > 0) && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                padding: "10px 16px", borderRadius: 10,
                background: hayGanador ? "#f0fdf4" : "#f8fafc",
                border: `1px solid ${hayGanador ? "#86efac" : "#e2e8f0"}`,
                marginBottom: 16,
              }}>
                <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 28, color: "#0f172a" }}>{sets1}</span>
                <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>SETS</span>
                <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 28, color: "#0f172a" }}>{sets2}</span>
                {hayGanador && (
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: "#22c55e", lineHeight: 1 }}>check_circle</span>
                )}
              </div>
            )}

            {error && (
              <p style={{ fontSize: 12, color: "#ef4444", fontFamily: "var(--font-space-grotesk), sans-serif", marginBottom: 12, textAlign: "center" }}>
                {error}
              </p>
            )}

            {/* Botones */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "14px", borderRadius: 10,
                  border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <motion.button
                onClick={handleGuardar}
                disabled={pending || !hayGanador}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  flex: 2, padding: "14px", borderRadius: 10, border: "none",
                  background: pending || !hayGanador ? "#94a3b8" : "#0f172a",
                  color: "#fff",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900,
                  cursor: pending || !hayGanador ? "not-allowed" : "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                {pending ? "Guardando..." : "Guardar resultado"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
