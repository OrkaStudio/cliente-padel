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

function formatPareja(pareja: { jugador1: { nombre: string; apellido: string } | null; jugador2: { nombre: string; apellido: string } | null } | null) {
  if (!pareja) return "—"
  const j1 = pareja.jugador1?.apellido ?? ""
  const j2 = pareja.jugador2?.apellido ?? ""
  if (j1 && j2) return `${j1} / ${j2}`
  return j1 || j2 || "—"
}

export function FixtureView({ partidos }: { partidos: Partido[] }) {
  const [search, setSearch]             = useState("")
  const [showFinalizados, setShowFin]   = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selSede = searchParams.get("sede")
  const [favoritoId, setFavoritoId]     = useState<string | null>(null)

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

  const sedes = useMemo(() => {
    const map = new Map<string, string>()
    partidos.forEach((p: Partido) => {
      if (p.sedes?.id && p.sedes?.nombre) map.set(p.sedes.id, p.sedes.nombre)
    })
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }))
  }, [partidos])

  const filtered = useMemo(() => {
    let list = partidos
    if (selSede) list = list.filter((p: Partido) => p.sedes?.id === selSede)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p: Partido) =>
        formatPareja(p.pareja1).toLowerCase().includes(q) ||
        formatPareja(p.pareja2).toLowerCase().includes(q)
      )
    }
    if (favoritoId) {
      list = [...list].sort((a, b) => {
        const aFav = a.pareja1_id === favoritoId || a.pareja2_id === favoritoId
        const bFav = b.pareja1_id === favoritoId || b.pareja2_id === favoritoId
        return (aFav === bFav) ? 0 : aFav ? -1 : 1
      })
    }
    return list
  }, [partidos, selSede, search, favoritoId])

  const live        = filtered.filter((p: Partido) => p.estado === "en_vivo")
  const pendientes  = filtered.filter((p: Partido) => p.estado === "pendiente")
  const finalizados = filtered.filter((p: Partido) => p.estado === "finalizado")

  const byDay = useMemo(() => {
    const map = new Map<string, { label: string; partidos: Partido[] }>()
    pendientes.forEach((p: Partido) => {
      const key = getDayKey(p.horario)
      if (!map.has(key)) map.set(key, { label: formatDia(p.horario), partidos: [] })
      map.get(key)!.partidos.push(p)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [pendientes])

  return (
    <div style={{ paddingBottom: 100 }}>

      {/* ── Sticky header ── */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "rgba(248,250,252,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        padding: "10px 16px 0",
      }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 10, padding: "9px 12px", marginBottom: 10,
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#94a3b8", lineHeight: 1 }}>search</span>
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
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#94a3b8", lineHeight: 1 }}>close</span>
            </button>
          )}
        </div>

        {/* Sede chips */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "0 0 10px", scrollbarWidth: "none" }}>
          <SedeChip active={!selSede} onClick={() => selectSede(null)}>Todas las sedes</SedeChip>
          {sedes.map(s => (
            <SedeChip key={s.id} active={selSede === s.id} onClick={() => selectSede(s.id)} color={sedeColor(s.nombre)}>
              {s.nombre}
            </SedeChip>
          ))}
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
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 700, color: "#15803d",
              }}>
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
                Ver {finalizados.length} finalizados
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
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 900, color: "#15803d",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}>EN VIVO</span>
              <div style={{ flex: 1, height: 1.5, background: "#22c55e", opacity: 0.3 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {live.map((p: Partido, i: number) => <PartidoCard key={p.id} partido={p} index={i} favoritoId={favoritoId} toggleFavorito={toggleFavorito} />)}
            </div>
          </div>
        )}

        {/* ── Por día ── */}
        {byDay.map(([dayKey, { label, partidos: dayP }]) => (
          <div key={dayKey} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
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
                fontSize: 10, color: "#94a3b8",
              }}>
                {dayP.length} {dayP.length === 1 ? "partido" : "partidos"}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {dayP.map((p: Partido, i: number) => <PartidoCard key={p.id} partido={p} index={i} favoritoId={favoritoId} toggleFavorito={toggleFavorito} />)}
            </div>
          </div>
        ))}

        {/* ── Finalizados (colapsado) ── */}
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
              {finalizados.map((p: Partido, i: number) => <PartidoCard key={p.id} partido={p} index={i} favoritoId={favoritoId} toggleFavorito={toggleFavorito} />)}
            </div>
          </div>
        )}

        {/* ── Finalizados collapse trigger (bottom) ── */}
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

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, color: "#cbd5e1", display: "block" }}>sports_tennis</span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
              {search
                ? `No encontramos a "${search}"`
                : selSede
                  ? "Sin partidos para esta sede"
                  : "Fixture no disponible aún"}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseLive {
          0% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
          50% { opacity: 0.6; transform: scale(1.1); box-shadow: 0 0 0 6px rgba(34,197,94,0.1); }
          100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 2px rgba(34,197,94,0.25); }
        }
      `}</style>
    </div>
  )
}

function SedeChip({ active, onClick, color, children }: { active: boolean; onClick: () => void; color?: string; children: React.ReactNode }) {
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
      }}
    >
      {children}
    </button>
  )
}

function PartidoCard({ partido: p, index, favoritoId, toggleFavorito }: { partido: Partido; index: number; favoritoId?: string | null; toggleFavorito?: (id: string, e: React.MouseEvent) => void }) {
  const color   = sedeColor(p.sedes?.nombre)
  const isLive  = p.estado === "en_vivo"
  const isFin   = p.estado === "finalizado"
  const res     = p.resultado
  const score   = res ? `${res.sets_pareja1} – ${res.sets_pareja2}` : null
  const detalle = res?.sets?.map((s: {p1:number;p2:number}) => `${s.p1}-${s.p2}`).join(" · ") ?? null

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
          background: `${color}15`,
          color: color,
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
            padding: "2px 6px", borderRadius: "4px", display: "inline-block"
          }}>
            {p.sedes.nombre}
          </span>
        )}
      </div>

      {/* Teams */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{ flex: 1, display: "flex",flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 0 }}>
          <span onClick={(e) => toggleFavorito && p.pareja1_id && toggleFavorito(p.pareja1_id, e)} style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 700, color: "#0f172a",
            textAlign: "right",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            width: "100%", cursor: toggleFavorito ? "pointer" : "default", WebkitTapHighlightColor: "transparent"
          }}>
            {favoritoId === p.pareja1_id && <span style={{ color: "#22c55e", marginRight: 4 }}>★</span>}
            {formatPareja(p.pareja1)}
          </span>
          <span onClick={(e) => toggleFavorito && p.pareja2_id && toggleFavorito(p.pareja2_id, e)} style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 700, color: "#0f172a",
            textAlign: "right",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            width: "100%", cursor: toggleFavorito ? "pointer" : "default", WebkitTapHighlightColor: "transparent"
          }}>
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
        {p.pareja2 && (
          // Omitimos la segunda etiqueta suelta, ya incluimos p.pareja2 arriba en la columna
          null
        )}
      </div>
    </div>
  )
}
