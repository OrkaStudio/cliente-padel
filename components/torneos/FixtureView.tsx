"use client"

import { useState, useMemo } from "react"
import { Chip } from "@/components/ui/padel/Chip"
import { StatusBadge } from "@/components/ui/padel/StatusBadge"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any

function formatPareja(pareja: { jugador1: { nombre: string; apellido: string } | null; jugador2: { nombre: string; apellido: string } | null } | null) {
  if (!pareja) return "—"
  const j1 = pareja.jugador1 ? `${pareja.jugador1.apellido}` : ""
  const j2 = pareja.jugador2 ? pareja.jugador2.apellido : ""
  if (j1 && j2) return `${j1} / ${j2}`
  return j1 || j2 || "—"
}

function formatHora(horario: string | null) {
  if (!horario) return "--:--"
  return new Date(horario).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

function formatFecha(horario: string | null) {
  if (!horario) return "Sin fecha"
  const d = new Date(horario)
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
}

function getDayKey(horario: string | null) {
  if (!horario) return "sin-fecha"
  return new Date(horario).toISOString().slice(0, 10)
}

const VENUE_COLORS: Record<string, string> = {
  "Voleando": "#bcff00",
  "Por Tres": "#60a5fa",
  "Más Pádel": "#f97316",
  "default": "#cbd5e1",
}

function getVenueColor(sedeName: string | undefined) {
  if (!sedeName) return VENUE_COLORS.default
  return VENUE_COLORS[sedeName] ?? VENUE_COLORS.default
}

function formatScore(resultado: { sets_pareja1: number; sets_pareja2: number } | null) {
  if (!resultado) return null
  return `${resultado.sets_pareja1} – ${resultado.sets_pareja2}`
}

export function FixtureView({ partidos }: { partidos: Partido[] }) {
  const [search, setSearch] = useState("")
  const [selSede, setSelSede] = useState<string | null>(null)

  // Extract unique sedes
  const sedes = useMemo(() => {
    const map = new Map<string, string>()
    partidos.forEach((p: Partido) => {
      if (p.sedes?.id && p.sedes?.nombre) map.set(p.sedes.id, p.sedes.nombre)
    })
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }))
  }, [partidos])

  // Filter
  const filtered = useMemo(() => {
    let list = partidos
    if (selSede) list = list.filter((p: Partido) => p.sedes?.id === selSede)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p: Partido) => {
        const p1 = formatPareja(p.pareja1).toLowerCase()
        const p2 = formatPareja(p.pareja2).toLowerCase()
        return p1.includes(q) || p2.includes(q)
      })
    }
    return list
  }, [partidos, selSede, search])

  const live = filtered.filter((p: Partido) => p.estado === "en_vivo")
  const rest = filtered.filter((p: Partido) => p.estado !== "en_vivo")

  // Group rest by day
  const byDay = useMemo(() => {
    const map = new Map<string, { label: string; partidos: Partido[] }>()
    rest.forEach((p: Partido) => {
      const key = getDayKey(p.horario)
      if (!map.has(key)) {
        map.set(key, { label: formatFecha(p.horario), partidos: [] })
      }
      map.get(key)!.partidos.push(p)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [rest])

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Search + filter sticky */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "rgba(248,250,252,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #cbd5e1",
        padding: "10px 16px 0",
      }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#f1f5f9", border: "1px solid #e2e8f0",
          borderRadius: 8, padding: "8px 12px", marginBottom: 10,
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: "#94a3b8", lineHeight: 1 }}>search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar jugador..."
            style={{
              flex: 1, border: "none", background: "transparent", outline: "none",
              fontSize: 13, color: "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1 }}>close</span>
            </button>
          )}
        </div>

        {/* Sede chips */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "0 0 10px" }}>
          <Chip small active={!selSede} onClick={() => setSelSede(null)}>Todas</Chip>
          {sedes.map(s => (
            <Chip key={s.id} small active={selSede === s.id} onClick={() => setSelSede(s.id)}>
              {s.nombre}
            </Chip>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        {/* EN VIVO section */}
        {live.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#bcff00", borderRadius: 4, padding: "4px 10px",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%", background: "#0f172a",
                  animation: "pulse 1.2s ease-in-out infinite",
                }} />
                <span style={{
                  fontSize: 10, fontWeight: 900, color: "#0f172a",
                  fontFamily: "var(--font-space-grotesk), sans-serif", letterSpacing: "0.08em",
                }}>EN VIVO</span>
              </div>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {live.map((p: Partido, i: number) => (
                <PartidoRow key={p.id} partido={p} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* By day */}
        {byDay.map(([dayKey, { label, partidos: dayPartidos }]) => (
          <div key={dayKey} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase",
                fontFamily: "var(--font-space-grotesk), sans-serif", letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dayPartidos.map((p: Partido, i: number) => (
                <PartidoRow key={p.id} partido={p} index={i} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, display: "block" }}>sports_tennis</span>
            <p style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, marginTop: 8,
            }}>
              {search ? "Sin resultados para tu búsqueda" : "Sin partidos cargados"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function PartidoRow({ partido: p, index }: { partido: Partido; index: number }) {
  const venueColor = getVenueColor(p.sedes?.nombre)
  const score = formatScore(p.resultado)
  const isLive = p.estado === "en_vivo"
  const isFin = p.estado === "finalizado"

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      borderLeft: `4px solid ${venueColor}`,
      overflow: "hidden",
      // Emil: stagger fade-up, 50ms per item
      animation: "fadeUp 300ms cubic-bezier(0.23, 1, 0.32, 1) both",
      animationDelay: `${index * 50}ms`,
    }}>
      {/* Top bar: hora + cancha + sede + status */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px",
        background: "#f8fafc",
        borderBottom: "1px solid #f1f5f9",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 13, fontWeight: 400, color: "#0f172a",
          }}>
            {formatHora(p.horario)}
          </span>
          {p.cancha && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#64748b",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              background: "#f1f5f9", padding: "2px 6px", borderRadius: 3,
            }}>
              C{p.cancha}
            </span>
          )}
          {p.sedes?.nombre && (
            <span style={{
              fontSize: 10, color: "#94a3b8",
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}>
              {p.sedes.nombre}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {p.categorias?.nombre && (
            <span style={{
              fontSize: 9, fontWeight: 900, color: "#64748b",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              background: "#f1f5f9", padding: "2px 7px", borderRadius: 3,
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              {p.categorias.nombre}
            </span>
          )}
          <StatusBadge status={p.estado} />
        </div>
      </div>

      {/* Teams + score */}
      <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}>
        {/* Pareja 1 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: "#0f172a",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            lineHeight: 1.3,
          }}>
            {formatPareja(p.pareja1)}
          </span>
        </div>

        {/* Score / VS */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          minWidth: 52,
        }}>
          {score ? (
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: isFin ? 18 : 16, fontWeight: 400,
              color: isLive ? "#0f172a" : "#64748b",
              background: isLive ? "#bcff00" : isFin ? "#f1f5f9" : "transparent",
              padding: "2px 8px", borderRadius: 4,
              letterSpacing: "0.02em",
            }}>
              {score}
            </span>
          ) : (
            <span style={{
              fontSize: 10, fontWeight: 900, color: "#94a3b8",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              letterSpacing: "0.08em",
            }}>VS</span>
          )}
        </div>

        {/* Pareja 2 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "right" }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: "#0f172a",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            lineHeight: 1.3,
          }}>
            {formatPareja(p.pareja2)}
          </span>
        </div>
      </div>
    </div>
  )
}
