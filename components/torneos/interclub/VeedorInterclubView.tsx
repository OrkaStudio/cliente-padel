"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import { MOCK_CATEGORIAS, CLUB_A, CLUB_B } from "./interclub-mock"
import { cerrarSesionVeedorAction, guardarResultadoInterclubAction } from "@/actions/partidos.actions"
import { InterclubAutoRefresh } from "./InterclubAutoRefresh"

const CLUB_ACCENT: Record<string, string> = {
  "voleando":  "#0f172a",
  "mas-padel": "#b45309",
}

// Sede tal como aparece en interclub-mock.ts
const CLUB_SEDE: Record<string, string> = {
  "voleando":  "Voleando",
  "mas-padel": "+ Pádel",
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SetScore = { a: string; b: string }

type PartidoMock = {
  id: string
  categoria: string
  pairA: string
  pairB: string
  hora: string
  fecha: string
  cancha: number
  sede: string
  sets: SetScore[]
  estado: "pendiente" | "en_vivo" | "finalizado"
  ganador: "A" | "B" | null
}

export type InterclubLiveRow = {
  id: string
  resultado: string | null
  ganador: string | null
  estado: string
  hora: string | null
  cancha: number | null
  fecha: string | null
  sede: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseResultado(resultado: string | null): SetScore[] {
  if (!resultado?.trim()) return []
  return resultado.trim().split(/\s+/).map(s => {
    const [a = "0", b = "0"] = s.split("-")
    return { a, b }
  })
}

function setsToResultado(sets: SetScore[]): string {
  return sets.map(s => `${s.a}-${s.b}`).join(" ")
}

function buildPartidos(club: string, liveRows: InterclubLiveRow[]): PartidoMock[] {
  const sede = CLUB_SEDE[club]
  const liveMap = new Map(liveRows.map(r => [r.id, r]))
  const result: PartidoMock[] = []

  for (const cat of MOCK_CATEGORIAS) {
    for (const p of cat.partidos) {
      const live = liveMap.get(p.id)
      const sedeActual = live?.sede ?? p.sede ?? sede
      if (sedeActual !== sede) continue
      const estado = (live?.estado ?? p.estado) as PartidoMock["estado"]
      const resultado = live?.resultado ?? p.resultado
      const ganador  = (live?.ganador ?? p.ganador) as "A" | "B" | null
      result.push({
        id:        p.id,
        categoria: cat.nombre,
        pairA:     p.pairA,
        pairB:     p.pairB,
        hora:      live?.hora   ?? p.horaInicio ?? "",
        fecha:     live?.fecha  ?? p.fecha      ?? "",
        cancha:    live?.cancha ?? p.cancha     ?? 1,
        sede:      sedeActual,
        sets:      parseResultado(resultado),
        estado,
        ganador,
      })
    }
  }

  return result.sort((a, b) =>
    a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora) || a.cancha - b.cancha
  )
}

// ─── LiveCard ─────────────────────────────────────────────────────────────────

function LiveCard({ partido, onCargar }: { partido: PartidoMock; onCargar: () => void }) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1.5px solid #bcff00",
      borderRadius: 14, padding: "13px 14px",
      position: "relative", overflow: "hidden",
      boxShadow: "0 2px 12px rgba(188,255,0,0.12)",
    }}>
      <span aria-hidden style={{
        position: "absolute", zIndex: 0, right: -4, bottom: -10,
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 58, fontWeight: 400, lineHeight: 1,
        color: "rgba(188,255,0,0.32)", letterSpacing: "-0.02em",
        pointerEvents: "none", userSelect: "none", textTransform: "uppercase",
      }}>VIVO</span>
      <div aria-hidden style={{
        position: "absolute", zIndex: 1, inset: 0, pointerEvents: "none",
        background: "linear-gradient(to bottom right, transparent 40%, rgba(255,255,255,0.6) 100%)",
      }} />

      {/* Top row */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 12,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 900, color: "#15803d",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          <span className="live-dot" style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "#22c55e", display: "inline-block", flexShrink: 0,
          }} />
          En cancha
        </div>
        {(() => {
          const sedeColor = partido.sede === CLUB_A.nombre ? CLUB_A.color : CLUB_B.color
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#64748b" }}>{partido.hora}</span>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, lineHeight: 1, color: sedeColor }}>location_on</span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: sedeColor }}>{partido.sede} C{partido.cancha}</span>
            </div>
          )
        })()}
      </div>

      {/* Scoreboard */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* Fila A */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            minWidth: 28, height: 18, padding: "0 5px",
            border: "1px solid #e2e8f0", borderRadius: 4, flexShrink: 0,
          }}>
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: CLUB_A.color, textTransform: "uppercase" }}>{CLUB_A.abbr}</span>
          </div>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 900, color: "#0f172a",
            lineHeight: 1.2,
            flex: 1, minWidth: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{partido.pairA}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {partido.sets.map((s, i) => (
              <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 18, lineHeight: 1, color: "#0f172a", minWidth: 16, textAlign: "center" }}>{s.a}</span>
            ))}
            <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#0f172a", flexShrink: 0, display: "inline-block" }} />
          </div>
        </div>

        <div style={{ height: 1, background: "#f1f5f9", margin: "0 0 8px 36px" }} />

        {/* Fila B */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            minWidth: 28, height: 18, padding: "0 5px",
            border: "1px solid #e2e8f0", borderRadius: 4, flexShrink: 0,
          }}>
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: CLUB_B.color, textTransform: "uppercase" }}>{CLUB_B.abbr}</span>
          </div>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 900, color: "#0f172a",
            lineHeight: 1.2,
            flex: 1, minWidth: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{partido.pairB}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {partido.sets.map((s, i) => (
              <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 18, lineHeight: 1, color: "#0f172a", minWidth: 16, textAlign: "center" }}>{s.b}</span>
            ))}
            <span className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#0f172a", flexShrink: 0, display: "inline-block" }} />
          </div>
        </div>
      </div>

      {/* Acción */}
      <div style={{ position: "relative", zIndex: 2, marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
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
    </div>
  )
}

