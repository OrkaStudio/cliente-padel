"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any

const SEDE_COLORS: Record<string, string> = {
  "Voleando": "#22c55e",
  "+Pádel":   "#f97316",
  "Por Tres": "#a855f7",
}
const DEFAULT_COLOR = "#94a3b8"

function sedeColor(nombre?: string) {
  if (!nombre) return DEFAULT_COLOR
  return SEDE_COLORS[nombre] ?? DEFAULT_COLOR
}

const TZ = "America/Argentina/Buenos_Aires"

function formatHora(horario: string | null) {
  if (!horario) return "--:--"
  return new Date(horario).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ })
}

function formatDia(horario: string | null) {
  if (!horario) return "Sin fecha"
  return new Date(horario).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", timeZone: TZ })
}

function getDayKey(horario: string | null) {
  if (!horario) return "sin-fecha"
  // en-CA gives YYYY-MM-DD, forced to AR timezone so late-night matches don't bleed into the next UTC day
  return new Date(horario).toLocaleDateString("en-CA", { timeZone: TZ })
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

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

function matchesSearch(p: Partido, query: string) {
  if (!query.trim()) return true
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  const jugadores = [
    p.pareja1?.jugador1, p.pareja1?.jugador2,
    p.pareja2?.jugador1, p.pareja2?.jugador2,
  ]
  return jugadores.some(j => {
    if (!j) return false
    const full = normalize(`${j.nombre} ${j.apellido}`)
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

// ── Main View ─────────────────────────────────────────────────────────────────

export function FixtureView({ partidos }: { partidos: Partido[] }) {
  const [search, setSearch]           = useState("")
  const [showFinalizados, setShowFin] = useState(false)
  const [selDay, setSelDay]           = useState<string | null>(null)
  const [selCat, setSelCat]           = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const selSede      = searchParams.get("sede")


  const mounted = useRef(false)
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [selDay, selSede, selCat])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectSede = (id: string | null) => {
    const url = id ? `${pathname}?sede=${id}` : pathname
    router.replace(url as any, { scroll: false })
  }

  const toggleDay = (key: string) => {
    setSelDay(prev => prev === key ? null : key)
    setShowFin(false)
  }

  const sedes = useMemo(() => {
    const map = new Map<string, string>()
    partidos.forEach((p: Partido) => {
      if (p.sedes?.id && p.sedes?.nombre) map.set(p.sedes.id, p.sedes.nombre)
    })
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }))
  }, [partidos])

  const categorias = useMemo(() => {
    const CAT_ORDER = ["4ta Caballeros", "6ta Caballeros", "8va Caballeros", "Senior +30"]
    const set = new Set<string>()
    partidos.forEach((p: Partido) => {
      if (p.categorias?.nombre) set.add(p.categorias.nombre)
    })
    return Array.from(set).sort((a, b) => {
      const ai = CAT_ORDER.indexOf(a)
      const bi = CAT_ORDER.indexOf(b)
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      return a.localeCompare(b)
    })
  }, [partidos])

  const days = useMemo(() => {
    const map = new Map<string, DayData>()
    partidos.forEach((p: Partido) => {
      const key = getDayKey(p.horario)
      if (!map.has(key)) {
        const d = new Date(p.horario ?? "")
        const valid = !isNaN(d.getTime())
        const shortDay = valid
          ? d.toLocaleDateString("es-AR", { weekday: "short", timeZone: TZ }).replace(".", "").toUpperCase().slice(0, 3)
          : "—"
        const dayNum = valid ? parseInt(new Date(p.horario ?? "").toLocaleDateString("en-CA", { timeZone: TZ }).split("-")[2]) : 0
        map.set(key, {
          label: formatDia(p.horario),
          shortDay,
          num: dayNum,
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

  const filtered = useMemo(() => {
    let list = partidos
    if (selSede) list = list.filter((p: Partido) => p.sedes?.id === selSede)
    if (selCat)  list = list.filter((p: Partido) => p.categorias?.nombre === selCat)
    if (selDay)  list = list.filter((p: Partido) => getDayKey(p.horario) === selDay)
    if (search.trim()) list = list.filter((p: Partido) => matchesSearch(p, search))
    return list
  }, [partidos, selSede, selCat, selDay, search])

  const live        = filtered.filter((p: Partido) => p.estado === "en_vivo")
  const pendientes  = filtered.filter((p: Partido) => p.estado === "pendiente")
  const finalizados = filtered.filter((p: Partido) => p.estado === "finalizado")

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
    <div style={{ background: "#f8fafc" }}>

      {/* ── Sticky header ── */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
      }}>

        {/* Tabs de días */}
        {days.length > 0 && (
          <div style={{
            display: "flex", gap: 6, overflowX: "auto",
            padding: "10px 12px 0", scrollbarWidth: "none",
            WebkitMaskImage: "linear-gradient(to right, black calc(100% - 36px), transparent 100%)",
            maskImage: "linear-gradient(to right, black calc(100% - 36px), transparent 100%)",
          }}>
            {days.map(([key, d]) => (
              <DayTab
                key={key}
                active={selDay === key}
                hasLive={d.hasLive}
                shortDay={d.shortDay}
                num={d.num}
                onClick={() => toggleDay(key)}
              />
            ))}
          </div>
        )}

        {/* Filtros: toggle + panel colapsable */}
        {(sedes.length > 0 || categorias.length > 1) && (() => {
          const activeCount = [selSede, selCat].filter(Boolean).length
          return (
            <>
              <button
                onClick={() => setFiltersOpen(v => !v)}
                data-pressable="true"
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  margin: "8px 12px 0", width: "calc(100% - 24px)",
                  padding: "8px 12px",
                  background: filtersOpen ? "#0f172a" : (activeCount > 0 ? "#f8fafc" : "#f8fafc"),
                  border: `1px solid ${filtersOpen ? "#0f172a" : activeCount > 0 ? "#0f172a" : "#e2e8f0"}`,
                  borderRadius: 10, cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 15, lineHeight: 1, color: filtersOpen ? "#bcff00" : "#64748b" }}>tune</span>
                <span style={{
                  flex: 1, textAlign: "left",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 11, fontWeight: 700,
                  color: filtersOpen ? "#fff" : "#64748b",
                }}>
                  Filtros{activeCount > 0 && !filtersOpen ? ` · ${activeCount} activo${activeCount > 1 ? "s" : ""}` : ""}
                </span>
                {activeCount > 0 && (
                  <span style={{
                    background: "#bcff00", color: "#000",
                    width: 17, height: 17, borderRadius: "50%",
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 9, fontWeight: 900,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {activeCount}
                  </span>
                )}
                <span style={{
                  fontFamily: "'Material Symbols Outlined'", fontSize: 17, lineHeight: 1,
                  color: filtersOpen ? "#bcff00" : "#94a3b8",
                  transform: filtersOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 200ms cubic-bezier(0.23,1,0.32,1)",
                }}>
                  expand_more
                </span>
              </button>

              {filtersOpen && (
                <div style={{
                  margin: "6px 12px 0",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12, overflow: "hidden",
                  animation: "filterIn 180ms cubic-bezier(0.23,1,0.32,1) both",
                }}>
                  {sedes.length > 0 && (
                    <div style={{
                      padding: "8px 12px",
                      borderBottom: categorias.length > 1 ? "1px solid #e2e8f0" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 11, color: "#94a3b8", lineHeight: 1 }}>location_on</span>
                        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Sede</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        <FilterChip active={!selSede} onClick={() => selectSede(null)}>Todas</FilterChip>
                        {sedes.map(s => (
                          <FilterChip key={s.id} active={selSede === s.id} onClick={() => selectSede(s.id)} color={sedeColor(s.nombre)}>
                            {s.nombre}
                          </FilterChip>
                        ))}
                      </div>
                    </div>
                  )}

                  {categorias.length > 1 && (
                    <div style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 11, color: "#94a3b8", lineHeight: 1 }}>category</span>
                        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>Categoría</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        <FilterChip active={!selCat} onClick={() => setSelCat(null)}>Todas</FilterChip>
                        {categorias.map(cat => (
                          <FilterChip key={cat} active={selCat === cat} onClick={() => setSelCat(cat)}>
                            {cat}
                          </FilterChip>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )
        })()}

        {/* Search */}
        <div style={{ padding: "8px 12px 10px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: search ? "#fff" : "#f8fafc",
            border: `1.5px solid ${search ? "#0f172a" : "#e2e8f0"}`,
            borderRadius: 10, padding: "10px 14px",
            transition: "border-color 160ms, background 160ms",
          }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: search ? "#0f172a" : "#94a3b8", lineHeight: 1 }}>search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar jugador..."
              style={{
                flex: 1, border: "none", background: "transparent", outline: "none",
                fontSize: 16, color: "#0f172a", fontWeight: 600,
                fontFamily: "var(--font-space-grotesk), sans-serif",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", WebkitTapHighlightColor: "transparent" }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1 }}>close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      {(live.length > 0 || pendientes.length > 0 || finalizados.length > 0) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "10px 16px 0" }}>
          {live.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ position: "relative", width: 6, height: 6, flexShrink: 0 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#bcff00", animation: "pingLive 1.5s cubic-bezier(0,0,0.2,1) infinite" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#bcff00" }} />
              </div>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 700, color: "#5a7a00" }}>
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
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, color: "#64748b", WebkitTapHighlightColor: "transparent" }}
              >
                {showFinalizados ? "Ocultar" : "Ver"} {finalizados.length} finalizados
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 13, lineHeight: 1, display: "inline-block", transform: showFinalizados ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms cubic-bezier(0.23, 1, 0.32, 1)" }}>expand_more</span>
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
              <div style={{ position: "relative", width: 7, height: 7, flexShrink: 0 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#bcff00", animation: "pingLive 1.5s cubic-bezier(0,0,0.2,1) infinite" }} />
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#bcff00" }} />
              </div>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 900, color: "#5a7a00", letterSpacing: "0.08em", textTransform: "uppercase" }}>EN VIVO · {live.length}</span>
              <div style={{ flex: 1, height: 1.5, background: "#bcff00", opacity: 0.5 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {live.map((p: Partido) => (
                <LiveCard key={p.id} partido={p} />
              ))}
            </div>
          </div>
        )}

        {/* ── Por día ── */}
        {!selDay && byDay.map(([dayKey, { label, partidos: dayP }]) => {
          const dayRaw = days.find(([k]) => k === dayKey)?.[1]
          return (
            <div key={dayKey} style={{ marginBottom: 20 }}>
              <DayHeader label={label} jugados={dayRaw?.jugados ?? 0} total={dayRaw?.total ?? 0} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {dayP.map((p: Partido, i: number) => (
                  <PartidoCard key={p.id} partido={p} index={i} />
                ))}
              </div>
            </div>
          )
        })}

        {/* ── Pendientes (con día seleccionado) ── */}
        {selDay && pendientes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
            {pendientes.map((p: Partido, i: number) => (
              <PartidoCard key={p.id} partido={p} index={i} />
            ))}
          </div>
        )}

        {/* ── Finalizados expandible ── */}
        {finalizados.length > 0 && showFinalizados && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 20, height: 1, background: "#e2e8f0" }} />
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 900, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Finalizados · {finalizados.length}
              </span>
              <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {finalizados.map((p: Partido, i: number) => (
                <PartidoCard key={p.id} partido={p} index={i} />
              ))}
            </div>
          </div>
        )}

        {finalizados.length > 0 && !showFinalizados && (
          <button
            onClick={() => setShowFin(true)}
            style={{ width: "100%", padding: "14px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#94a3b8", borderTop: "1px solid #f1f5f9", marginTop: 8 }}
          >
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>expand_more</span>
            Finalizados · {finalizados.length}
          </button>
        )}

        {/* ── Empty state ── */}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, color: "#cbd5e1", display: "block" }}>sports_tennis</span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
              {search.trim()
                ? `No encontramos a "${search}"`
                : hasFilters ? "Sin partidos con estos filtros" : "Fixture no disponible aún"}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setSelCat(null); setSelDay(null); selectSede(null) }}
                style={{ marginTop: 12, background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, fontWeight: 700, color: "#64748b" }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pingLive {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes filterIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

// ── Day Tab ───────────────────────────────────────────────────────────────────

function DayTab({ active, hasLive, shortDay, num, onClick }: {
  active: boolean
  hasLive?: boolean
  shortDay: string
  num: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      data-pressable="true"
      style={{
        flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 3, padding: "9px 16px", borderRadius: 12,
        border: `1.5px solid ${active ? "#0f172a" : "#e2e8f0"}`,
        background: active ? "#0f172a" : "#fff",
        cursor: "pointer", minWidth: 52, position: "relative",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {hasLive && (
        <div style={{
          position: "absolute", top: -3, right: -3,
          width: 9, height: 9, borderRadius: "50%",
          background: "#bcff00", border: "2px solid #fff",
        }} />
      )}
      <span style={{
        fontSize: 9, fontWeight: 900, letterSpacing: "0.08em",
        textTransform: "uppercase", lineHeight: 1,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        color: active ? "rgba(255,255,255,0.5)" : "#94a3b8",
      }}>
        {shortDay}
      </span>
      <span style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 22, lineHeight: 1,
        color: active ? "#fff" : "#0f172a",
      }}>
        {num}
      </span>
    </button>
  )
}

// ── Day Header ────────────────────────────────────────────────────────────────

function DayHeader({ label, jugados, total }: { label: string; jugados: number; total: number }) {
  const pct  = total > 0 ? (jugados / total) * 100 : 0
  const done = pct === 100

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 1, background: "#e2e8f0" }} />
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 900, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {label}
          </span>
          <div style={{ width: 20, height: 1, background: "#e2e8f0" }} />
        </div>
        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, color: done ? "#5a7a00" : "#94a3b8", fontWeight: done ? 700 : 400 }}>
          {jugados}/{total} jugados
        </span>
      </div>
      <div style={{ height: 2, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#bcff00", borderRadius: 2, transition: "width 600ms cubic-bezier(0.23, 1, 0.32, 1)" }} />
      </div>
    </div>
  )
}

// ── Filter Chip ───────────────────────────────────────────────────────────────

function FilterChip({ active, onClick, color, children }: {
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

// ── Live Card ─────────────────────────────────────────────────────────────────

function LiveCard({ partido: p }: { partido: Partido }) {
  const sets: { p1: number; p2: number }[] = p.resultado?.sets ?? []
  const sede   = p.sedes?.nombre ?? ""
  const cancha = p.cancha ?? null
  const hora   = formatHora(p.horario)
  const meta   = [sede, cancha != null ? (cancha > 0 ? `Cancha ${cancha}` : "Cancha -") : null, hora !== "--:--" ? hora : null].filter(Boolean).join("  ·  ")

  return (
    <div style={{
      background: "#bcff00",
      borderRadius: 14, padding: "14px 16px",
      position: "relative", overflow: "hidden",
      animation: "fadeUp 220ms cubic-bezier(0.23,1,0.32,1) both",
    }}>
      {/* Ghost VIVO */}
      <span aria-hidden style={{
        position: "absolute", zIndex: 0, right: -4, bottom: -10,
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 58, fontWeight: 400, lineHeight: 1,
        color: "rgba(0,0,0,0.07)", letterSpacing: "-0.02em",
        pointerEvents: "none", userSelect: "none", textTransform: "uppercase",
      }}>VIVO</span>

      {/* Top meta row */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 5, marginBottom: 12 }}>
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 11, lineHeight: 1, color: "rgba(0,0,0,0.45)" }}>location_on</span>
        <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {meta || "En cancha"}
        </span>
      </div>

      {/* Scoreboard */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, fontWeight: 900, color: "#0f172a", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {formatPareja(p.pareja1)}
          </span>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {sets.map((s, i) => (
              <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 22, lineHeight: 1, color: "#0f172a", minWidth: 16, textAlign: "center" }}>{s.p1}</span>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.1)", margin: "0 0 8px 0" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, fontWeight: 900, color: "#0f172a", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {formatPareja(p.pareja2)}
          </span>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {sets.map((s, i) => (
              <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 22, lineHeight: 1, color: "#0f172a", minWidth: 16, textAlign: "center" }}>{s.p2}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Partido Card ──────────────────────────────────────────────────────────────

function PartidoCard({
  partido: p, index,
}: {
  partido: Partido
  index: number
}) {
  const isFin    = p.estado === "finalizado"
  const color    = sedeColor(p.sedes?.nombre)
  const res      = p.resultado
  const sets: { p1: number; p2: number }[] = res?.sets ?? []
  const ganadorA = isFin && res && Number(res.sets_pareja1) > Number(res.sets_pareja2)
  const ganadorB = isFin && res && Number(res.sets_pareja2) > Number(res.sets_pareja1)

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #f1f5f9",
      borderRadius: 12, padding: "12px 14px",
      boxShadow: `inset 3px 0 0 0 ${color}`,
      animation: "fadeUp 220ms cubic-bezier(0.23,1,0.32,1) both",
      animationDelay: `${Math.min(index, 8) * 35}ms`,
    }}>

      {/* Top row: estado + hora/sede/cat */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: isFin ? 900 : 600, color: isFin ? "#64748b" : "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: isFin ? "#cbd5e1" : "#e2e8f0", display: "inline-block", flexShrink: 0 }} />
          {isFin ? "Finalizado" : "Pendiente"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: "auto" }}>
          {p.horario && (
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#64748b" }}>
              {formatHora(p.horario)}
            </span>
          )}
          <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, color: "#94a3b8" }}>
            · {p.cancha > 0 ? `C${p.cancha}` : "C -"}
          </span>
          {p.sedes?.nombre && (
            <>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, lineHeight: 1, color }}>location_on</span>
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color }}>{p.sedes.nombre}</span>
            </>
          )}
          {p.categorias?.nombre && (
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 8, fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase", background: "#f1f5f9", color: "#94a3b8", padding: "2px 6px", borderRadius: 4 }}>
              {p.categorias.nombre}
            </span>
          )}
        </div>
      </div>

      {/* Pareja 1 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 }}>
        <span
          style={{
            flex: 1, minWidth: 0,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: ganadorA ? 800 : 600,
            color: isFin && ganadorB ? "#94a3b8" : "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            opacity: isFin && ganadorB ? 0.5 : 1,
          }}
        >
          {formatPareja(p.pareja1)}
        </span>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, minWidth: 14 }}>
          {sets.length > 0 ? sets.map((s, i) => (
            <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 16, lineHeight: 1, color: ganadorA ? "#0f172a" : ganadorB ? "#cbd5e1" : "#64748b", minWidth: 14, textAlign: "center" }}>
              {s.p1}
            </span>
          )) : (
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, color: "#e2e8f0", fontWeight: 700 }}>—</span>
          )}
        </div>
      </div>

      <div style={{ height: 1, background: "#f1f5f9", margin: "0 0 8px 0" }} />

      {/* Pareja 2 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            flex: 1, minWidth: 0,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: ganadorB ? 800 : 600,
            color: isFin && ganadorA ? "#94a3b8" : "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            opacity: isFin && ganadorA ? 0.5 : 1,
          }}
        >
          {formatPareja(p.pareja2)}
        </span>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, minWidth: 14 }}>
          {sets.length > 0 ? sets.map((s, i) => (
            <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 16, lineHeight: 1, color: ganadorB ? "#0f172a" : ganadorA ? "#cbd5e1" : "#64748b", minWidth: 14, textAlign: "center" }}>
              {s.p2}
            </span>
          )) : (
            <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, color: "#e2e8f0", fontWeight: 700 }}>—</span>
          )}
        </div>
      </div>
    </div>
  )
}
