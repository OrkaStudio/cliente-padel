"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any

const SEDE_COLORS: Record<string, string> = {
  "Voleando":  "#22c55e",
  "Más Pádel": "#f97316",
  "Por Tres":  "#a855f7",
}
const DEFAULT_COLOR = "#94a3b8"

function sedeColor(nombre?: string) {
  if (!nombre) return DEFAULT_COLOR
  return SEDE_COLORS[nombre] ?? DEFAULT_COLOR
}

function formatHora(horario: string | null) {
  if (!horario) return "--:--"
  return new Date(horario).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })
}

function formatDia(horario: string | null) {
  if (!horario) return "Sin fecha"
  return new Date(horario).toLocaleDateString("es-AR", { weekday: "long", day: "numeric" })
}

function getDayKey(horario: string | null) {
  if (!horario) return "sin-fecha"
  return new Date(horario).toISOString().slice(0, 10)
}

function formatPareja(pareja: {
  jugador1: { nombre: string; apellido: string } | null
  jugador2: { nombre: string; apellido: string } | null
} | null) {
  if (!pareja) return "—"
  const j1 = pareja.jugador1?.apellido ?? ""
  const j2 = pareja.jugador2?.apellido ?? ""
  if (j1 && j2) return `${j1} / ${j2}`
  return j1 || j2 || "—"
}

// Busca por nombre y/o apellido, soporta múltiples términos ("Juan García" → ["juan","garcía"])
function matchesSearch(p: Partido, query: string) {
  if (!query.trim()) return true
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const jugadores = [
    p.pareja1?.jugador1, p.pareja1?.jugador2,
    p.pareja2?.jugador1, p.pareja2?.jugador2,
  ]
  return jugadores.some(j => {
    if (!j) return false
    const full = `${j.nombre} ${j.apellido}`.toLowerCase()
    return terms.every(t => full.includes(t))
  })
}

interface DayData {
  label: string
  shortDay: string
  num: number
  total: number
  jugados: number
  hasLive: boolean
}

