import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function TorneosPage() {
  const supabase = await createClient()

  const { data: torneos } = await supabase
    .from("torneos")
    .select("id, nombre, fecha_inicio, fecha_fin, estado")
    .order("created_at", { ascending: false })

  const live   = (torneos ?? []).filter(t => t.estado === "en_curso")
  const others = (torneos ?? []).filter(t => t.estado !== "en_curso")

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
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#bcff00" }} />
            <h2 style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 18,
              textTransform: "uppercase",
              color: "#0f172a",
              fontWeight: 400,
              margin: 0,
            }}>
              En Vivo Ahora
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {live.map(t => <TorneoCard key={t.id} torneo={t} />)}
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
            {others.map(t => <TorneoCard key={t.id} torneo={t} />)}
          </div>
        </section>
      )}

      {(!torneos || torneos.length === 0) && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 48, color: "#cbd5e1", display: "block" }}>
            sports_tennis
          </span>
          <p style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 18,
            color: "#94a3b8",
            textTransform: "uppercase",
            marginTop: 12,
            fontWeight: 400,
          }}>
            Sin torneos todavía
          </p>
        </div>
      )}
    </div>
  )
}

function TorneoCard({ torneo }: {
  torneo: { id: string; nombre: string; fecha_inicio: string; fecha_fin: string; estado: string }
}) {
  const isLive        = torneo.estado === "en_curso"
  const isInscripcion = torneo.estado === "inscripcion"

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link href={`/torneos/${torneo.id}` as any} style={{ textDecoration: "none" }}>
      <div style={{
        width: "100%",
        background: "#ffffff",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        cursor: "pointer",
        position: "relative",
        display: "block",
      }}>
        {/* Hero con gradiente */}
        <div style={{
          height: 140,
          position: "relative",
          background: isLive
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)"
            : "linear-gradient(135deg, #1e293b 0%, #334155 60%, #1e293b 100%)",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            right: -10,
            bottom: -20,
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 90,
            color: "rgba(255,255,255,0.05)",
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
            transform: "rotate(-8deg)",
            fontWeight: 400,
          }}>
            2026
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }} />

          <div style={{ position: "absolute", bottom: 12, left: 16, right: 16 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              {isLive && (
                <span style={{
                  background: "#bcff00", color: "#0f172a",
                  padding: "2px 8px", borderRadius: 4,
                  fontSize: 9, fontWeight: 900,
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  textTransform: "uppercase",
                }}>
                  En Vivo
                </span>
              )}
              {isInscripcion && (
                <span style={{
                  background: "#3b82f6", color: "#fff",
                  padding: "2px 8px", borderRadius: 4,
                  fontSize: 9, fontWeight: 900,
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  textTransform: "uppercase",
                }}>
                  Inscripciones Abiertas
                </span>
              )}
              <span style={{
                background: "rgba(255,255,255,0.18)", color: "#fff",
                padding: "2px 8px", borderRadius: 4,
                fontSize: 9, fontWeight: 900,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                textTransform: "uppercase",
              }}>
                Open
              </span>
            </div>
            <h3 style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 22,
              color: "#fff",
              textTransform: "uppercase",
              lineHeight: 1,
              fontWeight: 400,
              margin: 0,
            }}>
              {torneo.nombre}
            </h3>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, color: "#64748b", lineHeight: 1 }}>calendar_today</span>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-space-grotesk), sans-serif", color: "#64748b" }}>
                {torneo.fecha_inicio} → {torneo.fecha_fin}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, color: "#64748b", lineHeight: 1 }}>location_on</span>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-space-grotesk), sans-serif", color: "#64748b" }}>
                Las Flores
              </span>
            </div>
          </div>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: "#cbd5e1", lineHeight: 1 }}>chevron_right</span>
        </div>
      </div>
    </Link>
  )
}
