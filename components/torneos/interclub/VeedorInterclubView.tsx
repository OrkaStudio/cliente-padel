"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { cerrarSesionVeedorAction } from "@/actions/partidos.actions"

type SetScore = { a: string; b: string }

type PartidoMock = {
  id: string
  categoria: string
  pairA: string
  pairB: string
  hora: string           // "HH:MM"
  sets: SetScore[]
  finalizado: boolean    // true cuando el veedor confirmó resultado
  enVivo: boolean        // true = ya empezó (independiente del reloj)
}

const MOCK: Record<string, PartidoMock[]> = {
  "voleando": [
    { id: "v1",  categoria: "Suma 10",  pairA: "Peralta / Luna",     pairB: "Campos / Bravo",     hora: "14:30", sets: [{ a: "6", b: "3" }], finalizado: false, enVivo: true },
    { id: "v2",  categoria: "Quinta",   pairA: "Molina / Quiroga",   pairB: "Aguilar / Rojas",    hora: "15:00", sets: [{ a: "4", b: "2" }], finalizado: false, enVivo: true },
    { id: "v3",  categoria: "Segunda",  pairA: "Córdoba / Mena",     pairB: "Ríos / Sandoval",    hora: "15:00", sets: [], finalizado: false, enVivo: false },
    { id: "v4",  categoria: "Cuarta",   pairA: "Álvarez / Carrizo",  pairB: "Cabrera / Delgado",  hora: "15:00", sets: [], finalizado: false, enVivo: false },
    { id: "v5",  categoria: "Mixtos B", pairA: "Ibarra / Leiva",     pairB: "Neira / Poblete",    hora: "15:00", sets: [], finalizado: false, enVivo: false },
    { id: "v6",  categoria: "Tercera",  pairA: "Heredia / Ávila",    pairB: "Tapia / Contreras",  hora: "15:30", sets: [], finalizado: false, enVivo: false },
    { id: "v7",  categoria: "Primera",  pairA: "Muñoz / Serrano",    pairB: "Jiménez / Pedraza",  hora: "15:30", sets: [], finalizado: false, enVivo: false },
    { id: "v8",  categoria: "Tercera",  pairA: "Salas / Figueroa",   pairB: "Paredes / Solís",    hora: "16:00", sets: [], finalizado: false, enVivo: false },
    { id: "v9",  categoria: "Primera",  pairA: "Arce / Escobar",     pairB: "Cáceres / Valdivia", hora: "16:00", sets: [], finalizado: false, enVivo: false },
    { id: "v10", categoria: "Quinta",   pairA: "Navarro / Palacios", pairB: "Aguilar / Rojas",    hora: "16:30", sets: [], finalizado: false, enVivo: false },
  ],
  "mas-padel": [
    { id: "m1",  categoria: "Mixtos A", pairA: "Castro / Medina",    pairB: "Martín / Paz",       hora: "14:30", sets: [{ a: "5", b: "4" }], finalizado: false, enVivo: true },
    { id: "m2",  categoria: "Tercera",  pairA: "Heredia / Ávila",    pairB: "Paredes / Solís",    hora: "15:00", sets: [], finalizado: false, enVivo: false },
    { id: "m3",  categoria: "Primera",  pairA: "Muñoz / Serrano",    pairB: "Cáceres / Valdivia", hora: "15:00", sets: [], finalizado: false, enVivo: false },
    { id: "m4",  categoria: "Cuarta",   pairA: "Álvarez / Carrizo",  pairB: "Fuentes / Guerrero", hora: "15:30", sets: [], finalizado: false, enVivo: false },
    { id: "m5",  categoria: "Segunda",  pairA: "Córdoba / Mena",     pairB: "Zamora / Villareal", hora: "15:30", sets: [], finalizado: false, enVivo: false },
    { id: "m6",  categoria: "Mixtos B", pairA: "Ibarra / Leiva",     pairB: "Quintero / Robles",  hora: "15:30", sets: [], finalizado: false, enVivo: false },
    { id: "m7",  categoria: "Suma 10",  pairA: "Peralta / Luna",     pairB: "Herrera / Sosa",     hora: "15:30", sets: [], finalizado: false, enVivo: false },
    { id: "m8",  categoria: "Cuarta",   pairA: "Méndez / Peña",      pairB: "Cabrera / Delgado",  hora: "16:00", sets: [], finalizado: false, enVivo: false },
    { id: "m9",  categoria: "Quinta",   pairA: "Navarro / Palacios", pairB: "Espinoza / Vidal",   hora: "16:00", sets: [], finalizado: false, enVivo: false },
    { id: "m10", categoria: "Tercera",  pairA: "Salas / Figueroa",   pairB: "Tapia / Contreras",  hora: "16:30", sets: [], finalizado: false, enVivo: false },
    { id: "m11", categoria: "Primera",  pairA: "Arce / Escobar",     pairB: "Jiménez / Pedraza",  hora: "16:30", sets: [], finalizado: false, enVivo: false },
  ],
}