export function FixtureView({ partidos }: { partidos: Partido[] }) {
  const [search, setSearch]           = useState("")
  const [showFinalizados, setShowFin] = useState(false)
  const [selDay, setSelDay]           = useState<string | null>(null)
  const [selCat, setSelCat]           = useState<string | null>(null)
  const [favoritoId, setFavoritoId]   = useState<string | null>(null)

  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const selSede      = searchParams.get("sede")

  useEffect(() => {
    setFavoritoId(localStorage.getItem("padel_favorite"))
  }, [])

  const toggleFavorito = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (favoritoId === id) {
      localStorage.removeItem("padel_favorite")
      setFavoritoId(null)
    } else {
      localStorage.setItem("padel_favorite", id)
      setFavoritoId(id)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectSede = (id: string | null) => {
    const url = id ? `${pathname}?sede=${id}` : pathname
    router.replace(url as any, { scroll: false })
  }

  const toggleDay = (key: string) => {
    setSelDay(prev => prev === key ? null : key)
    setShowFin(false)
  }

  // ── Sedes únicas ──
  const sedes = useMemo(() => {
    const map = new Map<string, string>()
    partidos.forEach((p: Partido) => {
      if (p.sedes?.id && p.sedes?.nombre) map.set(p.sedes.id, p.sedes.nombre)
    })
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }))
  }, [partidos])

  // ── Categorías únicas ──
  const categorias = useMemo(() => {
    const set = new Set<string>()
    partidos.forEach((p: Partido) => {
      if (p.categorias?.nombre) set.add(p.categorias.nombre)
    })
    return Array.from(set).sort()
  }, [partidos])

  // ── Tabs de días con stats ──
  const days = useMemo(() => {
    const map = new Map<string, DayData>()
    partidos.forEach((p: Partido) => {
      const key = getDayKey(p.horario)
      if (!map.has(key)) {
        const d = new Date(p.horario ?? "")
        const valid = !isNaN(d.getTime())
        const shortDay = valid
          ? d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "").toUpperCase().slice(0, 3)
          : "—"
        map.set(key, {
          label: formatDia(p.horario),
          shortDay,
          num: valid ? d.getDate() : 0,
          total: 0, jugados: 0, hasLive: false,
        })
      }
      const entry = map.get(key)!
      entry.total++
      if (p.estado === "finalizado") entry.jugados++
      if (p.estado === "en_vivo")    entry.hasLive = true
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [partidos])

  // ── Partidos filtrados ──
  const filtered = useMemo(() => {
    let list = partidos
    if (selSede) list = list.filter((p: Partido) => p.sedes?.id === selSede)
    if (selCat)  list = list.filter((p: Partido) => p.categorias?.nombre === selCat)
    if (selDay)  list = list.filter((p: Partido) => getDayKey(p.horario) === selDay)
    if (search.trim()) list = list.filter((p: Partido) => matchesSearch(p, search))
    if (favoritoId) {
      list = [...list].sort((a, b) => {
        const af = a.pareja1_id === favoritoId || a.pareja2_id === favoritoId
        const bf = b.pareja1_id === favoritoId || b.pareja2_id === favoritoId
        return (af === bf) ? 0 : af ? -1 : 1
      })
    }
    return list
  }, [partidos, selSede, selCat, selDay, search, favoritoId])

  const live       = filtered.filter((p: Partido) => p.estado === "en_vivo")
  const pendientes = filtered.filter((p: Partido) => p.estado === "pendiente")
  const finalizados = filtered.filter((p: Partido) => p.estado === "finalizado")

  // ── Pendientes agrupados por día (solo si no hay día seleccionado) ──
  const byDay = useMemo(() => {
    if (selDay) return []
    const map = new Map<string, { label: string; partidos: Partido[] }>()
    pendientes.forEach((p: Partido) => {
      const key = getDayKey(p.horario)
      if (!map.has(key)) map.set(key, { label: formatDia(p.horario), partidos: [] })
      map.get(key)!.partidos.push(p)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [pendientes, selDay])

  const hasFilters = !!selSede || !!selCat || !!selDay || !!search.trim()

  return (
    <div style={{ paddingBottom: 100 }}>

      {/* ── Sticky header ── */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "rgba(248,250,252,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        paddingTop: 10,
      }}>

        {/* Tabs de días */}
        {days.length > 1 && (
          <div style={{
            display: "flex", gap: 8, overflowX: "auto",
            padding: "0 16px 10px", scrollbarWidth: "none",
          }}>
            {days.map(([key, d]) => (
              <DayTab
                key={key}
                active={selDay === key}
                hasLive={d.hasLive}
                shortDay={d.shortDay}
                num={d.num}
                jugados={d.jugados}
                total={d.total}
                onClick={() => toggleDay(key)}
              />
            ))}
          </div>
        )}

        {/* Search */}
        <div style={{ padding: "0 16px", marginBottom: 10 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 10, padding: "9px 12px",
          }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1 }}>
              search
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o apellido..."
              style={{
                flex: 1, border: "none", background: "transparent", outline: "none",
                fontSize: 13, color: "#0f172a",
                fontFamily: "var(--font-space-grotesk), sans-serif",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}
              >
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#94a3b8", lineHeight: 1 }}>
                  close
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Chips: sedes + categorías */}
        <div style={{
          display: "flex", gap: 6, overflowX: "auto",
          padding: "0 16px 10px", scrollbarWidth: "none", alignItems: "center",
        }}>
          <FilterChip active={!selSede} onClick={() => selectSede(null)}>Todas las sedes</FilterChip>
          {sedes.map(s => (
            <FilterChip key={s.id} active={selSede === s.id} onClick={() => selectSede(s.id)} color={sedeColor(s.nombre)}>
              {s.nombre}
            </FilterChip>
          ))}

          {categorias.length > 1 && (
            <>
              <div style={{ width: 1, alignSelf: "stretch", background: "#e2e8f0", flexShrink: 0, margin: "2px 4px" }} />
              <FilterChip active={!selCat} onClick={() => setSelCat(null)}>Todas</FilterChip>
              {categorias.map(cat => (
                <FilterChip key={cat} active={selCat === cat} onClick={() => setSelCat(cat)}>
                  {cat}
                </FilterChip>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Status bar ── */}
      {(live.length > 0 || pendientes.length > 0 || finalizados.length > 0) && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          padding: "10px 16px 0",
        }}>
          {live.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%", background: "#22c55e",
                animation: "pulseLive 2s infinite ease-in-out",
              }} />
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 700, color: "#15803d" }}>
                {live.length} en vivo
              </span>
            </div>
          )}
          {live.length > 0 && pendientes.length > 0 && <span style={{ color: "#cbd5e1", fontSize: 11 }}>·</span>}
          {pendientes.length > 0 && (
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, color: "#64748b" }}>
              {pendientes.length} por jugar
            </span>
          )}
          {finalizados.length > 0 && (
            <>
              <span style={{ color: "#cbd5e1", fontSize: 11 }}>·</span>
              <button
                onClick={() => setShowFin(v => !v)}
                style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 3,
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 11, color: "#64748b",
                }}
              >
                {showFinalizados ? "Ocultar" : "Ver"} {finalizados.length} finalizados
                <span style={{
                  fontFamily: "'Material Symbols Outlined'", fontSize: 13, lineHeight: 1,
                  display: "inline-block",
                  transform: showFinalizados ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}>expand_more</span>
              </button>
            </>
          )}
        </div>
      )}

      <div style={{ padding: "12px 16px 0" }}>

        {/* ── EN VIVO ── */}
        {live.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulseLive 2s infinite ease-in-out", flexShrink: 0 }} />
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 900, color: "#15803d",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>EN VIVO</span>
              <div style={{ flex: 1, height: 1.5, background: "#22c55e", opacity: 0.3 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {live.map((p: Partido, i: number) => (
                <PartidoCard key={p.id} partido={p} index={i} favoritoId={favoritoId} toggleFavorito={toggleFavorito} />
              ))}
            </div>
          </div>
        )}

        {/* ── Por día (cuando no hay día seleccionado) ── */}
        {!selDay && byDay.map(([dayKey, { label, partidos: dayP }]) => {
          const dayRaw = days.find(([k]) => k === dayKey)?.[1]
          return (
            <div key={dayKey} style={{ marginBottom: 20 }}>
              <DayHeader label={label} jugados={dayRaw?.jugados ?? 0} total={dayRaw?.total ?? 0} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {dayP.map((p: Partido, i: number) => (
                  <PartidoCard key={p.id} partido={p} index={i} favoritoId={favoritoId} toggleFavorito={toggleFavorito} />
                ))}
              </div>
            </div>
          )
        })}

        {/* ── Pendientes (cuando hay día seleccionado) ── */}
        {selDay && pendientes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
            {pendientes.map((p: Partido, i: number) => (
              <PartidoCard key={p.id} partido={p} index={i} favoritoId={favoritoId} toggleFavorito={toggleFavorito} />
            ))}
          </div>
        )}

        {/* ── Finalizados (expandible) ── */}
        {finalizados.length > 0 && showFinalizados && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 20, height: 1, background: "#e2e8f0" }} />
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 900, color: "#94a3b8",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                Finalizados · {finalizados.length}
              </span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {finalizados.map((p: Partido, i: number) => (
                <PartidoCard key={p.id} partido={p} index={i} favoritoId={favoritoId} toggleFavorito={toggleFavorito} />
              ))}
            </div>
          </div>
        )}

        {finalizados.length > 0 && !showFinalizados && (
          <button
            onClick={() => setShowFin(true)}
            style={{
              width: "100%", padding: "14px", background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 12, fontWeight: 700, color: "#94a3b8",
              borderTop: "1px solid #f1f5f9", marginTop: 8,
            }}
          >
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>expand_more</span>
            Finalizados · {finalizados.length}
          </button>
        )}

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, color: "#cbd5e1", display: "block" }}>
              sports_tennis
            </span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
              {search.trim()
                ? `No encontramos a "${search}"`
                : hasFilters
                  ? "Sin partidos con estos filtros"
                  : "Fixture no disponible aún"}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setSelCat(null); setSelDay(null); selectSede(null) }}
                style={{
                  marginTop: 12, background: "none", border: "1px solid #e2e8f0",
                  borderRadius: 8, padding: "8px 16px", cursor: "pointer",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, fontWeight: 700, color: "#64748b",
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseLive {
          0%   { opacity: 1; transform: scale(1); box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
          50%  { opacity: 0.6; transform: scale(1.1); box-shadow: 0 0 0 6px rgba(34,197,94,0.1); }
          100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

// ── Day Tab ────────────────────────────────────────────────────────────────

function DayTab({ active, hasLive, shortDay, num, jugados, total, onClick }: {
  active: boolean
  hasLive?: boolean
  shortDay: string
  num: number
  jugados: number
  total: number
  onClick: () => void
}) {
  const pct = total > 0 ? Math.round((jugados / total) * 100) : 0

  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 2, padding: "8px 14px", borderRadius: 12,
        border: `1.5px solid ${active ? "#0f172a" : "#e2e8f0"}`,
        background: active ? "#0f172a" : "#fff",
        cursor: "pointer", minWidth: 56, position: "relative",
        transition: "all 160ms cubic-bezier(0.23,1,0.32,1)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Dot live */}
      {hasLive && (
        <div style={{
          position: "absolute", top: -3, right: -3,
          width: 9, height: 9, borderRadius: "50%",
          background: "#22c55e", border: "2px solid #f8fafc",
        }} />
      )}

      {/* Short day name */}
      <span style={{
        fontSize: 9, fontWeight: 900, letterSpacing: "0.08em",
        textTransform: "uppercase", lineHeight: 1,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        color: active ? "rgba(255,255,255,0.5)" : "#94a3b8",
      }}>
        {shortDay}
      </span>

      {/* Day number */}
      <span style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 20, lineHeight: 1,
        color: active ? "#fff" : "#0f172a",
      }}>
        {num}
      </span>

      {/* Progress bar */}
      <div style={{
        width: "100%", height: 3, background: active ? "rgba(255,255,255,0.15)" : "#f1f5f9",
        borderRadius: 2, overflow: "hidden", marginTop: 3,
      }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: active ? (pct === 100 ? "#22c55e" : "#bcff00") : (pct === 100 ? "#22c55e" : "#bcff00"),
          borderRadius: 2,
        }} />
      </div>

      {/* Count */}
      <span style={{
        fontSize: 8, fontWeight: 700, lineHeight: 1,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        color: active ? "rgba(255,255,255,0.35)" : "#cbd5e1",
      }}>
        {jugados}/{total}
      </span>
    </button>
  )
}

