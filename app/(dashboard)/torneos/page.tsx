import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import Image from "next/image"

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

function fmtFecha(iso: string) {
  const [, m, d] = iso.split("-")
  return `${parseInt(d)} ${MESES[parseInt(m) - 1]}`
}

export default async function TorneosPage() {
  const supabase = await createClient()

  const { data: torneos, error } = await supabase
    .from("torneos")
    .select("id, nombre, fecha_inicio, fecha_fin, estado, tipo")
    .neq("estado", "borrador")
    .order("created_at", { ascending: false })

  const all    = torneos ?? []
  const live   = all.filter(t => t.estado === "en_curso")
  const others = all.filter(t => t.estado !== "en_curso")

  return (
    <div style={{ padding: "20px 18px", paddingBottom: 100 }}>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 32,
          textTransform: "uppercase",
          color: "#0f172a",
          lineHeight: 1,
          fontWeight: 400,
          margin: 0,
        }}>
          Explorar Torneos
        </h1>
        <p style={{
          fontSize: 12,
          color: "#64748b",
          fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
          fontWeight: 700,
          marginTop: 4,
        }}>
          Seleccioná un evento para ver detalles
        </p>
      </div>

      {live.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {live.map(t => <TorneoCard key={t.id} torneo={t} isDev={false} />)}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 18,
            textTransform: "uppercase",
            color: "#64748b",
            marginBottom: 16,
            fontWeight: 400,
            margin: "0 0 16px",
          }}>
            {live.length > 0 ? "Otros Torneos" : "Torneos"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {others.map(t => <TorneoCard key={t.id} torneo={t} isDev={false} />)}
          </div>
        </section>
      )}

      {all.length === 0 && <InterclubCardFallback />}
    </div>
  )
}

function TorneoCard({ torneo, isDev }: {
  torneo: { id: string; nombre: string; fecha_inicio: string; fecha_fin: string; estado: string; tipo: string }
  isDev: boolean
}) {
  if (torneo.tipo === "interclub") {
    return <InterclubCard torneo={torneo} />
  }

  const today          = new Date().toISOString().split("T")[0]
  const isFuture       = torneo.fecha_inicio > today
  const isLive         = torneo.estado === "en_curso" && !isFuture
  const isInscripcion  = torneo.estado === "inscripcion"
  const isProximo      = torneo.estado === "borrador"
  const showProximamente = isProximo || isFuture

  const inner = (
    <div style={{
      width: "100%",
      background: "#ffffff",
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      cursor: (showProximamente && !isDev) ? "default" : "pointer",
      position: "relative",
      display: "block",
      opacity: 1,
    }}>
      <div style={{
        height: 160,
        position: "relative",
        overflow: "hidden",
      }}>
        <Image
          src="/clubes/torneo-campeones-bg.jpg"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center 30%" }}
        />
        {/* Overlay — semi-transparente para que las pelotitas se vean */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.42)" }} />
        {/* Acento verde lima en esquina superior derecha */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 85% 10%, rgba(188,255,0,0.28) 0%, transparent 55%)",
        }} />
        {/* Degradado bottom para legibilidad del texto */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }} />
        <div style={{ position: "absolute", bottom: 12, left: 16, right: 16 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            {showProximamente && (
              <span style={{
                background: "rgba(255,255,255,0.15)", color: "#fff",
                padding: "2px 8px", borderRadius: 4,
                fontSize: 9, fontWeight: 900,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                textTransform: "uppercase", letterSpacing: "0.06em",
                backdropFilter: "blur(4px)",
              }}>
                Próximamente
              </span>
            )}
            {isLive && (
              <span style={{ background: "#bcff00", color: "#0f172a", padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 900, fontFamily: "var(--font-space-grotesk), sans-serif", textTransform: "uppercase" }}>
                En Vivo
              </span>
            )}
            {isInscripcion && !showProximamente && (
              <span style={{ background: "#3b82f6", color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 900, fontFamily: "var(--font-space-grotesk), sans-serif", textTransform: "uppercase" }}>
                Inscripciones Abiertas
              </span>
            )}
          </div>
          <h3 style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 22, color: "#fff", textTransform: "uppercase", lineHeight: 1, fontWeight: 400, margin: 0 }}>
            {torneo.nombre}
          </h3>
        </div>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, color: "#64748b", lineHeight: 1 }}>calendar_today</span>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-space-grotesk), sans-serif", color: "#64748b" }}>
              {fmtFecha(torneo.fecha_inicio)} → {fmtFecha(torneo.fecha_fin)} 2026
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, color: "#64748b", lineHeight: 1 }}>location_on</span>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-space-grotesk), sans-serif", color: "#64748b" }}>
              Las Flores
            </span>
          </div>
        </div>
        {(!showProximamente || isDev) && (
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: "#cbd5e1", lineHeight: 1 }}>chevron_right</span>
        )}
      </div>
    </div>
  )

  if (showProximamente && !isDev) return inner

  return (
    <Link href={`/torneos/${torneo.id}` as never} style={{ textDecoration: "none" }}>
      {inner}
    </Link>
  )
}