// Compara "HH:MM" con la hora actual
function horaYaPaso(hora: string): boolean {
  const now = new Date()
  const [h, m] = hora.split(":").map(Number)
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  return now >= target
}

function getEstado(p: PartidoMock): "pendiente" | "en_vivo" | "finalizado" {
  if (p.finalizado) return "finalizado"
  if (p.enVivo || horaYaPaso(p.hora)) return "en_vivo"
  return "pendiente"
}

// ─── PartidoCard ──────────────────────────────────────────────────────────────

function PartidoCard({ partido, estado, onCargar }: {
  partido: PartidoMock
  estado: "pendiente" | "en_vivo" | "finalizado"
  onCargar: () => void
}) {
  const isLive = estado === "en_vivo"
  const isFin  = estado === "finalizado"
  const isPend = estado === "pendiente"

  return (
    <div style={{
      background: "#ffffff",
      border: isLive ? "1.5px solid #bcff00" : "1px solid #f1f5f9",
      borderRadius: 14,
      padding: "13px 14px",
      position: "relative", overflow: "hidden",
      boxShadow: isLive ? "0 2px 12px rgba(188,255,0,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
      opacity: isPend ? 0.6 : 1,
    }}>

      {isLive && (
        <span aria-hidden style={{
          position: "absolute", zIndex: 0, right: -4, bottom: -10,
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 58, fontWeight: 400, lineHeight: 1,
          color: "rgba(188,255,0,0.32)", letterSpacing: "-0.02em",
          pointerEvents: "none", userSelect: "none", textTransform: "uppercase",
        }}>VIVO</span>
      )}
      {isLive && (
        <div aria-hidden style={{
          position: "absolute", zIndex: 1, inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom right, transparent 40%, rgba(255,255,255,0.6) 100%)",
        }} />
      )}

      {/* Header */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 10,
      }}>
        <div style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 900, color: "#0f172a",
          textTransform: "uppercase", letterSpacing: "0.1em",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          {isLive && (
            <span className="live-dot" style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#0f172a", flexShrink: 0, display: "inline-block",
            }} />
          )}
          {partido.categoria}
        </div>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 700,
          color: isLive ? "#0f172a" : "#94a3b8",
        }}>{partido.hora}</span>
      </div>

      {/* Scoreboard */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Fila A */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 900, color: "#0f172a",
            lineHeight: 1.2, textTransform: "uppercase",
            flex: 1, minWidth: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{partido.pairA}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {partido.sets.map((s, i) => (
              <span key={i} style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 16, lineHeight: 1, color: "#0f172a",
                minWidth: 14, textAlign: "center",
              }}>{s.a}</span>
            ))}
            {isLive && (
              <span className="live-dot" style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#0f172a", flexShrink: 0, display: "inline-block",
              }} />
            )}
          </div>
        </div>

        <div style={{ height: 1, background: "#f1f5f9", marginBottom: 8 }} />

        {/* Fila B */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 900, color: "#0f172a",
            lineHeight: 1.2, textTransform: "uppercase",
            flex: 1, minWidth: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{partido.pairB}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {partido.sets.map((s, i) => (
              <span key={i} style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 16, lineHeight: 1, color: "#0f172a",
                minWidth: 14, textAlign: "center",
              }}>{s.b}</span>
            ))}
            {isLive && (
              <span className="live-dot" style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#0f172a", flexShrink: 0, display: "inline-block",
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Acción: solo si en_vivo */}
      {isLive && (
        <div style={{
          position: "relative", zIndex: 2,
          marginTop: 12, paddingTop: 12,
          borderTop: "1px solid #f1f5f9",
        }}>
          <button
            onClick={onCargar}
            style={{
              width: "100%", padding: "10px 0",
              borderRadius: 10, border: "none",
              background: "#bcff00", color: "#0f172a",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, fontWeight: 900,
              textTransform: "uppercase", letterSpacing: "0.08em",
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
            }}
          >
            Cargar resultado
          </button>
        </div>
      )}

      {/* Finalizado */}
      {isFin && (
        <div style={{
          position: "relative", zIndex: 2,
          marginTop: 10, paddingTop: 10,
          borderTop: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#0f172a", lineHeight: 1 }}>
            check_circle
          </span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 700, color: "#0f172a",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>Resultado cargado</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {partido.sets.map((s, i) => (
              <span key={i} style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 13, color: "#0f172a",
              }}>{s.a}-{s.b}</span>
            ))}
          </div>
        </div>
      )}

      {/* Pendiente — horario */}
      {isPend && (
        <div style={{
          position: "relative", zIndex: 2,
          marginTop: 10, paddingTop: 10,
          borderTop: "1px solid #f1f5f9",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, color: "#94a3b8", lineHeight: 1 }}>
            schedule
          </span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 700, color: "#94a3b8",
            letterSpacing: "0.04em",
          }}>Comienza a las {partido.hora}</span>
        </div>
      )}
    </div>
  )
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        style={{
          width: 40, height: 40, borderRadius: "10px 0 0 10px",
          border: "1.5px solid #e2e8f0", borderRight: "none",
          background: "#f8fafc", color: "#0f172a",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 20, fontWeight: 300, lineHeight: 1,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          WebkitTapHighlightColor: "transparent", flexShrink: 0,
        }}
      >−</button>
      <div style={{
        width: 52, height: 40,
        border: "1.5px solid #e2e8f0",
        background: "#ffffff",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 22, lineHeight: 1, color: "#0f172a",
        }}>{value}</span>
      </div>
      <button
        onClick={() => onChange(Math.min(99, value + 1))}
        style={{
          width: 40, height: 40, borderRadius: "0 10px 10px 0",
          border: "1.5px solid #e2e8f0", borderLeft: "none",
          background: "#f8fafc", color: "#0f172a",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 20, fontWeight: 300, lineHeight: 1,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          WebkitTapHighlightColor: "transparent", flexShrink: 0,
        }}
      >+</button>
    </div>
  )
}