// ─── PartidoCard ──────────────────────────────────────────────────────────────

function PartidoCard({ partido, onIniciar, onEditar }: {
  partido: PartidoMock
  onIniciar?: () => void
  onEditar?: () => void
}) {
  const isFin    = partido.estado === "finalizado"
  const ganadorA = partido.ganador === "A"
  const ganadorB = partido.ganador === "B"

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #f1f5f9",
      borderRadius: 12, padding: "12px 14px",
      opacity: partido.estado === "pendiente" ? 0.75 : 1,
    }}>
      {/* Top row: estado ← → hora/lugar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: isFin ? 900 : 600,
          color: isFin ? "#64748b" : "#cbd5e1",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: isFin ? "#cbd5e1" : "#e2e8f0", display: "inline-block", flexShrink: 0 }} />
          {isFin ? "Finalizado" : "Pendiente"}
        </div>
        {(() => {
          const sedeColor = partido.sede === CLUB_A.nombre ? CLUB_A.color : CLUB_B.color
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#64748b" }}>{partido.hora}</span>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, lineHeight: 1, color: sedeColor }}>location_on</span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: sedeColor }}>{partido.sede} C{partido.cancha}</span>
            </div>
          )
        })()}
      </div>
      {/* Categoría */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{partido.categoria}</span>
      </div>

      {/* Fila A */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 18, padding: "0 5px", border: "1px solid #e2e8f0", borderRadius: 4, flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: CLUB_A.color, textTransform: "uppercase" }}>{CLUB_A.abbr}</span>
        </div>
        <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: ganadorA ? 800 : 600, color: isFin && ganadorB ? "#94a3b8" : "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{partido.pairA}</span>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {partido.sets.length > 0 ? partido.sets.map((s, i) => (
            <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 16, lineHeight: 1, color: ganadorA ? "#0f172a" : ganadorB ? "#cbd5e1" : "#64748b", minWidth: 12, textAlign: "center" }}>{s.a}</span>
          )) : (
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, color: "#e2e8f0", fontWeight: 700 }}>—</span>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: "#f1f5f9", margin: "0 0 8px 36px" }} />

      {/* Fila B */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 28, height: 18, padding: "0 5px", border: "1px solid #e2e8f0", borderRadius: 4, flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: CLUB_B.color, textTransform: "uppercase" }}>{CLUB_B.abbr}</span>
        </div>
        <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: ganadorB ? 800 : 600, color: isFin && ganadorA ? "#94a3b8" : "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{partido.pairB}</span>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {partido.sets.length > 0 ? partido.sets.map((s, i) => (
            <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 16, lineHeight: 1, color: ganadorB ? "#0f172a" : ganadorA ? "#cbd5e1" : "#64748b", minWidth: 12, textAlign: "center" }}>{s.b}</span>
          )) : (
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, color: "#e2e8f0", fontWeight: 700 }}>—</span>
          )}
        </div>
      </div>

      {onIniciar && partido.estado === "pendiente" && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
          <button onClick={onIniciar} style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1.5px solid #0f172a", background: "transparent", color: "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
            Iniciar partido
          </button>
        </div>
      )}

      {isFin && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 13, color: "#0f172a", lineHeight: 1 }}>check_circle</span>
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em" }}>Resultado cargado</span>
          {onEditar && (
            <button onClick={onEditar} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", WebkitTapHighlightColor: "transparent" }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 13, lineHeight: 1 }}>edit</span>
              Editar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <button onClick={() => onChange(Math.max(0, value - 1))} style={{ width: 40, height: 40, borderRadius: "10px 0 0 10px", border: "1.5px solid #e2e8f0", borderRight: "none", background: "#f8fafc", color: "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 20, fontWeight: 300, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent", flexShrink: 0 }}>−</button>
      <div style={{ width: 52, height: 40, border: "1.5px solid #e2e8f0", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 22, lineHeight: 1, color: "#0f172a" }}>{value}</span>
      </div>
      <button onClick={() => onChange(Math.min(99, value + 1))} style={{ width: 40, height: 40, borderRadius: "0 10px 10px 0", border: "1.5px solid #e2e8f0", borderLeft: "none", background: "#f8fafc", color: "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 20, fontWeight: 300, lineHeight: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent", flexShrink: 0 }}>+</button>
    </div>
  )
}

