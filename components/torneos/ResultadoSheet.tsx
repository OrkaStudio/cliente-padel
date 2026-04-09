"use client"

import { useState, useTransition, useEffect } from "react"
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

// Scores válidos cuando gana P1
const P1_WINS: SetScore[] = [
  { p1: 6, p2: 0 }, { p1: 6, p2: 1 }, { p1: 6, p2: 2 },
  { p1: 6, p2: 3 }, { p1: 6, p2: 4 }, { p1: 7, p2: 5 }, { p1: 7, p2: 6 },
]
// Scores válidos cuando gana P2
const P2_WINS: SetScore[] = [
  { p1: 0, p2: 6 }, { p1: 1, p2: 6 }, { p1: 2, p2: 6 },
  { p1: 3, p2: 6 }, { p1: 4, p2: 6 }, { p1: 5, p2: 7 }, { p1: 6, p2: 7 },
]
// Super tie-break
const STB_P1: SetScore[] = Array.from({ length: 9 }, (_, i) => ({ p1: 10, p2: i }))
const STB_P2: SetScore[] = Array.from({ length: 9 }, (_, i) => ({ p1: i, p2: 10 }))

const DEFAULT_SET: SetScore = { p1: 6, p2: 4 }

function scoreKey(s: SetScore) { return `${s.p1}-${s.p2}` }
function eqScore(a: SetScore, b: SetScore) { return a.p1 === b.p1 && a.p2 === b.p2 }

function SetPicker({
  value,
  onChange,
  nombre1,
  nombre2,
  isStb = false,
}: {
  value: SetScore
  onChange: (s: SetScore) => void
  nombre1: string
  nombre2: string
  isStb?: boolean
}) {
  const p1Scores = isStb ? STB_P1 : P1_WINS
  const p2Scores = isStb ? STB_P2 : P2_WINS
  return (
    <div>
      {/* Gana P1 */}
      <p style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 9, fontWeight: 900, color: "#64748b",
        textTransform: "uppercase", letterSpacing: "0.06em",
        margin: "0 0 6px",
      }}>
        Gana {nombre1.split(" / ")[0]}
      </p>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
        {p1Scores.map(s => (
          <button
            key={scoreKey(s)}
            onClick={() => onChange(s)}
            style={{
              flexShrink: 0,
              padding: "7px 12px", borderRadius: 8,
              border: `1.5px solid ${eqScore(value, s) ? "#22c55e" : "#e2e8f0"}`,
              background: eqScore(value, s) ? "#f0fdf4" : "#f8fafc",
              color: eqScore(value, s) ? "#15803d" : "#64748b",
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 14, fontWeight: 400,
              cursor: "pointer",
              transition: "all 120ms ease",
            }}
          >
            {s.p1}-{s.p2}
          </button>
        ))}
      </div>

      {/* Gana P2 */}
      <p style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 9, fontWeight: 900, color: "#64748b",
        textTransform: "uppercase", letterSpacing: "0.06em",
        margin: "4px 0 6px",
      }}>
        Gana {nombre2.split(" / ")[0]}
      </p>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
        {p2Scores.map(s => (
          <button
            key={scoreKey(s)}
            onClick={() => onChange(s)}
            style={{
              flexShrink: 0,
              padding: "7px 12px", borderRadius: 8,
              border: `1.5px solid ${eqScore(value, s) ? "#f97316" : "#e2e8f0"}`,
              background: eqScore(value, s) ? "#fff7ed" : "#f8fafc",
              color: eqScore(value, s) ? "#c2410c" : "#64748b",
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 14, fontWeight: 400,
              cursor: "pointer",
              transition: "all 120ms ease",
            }}
          >
            {s.p1}-{s.p2}
          </button>
        ))}
      </div>
    </div>
  )
}

