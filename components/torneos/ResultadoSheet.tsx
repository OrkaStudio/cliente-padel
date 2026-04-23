"use client"

import { useState, useTransition, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { actualizarResultadoAction } from "@/actions/partidos.actions"
import { Toast } from "@/components/ui/Toast"

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

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Flecha abajo (-) */}
      <button
        onClick={() => onChange(value - 1)}
        disabled={value === 0}
        style={{
          width: 44, height: 48, borderRadius: 12,
          border: "1px solid #e2e8f0", background: "#f8fafc",
          cursor: value === 0 ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: value === 0 ? 0.4 : 1,
          pointerEvents: value === 0 ? "none" : "auto",
          WebkitTapHighlightColor: "transparent", flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 24, color: "#64748b", lineHeight: 1 }}>
          remove
        </span>
      </button>

      {/* Número */}
      <span style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 36, fontWeight: 400, color: "#0f172a",
        lineHeight: 1, minWidth: 28, textAlign: "center",
      }}>
        {value}
      </span>

      {/* Flecha arriba (+) MASIVA */}
      <button
        onClick={() => onChange(value + 1)}
        style={{
          width: 56, height: 48, borderRadius: 12,
          border: "none", background: "#0f172a",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          WebkitTapHighlightColor: "transparent", flexShrink: 0,
          boxShadow: "0 4px 12px rgba(15,23,42,0.15)",
        }}
      >
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 28, color: "#bcff00", lineHeight: 1 }}>
          add
        </span>
      </button>
    </div>
  )
}

