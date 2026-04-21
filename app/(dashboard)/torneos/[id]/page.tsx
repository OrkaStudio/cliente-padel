// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

export const revalidate = 30

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { LiveMatchBanner } from "@/components/torneos/LiveMatchBanner"

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
function fmtFecha(iso: string) {
  const [, m, d] = iso.split("-")
  return `${parseInt(d)} ${MESES[parseInt(m) - 1]}`
}
function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}
function fmtPareja(pareja: { jugador1: { apellido: string } | null; jugador2: { apellido: string } | null } | null) {
  if (!pareja) return "—"
  const a = pareja.jugador1?.apellido ?? ""
  const b = pareja.jugador2?.apellido ?? ""
  return b ? `${a} / ${b}` : a
}

export default async function TorneoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: torneo } = await supabase
    .from("torneos")
    .select("id, nombre, fecha_inicio, fecha_fin, estado")
    .eq("id", id)
    .single()

  if (!torneo) notFound()

  const [
    { data: sedes },
    { data: partidoEnVivo },
    { data: proximos },
  ] = await Promise.all([
    supabase.from("sedes").select("id, nombre").eq("torneo_id", id),

    supabase.from("partidos").select(`
      id, horario, cancha,
      sedes ( nombre ),
      pareja1:parejas!pareja1_id (
        jugador1:jugadores!jugador1_id ( nombre, apellido ),
        jugador2:jugadores!jugador2_id ( nombre, apellido )
      ),
      pareja2:parejas!pareja2_id (
        jugador1:jugadores!jugador1_id ( nombre, apellido ),
        jugador2:jugadores!jugador2_id ( nombre, apellido )
      )
    `).eq("torneo_id", id).eq("estado", "en_vivo").limit(1).maybeSingle(),

    supabase.from("partidos").select(`
      id, horario, cancha,
      sedes:sede_id ( nombre ),
      categorias:categoria_id ( nombre ),
      pareja1:parejas!pareja1_id (
        jugador1:jugadores!jugador1_id ( apellido ),
        jugador2:jugadores!jugador2_id ( apellido )
      ),
      pareja2:parejas!pareja2_id (
        jugador1:jugadores!jugador1_id ( apellido ),
        jugador2:jugadores!jugador2_id ( apellido )
      )
    `).eq("torneo_id", id).eq("estado", "pendiente").order("horario").limit(4),
  ])

  const sedeNombres = (sedes ?? []).map(s => s.nombre).join(" · ")

  return (
    <div style={{ paddingBottom: 100, background: "#f8fafc", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{
        padding: "16px 18px 28px",
        position: "relative", overflow: "hidden",
        background: "#0f172a",
        borderRadius: "0 0 28px 28px",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -40,
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(188,255,0,0.18) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        <Link href={"/torneos" as AnyHref} style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          color: "#64748b", textDecoration: "none",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 11, fontWeight: 800, textTransform: "uppercase",
          letterSpacing: "0.06em", marginBottom: 18,
          WebkitTapHighlightColor: "transparent",
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>arrow_back</span>
          Torneos
        </Link>

        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 42, lineHeight: 0.9, color: "#fff",
            textTransform: "uppercase", fontWeight: 400,
            margin: "0 0 20px", letterSpacing: "-0.01em",
          }}>
            {torneo.nombre}
          </h1>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <HeroPill icon="calendar_month">
              {fmtFecha(torneo.fecha_inicio)} → {fmtFecha(torneo.fecha_fin)}
            </HeroPill>
            {sedeNombres && (
              <HeroPill icon="location_on">{sedeNombres}</HeroPill>
            )}
          </div>
        </div>
      </div>

      {/* Partido en vivo */}
      {partidoEnVivo && (
        <LiveMatchBanner partido={partidoEnVivo} torneoId={id} />
      )}

      {/* Próximos partidos */}
      <div style={{ padding: "24px 18px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, fontWeight: 900, color: "#64748b",
            textTransform: "uppercase", letterSpacing: "0.08em", margin: 0,
          }}>
            Próximos partidos
          </h2>
          {(proximos ?? []).length > 0 && (
            <Link href={`/torneos/${id}/fixture` as AnyHref} style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, fontWeight: 800, color: "#0f172a",
              textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em",
              WebkitTapHighlightColor: "transparent",
            }}>
              Ver todos
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 15, lineHeight: 1 }}>chevron_right</span>
            </Link>
          )}
        </div>

        {(proximos ?? []).length === 0 ? (
          <EmptyFixture torneoId={id} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(proximos ?? []).map((p) => (
              <ProximoCard key={p.id} partido={p} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HeroPill({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      padding: "5px 12px", borderRadius: 100,
      display: "flex", alignItems: "center", gap: 5,
    }}>
      <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#bcff00", lineHeight: 1 }}>
        {icon}
      </span>
      <span style={{
        fontSize: 11, fontWeight: 700,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        color: "#e2e8f0", letterSpacing: "0.02em",
      }}>
        {children}
      </span>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProximoCard({ partido }: { partido: any }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sede = (partido.sedes as any)?.nombre ?? ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cat  = (partido.categorias as any)?.nombre ?? ""

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 16,
      padding: "12px 14px",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}>
      {/* Hora */}
      <div style={{
        minWidth: 44,
        display: "flex", flexDirection: "column", alignItems: "center",
        background: "#f1f5f9", borderRadius: 10, padding: "6px 4px",
      }}>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 14, fontWeight: 900, color: "#0f172a", lineHeight: 1,
        }}>
          {fmtHora(partido.horario)}
        </span>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 700, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2,
        }}>
          C{partido.cancha}
        </span>
      </div>

      {/* Parejas */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 14, color: "#0f172a", fontWeight: 400,
            textTransform: "uppercase", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {fmtPareja(partido.pareja1)}
          </span>
          <span style={{ fontSize: 9, fontWeight: 900, color: "#94a3b8" }}>vs</span>
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 14, color: "#0f172a", fontWeight: 400,
            textTransform: "uppercase", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {fmtPareja(partido.pareja2)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          {cat && (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 700, color: "#64748b",
            }}>
              {cat}
            </span>
          )}
          {sede && cat && <span style={{ fontSize: 10, color: "#cbd5e1" }}>·</span>}
          {sede && (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 700, color: "#64748b",
            }}>
              {sede}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyFixture({ torneoId }: { torneoId: string }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 20, padding: "32px 24px",
      textAlign: "center",
    }}>
      <span style={{
        fontFamily: "'Material Symbols Outlined'",
        fontSize: 40, color: "#e2e8f0", display: "block", lineHeight: 1,
      }}>
        calendar_today
      </span>
      <p style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 13, fontWeight: 700, color: "#94a3b8",
        margin: "12px 0 20px", lineHeight: 1.4,
      }}>
        El fixture se publicará<br />cuando el torneo comience
      </p>
      <Link href={`/torneos/${torneoId}/fixture` as AnyHref} style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "#0f172a", color: "#bcff00",
        padding: "10px 20px", borderRadius: 100,
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 12, fontWeight: 900, textTransform: "uppercase",
        letterSpacing: "0.05em", textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
      }}>
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>sports_tennis</span>
        Ver fixture
      </Link>
    </div>
  )
}
