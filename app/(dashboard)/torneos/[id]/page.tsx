// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

export const revalidate = 15

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

function fmtFecha(iso: string) {
  const [, m, d] = iso.split("-")
  return `${parseInt(d)} ${MESES[parseInt(m) - 1]}`
}

function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Argentina/Buenos_Aires" })
}

function fmtPareja(pareja: {
  jugador1: { apellido: string } | null
  jugador2: { apellido: string } | null
} | null): string {
  if (!pareja) return "—"
  const a = pareja.jugador1?.apellido ?? ""
  const b = pareja.jugador2?.apellido ?? ""
  return b ? `${a} / ${b}` : a || "—"
}

const TIPO_TO_GENERO: Record<string, "masc" | "dam" | "mixto"> = {
  caballeros: "masc",
  damas:      "dam",
  mixto:      "mixto",
  especial:   "mixto",
}

const GENERO_CONFIG = {
  masc:  { label: "Hombres", badgeLabel: "Masc", color: "#64748b",  colorDark: "rgba(255,255,255,0.45)" },
  dam:   { label: "Damas",   badgeLabel: "Dam",  color: "#be185d",  colorDark: "#fda4af"                },
  mixto: { label: "Mixtos",  badgeLabel: "Mix",  color: "#4338ca",  colorDark: "#a5b4fc"                },
} as const

const GENERO_ORDER: ("masc" | "dam" | "mixto")[] = ["masc", "dam", "mixto"]

