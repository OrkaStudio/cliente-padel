export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MOCK_CATEGORIAS, CLUB_A, CLUB_B } from "@/components/torneos/interclub/interclub-mock"
import type { Club, CategoriaInterclub } from "@/components/torneos/interclub/CategoriasInterclub"
import { InterclubAutoRefresh } from "@/components/torneos/interclub/InterclubAutoRefresh"
import { HeroMarcador } from "@/components/torneos/interclub/HeroMarcador"

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const HOY  = new Date().toISOString().split("T")[0]

function formatFecha(fecha?: string): string | null {
  if (!fecha || fecha === HOY) return null
  const d = new Date(fecha + "T12:00:00")
  return `${DIAS[d.getDay()]} ${d.getDate()}`
}

function arHour(iso: string): string {
  const d = new Date(iso)
  const h = ((d.getUTCHours() - 3) + 24) % 24
  const m = d.getUTCMinutes()
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function arDate(iso: string): string {
  return new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function formatJug(nombre: string, apellido: string): string {
  if (!apellido) return nombre
  return `${nombre[0]}.${apellido}`
}

function formatPair(j1n: string, j1a: string, j2n?: string | null, j2a?: string | null): string {
  const p1 = formatJug(j1n, j1a)
  if (!j2n) return p1
  return `${p1} / ${formatJug(j2n, j2a ?? "")}`
}

const SHORT_NAME: Record<string, string> = {
  "2da Caballeros": "Segunda", "3ra Caballeros": "Tercera",
  "4ta Caballeros": "Cuarta",  "5ta Caballeros": "Quinta",
  "6ta Caballeros": "Sexta",   "7ma Caballeros": "Séptima",
  "4ta Damas": "Cuarta",       "5ta Damas": "Quinta",
  "6ta Damas": "Sexta",
}

// ─── Fetch real ───────────────────────────────────────────────────────────────

async function getCat(torneoId: string, catId: string): Promise<CategoriaInterclub | null> {
  // Primero intentar mock (IDs fijos en dev)
  const mockCat = MOCK_CATEGORIAS.find((c) => c.id === catId)
  if (mockCat) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from("interclub_partidos")
        .select("id, resultado, ganador, estado, hora, cancha, fecha, sede")
        .in("id", mockCat.partidos.map(p => p.id))
      if (!data || data.length === 0) return mockCat
      const liveMap = new Map(data.map(r => [r.id, r]))
      const partidos = mockCat.partidos.map(p => {
        const live = liveMap.get(p.id)
        if (!live) return p
        return {
          ...p,
          resultado:  live.resultado  ?? p.resultado,
          ganador:    (live.ganador   ?? p.ganador)   as "A" | "B" | null,
          estado:     (live.estado    ?? p.estado)    as "pendiente" | "en_vivo" | "finalizado",
          horaInicio: live.hora       ?? p.horaInicio,
          cancha:     live.cancha     ?? p.cancha,
          fecha:      live.fecha      ?? p.fecha,
          sede:       live.sede       ?? p.sede,
        }
      })
      const fin    = partidos.filter(p => p.estado === "finalizado")
      const ptsA   = fin.filter(p => p.ganador === "A").length
      const ptsB   = fin.filter(p => p.ganador === "B").length
      const estado = partidos.every(p => p.estado === "finalizado") && partidos.length > 0
        ? "finalizado"
        : partidos.some(p => p.estado === "en_vivo")
        ? "en_vivo"
        : "pendiente"
      return { ...mockCat, partidos, ptsA, ptsB, estado }
    } catch {
      return mockCat
    }
  }

  // Fetch real desde Supabase
  try {
    const supabase = await createClient()

    // Resolver slug → UUID si hace falta
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(torneoId)
    let realTorneoId = torneoId
    if (!isUuid) {
      const { data: t } = await supabase
        .from("torneos").select("id").ilike("nombre", "%interclub%").limit(1).single()
      if (!t) return null
      realTorneoId = t.id
    }

    const [
      { data: cat },
      { data: partidos, error: errPart },
    ] = await Promise.all([
      supabase.from("categorias").select("id, nombre, tipo").eq("id", catId).single(),
      supabase.from("partidos")
        .select("id, horario, cancha, estado, sede_id, pareja1_id, pareja2_id")
        .eq("torneo_id", realTorneoId)
        .eq("categoria_id", catId)
        .order("horario"),
    ])

    if (!cat || errPart || !partidos?.length) return null

    const parejaIds  = [...new Set([...partidos.map(p => p.pareja1_id), ...partidos.map(p => p.pareja2_id)])]
    const sedeIds    = [...new Set(partidos.map(p => p.sede_id))]
    const partidoIds = partidos.map(p => p.id)

    const [
      { data: parejas },
      { data: sedes },
      { data: liveData },
    ] = await Promise.all([
      supabase.from("parejas").select("id, club_id, jugador1_id, jugador2_id").in("id", parejaIds),
      supabase.from("sedes").select("id, nombre").in("id", sedeIds),
      supabase.from("interclub_partidos")
        .select("id, resultado, ganador, estado, hora, cancha, fecha, sede")
        .in("id", partidoIds),
    ])

    const jugadorIds = [...new Set(
      (parejas ?? []).flatMap(p => [p.jugador1_id, p.jugador2_id].filter(Boolean))
    )]
    const clubIds = [...new Set((parejas ?? []).map(p => p.club_id).filter(Boolean))]

    const [{ data: jugadores }, { data: clubes }] = await Promise.all([
      supabase.from("jugadores").select("id, nombre, apellido").in("id", jugadorIds),
      supabase.from("clubes").select("id, nombre").in("id", clubIds),
    ])

    const parejaMap  = new Map((parejas   ?? []).map(p => [p.id, p]))
    const jugadorMap = new Map((jugadores ?? []).map(j => [j.id, j]))
    const clubMap    = new Map((clubes    ?? []).map(c => [c.id, c]))
    const sedeMap    = new Map((sedes     ?? []).map(s => [s.id, s]))
    const liveMap    = new Map((liveData  ?? []).map(r => [r.id, r]))

    const tipo   = cat.tipo as string
    const genero = tipo === "caballeros" ? "masc" : tipo === "damas" ? "dam" : "mixto"
    const nombre = SHORT_NAME[cat.nombre] ?? cat.nombre

    const parts = partidos.map(row => {
      const sede = sedeMap.get(row.sede_id)
      const par1 = parejaMap.get(row.pareja1_id)
      const par2 = parejaMap.get(row.pareja2_id)
      if (!par1 || !par2) return null

      const club1   = clubMap.get(par1.club_id)
      const p1IsVol = club1?.nombre === "Voleando"
      const pVol    = p1IsVol ? par1 : par2
      const pMP     = p1IsVol ? par2 : par1

      const jV1 = jugadorMap.get(pVol.jugador1_id)
      const jV2 = jugadorMap.get(pVol.jugador2_id)
      const jM1 = jugadorMap.get(pMP.jugador1_id)
      const jM2 = jugadorMap.get(pMP.jugador2_id)

      const live = liveMap.get(row.id)

      return {
        id:         row.id,
        pairA:      formatPair(jV1?.nombre ?? "?", jV1?.apellido ?? "", jV2?.nombre, jV2?.apellido),
        pairB:      formatPair(jM1?.nombre ?? "?", jM1?.apellido ?? "", jM2?.nombre, jM2?.apellido),
        resultado:  live?.resultado  ?? null,
        ganador:    (live?.ganador   ?? null) as "A" | "B" | null,
        estado:     (live?.estado    ?? row.estado) as "pendiente" | "en_vivo" | "finalizado",
        horaInicio: live?.hora       ?? arHour(row.horario),
        cancha:     live?.cancha     ?? (row.cancha > 0 ? row.cancha : undefined),
        fecha:      live?.fecha      ?? arDate(row.horario),
        sede:       live?.sede       ?? sede?.nombre,
      }
    }).filter(Boolean) as CategoriaInterclub["partidos"]

    const fin   = parts.filter(p => p.estado === "finalizado")
    const ptsA  = fin.filter(p => p.ganador === "A").length
    const ptsB  = fin.filter(p => p.ganador === "B").length
    const estado = parts.every(p => p.estado === "finalizado") && parts.length > 0
      ? "finalizado"
      : parts.some(p => p.estado === "en_vivo")
      ? "en_vivo"
      : "pendiente"

    return { id: cat.id, nombre, genero, estado, ptsA, ptsB, partidos: parts }
  } catch (e) {
    console.error("getCat error:", e)
    return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoriaInterclubPage({
  params,
}: {
  params: Promise<{ id: string; catId: string }>
}) {
  const { id, catId } = await params
  const cat = await getCat(id, catId)
  if (!cat) notFound()

  const enVivo      = cat.partidos.filter((p) => p.estado === "en_vivo")
  const finalizados = cat.partidos.filter((p) => p.estado === "finalizado")
  const pendientes  = cat.partidos.filter((p) => p.estado === "pendiente")
  const isLive      = cat.estado === "en_vivo"

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 60 }}>
      <InterclubAutoRefresh />

      {/* ── Sticky header ── */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #f1f5f9",
        position: "sticky", top: 45, zIndex: 50,
        display: "flex", alignItems: "center",
        padding: "0 18px", height: 52,
        gap: 12,
      }}>
        <Link
          href={`/torneos/${id}/interclub` as AnyHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            color: "#94a3b8", textDecoration: "none",
            WebkitTapHighlightColor: "transparent", flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, lineHeight: 1 }}>
            arrow_back
          </span>
        </Link>

        <div style={{ width: 1, height: 20, background: "#e2e8f0", flexShrink: 0 }} />

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 16, fontWeight: 400, lineHeight: 1,
              color: "#0f172a", textTransform: "uppercase",
              letterSpacing: "0.02em",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{cat.nombre}</span>
            <span style={{
              flexShrink: 0,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900,
              textTransform: "uppercase", letterSpacing: "0.08em",
              padding: "2px 6px", borderRadius: 3,
              background: cat.genero === "dam"
                ? "rgba(244,63,94,0.08)" : cat.genero === "mixto"
                ? "rgba(99,102,241,0.08)" : "rgba(15,23,42,0.06)",
              color: cat.genero === "dam"
                ? "#be185d" : cat.genero === "mixto"
                ? "#4338ca" : "#64748b",
            }}>
              {cat.genero === "dam" ? "Dam" : cat.genero === "mixto" ? "Mix" : "Masc"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 10 }}>
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 18, lineHeight: 1, color: "#0f172a",
            }}>{cat.ptsA}</span>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 700, color: "#cbd5e1",
            }}>–</span>
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 18, lineHeight: 1, color: "#0f172a",
            }}>{cat.ptsB}</span>
            {isLive && (
              <span className="live-dot" style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#bcff00", flexShrink: 0, display: "inline-block",
                boxShadow: "0 0 6px rgba(188,255,0,0.6)",
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Mini hero marcador */}
      <HeroMarcador
        clubA={CLUB_A}
        clubB={CLUB_B}
        ptsA={cat.ptsA}
        ptsB={cat.ptsB}
        compact
      />

      {/* Progress bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 18px 12px",
        background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
      }}>
        <div style={{ flex: 1, height: 3, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${cat.partidos.length > 0 ? (finalizados.length / cat.partidos.length) * 100 : 0}%`,
            background: isLive ? "#bcff00" : "#0f172a",
            borderRadius: 2,
          }} />
        </div>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 700, color: "#94a3b8", whiteSpace: "nowrap",
        }}>{finalizados.length}/{cat.partidos.length} jugados</span>
      </div>

      {/* ── Contenido ── */}
      <div style={{ padding: "0 14px 8px" }}>

        {enVivo.map((p) => (
          <LiveCard key={p.id} partido={p} />
        ))}

        {(pendientes.length > 0 || finalizados.length > 0) && (
          <section style={{ paddingTop: 20 }}>
            <SectionLabel label="Fixture" />

            {pendientes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {pendientes.map((p, i) => (
                  <PartidoCard
                    key={p.id} index={i}
                    pairA={p.pairA} pairB={p.pairB}
                    resultado={null} ganador={null}
                    horaInicio={p.horaInicio} sede={p.sede} cancha={p.cancha} fecha={p.fecha}
                    clubA={CLUB_A} clubB={CLUB_B}
                  />
                ))}
              </div>
            )}

            {finalizados.length > 0 && (
              <details style={{ marginTop: pendientes.length > 0 ? 0 : 8 }}>
                <summary style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "14px 0", cursor: "pointer", listStyle: "none",
                  borderTop: pendientes.length > 0 ? "1px solid #f1f5f9" : "none",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 11, fontWeight: 700, color: "#94a3b8",
                  WebkitTapHighlightColor: "transparent",
                }}>
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>expand_more</span>
                  Ver {finalizados.length} resultado{finalizados.length !== 1 ? "s" : ""}
                </summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 8 }}>
                  {finalizados.map((p, i) => (
                    <PartidoCard
                      key={p.id} index={i}
                      pairA={p.pairA} pairB={p.pairB}
                      resultado={p.resultado} ganador={p.ganador}
                      horaInicio={p.horaInicio} sede={p.sede} cancha={p.cancha} fecha={p.fecha}
                      clubA={CLUB_A} clubB={CLUB_B}
                    />
                  ))}
                </div>
              </details>
            )}
          </section>
        )}

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseLive {
          0%   { opacity: 1; transform: scale(1); box-shadow: 0 0 0 2px rgba(188,255,0,0.3); }
          50%  { opacity: 0.7; transform: scale(1.1); box-shadow: 0 0 0 6px rgba(188,255,0,0.1); }
          100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 2px rgba(188,255,0,0.3); }
        }
        details summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <span style={{
      fontFamily: "var(--font-space-grotesk), sans-serif",
      fontSize: 10, fontWeight: 900,
      textTransform: "uppercase", letterSpacing: "0.1em",
      color: "#94a3b8",
    }}>{label}</span>
  )
}