// ─── Sheet resultado ──────────────────────────────────────────────────────────

function ResultadoSheet({ partido, onClose, onGuardarParcial, onGuardar, isEditing }: {
  partido: PartidoMock
  onClose: () => void
  onGuardarParcial: (sets: SetScore[]) => void
  onGuardar: (sets: SetScore[], ganador: "A" | "B") => void
  isEditing?: boolean
}) {
  const parseN = (v: string) => parseInt(v, 10) || 0
  const init = partido.sets.length > 0
    ? partido.sets.map(s => ({ a: parseN(s.a), b: parseN(s.b) }))
    : [{ a: 0, b: 0 }]
  const [sets, setSets] = useState<{ a: number; b: number }[]>(init)

  const updateSet = (i: number, side: "a" | "b", val: number) =>
    setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [side]: val } : s))

  const addSet    = () => { if (sets.length < 3) setSets(prev => [...prev, { a: 0, b: 0 }]) }
  const removeSet = (i: number) => { if (sets.length > 1) setSets(prev => prev.filter((_, idx) => idx !== i)) }

  const setsA = sets.filter(s => s.a > s.b).length
  const setsB = sets.filter(s => s.b > s.a).length
  const ganador: "A" | "B" | null = setsA > setsB ? "A" : setsB > setsA ? "B" : null

  return (
    <AnimatePresence>
      <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.5)" }} />
      <motion.div
        key="sheet"
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301, background: "#ffffff", borderRadius: "20px 20px 0 0", paddingBottom: "env(safe-area-inset-bottom, 24px)" }}
      >
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 8px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>

        <div style={{ padding: "4px 20px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 6px" }}>{partido.categoria} · C{partido.cancha} · Resultado</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 16, color: "#0f172a", lineHeight: 1.2 }}>{partido.pairA}</span>
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em" }}>VS</span>
            <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 16, color: "#0f172a", lineHeight: 1.2 }}>{partido.pairB}</span>
          </div>
        </div>

        <div style={{ padding: "16px 20px 0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sets.map((s, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em" }}>Set {i + 1}</span>
                  {sets.length > 1 && (
                    <button onClick={() => removeSet(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 0, WebkitTapHighlightColor: "transparent" }}>
                      <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>close</span>
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 800, color: "#0f172a", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>{partido.pairA.split(" / ")[0]}</span>
                  <Stepper value={s.a} onChange={v => updateSet(i, "a", v)} />
                </div>
                <div style={{ height: 1, background: "#e2e8f0", margin: "0 0 10px" }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 800, color: "#0f172a", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>{partido.pairB.split(" / ")[0]}</span>
                  <Stepper value={s.b} onChange={v => updateSet(i, "b", v)} />
                </div>
              </div>
            ))}
          </div>

          {sets.length < 3 && (
            <button onClick={addSet} style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 12, background: "none", border: "none", cursor: "pointer", padding: "6px 0", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", WebkitTapHighlightColor: "transparent" }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>add_circle</span>
              Agregar set
            </button>
          )}
        </div>

        <div style={{ padding: "12px 20px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
          {!isEditing && (
            <button
              onClick={() => onGuardarParcial(sets.map(s => ({ a: String(s.a), b: String(s.b) })))}
              style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "transparent", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}
            >
              Actualizar set
            </button>
          )}
          <button
            onClick={() => ganador && onGuardar(sets.map(s => ({ a: String(s.a), b: String(s.b) })), ganador)}
            disabled={!ganador}
            style={{ width: "100%", padding: "16px 0", borderRadius: 14, border: "none", background: ganador ? "#0f172a" : "#f1f5f9", color: ganador ? "#bcff00" : "#94a3b8", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", cursor: ganador ? "pointer" : "default", WebkitTapHighlightColor: "transparent", transition: "background 200ms, color 200ms" }}
          >
            {ganador ? (isEditing ? "Actualizar resultado" : "Confirmar resultado") : "Ingresá todos los sets"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Dialog "¿Iniciás el siguiente?" ─────────────────────────────────────────

function SiguienteDialog({ siguiente, onSi, onNo, onCorregir }: {
  siguiente: PartidoMock
  onSi: () => void
  onNo: () => void
  onCorregir: () => void
}) {
  return (
    <AnimatePresence>
      <motion.div key="backdrop-sig" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onNo} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.5)" }} />
      <motion.div
        key="dialog-sig"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 401, background: "#ffffff", borderRadius: "20px 20px 0 0", padding: "24px 20px", paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, lineHeight: 1, color: "#0f172a", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center", margin: "0 0 6px" }}>Resultado cargado</p>
        <p style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 20, color: "#0f172a", textTransform: "uppercase", textAlign: "center", margin: "0 0 20px", lineHeight: 1.2 }}>
          ¿Iniciás el siguiente<br />en C{siguiente.cancha}?
          {siguiente.fecha && siguiente.fecha !== HOY && (
            <span style={{ display: "block", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 700, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>
              ⚠ {`${DIAS[new Date(siguiente.fecha + "T12:00:00").getDay()]} ${new Date(siguiente.fecha + "T12:00:00").getDate()}`}
            </span>
          )}
        </p>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: "10px 14px", marginBottom: 20 }}>
          <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>{siguiente.categoria} · {siguiente.hora}</p>
          <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 800, color: "#0f172a", margin: "0 0 3px" }}>{siguiente.pairA}</p>
          <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 700, color: "#94a3b8", margin: "0 0 3px" }}>vs</p>
          <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 800, color: "#0f172a", margin: 0 }}>{siguiente.pairB}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onNo} style={{ flex: 1, padding: "14px 0", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "transparent", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>Ahora no</button>
          <button onClick={onSi} style={{ flex: 2, padding: "14px 0", borderRadius: 12, border: "none", background: "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 800, color: "#bcff00", textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>Iniciar partido</button>
        </div>
        <button onClick={onCorregir} style={{ display: "block", width: "100%", marginTop: 14, background: "none", border: "none", cursor: "pointer", padding: "6px 0", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", WebkitTapHighlightColor: "transparent" }}>← Corregir resultado anterior</button>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ label, count }: { label: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "20px 0 10px" }}>
      <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 14, color: "#cbd5e1" }}>{count}</span>
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function VeedorInterclubView({
  club,
  clubNombre,
  initialLiveData = [],
}: {
  club: string
  clubNombre: string
  initialLiveData?: InterclubLiveRow[]
}) {
  const router = useRouter()
  const [partidos, setPartidos] = useState<PartidoMock[]>(() => buildPartidos(club, initialLiveData))
  const [sheetPartido, setSheetPartido]         = useState<PartidoMock | null>(null)
  const [siguienteDialog, setSiguienteDialog]   = useState<PartidoMock | null>(null)
  const [ultimoFinalizado, setUltimoFinalizado] = useState<PartidoMock | null>(null)
  const [saveError, setSaveError]               = useState<string | null>(null)
  const [, startSalir] = useTransition()

  // Merge server data on refresh — mantiene optimistic state para en_vivo/finalizado
  useEffect(() => {
    if (!initialLiveData.length) return
    const fresh    = buildPartidos(club, initialLiveData)
    const freshMap = new Map(fresh.map(p => [p.id, p]))
    setPartidos(prev => {
      const merged  = prev
        .filter(p => freshMap.has(p.id))
        .map(p => p.estado === "pendiente" ? freshMap.get(p.id)! : p)
      const nuevos  = fresh.filter(p => !prev.some(ep => ep.id === p.id))
      return [...merged, ...nuevos].sort((a, b) =>
        a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora) || a.cancha - b.cancha
      )
    })
  }, [initialLiveData, club])

  const live       = partidos.filter(p => p.estado === "en_vivo")
  const proximos   = partidos
    .filter(p => p.estado === "pendiente")
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
  const finalizados = partidos.filter(p => p.estado === "finalizado")

  const nextPorCancha = (cancha: number) => proximos.find(p => p.cancha === cancha)
  const canchaLibre   = (cancha: number) => !live.some(p => p.cancha === cancha)

  const showError = (msg: string) => {
    setSaveError(msg)
    setTimeout(() => setSaveError(null), 4000)
  }

  const iniciar = async (id: string) => {
    setPartidos(prev => prev.map(p => p.id === id ? { ...p, estado: "en_vivo" as const } : p))
    const [, err] = await guardarResultadoInterclubAction({ id, resultado: null, ganador: null, estado: "en_vivo" })
    if (err) {
      setPartidos(prev => prev.map(p => p.id === id ? { ...p, estado: "pendiente" as const } : p))
      showError("Error al iniciar el partido. Intentá de nuevo.")
    }
  }

  const guardarParcial = async (id: string, sets: SetScore[]) => {
    setPartidos(prev => prev.map(p => p.id === id ? { ...p, sets } : p))
    setSheetPartido(null)
    const resultado = setsToResultado(sets)
    const [, err] = await guardarResultadoInterclubAction({ id, resultado, ganador: null, estado: "en_vivo" })
    if (err) showError((err as { message?: string })?.message ?? JSON.stringify(err))
  }

  const confirmar = async (id: string, sets: SetScore[], ganador: "A" | "B") => {
    const partido    = partidos.find(p => p.id === id)
    const eraEnVivo  = partido?.estado === "en_vivo"
    const cancha     = partido?.cancha ?? 1
    const finalizado = { ...partido!, estado: "finalizado" as const, sets, ganador }
    setPartidos(prev => prev.map(p => p.id === id ? finalizado : p))
    setUltimoFinalizado(finalizado)
    setSheetPartido(null)

    const resultado = setsToResultado(sets)
    const [, err] = await guardarResultadoInterclubAction({ id, resultado, ganador, estado: "finalizado" })
    if (err) {
      console.error("[confirmar] error:", err)
      setPartidos(prev => prev.map(p => p.id === id ? { ...partido!, estado: "en_vivo" as const } : p))
      const msg = (err as { message?: string; data?: { message?: string } })?.message
        ?? (err as { data?: { message?: string } })?.data?.message
        ?? JSON.stringify(err)
      showError(msg)
      return
    }

    if (eraEnVivo) {
      const siguiente = proximos.find(p => p.cancha === cancha && p.id !== id)
      if (siguiente) setSiguienteDialog(siguiente)
    }
  }

  const handleSalir = () => {
    startSalir(async () => {
      await cerrarSesionVeedorAction({ club: club as "voleando" | "mas-padel" })
      router.push(`/veedor/${club}/login`)
    })
  }

  const accent  = CLUB_ACCENT[club] ?? "#0f172a"
  const logoSrc = club === "voleando" ? "/clubes/voleando.logo.png" : "/clubes/mas-padel.logo.png"
  const pageBg  = "radial-gradient(ellipse at 0% 100%, rgba(188,255,0,0.18) 0%, transparent 60%), radial-gradient(ellipse at 100% 0%, rgba(180,83,9,0.12) 0%, transparent 55%), #f8fafc"

  return (
    <div style={{ background: "#f8fafc", minHeight: "100dvh" }}>
      <InterclubAutoRefresh />

      {/* Error banner */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "fixed", top: "max(16px, env(safe-area-inset-top))",
              left: "50%", transform: "translateX(-50%)", zIndex: 600,
              background: "#ef4444", color: "#fff",
              padding: "10px 18px", borderRadius: 10,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 12, fontWeight: 700,
              boxShadow: "0 4px 16px rgba(239,68,68,0.35)",
              whiteSpace: "nowrap",
            }}
          >
            {saveError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{
        background: pageBg,
        padding: "16px 20px 24px",
        paddingTop: "max(16px, env(safe-area-inset-top))",
        borderBottom: "1px solid #e2e8f0",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div aria-hidden style={{ position: "absolute", right: -20, bottom: -20, pointerEvents: "none", opacity: 0.07, zIndex: 0 }}>
          <Image src={logoSrc} alt="" width={200} height={200} style={{ objectFit: "contain" }} />
        </div>

        <button onClick={() => router.push("/torneos/123/interclub")} style={{ position: "absolute", top: "max(14px, env(safe-area-inset-top))", left: 16, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", WebkitTapHighlightColor: "transparent", zIndex: 1 }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>arrow_back</span>
          Torneo
        </button>

        <button onClick={handleSalir} style={{ position: "absolute", top: "max(14px, env(safe-area-inset-top))", right: 16, display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", WebkitTapHighlightColor: "transparent", zIndex: 1 }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>logout</span>
          Salir
        </button>

        <div style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", background: accent, borderRadius: 3, padding: "4px 10px", marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.14em" }}>Veedor</span>
        </div>

        <h1 style={{ position: "relative", zIndex: 1, fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 28, fontWeight: 400, lineHeight: 1, color: "#0f172a", textTransform: "uppercase", margin: "0 0 4px", textAlign: "center" }}>{clubNombre}</h1>
        <p style={{ position: "relative", zIndex: 1, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Torneo Interclubes · Abr 2026</p>
      </div>

      {/* Partidos */}
      <div style={{ padding: "4px 14px 100px" }}>
        {live.length > 0 && (
          <>
            <SectionLabel label="En cancha" count={live.length} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {live.map(p => <LiveCard key={p.id} partido={p} onCargar={() => setSheetPartido(p)} />)}
            </div>
          </>
        )}

        {proximos.length > 0 && (
          <>
            <SectionLabel label="Próximos" count={proximos.length} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {proximos.map(p => {
                const esNext = p.id === nextPorCancha(p.cancha)?.id
                const libre  = canchaLibre(p.cancha)
                return <PartidoCard key={p.id} partido={p} onIniciar={esNext && libre ? () => iniciar(p.id) : undefined} />
              })}
            </div>
          </>
        )}

        {finalizados.length > 0 && (
          <>
            <SectionLabel label="Finalizados" count={finalizados.length} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {finalizados.map(p => <PartidoCard key={p.id} partido={p} onEditar={() => setSheetPartido(p)} />)}
            </div>
          </>
        )}
      </div>

      {sheetPartido && (
        <ResultadoSheet
          partido={sheetPartido}
          onClose={() => setSheetPartido(null)}
          onGuardarParcial={sets => guardarParcial(sheetPartido.id, sets)}
          onGuardar={(sets, ganador) => confirmar(sheetPartido.id, sets, ganador)}
          isEditing={sheetPartido.estado === "finalizado"}
        />
      )}

      {siguienteDialog && (
        <SiguienteDialog
          siguiente={siguienteDialog}
          onSi={() => { iniciar(siguienteDialog.id); setSiguienteDialog(null) }}
          onNo={() => setSiguienteDialog(null)}
          onCorregir={() => {
            setSiguienteDialog(null)
            if (ultimoFinalizado) {
              setPartidos(prev => prev.map(p => p.id === ultimoFinalizado.id ? { ...p, estado: "en_vivo" as const } : p))
              setSheetPartido({ ...ultimoFinalizado, estado: "en_vivo" as const })
            }
          }}
        />
      )}

      <style>{`
        @keyframes pulseLive {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.6; transform:scale(1.3); }
        }
        .live-dot { animation: pulseLive 1.8s ease-in-out infinite; }
      `}</style>
    </div>
  )
}
