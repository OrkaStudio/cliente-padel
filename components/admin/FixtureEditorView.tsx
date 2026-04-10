"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { moverPartidoAction } from "@/actions/partidos.actions"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any
type Sede = {
  id: string
  nombre: string
  canchas_count: number
  horario_inicio: string
  horario_fin: string
  duracion_turno: number
}

function generarSlots(sede: Sede, fecha: string): string[] {
  const slots: string[] = []
  const [hIni = 0, mIni = 0] = sede.horario_inicio.split(":").map(Number)
  const [hFin = 22, mFin = 0] = sede.horario_fin.split(":").map(Number)
  let minutos = hIni * 60 + mIni
  const finMinutos = hFin * 60 + mFin
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

function fechaDePartido(iso: string) {
  return new Date(iso).toISOString().slice(0, 10)
}

export function FixtureEditorView({ partidos, sedes }: { partidos: Partido[]; sedes: Sede[] }) {
  const [selSede, setSelSede] = useState<string>(sedes[0]?.id ?? "")
  const [selCat, setSelCat] = useState<string>("todas")

  const sede = sedes.find(s => s.id === selSede)
  const partidosDeSede = partidos.filter((p: Partido) => p.sedes?.id === selSede)

  const categorias = Array.from(
    new Map(
      partidosDeSede
        .filter((p: Partido) => p.categorias?.id)
        .map((p: Partido) => [p.categorias.id, p.categorias.nombre])
    ).entries()
  )

  const partidosFiltrados = selCat === "todas"
    ? partidosDeSede
    : partidosDeSede.filter((p: Partido) => p.categorias?.id === selCat)

  const canchas = sede ? Array.from({ length: sede.canchas_count }, (_, i) => i + 1) : []

  // Slots: derivar fecha del primer partido de la sede, fallback a hoy
  const fechaRef = partidosDeSede[0]?.horario
    ? fechaDePartido(partidosDeSede[0].horario)
    : new Date().toISOString().slice(0, 10)
  const slots = sede ? generarSlots(sede, fechaRef) : []

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Selector de sede */}
      {sedes.length > 1 && (
        <div style={{
          display: "flex", gap: 8, padding: "10px 16px",
          overflowX: "auto", borderBottom: "1px solid #e2e8f0", background: "#fff",
        }}>
          {sedes.map(s => (
            <button key={s.id} onClick={() => { setSelSede(s.id); setSelCat("todas") }}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", flexShrink: 0,
                background: selSede === s.id ? "#0f172a" : "#f1f5f9",
                color: selSede === s.id ? "#fff" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 900, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.04em",
                WebkitTapHighlightColor: "transparent",
              }}>
              {s.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Filtro por categoría */}
      {categorias.length > 1 && (
        <div style={{
          display: "flex", gap: 6, padding: "10px 16px",
          overflowX: "auto", borderBottom: "1px solid #e2e8f0", background: "#fff",
        }}>
          {[["todas", "Todas"] as [string, string], ...categorias].map(([id, nombre]) => (
            <button key={id} onClick={() => setSelCat(id)}
              style={{
                padding: "5px 12px", borderRadius: 20, border: "1.5px solid", flexShrink: 0,
                borderColor: selCat === id ? "#0f172a" : "#e2e8f0",
                background: selCat === id ? "#0f172a" : "#fff",
                color: selCat === id ? "#fff" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.04em",
                WebkitTapHighlightColor: "transparent",
              }}>
              {nombre}
            </button>
          ))}
        </div>
      )}

      {/* Lista de partidos */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {partidosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 32, display: "block", marginBottom: 8 }}>
              sports_tennis
            </span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12 }}>
              No hay partidos en esta sede
            </p>
          </div>
        ) : (
          partidosFiltrados.map((p: Partido) => (
            <FilaPartido
              key={p.id}
              partido={p}
              slots={slots}
              canchas={canchas}
              todosPartidos={partidosDeSede}
            />
          ))
        )}
      </div>
    </div>
  )
}