// ─── Sheet resultado ──────────────────────────────────────────────────────────

function ResultadoSheet({ partido, onClose, onGuardar }: {
  partido: PartidoMock
  onClose: () => void
  onGuardar: (sets: SetScore[]) => void
}) {
  // Guardamos como números internamente, convertimos a string al confirmar
  const parseN = (v: string) => v === "" ? 0 : parseInt(v, 10) || 0
  const initSets = partido.sets.length > 0
    ? partido.sets.map(s => ({ a: parseN(s.a), b: parseN(s.b) }))
    : [{ a: 0, b: 0 }]
  const [sets, setSets] = useState<{ a: number; b: number }[]>(initSets)

  const updateSet = (i: number, side: "a" | "b", val: number) => {
    setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [side]: val } : s))
  }

  const addSet = () => {
    if (sets.length < 3) setSets(prev => [...prev, { a: 0, b: 0 }])
  }

  const removeSet = (i: number) => {
    if (sets.length > 1) setSets(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleGuardar = () => {
    if (sets.length === 0) return
    onGuardar(sets.map(s => ({ a: String(s.a), b: String(s.b) })))
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.5)" }}
      />
      <motion.div
        key="sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          zIndex: 301,
          background: "#ffffff",
          borderRadius: "20px 20px 0 0",
          paddingBottom: "env(safe-area-inset-bottom, 24px)",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 8px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "4px 20px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 900, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 6px",
          }}>{partido.categoria} · Resultado</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 16, color: "#0f172a", textTransform: "uppercase", lineHeight: 1.2,
            }}>{partido.pairA}</span>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 800, color: "#cbd5e1",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>VS</span>
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 16, color: "#0f172a", textTransform: "uppercase", lineHeight: 1.2,
            }}>{partido.pairB}</span>
          </div>
        </div>

        {/* Sets */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sets.map((s, i) => (
              <div key={i} style={{
                background: "#f8fafc", borderRadius: 14,
                padding: "12px 14px",
                position: "relative",
              }}>
                {/* Set label + delete */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginBottom: 12,
                }}>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 9, fontWeight: 900, color: "#94a3b8",
                    textTransform: "uppercase", letterSpacing: "0.12em",
                  }}>Set {i + 1}</span>
                  {sets.length > 1 && (
                    <button onClick={() => removeSet(i)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#cbd5e1", padding: 0, lineHeight: 1,
                      WebkitTapHighlightColor: "transparent",
                    }}>
                      <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>close</span>
                    </button>
                  )}
                </div>

                {/* Fila par A */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 12, fontWeight: 800, color: "#0f172a",
                    textTransform: "uppercase", flex: 1, minWidth: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    paddingRight: 12,
                  }}>{partido.pairA.split(" / ")[0]}</span>
                  <Stepper value={s.a} onChange={v => updateSet(i, "a", v)} />
                </div>

                <div style={{ height: 1, background: "#e2e8f0", margin: "0 0 10px" }} />

                {/* Fila par B */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 12, fontWeight: 800, color: "#0f172a",
                    textTransform: "uppercase", flex: 1, minWidth: 0,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    paddingRight: 12,
                  }}>{partido.pairB.split(" / ")[0]}</span>
                  <Stepper value={s.b} onChange={v => updateSet(i, "b", v)} />
                </div>
              </div>
            ))}
          </div>

          {sets.length < 3 && (
            <button onClick={addSet} style={{
              display: "flex", alignItems: "center", gap: 5,
              marginTop: 12, background: "none", border: "none",
              cursor: "pointer", padding: "6px 0",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 700, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.06em",
              WebkitTapHighlightColor: "transparent",
            }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>add_circle</span>
              Agregar set
            </button>
          )}
        </div>

        {/* CTA */}
        <div style={{ padding: "16px 20px 8px" }}>
          <button onClick={handleGuardar} style={{
            width: "100%", padding: "16px 0",
            borderRadius: 14, border: "none",
            background: "#0f172a", color: "#bcff00",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.08em",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }}>
            Confirmar resultado
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "20px 0 10px" }}>
      <span style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 10, fontWeight: 900, color: "#94a3b8",
        textTransform: "uppercase", letterSpacing: "0.1em",
      }}>{label}</span>
      <span style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 14, color: "#cbd5e1",
      }}>{count}</span>
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function VeedorInterclubView({ club }: { club: string }) {
  const router = useRouter()
  const [partidos, setPartidos] = useState<PartidoMock[]>(MOCK[club] ?? [])
  const [sheetPartido, setSheetPartido] = useState<PartidoMock | null>(null)
  const [, startSalir] = useTransition()

  // Refresca el estado automático cada 30 segundos
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  // Computa estado en tiempo real (tick fuerza re-render)
  const conEstado = partidos.map(p => ({ ...p, estadoActual: getEstado(p) }))
  void tick // asegura que el efecto re-evalúa

  const live       = conEstado.filter(p => p.estadoActual === "en_vivo")
  const proximos   = conEstado.filter(p => p.estadoActual === "pendiente")
  const finalizados = conEstado.filter(p => p.estadoActual === "finalizado")

  const guardar = (id: string, sets: SetScore[]) => {
    setPartidos(prev => prev.map(p => p.id === id ? { ...p, finalizado: true, sets } : p))
    setSheetPartido(null)
  }

  const handleSalir = () => {
    startSalir(async () => {
      await cerrarSesionVeedorAction({ club: club as "voleando" | "mas-padel" })
      router.push(`/veedor/${club}/login`)
    })
  }

  return (
    <div style={{ padding: "4px 14px 100px" }}>

      {/* Botón cerrar sesión */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12 }}>
        <button
          onClick={handleSalir}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "none", border: "none",
            cursor: "pointer", padding: "4px 0",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.06em",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>logout</span>
          Cerrar sesión
        </button>
      </div>

      {/* EN CANCHA */}
      {live.length > 0 && (
        <>
          <SectionLabel label="En cancha" count={live.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {live.map(p => (
              <PartidoCard
                key={p.id} partido={p} estado={p.estadoActual}
                onCargar={() => setSheetPartido(p)}
              />
            ))}
          </div>
        </>
      )}

      {/* PRÓXIMOS */}
      {proximos.length > 0 && (
        <>
          <SectionLabel label="Próximos" count={proximos.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {proximos.map(p => (
              <PartidoCard
                key={p.id} partido={p} estado={p.estadoActual}
                onCargar={() => setSheetPartido(p)}
              />
            ))}
          </div>
        </>
      )}

      {/* FINALIZADOS */}
      {finalizados.length > 0 && (
        <>
          <SectionLabel label="Finalizados" count={finalizados.length} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {finalizados.map(p => (
              <PartidoCard
                key={p.id} partido={p} estado={p.estadoActual}
                onCargar={() => setSheetPartido(p)}
              />
            ))}
          </div>
        </>
      )}

      {/* Sheet */}
      {sheetPartido && (
        <ResultadoSheet
          partido={sheetPartido}
          onClose={() => setSheetPartido(null)}
          onGuardar={sets => guardar(sheetPartido.id, sets)}
        />
      )}
    </div>
  )
}