// ── Day Header (sección por día en vista "todos") ─────────────────────────

function DayHeader({ label, jugados, total }: { label: string; jugados: number; total: number }) {
  const pct = total > 0 ? (jugados / total) * 100 : 0
  const done = pct === 100

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 1, background: "#e2e8f0" }} />
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, fontWeight: 900, color: "#64748b",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            {label}
          </span>
          <div style={{ width: 20, height: 1, background: "#e2e8f0" }} />
        </div>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10,
          color: done ? "#15803d" : "#94a3b8",
          fontWeight: done ? 700 : 400,
        }}>
          {jugados}/{total} jugados
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: done ? "#22c55e" : "#bcff00",
          borderRadius: 2,
          transition: "width 600ms cubic-bezier(0.23, 1, 0.32, 1)",
        }} />
      </div>
    </div>
  )
}

// ── Filter Chip ───────────────────────────────────────────────────────────

function FilterChip({
  active, onClick, color, children,
}: {
  active: boolean
  onClick: () => void
  color?: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: "5px 14px", borderRadius: 20,
        border: `1.5px solid ${active ? "#0f172a" : "#e2e8f0"}`,
        background: active ? "#0f172a" : "#fff",
        color: active ? "#fff" : color ?? "#64748b",
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 11, fontWeight: 700, cursor: "pointer",
        textTransform: "uppercase", letterSpacing: "0.04em",
        transition: "all 160ms cubic-bezier(0.23,1,0.32,1)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  )
}

// ── Partido Card ──────────────────────────────────────────────────────────

function PartidoCard({
  partido: p, index, favoritoId, toggleFavorito,
}: {
  partido: Partido
  index: number
  favoritoId?: string | null
  toggleFavorito?: (id: string, e: React.MouseEvent) => void
}) {
  const color  = sedeColor(p.sedes?.nombre)
  const isLive = p.estado === "en_vivo"
  const isFin  = p.estado === "finalizado"
  const res    = p.resultado
  const score  = res ? `${res.sets_pareja1} – ${res.sets_pareja2}` : null
  const detalle = res?.sets?.map((s: { p1: number; p2: number }) => `${s.p1}-${s.p2}`).join(" · ") ?? null

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      boxShadow: `inset 4px 0 0 ${color}, 0 2px 12px ${color}10`,
      borderRadius: 12,
      padding: "12px 14px",
      display: "flex", alignItems: "center", gap: 14,
      position: "relative",
      animation: "fadeUp 250ms cubic-bezier(0.23,1,0.32,1) both",
      animationDelay: `${Math.min(index, 8) * 40}ms`,
    }}>
      {p.categorias?.nombre && (
        <span style={{
          position: "absolute", top: 10, right: 12,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 8, fontWeight: 900, letterSpacing: "0.06em",
          textTransform: "uppercase",
          background: `${color}15`, color,
          padding: "3px 8px", borderRadius: 100,
        }}>
          {p.categorias.nombre}
        </span>
      )}

      {/* Hora + cancha + sede */}
      <div style={{ flexShrink: 0, width: 68 }}>
        <p style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 16, fontWeight: 400,
          color: isLive ? color : "#0f172a",
          margin: 0, lineHeight: 1,
        }}>
          {formatHora(p.horario)}
        </p>
        {p.cancha && (
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 700, color: "#94a3b8",
            textTransform: "uppercase", margin: "4px 0 3px", letterSpacing: "0.04em",
          }}>
            Cancha {p.cancha}
          </p>
        )}
        {p.sedes?.nombre && (
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, color: "#fff", fontWeight: 700, background: color,
            textTransform: "uppercase", letterSpacing: "0.05em",
            padding: "2px 6px", borderRadius: "4px", display: "inline-block",
          }}>
            {p.sedes.nombre}
          </span>
        )}
      </div>

      {/* Teams */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 0 }}>
          <span
            onClick={e => toggleFavorito && p.pareja1_id && toggleFavorito(p.pareja1_id, e)}
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 12, fontWeight: 700, color: "#0f172a",
              textAlign: "right",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              width: "100%", cursor: toggleFavorito ? "pointer" : "default",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {favoritoId === p.pareja1_id && <span style={{ color: "#22c55e", marginRight: 4 }}>★</span>}
            {formatPareja(p.pareja1)}
          </span>
          <span
            onClick={e => toggleFavorito && p.pareja2_id && toggleFavorito(p.pareja2_id, e)}
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 12, fontWeight: 700, color: "#0f172a",
              textAlign: "right",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              width: "100%", cursor: toggleFavorito ? "pointer" : "default",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {favoritoId === p.pareja2_id && <span style={{ color: "#22c55e", marginRight: 4 }}>★</span>}
            {formatPareja(p.pareja2)}
          </span>
        </div>

        {score ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, gap: 2 }}>
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 14, fontWeight: 400,
              color: isLive ? "#0f172a" : "#64748b",
              background: isLive ? "#bcff00" : isFin ? "#f1f5f9" : "transparent",
              padding: "1px 7px", borderRadius: 4,
            }}>
              {score}
            </span>
            {detalle && (
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 8, color: "#94a3b8", fontWeight: 600,
                letterSpacing: "0.02em", whiteSpace: "nowrap",
              }}>
                {detalle}
              </span>
            )}
          </div>
        ) : (
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 900, color: "#94a3b8",
            letterSpacing: "0.08em", flexShrink: 0,
          }}>
            vs
          </span>
        )}
      </div>
    </div>
  )
}