export default async function TorneoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: torneo } = await supabase
    .from("torneos")
    .select("id, nombre, fecha_inicio, fecha_fin, estado")
    .eq("id", id)
    .single()

  if (!torneo) notFound()

  const { data: torneoCategorias } = await supabase
    .from("torneo_categorias")
    .select(`id, categoria_id, categorias ( id, nombre, tipo, orden )`)
    .eq("torneo_id", id)
    .order("categorias(orden)")

  const PARTIDOS_SELECT = `
    id, horario, cancha, resultado,
    sedes:sede_id ( nombre ),
    categorias:categoria_id ( id, nombre, tipo ),
    pareja1:parejas!pareja1_id (
      jugador1:jugadores!jugador1_id ( apellido ),
      jugador2:jugadores!jugador2_id ( apellido )
    ),
    pareja2:parejas!pareja2_id (
      jugador1:jugadores!jugador1_id ( apellido ),
      jugador2:jugadores!jugador2_id ( apellido )
    )
  `

  const [
    { data: sedes },
    { data: livePartidos },
    { data: proximosPartidos },
    { data: allStats },
  ] = await Promise.all([
    supabase.from("sedes").select("id, nombre").eq("torneo_id", id),

    supabase.from("partidos").select(PARTIDOS_SELECT)
      .eq("torneo_id", id).eq("estado", "en_vivo"),

    supabase.from("partidos").select(PARTIDOS_SELECT)
      .eq("torneo_id", id).eq("estado", "pendiente")
      .order("horario").limit(4),

    supabase.from("partidos")
      .select("estado, categoria_id")
      .eq("torneo_id", id),
  ])

  const statsMap = new Map<string, { total: number; jugados: number; live: number }>()
  for (const p of allStats ?? []) {
    if (!statsMap.has(p.categoria_id)) {
      statsMap.set(p.categoria_id, { total: 0, jugados: 0, live: 0 })
    }
    const s = statsMap.get(p.categoria_id)!
    s.total++
    if (p.estado === "finalizado") s.jugados++
    if (p.estado === "en_vivo")    s.live++
  }

  const sedeNombres = (sedes ?? []).map(s => s.nombre).join(" · ")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categorias = (torneoCategorias ?? []).map((tc: any) => ({
    id:     tc.categoria_id as string,
    nombre: tc.categorias?.nombre  as string ?? "",
    tipo:   tc.categorias?.tipo    as string ?? "caballeros",
    orden:  tc.categorias?.orden   as number ?? 0,
    stats:  statsMap.get(tc.categoria_id) ?? { total: 0, jugados: 0, live: 0 },
  }))

  const groups = GENERO_ORDER
    .map(g => ({
      genero: g,
      cats: categorias.filter(c => TIPO_TO_GENERO[c.tipo] === g).sort((a, b) => a.orden - b.orden),
    }))
    .filter(g => g.cats.length > 0)

  const live    = livePartidos    ?? []
  const proximos = proximosPartidos ?? []

  return (
    <div style={{ background: "#f8fafc" }}>

      {/* ── Hero ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        borderRadius: "0 0 24px 24px",
        minHeight: 180,
      }}>
        <Image
          src="/clubes/torneo-campeones-bg.jpg"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center 35%" }}
          priority
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.72)" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 80% 0%, rgba(188,255,0,0.22) 0%, transparent 55%)",
        }} />

        {/* Content — centrado */}
        <div style={{
          position: "relative", zIndex: 2,
          padding: "14px 18px 24px",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        }}>
          <Link href={"/torneos" as AnyHref} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            color: "rgba(255,255,255,0.4)", textDecoration: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: "0.06em", marginBottom: 14, alignSelf: "flex-start",
            WebkitTapHighlightColor: "transparent",
          }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 15, lineHeight: 1 }}>arrow_back</span>
            Torneos
          </Link>

          <h1 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 36, lineHeight: 0.92, color: "#fff",
            textTransform: "uppercase", fontWeight: 400,
            margin: "0 0 16px", letterSpacing: "-0.01em",
          }}>
            {torneo.nombre}
          </h1>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            <HeroPill icon="calendar_month">
              {fmtFecha(torneo.fecha_inicio)} → {fmtFecha(torneo.fecha_fin)}
            </HeroPill>
            {sedeNombres && <HeroPill icon="location_on">{sedeNombres}</HeroPill>}
          </div>
        </div>
      </div>

      {/* ── En Vivo — carousel ── */}
      {live.length > 0 && (
        <div style={{ margin: "20px 0 0", padding: "0 16px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "#bcff00",
                  animation: "pingLive 1.4s cubic-bezier(0,0,0.2,1) infinite",
                }} />
                <div style={{ position: "absolute", inset: 1, borderRadius: "50%", background: "#bcff00" }} />
              </div>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 900, color: "#5a7a00",
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
                En Vivo · {live.length}
              </span>
            </div>
            <Link href={`/torneos/${id}/fixture` as AnyHref} style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 800, color: "#64748b",
              textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em",
              display: "inline-flex", alignItems: "center", gap: 2,
              WebkitTapHighlightColor: "transparent",
            }}>
              Ver fixture
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>chevron_right</span>
            </Link>
          </div>

          {/* Carousel — el padding lo da el outer; el carousel solo scrollea */}
          <div style={{
            display: "flex", gap: 10,
            overflowX: "auto", scrollSnapType: "x mandatory",
            padding: "0 0 4px",
            scrollbarWidth: "none",
            WebkitMaskImage: live.length > 1
              ? "linear-gradient(to right, black calc(100% - 32px), transparent 100%)"
              : undefined,
            maskImage: live.length > 1
              ? "linear-gradient(to right, black calc(100% - 32px), transparent 100%)"
              : undefined,
          }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {live.map((p: any) => (
              <div key={p.id} style={{
                scrollSnapAlign: "start", flexShrink: 0,
                width: live.length > 1 ? "calc(88% - 10px)" : "100%",
              }}>
                <LiveCard partido={p} hora={fmtHora(p.horario)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Próximos partidos (solo cuando no hay nada en vivo) ── */}
      {live.length === 0 && proximos.length > 0 && (
        <div style={{ margin: "20px 0 0", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 13, color: "#64748b", lineHeight: 1 }}>schedule</span>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 900, color: "#64748b",
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
                Próximos partidos
              </span>
            </div>
            <Link href={`/torneos/${id}/fixture` as AnyHref} style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 800, color: "#64748b",
              textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em",
              display: "inline-flex", alignItems: "center", gap: 2,
              WebkitTapHighlightColor: "transparent",
            }}>
              Ver fixture
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>chevron_right</span>
            </Link>
          </div>

          <div style={{
            display: "flex", gap: 10,
            overflowX: "auto", scrollSnapType: "x mandatory",
            padding: "0 0 4px", scrollbarWidth: "none",
            WebkitMaskImage: proximos.length > 1
              ? "linear-gradient(to right, black calc(100% - 32px), transparent 100%)"
              : undefined,
            maskImage: proximos.length > 1
              ? "linear-gradient(to right, black calc(100% - 32px), transparent 100%)"
              : undefined,
          }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {proximos.map((p: any) => (
              <div key={p.id} style={{
                scrollSnapAlign: "start", flexShrink: 0,
                width: proximos.length > 1 ? "calc(88% - 10px)" : "100%",
              }}>
                <ProximoCard partido={p} hora={fmtHora(p.horario)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Categorías ── */}
      <div style={{ padding: "24px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 26, fontWeight: 400, lineHeight: 1,
            color: "#0f172a", textTransform: "uppercase",
            letterSpacing: "0.02em", margin: 0,
          }}>Categorías</h2>
          <Link href={`/torneos/${id}/tabla` as AnyHref} style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, fontWeight: 800, color: "#0f172a",
            textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em",
            display: "inline-flex", alignItems: "center", gap: 2,
            WebkitTapHighlightColor: "transparent",
          }}>
            Ver tabla
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 15, lineHeight: 1 }}>chevron_right</span>
          </Link>
        </div>

        {groups.map(({ genero, cats }) => {
          const cfg = GENERO_CONFIG[genero]
          return (
            <div key={genero} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 9, fontWeight: 900,
                  textTransform: "uppercase", letterSpacing: "0.12em",
                  color: cfg.color,
                }}>
                  {cfg.label}
                </span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {cats.map((cat, i) => {
                  const dark = i % 3 === 0
                  const { stats } = cat
                  const isLive = stats.live > 0

                  return (
                    <div key={cat.id} style={{ gridColumn: dark ? "1 / -1" : undefined }}>
                      <Link
                        href={`/torneos/${id}/tabla?cat=${cat.id}` as AnyHref}
                        style={{
                          display: "flex", flexDirection: "column",
                          justifyContent: "space-between",
                          textDecoration: "none", position: "relative", overflow: "hidden",
                          borderRadius: 14,
                          WebkitTapHighlightColor: "transparent",
                          minHeight: dark ? 110 : 100,
                          padding: dark ? "18px 20px" : "14px 16px",
                          background: dark ? "#0f172a" : "#ffffff",
                          border: dark ? "none" : "1px solid #f1f5f9",
                          boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.15)" : "0 1px 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        {isLive && dark && (
                          <div style={{
                            position: "absolute", top: -20, right: -20,
                            width: 120, height: 120, borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(188,255,0,0.22) 0%, transparent 70%)",
                            pointerEvents: "none",
                          }} />
                        )}

                        <div style={{
                          display: "flex", alignItems: "flex-start",
                          justifyContent: "space-between", gap: 8,
                          position: "relative", zIndex: 1, flex: 1,
                        }}>
                          <div style={{
                            fontFamily: "var(--font-anton), Anton, sans-serif",
                            fontSize: dark ? 22 : 17, fontWeight: 400, lineHeight: 1,
                            color: dark ? "#ffffff" : "#0f172a",
                            textTransform: "uppercase", letterSpacing: "0.01em",
                          }}>
                            {cat.nombre}
                          </div>
                          <span style={{
                            flexShrink: 0,
                            background: dark ? "rgba(255,255,255,0.08)" : `${cfg.color}15`,
                            color: dark ? cfg.colorDark : cfg.color,
                            padding: "3px 7px", borderRadius: 4,
                            fontFamily: "var(--font-space-grotesk), sans-serif",
                            fontSize: 8, fontWeight: 900,
                            textTransform: "uppercase", letterSpacing: "0.1em",
                            marginTop: 2,
                          }}>
                            {cfg.badgeLabel}
                          </span>
                        </div>

                        <div style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: 12, position: "relative", zIndex: 1,
                        }}>
                          {isLive ? (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              background: "#bcff00", color: "#000",
                              padding: "4px 10px", borderRadius: 100,
                              fontFamily: "var(--font-space-grotesk), sans-serif",
                              fontSize: 9, fontWeight: 700,
                              textTransform: "uppercase", letterSpacing: "0.08em",
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#000", flexShrink: 0 }} />
                              En juego
                            </span>
                          ) : (
                            <span style={{
                              background: dark ? "rgba(255,255,255,0.07)" : "#f1f5f9",
                              color: dark ? "rgba(255,255,255,0.38)" : "#94a3b8",
                              padding: "4px 10px", borderRadius: 100,
                              fontFamily: "var(--font-space-grotesk), sans-serif",
                              fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                            }}>
                              {stats.jugados === stats.total && stats.total > 0 ? "Finalizado" : "Próximamente"}
                            </span>
                          )}
                          <span style={{
                            fontFamily: "'Material Symbols Outlined'",
                            fontSize: 20, lineHeight: 1,
                            color: dark ? "#bcff00" : "#0f172a",
                          }}>
                            arrow_forward
                          </span>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {groups.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 36, color: "#e2e8f0", display: "block" }}>
              category
            </span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
              Las categorías se publicarán próximamente
            </p>
            <Link href={`/torneos/${id}/fixture` as AnyHref} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#0f172a", color: "#bcff00",
              padding: "10px 20px", borderRadius: 100,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 12, fontWeight: 900, textTransform: "uppercase",
              letterSpacing: "0.05em", textDecoration: "none", marginTop: 16,
              WebkitTapHighlightColor: "transparent",
            }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>sports_tennis</span>
              Ver fixture
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pingLive {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ── Hero Pill ─────────────────────────────────────────────────────────────────

function HeroPill({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.14)",
      padding: "4px 10px", borderRadius: 100,
      display: "flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 13, color: "#bcff00", lineHeight: 1 }}>
        {icon}
      </span>
      <span style={{
        fontSize: 10, fontWeight: 700,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        color: "rgba(255,255,255,0.75)", letterSpacing: "0.02em",
      }}>
        {children}
      </span>
    </div>
  )
}

// ── Live Card (exportada para reutilizar) ─────────────────────────────────────

export function LiveCard({ partido: p, hora }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  partido: any
  hora: string
}) {
  const sets: { p1: number; p2: number }[] = p.resultado?.sets ?? []
  const hasSets = sets.length > 0

  const sede   = p.sedes?.nombre   ?? ""
  const cancha = p.cancha          ?? null
  const cat    = p.categorias?.nombre ?? ""

  const meta = [
    sede                          || null,
    cancha ? `Cancha ${cancha}`   : null,
    hora                          || null,
  ].filter(Boolean).join("  ·  ")

  return (
    <div style={{
      background: "#bcff00",
      borderRadius: 14, padding: "14px 16px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ghost VIVO */}
      <span aria-hidden style={{
        position: "absolute", right: -6, bottom: -14,
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 70, fontWeight: 400, lineHeight: 1,
        color: "rgba(0,0,0,0.09)", letterSpacing: "-0.02em",
        pointerEvents: "none", userSelect: "none", textTransform: "uppercase",
      }}>
        VIVO
      </span>

      {/* Top: sede · cancha · hora + cat badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, position: "relative", zIndex: 1 }}>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 11, lineHeight: 1 }}>location_on</span>
          {meta}
        </span>
        {cat && (
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900, color: "rgba(0,0,0,0.45)",
            textTransform: "uppercase", letterSpacing: "0.08em",
            background: "rgba(0,0,0,0.08)", padding: "2px 7px", borderRadius: 4,
          }}>
            {cat}
          </span>
        )}
      </div>

      {/* Scoreboard */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Pareja 1 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 800, color: "#000",
            flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            lineHeight: 1,
          }}>
            {fmtPareja(p.pareja1)}
          </span>
          {hasSets && (
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {sets.map((s, i) => (
                <span key={i} style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 22, lineHeight: 1, color: "#000",
                  minWidth: 16, textAlign: "center",
                }}>
                  {s.p1}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: "rgba(0,0,0,0.1)", margin: "0 0 8px 0" }} />

        {/* Pareja 2 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 800, color: "#000",
            flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            lineHeight: 1,
          }}>
            {fmtPareja(p.pareja2)}
          </span>
          {hasSets && (
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {sets.map((s, i) => (
                <span key={i} style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 22, lineHeight: 1, color: "#000",
                  minWidth: 16, textAlign: "center",
                }}>
                  {s.p2}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Proximo Card ──────────────────────────────────────────────────────────────

function ProximoCard({ partido: p, hora }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  partido: any
  hora: string
}) {
  const sede = p.sedes?.nombre ?? ""
  const cat  = p.categorias?.nombre ?? ""

  return (
    <div style={{
      background: "#1e1a3e",
      borderRadius: 14, padding: "14px 16px",
      position: "relative", overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Ghost hora */}
      <span aria-hidden style={{
        position: "absolute", right: -6, bottom: -14,
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 70, fontWeight: 400, lineHeight: 1,
        color: "rgba(255,255,255,0.04)", letterSpacing: "-0.02em",
        pointerEvents: "none", userSelect: "none",
      }}>
        {hora}
      </span>

      {/* Top: hora destacada + sede + cat badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.04em",
          }}>
            {hora}
          </span>
          {sede && (
            <>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>·</span>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)",
                display: "flex", alignItems: "center", gap: 2,
              }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 11, lineHeight: 1 }}>location_on</span>
                {sede}
              </span>
            </>
          )}
        </div>
        {cat && (
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase", letterSpacing: "0.08em",
            background: "rgba(255,255,255,0.07)", padding: "2px 7px", borderRadius: 4,
          }}>
            {cat}
          </span>
        )}
      </div>

      {/* Parejas — mismo peso visual */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ paddingBottom: 8 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)",
            display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            lineHeight: 1,
          }}>
            {fmtPareja(p.pareja1)}
          </span>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 0 8px 0" }} />

        <div>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.88)",
            display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            lineHeight: 1,
          }}>
            {fmtPareja(p.pareja2)}
          </span>
        </div>
      </div>
    </div>
  )
}
