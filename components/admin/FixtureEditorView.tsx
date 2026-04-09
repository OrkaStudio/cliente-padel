"use client"

import { useState, useMemo } from "react"
import { FixtureEditSheet } from "./FixtureEditSheet"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any
type Sede = { id: string; nombre: string; canchas_count: number; horario_inicio: string; horario_fin: string; duracion_turno: number }

function generarSlots(sede: Sede): string[] {
  const slots: string[] = []
  const hoy = new Date().toISOString().slice(0, 10)
  const [hIni = 0, mIni = 0] = sede.horario_inicio.split(":").map(Number)
  const [hFin = 22, mFin = 0] = sede.horario_fin.split(":").map(Number)
  let minutos = hIni * 60 + mIni
  const finMinutos = hFin * 60 + mFin
  while (minutos < finMinutos) {
    const h = String(Math.floor(minutos / 60)).padStart(2, "0")
    const m = String(minutos % 60).padStart(2, "0")
    slots.push(`${hoy}T${h}:${m}:00-03:00`)
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

const ESTADO_COLOR: Record<string, string> = {
  pendiente:  "#e2e8f0",
  en_vivo:    "#bcff00",
  finalizado: "#f1f5f9",
}

export function FixtureEditorView({ partidos, sedes }: { partidos: Partido[]; sedes: Sede[] }) {
  const [selSede, setSelSede] = useState<string>(sedes[0]?.id ?? "")
  const [editPartido, setEditPartido] = useState<Partido | null>(null)

  const sede = sedes.find(s => s.id === selSede)
  const slots = sede ? generarSlots(sede) : []
  const canchas = sede ? Array.from({ length: sede.canchas_count }, (_, i) => i + 1) : []

  const partidosDeSede = useMemo(
    () => partidos.filter((p: Partido) => p.sedes?.id === selSede),
    [partidos, selSede]
  )

  // Mapa: "horario|cancha" → partido
  const mapa = useMemo(() => {
    const m = new Map<string, Partido>()
    partidosDeSede.forEach((p: Partido) => {
      if (p.horario && p.cancha) {
        const key = `${new Date(p.horario).toISOString().slice(0, 16)}|${p.cancha}`
        m.set(key, p)
      }
    })
    return m
  }, [partidosDeSede])

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Selector de sede */}
      {sedes.length > 1 && (
        <div style={{
          display: "flex", gap: 8, padding: "10px 16px",
          overflowX: "auto", borderBottom: "1px solid #e2e8f0",
          background: "#fff",
        }}>
          {sedes.map(s => (
            <button
              key={s.id}
              onClick={() => setSelSede(s.id)}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: selSede === s.id ? "#0f172a" : "#f1f5f9",
                color: selSede === s.id ? "#fff" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 900, cursor: "pointer",
                whiteSpace: "nowrap", WebkitTapHighlightColor: "transparent",
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}
            >
              {s.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Grilla */}
      {sede ? (
        <div style={{ overflowX: "auto", padding: "16px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `80px ${canchas.map(() => "1fr").join(" ")}`,
            gap: 4,
            minWidth: 80 + canchas.length * 140,
          }}>
            {/* Header de canchas */}
            <div />
            {canchas.map(c => (
              <div key={c} style={{
                textAlign: "center", padding: "8px 4px",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10, fontWeight: 900, color: "#64748b",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                Cancha {c}
              </div>
            ))}

            {/* Filas por horario */}
            {slots.map(slot => {
              const slotKey = new Date(slot).toISOString().slice(0, 16)
              return [
                // Hora
                <div key={`hora-${slot}`} style={{
                  display: "flex", alignItems: "center",
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 13, color: "#64748b", paddingRight: 8,
                }}>
                  {formatHora(slot)}
                </div>,
                // Celdas por cancha
                ...canchas.map(c => {
                  const key = `${slotKey}|${c}`
                  const p = mapa.get(key)
                  return (
                    <CeldaPartido
                      key={key}
                      partido={p}
                      onEdit={() => p && setEditPartido(p)}
                    />
                  )
                }),
              ]
            })}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 16px", color: "#94a3b8" }}>
          <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13 }}>
            No hay sedes configuradas
          </p>
        </div>
      )}

      {/* Sheet de edición */}
      {editPartido && sede && (
        <FixtureEditSheet
          partido={editPartido}
          sede={sede}
          todosPartidos={partidosDeSede}
          onClose={() => setEditPartido(null)}
        />
      )}
    </div>
  )
}

function CeldaPartido({ partido, onEdit }: { partido: Partido | undefined; onEdit: () => void }) {
  if (!partido) {
    return (
      <div style={{
        borderRadius: 8, border: "1px dashed #e2e8f0",
        minHeight: 72, background: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "'Material Symbols Outlined'",
          fontSize: 16, color: "#e2e8f0", lineHeight: 1,
        }}>sports_tennis</span>
      </div>
    )
  }

  const color = ESTADO_COLOR[partido.estado] ?? "#e2e8f0"
  const isLive = partido.estado === "en_vivo"

  return (
    <button
      onClick={onEdit}
      style={{
        borderRadius: 8,
        border: `1px solid ${isLive ? "#bcff00" : "#e2e8f0"}`,
        borderLeft: `4px solid ${color}`,
        minHeight: 72, background: "#fff",
        padding: "8px", textAlign: "left",
        cursor: "pointer", WebkitTapHighlightColor: "transparent",
        display: "flex", flexDirection: "column", gap: 4,
      }}
    >
      {partido.categorias?.nombre && (
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 8, fontWeight: 900, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          {partido.categorias.nombre}
        </span>
      )}
      <span style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 10, fontWeight: 700, color: "#0f172a", lineHeight: 1.3,
      }}>
        {nombrePareja(partido.pareja1)}
      </span>
      <span style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 9, color: "#94a3b8",
      }}>vs</span>
      <span style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 10, fontWeight: 700, color: "#0f172a", lineHeight: 1.3,
      }}>
        {nombrePareja(partido.pareja2)}
      </span>
      <span style={{
        fontFamily: "'Material Symbols Outlined'",
        fontSize: 12, color: "#cbd5e1", lineHeight: 1, alignSelf: "flex-end",
      }}>
        edit
      </span>
    </button>
  )
}