function InterclubCard({ torneo }: {
  torneo: { id: string; nombre: string; fecha_inicio: string; fecha_fin: string; estado: string; tipo: string }
}) {
  const isLive = torneo.estado === "en_curso"

  return (
    <Link href={`/torneos/${torneo.id}/interclub`} style={{ textDecoration: "none" }}>
      <div style={{ background: "#ffffff", borderRadius: 20, overflow: "hidden", border: "1px solid #e2e8f0", cursor: "pointer" }}>
        <div style={{
          height: 160, position: "relative", overflow: "hidden",
          background: "radial-gradient(ellipse at 0% 100%, rgba(188,255,0,0.18) 0%, transparent 60%), radial-gradient(ellipse at 100% 0%, rgba(180,83,9,0.13) 0%, transparent 55%), #f8fafc",
          borderBottom: "1px solid #e2e8f0",
        }}>
          <div style={{ position: "absolute", left: "12%", top: 0, bottom: 0, width: 110, opacity: 0.11 }}>
            <Image src="/clubes/voleando.logo.png" alt="" fill style={{ objectFit: "contain", objectPosition: "center" }} />
          </div>
          <div style={{ position: "absolute", right: "12%", top: 0, bottom: 0, width: 110, opacity: 0.11 }}>
            <Image src="/clubes/mas-padel.logo.png" alt="" fill style={{ objectFit: "contain", objectPosition: "center" }} />
          </div>
          <div style={{ position: "absolute", bottom: 12, left: 16, right: 16 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 5 }}>
              {isLive ? (
                <span style={{ background: "rgba(188,255,0,0.15)", color: "#3d6b00", padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 900, fontFamily: "var(--font-space-grotesk), sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  En Vivo
                </span>
              ) : (
                <span style={{ background: "rgba(15,23,42,0.07)", color: "#64748b", padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 900, fontFamily: "var(--font-space-grotesk), sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Finalizado
                </span>
              )}
            </div>
            <h3 style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 20, color: "#0f172a", textTransform: "uppercase", lineHeight: 1, fontWeight: 400, margin: 0 }}>
              {torneo.nombre}
            </h3>
          </div>
        </div>
        <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, color: "#64748b", lineHeight: 1 }}>calendar_today</span>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-space-grotesk), sans-serif", color: "#64748b" }}>
                {fmtFecha(torneo.fecha_inicio)} → {fmtFecha(torneo.fecha_fin)} 2026
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, color: "#64748b", lineHeight: 1 }}>location_on</span>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-space-grotesk), sans-serif", color: "#64748b" }}>
                Voleando · Más Pádel
              </span>
            </div>
          </div>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: "#cbd5e1", lineHeight: 1 }}>chevron_right</span>
        </div>
      </div>
    </Link>
  )
}

function InterclubCardFallback() {
  return (
    <section>
      <InterclubCard torneo={{
        id: "11111111-0000-0000-0000-000000000001",
        nombre: "Interclub Las Flores 2026",
        fecha_inicio: "2026-04-17",
        fecha_fin: "2026-04-19",
        estado: "en_curso",
        tipo: "interclub",
      }} />
    </section>
  )
}