function SetRow({
  label,
  value,
  onChange,
  nombre1,
  nombre2,
}: {
  label: string
  value: SetScore
  onChange: (s: SetScore) => void
  nombre1: string
  nombre2: string
}) {
  const ganador = value.p1 > value.p2 ? nombre1.split(" / ")[0] : value.p2 > value.p1 ? nombre2.split(" / ")[0] : null

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 11, color: "#94a3b8", margin: 0, letterSpacing: "0.08em",
        }}>
          {label}
        </p>
        {ganador && (
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 900, color: "#15803d",
            background: "#f0fdf4", padding: "2px 8px", borderRadius: 4,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Gana {ganador}
          </span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", alignItems: "center", gap: 8 }}>
        {/* P1 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 900, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {nombre1.split(" / ")[0]}
          </span>
          <Stepper value={value.p1} onChange={v => onChange({ ...value, p1: v })} />
        </div>

        {/* Separador */}
        <div style={{ textAlign: "center" }}>
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 22, color: "#e2e8f0",
          }}>–</span>
        </div>

        {/* P2 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 900, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {nombre2.split(" / ")[0]}
          </span>
          <Stepper value={value.p2} onChange={v => onChange({ ...value, p2: v })} />
        </div>
      </div>
    </div>
  )
}

export function ResultadoSheet({
  partido,
  onClose,
  onSuccess,
  tercerSet = "super_tie_break",
}: {
  partido: { id: string; pareja1: Pareja | null; pareja2: Pareja | null; resultado?: { sets?: Array<{ p1: number; p2: number }> } | null } | null
  onClose: () => void
  onSuccess?: () => void
  tercerSet?: "completo" | "tie_break" | "super_tie_break"
}) {
  const [set1, setSet1] = useState<SetScore>({ p1: 0, p2: 0 })
  const [set2, setSet2] = useState<SetScore>({ p1: 0, p2: 0 })
  const [set3, setSet3] = useState<SetScore | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const nombre1 = nombrePareja(partido?.pareja1 ?? null)
  const nombre2 = nombrePareja(partido?.pareja2 ?? null)

  useEffect(() => {
    if (partido) {
      const s = partido.resultado?.sets
      setSet1(s?.[0] ?? { p1: 0, p2: 0 })
      setSet2(s?.[1] ?? { p1: 0, p2: 0 })
      setSet3(s?.[2] ?? null)
      setError(null)
    }
  }, [partido?.id])

  const sets1 = [set1, set2, set3].filter(Boolean).filter(s => s!.p1 > s!.p2).length
  const sets2 = [set1, set2, set3].filter(Boolean).filter(s => s!.p2 > s!.p1).length
  const empate11 = set1.p1 !== set1.p2 && set2.p1 !== set2.p2 &&
    (set1.p1 > set1.p2) !== (set2.p1 > set2.p2) && !set3
  const hayGanador = sets1 !== sets2 && (sets1 >= 2 || sets2 >= 2)

  const isStb = tercerSet !== "completo"
  const allSets = [set1, set2, ...(set3 ? [set3] : [])]

  const handleGuardar = () => {
    if (!partido) return
    setError(null)
    startTransition(async () => {
      const [, err] = await actualizarResultadoAction({ partidoId: partido.id, sets: allSets })
      if (err) {
        console.error("Error al guardar resultado:", err)
        setError(err.message ?? err.code ?? JSON.stringify(err))
        return
      }
      onSuccess ? onSuccess() : onClose()
    })
  }

  return (
    <>
      <Toast message={error} type="error" onDismiss={() => setError(null)} />
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
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 70,
              background: "#fff", borderRadius: "20px 20px 0 0",
              padding: "16px 20px 44px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              maxHeight: "92vh", overflowY: "auto",
            }}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 16px" }} />

            {/* Equipos */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, fontWeight: 900, color: "#0f172a", flex: 1 }}>
                {nombre1}
              </span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, color: "#cbd5e1", fontWeight: 700, padding: "0 10px" }}>vs</span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, fontWeight: 900, color: "#0f172a", flex: 1, textAlign: "right" }}>
                {nombre2}
              </span>
            </div>

            {/* Set 1 */}
            <SetRow label="SET 1" value={set1} onChange={setSet1} nombre1={nombre1} nombre2={nombre2} />

            <div style={{ height: 1, background: "#f1f5f9", margin: "16px 0" }} />

            {/* Set 2 */}
            <SetRow label="SET 2" value={set2} onChange={setSet2} nombre1={nombre1} nombre2={nombre2} />

            {/* 3er set / STB */}
            {set3 !== null ? (
              <>
                <div style={{ height: 1, background: "#f1f5f9", margin: "16px 0" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 11, color: "#94a3b8", margin: 0, letterSpacing: "0.08em" }}>
                    {isStb ? "SUPER TIE-BREAK" : "SET 3"}
                  </p>
                  <button onClick={() => setSet3(null)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1 }}>close</span>
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {nombre1.split(" / ")[0]}
                    </span>
                    <Stepper value={set3.p1} onChange={v => setSet3({ ...set3, p1: v })} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 22, color: "#e2e8f0" }}>–</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {nombre2.split(" / ")[0]}
                    </span>
                    <Stepper value={set3.p2} onChange={v => setSet3({ ...set3, p2: v })} />
                  </div>
                </div>
              </>
            ) : empate11 && (
              <>
                <div style={{ height: 1, background: "#f1f5f9", margin: "16px 0" }} />
                <button
                  onClick={() => setSet3({ p1: 0, p2: 0 })}
                  style={{
                    width: "100%", padding: "13px",
                    border: "1.5px dashed #bcff00", borderRadius: 12,
                    background: "#f9ffe0", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 12, fontWeight: 900, color: "#0f172a",
                  }}
                >
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>add</span>
                  {isStb ? "Agregar Super Tie-Break" : "Agregar 3er set"}
                </button>
              </>
            )}

            {/* Resumen */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              padding: "12px 16px", borderRadius: 12,
              background: hayGanador ? "#f0fdf4" : "#f8fafc",
              border: `1px solid ${hayGanador ? "#86efac" : "#e2e8f0"}`,
              margin: "16px 0 14px",
            }}>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", flex: 1, textAlign: "right" }}>
                {nombre1.split(" / ")[0]}
              </span>
              <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 30, color: "#0f172a" }}>{sets1}</span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, color: "#cbd5e1", fontWeight: 700 }}>–</span>
              <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 30, color: "#0f172a" }}>{sets2}</span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", flex: 1 }}>
                {nombre2.split(" / ")[0]}
              </span>
              {hayGanador && (
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: "#22c55e", lineHeight: 1 }}>check_circle</span>
              )}
            </div>

            {/* Botones */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: "14px", borderRadius: 10,
                border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
                Cancelar
              </button>
              <motion.button
                onClick={handleGuardar}
                disabled={pending}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  flex: 2, padding: "14px", borderRadius: 10, border: "none",
                  background: pending ? "#94a3b8" : (hayGanador ? "#166534" : "#0f172a"),
                  color: hayGanador ? "#bcff00" : "#fff",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900,
                  cursor: pending ? "not-allowed" : "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                {pending ? "Guardando..." : (hayGanador ? "🏆 Finalizar Partido" : "💾 Guardar Parcial")}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  )
}