function FilaPartido({ partido, slots, canchas, todosPartidos }: {
  partido: Partido
  slots: string[]
  canchas: number[]
  todosPartidos: Partido[]
}) {
  const [horario, setHorario] = useState<string>(partido.horario ?? "")
  const [cancha, setCancha] = useState<number>(partido.cancha ?? 1)
  const [pending, startTransition] = useTransition()
  const [guardado, setGuardado] = useState(false)
  const router = useRouter()

  const sinCambios = horario === partido.horario && cancha === partido.cancha

  const conflicto = todosPartidos.find(p =>
    p.id !== partido.id &&
    p.cancha === cancha &&
    new Date(p.horario).toISOString().slice(0, 16) === new Date(horario).toISOString().slice(0, 16)
  )

  const handleGuardar = () => {
    startTransition(async () => {
      const [, err] = await moverPartidoAction({
        partidoId: partido.id,
        nuevoHorario: horario,
        nuevaCancha: cancha,
        ...(conflicto ? { intercambiarCon: conflicto.id } : {}),
      })
      if (!err) {
        setGuardado(true)
        setTimeout(() => setGuardado(false), 2000)
        router.refresh()
      }
    })
  }

  const estadoColor: Record<string, string> = {
    pendiente: "#e2e8f0",
    en_vivo: "#bcff00",
    finalizado: "#94a3b8",
  }
  const accentColor = estadoColor[partido.estado] ?? "#e2e8f0"

  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #e2e8f0",
      borderLeft: `4px solid ${accentColor}`,
      padding: "14px",
    }}>
      {/* Categoría + parejas */}
      {partido.categorias?.nombre && (
        <p style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 900, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px",
        }}>
          {partido.categorias.nombre}
        </p>
      )}
      <p style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 12px", lineHeight: 1.3,
      }}>
        {nombrePareja(partido.pareja1)}
        <span style={{ fontWeight: 400, color: "#94a3b8", margin: "0 6px" }}>vs</span>
        {nombrePareja(partido.pareja2)}
      </p>

      {/* Selects */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <p style={labelStyle}>Horario</p>
          <select
            value={horario}
            onChange={e => { setHorario(e.target.value); setGuardado(false) }}
            style={selectStyle}
          >
            {slots.map(s => (
              <option key={s} value={s}>{formatHora(s)}</option>
            ))}
          </select>
        </div>

        <div style={{ width: 90 }}>
          <p style={labelStyle}>Cancha</p>
          <select
            value={cancha}
            onChange={e => { setCancha(Number(e.target.value)); setGuardado(false) }}
            style={selectStyle}
          >
            {canchas.map(c => (
              <option key={c} value={c}>Cancha {c}</option>
            ))}
          </select>
        </div>

        {/* Botón guardar — solo visible si hay cambios */}
        {!sinCambios && (
          <button
            onClick={handleGuardar}
            disabled={pending}
            style={{
              flexShrink: 0, padding: "0 14px", height: 38,
              borderRadius: 8, border: "none",
              background: pending ? "#e2e8f0" : conflicto ? "#f59e0b" : "#0f172a",
              color: pending ? "#94a3b8" : "#fff",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, fontWeight: 900, cursor: pending ? "not-allowed" : "pointer",
              WebkitTapHighlightColor: "transparent",
              whiteSpace: "nowrap",
            }}
          >
            {pending ? "..." : conflicto ? "↕ Swap" : "Guardar"}
          </button>
        )}

        {/* Confirmación */}
        {sinCambios && guardado && (
          <div style={{
            flexShrink: 0, display: "flex", alignItems: "center", gap: 4, height: 38,
          }}>
            <span style={{
              fontFamily: "'Material Symbols Outlined'", fontSize: 18,
              color: "#22c55e", lineHeight: 1,
            }}>check_circle</span>
          </div>
        )}
      </div>

      {/* Aviso de swap */}
      {!sinCambios && conflicto && (
        <p style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, color: "#92400e", margin: "8px 0 0",
          background: "#fef3c7", borderRadius: 6, padding: "5px 8px",
        }}>
          Ese slot tiene otro partido — se intercambiarán
        </p>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontSize: 9, fontWeight: 900, color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: "0.06em",
  margin: "0 0 4px",
}

const selectStyle: React.CSSProperties = {
  width: "100%", height: 38, padding: "0 8px",
  border: "1px solid #e2e8f0", borderRadius: 8,
  background: "#f8fafc", outline: "none",
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontSize: 12, color: "#0f172a", cursor: "pointer",
  appearance: "auto",
}
