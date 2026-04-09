"use client"

import { useState } from "react"
import type { DisponibilidadMap } from "@/types/torneo"

type Props = {
  disponibilidad: DisponibilidadMap
  horario_inicio: string
  horario_fin: string
  duracion_turno: string
  fechas: string[]
  onChange: (disponibilidad: DisponibilidadMap) => void
}

function generarSlots(inicio: string, fin: string, duracionMin: number): string[] {
  const slots: string[] = []
  if (!inicio || !fin) return slots

  const [hi, mi] = inicio.split(":").map(Number)
  const [hf, mf] = fin.split(":").map(Number)
  let minutos = hi * 60 + mi
  const finMin = hf * 60 + mf

  while (minutos + duracionMin <= finMin) {
    const h = String(Math.floor(minutos / 60)).padStart(2, "0")
    const m = String(minutos % 60).padStart(2, "0")
    slots.push(`${h}:${m}`)
    minutos += duracionMin
  }
  return slots
}

function formatFecha(iso: string): string {
  if (!iso) return ""
  const [, mes, dia] = iso.split("-")
  const dias = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"]
  const d = new Date(iso + "T12:00:00")
  return `${dias[d.getDay()]} ${dia}/${mes}`
}

export function SlotPicker({
  disponibilidad,
  horario_inicio,
  horario_fin,
  duracion_turno,
  fechas,
  onChange,
}: Props) {
  const [canchaActiva, setCanchaActiva] = useState<"1" | "2">("1")
  const [fechaActiva, setFechaActiva] = useState<string>(fechas[0] ?? "")

  const duracion = parseInt(duracion_turno, 10) || 90
  const slots = generarSlots(horario_inicio, horario_fin, duracion)

  const selectedSlots: string[] =
    disponibilidad[canchaActiva]?.[fechaActiva] ?? []

  function toggleSlot(slot: string) {
    const actual = disponibilidad[canchaActiva]?.[fechaActiva] ?? []
    const updated = actual.includes(slot)
      ? actual.filter((s) => s !== slot)
      : [...actual, slot]

    onChange({
      ...disponibilidad,
      [canchaActiva]: {
        ...(disponibilidad[canchaActiva] ?? {}),
        [fechaActiva]: updated,
      },
    })
  }

  function totalSlots(): number {
    let total = 0
    for (const cancha of ["1", "2"]) {
      for (const fecha of fechas) {
        total += disponibilidad[cancha]?.[fecha]?.length ?? 0
      }
    }
    return total
  }

  if (fechas.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic">
        Definí las fechas del torneo para ver los slots.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs cancha */}
      <div className="flex gap-2">
        {(["1", "2"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCanchaActiva(c)}
            className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              backgroundColor: canchaActiva === c ? "#0f172a" : "#e2e8f0",
              color: canchaActiva === c ? "#ffffff" : "#64748b",
            }}
          >
            Cancha {c}
          </button>
        ))}
      </div>

      {/* Tabs fecha */}
      <div className="flex gap-2 flex-wrap">
        {fechas.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFechaActiva(f)}
            className="px-3 py-1 rounded text-xs font-semibold transition-all"
            style={{
              backgroundColor: fechaActiva === f ? "#bcff00" : "#f1f5f9",
              color: "#0f172a",
            }}
          >
            {formatFecha(f)}
          </button>
        ))}
      </div>

      {/* Grid de slots */}
      {slots.length === 0 ? (
        <p className="text-sm text-slate-400 italic">
          Definí horario inicio/fin para ver los slots.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => {
            const activo = selectedSlots.includes(slot)
            return (
              <button
                key={slot}
                type="button"
                onClick={() => toggleSlot(slot)}
                className="px-3 py-1.5 rounded text-sm font-mono font-semibold transition-all border"
                style={{
                  backgroundColor: activo ? "#bcff00" : "#ffffff",
                  borderColor: activo ? "#bcff00" : "#e2e8f0",
                  color: "#0f172a",
                }}
              >
                {slot}
              </button>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-400" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
        {totalSlots()} turnos totales seleccionados en esta sede
      </p>
    </div>
  )
}