export function ResultadoSheet({
  partido,
  onClose,
  tercerSet = "super_tie_break",
}: {
  partido: { id: string; pareja1: Pareja | null; pareja2: Pareja | null } | null
  onClose: () => void
  tercerSet?: "completo" | "tie_break" | "super_tie_break"
}) {
  const [set1, setSet1] = useState<SetScore>(DEFAULT_SET)
  const [set2, setSet2] = useState<SetScore>(DEFAULT_SET)
  const [set3, setSet3] = useState<SetScore | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const nombre1 = nombrePareja(partido?.pareja1 ?? null)
  const nombre2 = nombrePareja(partido?.pareja2 ?? null)

  // Reset al abrir
  useEffect(() => {
    if (partido) {
      setSet1(DEFAULT_SET)
      setSet2(DEFAULT_SET)
      setSet3(null)
      setError(null)
    }
  }, [partido?.id])

  const sets1 = [set1, set2, set3].filter(Boolean).filter(s => s!.p1 > s!.p2).length
  const sets2 = [set1, set2, set3].filter(Boolean).filter(s => s!.p2 > s!.p1).length
  const empate = sets1 === 1 && sets2 === 1 && !set3
  const hayGanador = !empate && sets1 !== sets2

  // Si después de set1 y set2 hay empate, mostrar 3er set automáticamente
  useEffect(() => {
    if (set1.p1 > set1.p2 !== set2.p1 > set2.p2 && !set3) {
      // 1-1 → sugerir 3er set pero no auto-agregar
    }
  }, [set1, set2])

  const allSets = [set1, set2, ...(set3 ? [set3] : [])]
  const isStb = tercerSet === "super_tie_break" || tercerSet === "tie_break"

  const handleGuardar = () => {
    if (!partido) return
    setError(null)
    startTransition(async () => {
      const [, err] = await actualizarResultadoAction({ partidoId: partido.id, sets: allSets })
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
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 70,
              background: "#fff", borderRadius: "20px 20px 0 0",
              padding: "16px 16px 40px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              maxHeight: "90vh", overflowY: "auto",
            }}
          >
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 16px" }} />

            {/* Equipos */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 900, color: "#0f172a", flex: 1 }}>
                {nombre1}
              </span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, color: "#cbd5e1", fontWeight: 700, padding: "0 8px" }}>vs</span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 900, color: "#0f172a", flex: 1, textAlign: "right" }}>
                {nombre2}
              </span>
            </div>

            {/* Set 1 */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 11, color: "#94a3b8", margin: "0 0 8px", letterSpacing: "0.06em" }}>
                SET 1
              </p>
              <SetPicker value={set1} onChange={setSet1} nombre1={nombre1} nombre2={nombre2} />
            </div>

            {/* Set 2 */}
            <div style={{ marginBottom: 14, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
              <p style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 11, color: "#94a3b8", margin: "0 0 8px", letterSpacing: "0.06em" }}>
                SET 2
              </p>
              <SetPicker value={set2} onChange={setSet2} nombre1={nombre1} nombre2={nombre2} />
            </div>

            {/* 3er set / STB */}
            {set3 ? (
              <div style={{ marginBottom: 14, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <p style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 11, color: "#94a3b8", margin: 0, letterSpacing: "0.06em" }}>
                    {isStb ? "SUPER TIE-BREAK" : "SET 3"}
                  </p>
                  <button onClick={() => setSet3(null)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1 }}>close</span>
                  </button>
                </div>
                <SetPicker value={set3} onChange={setSet3} nombre1={nombre1} nombre2={nombre2} isStb={isStb} />
              </div>
            ) : (
              empate && (
                <button
                  onClick={() => setSet3(isStb ? { p1: 10, p2: 7 } : { p1: 6, p2: 4 })}
                  style={{
                    width: "100%", padding: "12px",
                    border: "1.5px dashed #bcff00", borderRadius: 10,
                    background: "#f9ffe0", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 12, fontWeight: 900, color: "#0f172a",
                    marginBottom: 14,
                  }}
                >
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>add</span>
                  {isStb ? "Agregar Super Tie-Break" : "Agregar 3er set"}
                </button>
              )
            )}

            {/* Resumen */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "10px 16px", borderRadius: 10,
              background: hayGanador ? "#f0fdf4" : "#f8fafc",
              border: `1px solid ${hayGanador ? "#86efac" : "#e2e8f0"}`,
              marginBottom: 14,
            }}>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", flex: 1, textAlign: "right" }}>
                {nombre1.split(" / ")[0]}
              </span>
              <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 26, color: "#0f172a" }}>{sets1}</span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, color: "#cbd5e1", fontWeight: 700 }}>–</span>
              <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 26, color: "#0f172a" }}>{sets2}</span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", flex: 1 }}>
                {nombre2.split(" / ")[0]}
              </span>
              {hayGanador && <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: "#22c55e", lineHeight: 1 }}>check_circle</span>}
            </div>

            {error && (
              <p style={{ fontSize: 12, color: "#ef4444", fontFamily: "var(--font-space-grotesk), sans-serif", marginBottom: 12, textAlign: "center" }}>{error}</p>
            )}

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
