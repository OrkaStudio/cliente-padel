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
  const j1 = p.jugador1 ? `${p.jugador1.apellido}` : ""
  const j2 = p.jugador2 ? p.jugador2.apellido : ""
  return [j1, j2].filter(Boolean).join(" / ") || "—"
}

export function ResultadoSheet({
  partido,
  onClose,
}: {
  partido: { id: string; pareja1: Pareja | null; pareja2: Pareja | null } | null
  onClose: () => void
}) {
  const [sets1, setSets1] = useState<number>(0)
  const [sets2, setSets2] = useState<number>(0)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleGuardar = () => {
    if (!partido) return
    if (sets1 === sets2) { setError("No puede terminar empatado"); return }
    setError(null)
    startTransition(async () => {
      const [, err] = await actualizarResultadoAction({
        partidoId: partido.id,
        sets_pareja1: sets1,
        sets_pareja2: sets2,
      })
      if (err) { setError(err.message); return }
      onClose()
    })
  }

  return (
    <AnimatePresence>
      {partido && (
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
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
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
              width: "100%", maxWidth: 430,
              zIndex: 70,
              background: "#fff",
              borderRadius: "20px 20px 0 0",
              padding: "20px 20px 40px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
            }}
          >
            {/* Handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: "#e2e8f0", margin: "0 auto 20px",
            }} />

            <h3 style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 20, fontWeight: 400, color: "#0f172a",
              textTransform: "uppercase", margin: "0 0 20px",
            }}>
              Cargar Resultado
            </h3>

            {/* Equipos + sets */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
              {/* Pareja 1 */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: "#64748b",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  margin: "0 0 8px", textAlign: "center",
                }}>
                  {nombrePareja(partido.pareja1)}
                </p>
                <SetInput value={sets1} onChange={setSets1} />
              </div>

              <span style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 22, color: "#cbd5e1", flexShrink: 0,
              }}>
                VS
              </span>

              {/* Pareja 2 */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: "#64748b",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  margin: "0 0 8px", textAlign: "center",
                }}>
                  {nombrePareja(partido.pareja2)}
                </p>
                <SetInput value={sets2} onChange={setSets2} />
              </div>
            </div>

            {error && (
              <p style={{
                fontSize: 12, color: "#ef4444",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                marginBottom: 12, textAlign: "center",
              }}>
                {error}
              </p>
            )}

            {/* Botones */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "14px",
                  borderRadius: 10, border: "1px solid #e2e8f0",
                  background: "#f8fafc", color: "#64748b",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Cancelar
              </button>
              <motion.button
                onClick={handleGuardar}
                disabled={pending}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  flex: 2, padding: "14px",
                  borderRadius: 10, border: "none",
                  background: pending ? "#94a3b8" : "#0f172a",
                  color: "#fff",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900,
                  cursor: pending ? "not-allowed" : "pointer",
                  WebkitTapHighlightColor: "transparent",
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

function SetInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{
          width: 36, height: 36, borderRadius: 8,
          border: "1px solid #e2e8f0", background: "#f8fafc",
          fontSize: 18, color: "#0f172a", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        −
      </button>
      <span style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 32, fontWeight: 400, color: "#0f172a",
        minWidth: 28, textAlign: "center",
      }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(3, value + 1))}
        style={{
          width: 36, height: 36, borderRadius: 8,
          border: "1px solid #e2e8f0", background: "#f8fafc",
          fontSize: 18, color: "#0f172a", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        +
      </button>
    </div>
  )
}