function LiveCard({ partido: p }: {
  partido: { id: string; pairA: string; pairB: string; resultado: string | null; horaInicio?: string; sede?: string; cancha?: number }
}) {
  const parsed = (p.resultado?.trim().split(/\s+/) ?? []).map(s => {
    const [a, b] = s.split("-")
    return { a: a ?? "–", b: b ?? "–" }
  })

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{
        background: "#ffffff",
        border: "1.5px solid #bcff00",
        borderRadius: 14, padding: "13px 14px",
        position: "relative", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(188,255,0,0.12)",
      }}>
        <span aria-hidden style={{
          position: "absolute", zIndex: 0,
          right: -4, bottom: -10,
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 58, fontWeight: 400, lineHeight: 1,
          color: "rgba(188,255,0,0.32)", letterSpacing: "-0.02em",
          pointerEvents: "none", userSelect: "none", textTransform: "uppercase",
        }}>VIVO</span>
        <div aria-hidden style={{
          position: "absolute", zIndex: 1, inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom right, transparent 40%, rgba(255,255,255,0.6) 100%)",
        }} />

        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 12,
        }}>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 900, color: "#0f172a",
            textTransform: "uppercase", letterSpacing: "0.12em",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#0f172a", display: "inline-block", flexShrink: 0,
            }} />
            En cancha
          </div>
          {(p.sede || p.horaInicio) && (() => {
            const sedeColor = p.sede === CLUB_A.nombre ? CLUB_A.color : p.sede ? CLUB_B.color : "#94a3b8"
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                {p.horaInicio && (
                  <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#64748b" }}>
                    {p.horaInicio}
                  </span>
                )}
                {p.sede && <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, lineHeight: 1, color: sedeColor }}>location_on</span>}
                {p.sede && (
                  <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: sedeColor }}>
                    {p.sede}{p.cancha ? ` C${p.cancha}` : ""}
                  </span>
                )}
              </div>
            )
          })()}
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, fontWeight: 900, color: "#0f172a",
              lineHeight: 1.2, textTransform: "uppercase", flex: 1, minWidth: 0,
            }}>{p.pairA}</span>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {parsed.map((s, i) => (
                <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 18, lineHeight: 1, color: "#0f172a", minWidth: 16, textAlign: "center" }}>{s.a}</span>
              ))}
            </div>
          </div>
          <div style={{ height: 1, background: "#f1f5f9", marginBottom: 8 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, fontWeight: 900, color: "#0f172a",
              lineHeight: 1.2, textTransform: "uppercase", flex: 1, minWidth: 0,
            }}>{p.pairB}</span>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {parsed.map((s, i) => (
                <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 18, lineHeight: 1, color: "#0f172a", minWidth: 16, textAlign: "center" }}>{s.b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PartidoCard({
  pairA, pairB, resultado, ganador, horaInicio, sede, cancha, fecha, clubA, clubB, index,
}: {
  pairA: string; pairB: string
  resultado: string | null; ganador: "A" | "B" | null
  horaInicio?: string; sede?: string; cancha?: number; fecha?: string
  clubA: Club; clubB: Club; index: number
}) {
  const ganadorA  = ganador === "A"
  const ganadorB  = ganador === "B"
  const parsed    = (resultado?.trim().split(/\s+/) ?? []).map(s => { const [a, b] = s.split("-"); return { a: a ?? "–", b: b ?? "–" } })
  const hasScore  = parsed.length > 0
  const sedeColor = sede === "Voleando" ? clubA.color : sede ? clubB.color : "#64748b"
  const diaStr    = formatFecha(fecha)
  const hasMeta   = !!(horaInicio || sede)

  return (
    <div style={{
      background: "#ffffff", border: "1px solid #f1f5f9", borderRadius: 12, padding: "12px 14px",
      animation: "fadeUp 250ms cubic-bezier(0.23,1,0.32,1) both",
      animationDelay: `${Math.min(index, 8) * 40}ms`,
    }}>
      {hasMeta && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: ganador ? 900 : 600,
            color: ganador ? "#64748b" : "#cbd5e1",
            textTransform: "uppercase", letterSpacing: "0.12em",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: ganador ? "#cbd5e1" : "#e2e8f0", display: "inline-block", flexShrink: 0 }} />
            {ganador ? "Finalizado" : "Pendiente"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {diaStr && <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, lineHeight: 1, color: "#94a3b8" }}>calendar_today</span>}
            {(diaStr || horaInicio) && (
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 600, color: "#64748b" }}>
                {[diaStr, horaInicio].filter(Boolean).join(" · ")}
              </span>
            )}
            {sede && <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, lineHeight: 1, color: sedeColor }}>location_on</span>}
            {sede && (
              <span style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 10, fontWeight: 700, color: sedeColor }}>
                {sede}{cancha ? ` C${cancha}` : ""}
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.08em",
            color: clubA.color, border: "1px solid #e2e8f0", borderRadius: 3, padding: "1px 4px", flexShrink: 0,
          }}>{clubA.abbr}</span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, lineHeight: 1.3,
            fontWeight: ganadorA ? 900 : 600, color: ganadorB ? "#94a3b8" : "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{pairA}</span>
        </div>
        {hasScore && (
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            {parsed.map((s, i) => (
              <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 16, lineHeight: 1, color: ganadorA ? "#0f172a" : "#94a3b8", minWidth: 14, textAlign: "center" }}>{s.a}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "#f8fafc", marginBottom: 8 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.08em",
            color: clubB.color, border: "1px solid #e2e8f0", borderRadius: 3, padding: "1px 4px", flexShrink: 0,
          }}>{clubB.abbr}</span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12, lineHeight: 1.3,
            fontWeight: ganadorB ? 900 : 600, color: ganadorA ? "#94a3b8" : "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{pairB}</span>
        </div>
        {hasScore && (
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            {parsed.map((s, i) => (
              <span key={i} style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 16, lineHeight: 1, color: ganadorB ? "#0f172a" : "#94a3b8", minWidth: 14, textAlign: "center" }}>{s.b}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
