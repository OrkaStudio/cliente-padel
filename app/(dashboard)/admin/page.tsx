import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { EstadoTorneoButton } from "@/components/admin/EstadoTorneoButton"

const ESTADO_LABEL: Record<string, { t: string; bg: string; c: string }> = {
  borrador:    { t: "Borrador",    bg: "#f1f5f9", c: "#64748b" },
  inscripcion: { t: "Inscripción", bg: "#dbeafe", c: "#1e40af" },
  en_curso:    { t: "En curso",    bg: "#bcff00", c: "#0f172a" },
  finalizado:  { t: "Finalizado",  bg: "#e2e8f0", c: "#64748b" },
}

const NEXT_ESTADO: Record<string, string> = {
  borrador:    "inscripcion",
  inscripcion: "en_curso",
  en_curso:    "finalizado",
}

export default async function AdminPage() {
  const supabase = await createClient()

  // Todos los torneos (admin ve todo)
  const { data: torneos } = await supabase
    .from("torneos")
    .select("id, nombre, fecha_inicio, fecha_fin, estado, costo_inscripcion")
    .order("created_at", { ascending: false })

  // Métricas del torneo activo
  const activo = torneos?.find(t => t.estado === "en_curso") ?? torneos?.[0]

  let metricas = { parejas: 0, jugados: 0, enVivo: 0, pendientes: 0, recaudacion: 0 }

  if (activo) {
    const [{ count: parejas }, { data: partidos }] = await Promise.all([
      supabase.from("parejas").select("*", { count: "exact", head: true }).eq("torneo_id", activo.id),
      supabase.from("partidos").select("estado").eq("torneo_id", activo.id),
    ])
    metricas = {
      parejas:     parejas ?? 0,
      jugados:     partidos?.filter(p => p.estado === "finalizado").length ?? 0,
      enVivo:      partidos?.filter(p => p.estado === "en_vivo").length ?? 0,
      pendientes:  partidos?.filter(p => p.estado === "pendiente").length ?? 0,
    }
  }

  return (
    <div style={{ padding: "20px 16px 100px" }}>

      {/* Header admin */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{
            fontFamily: "'Material Symbols Outlined'",
            fontSize: 16, color: "#bcff00", lineHeight: 1,
          }}>
            admin_panel_settings
          </span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 900, color: "#64748b",
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            Panel Admin
          </span>
        </div>
        <h1 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 28, fontWeight: 400, color: "#0f172a",
          textTransform: "uppercase", margin: 0, lineHeight: 1,
        }}>
          {activo?.nombre ?? "Sin torneo activo"}
        </h1>
      </div>

      {activo && (
        <>
          {/* Estado + cambiar */}
          <div style={{
            background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
            padding: "16px", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10, fontWeight: 900, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px",
              }}>Estado del torneo</p>
              <span style={{
                ...ESTADO_LABEL[activo.estado],
                padding: "4px 12px", borderRadius: 4,
                fontSize: 11, fontWeight: 900,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                textTransform: "uppercase",
                background: ESTADO_LABEL[activo.estado]?.bg,
                color: ESTADO_LABEL[activo.estado]?.c,
              }}>
                {ESTADO_LABEL[activo.estado]?.t}
              </span>
            </div>
            {NEXT_ESTADO[activo.estado] && (
              <EstadoTorneoButton
                torneoId={activo.id}
                nextEstado={NEXT_ESTADO[activo.estado] as "inscripcion" | "en_curso" | "finalizado"}
                label={ESTADO_LABEL[NEXT_ESTADO[activo.estado] ?? ""]?.t ?? ""}
              />
            )}
          </div>

          {/* Bento Box Operativo */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 12, marginBottom: 28,
          }}>
            {metricas.enVivo > 0 ? (
              <div style={{
                gridColumn: "span 2", background: "#bcff00", borderRadius: 16, padding: "20px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: "0 8px 32px rgba(188,255,0,0.15)"
              }}>
                <div>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 900,
                    textTransform: "uppercase", color: "#166534", letterSpacing: "0.06em", display: "block", marginBottom: 4
                  }}>
                    Operando Ahora
                  </span>
                  <p style={{
                    fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 40,
                    color: "#0f172a", margin: 0, lineHeight: 1
                  }}>
                    {metricas.enVivo} EN VIVO
                  </p>
                </div>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 52, opacity: 0.8, color: "#166534" }}>stadium</span>
              </div>
            ) : (
              <div style={{
                gridColumn: "span 2", background: "#0f172a", borderRadius: 16, padding: "20px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                boxShadow: "0 12px 32px rgba(0,0,0,0.15)"
              }}>
                <div>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 11, fontWeight: 900,
                    textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.06em", display: "block", marginBottom: 4
                  }}>
                    Por jugar
                  </span>
                  <p style={{
                    fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 44,
                    color: "#fff", margin: 0, lineHeight: 1
                  }}>
                    {metricas.pendientes}
                  </p>
                </div>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 52, color: "#bcff00" }}>schedule</span>
              </div>
            )}

            <MetricCard icon="group" label="Parejas" value={String(metricas.parejas)} />
            <MetricCard icon="fact_check" label="Completados" value={String(metricas.jugados)} />
          </div>

          {/* Acciones principales (Botones táctiles enormes) */}
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, fontWeight: 900, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12,
          }}>
            Panel de Control
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AdminLink href={`/admin/torneo/${activo.id}`} icon="sports_tennis" label="Monitor de Canchas" desc="Cargar resultados de los partidos en juego" accent />
            <AdminLink href={`/admin/torneo/${activo.id}/fixture`} icon="edit_calendar" label="Editar Horarios" desc="Resolver atrasos y reasignar canchas" />
            <AdminLink href={`/admin/torneo/${activo.id}/inscripcion`} icon="person_add" label="Inscripciones" desc="Ver o agregar parejas y jugadores" />
          </div>
        </>
      )}

      {/* Otros torneos */}
      {(torneos?.length ?? 0) > 1 && (
        <div style={{ marginTop: 32 }}>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 900, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
          }}>
            Otros torneos
          </p>
          {torneos?.filter(t => t.id !== activo?.id).map(t => (
            <Link key={t.id} href={`/admin/torneo/${t.id}` as never} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
                padding: "12px 16px", marginBottom: 8,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <p style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0,
                  }}>{t.nombre}</p>
                  <p style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 11, color: "#94a3b8", margin: "2px 0 0",
                  }}>{t.fecha_inicio} → {t.fecha_fin}</p>
                </div>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: "#cbd5e1" }}>chevron_right</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? "#0f172a" : "#fff",
      borderRadius: 12, border: `1px solid ${accent ? "#0f172a" : "#e2e8f0"}`,
      padding: "14px",
    }}>
      <span style={{
        fontFamily: "'Material Symbols Outlined'",
        fontSize: 20, color: accent ? "#bcff00" : "#94a3b8",
        display: "block", marginBottom: 8, lineHeight: 1,
      }}>{icon}</span>
      <p style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 28, fontWeight: 400,
        color: accent ? "#fff" : "#0f172a",
        margin: "0 0 2px", lineHeight: 1,
      }}>{value}</p>
      <p style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 10, fontWeight: 700, color: accent ? "#94a3b8" : "#64748b",
        textTransform: "uppercase", letterSpacing: "0.06em", margin: 0,
      }}>{label}</p>
    </div>
  )
}

function AdminLink({ href, icon, label, desc, accent }: { href: string; icon: string; label: string; desc: string; accent?: boolean }) {
  return (
    <Link href={href as never} style={{ textDecoration: "none" }}>
      <div style={{
        background: accent ? "#0f172a" : "#fff",
        borderRadius: 16, border: `1px solid ${accent ? "transparent" : "#e2e8f0"}`,
        padding: "18px 20px", display: "flex", alignItems: "center", gap: 16,
        boxShadow: accent ? "0 12px 24px rgba(0,0,0,0.15)" : "none",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: accent ? "#bcff00" : "#f1f5f9", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 24, color: "#0f172a", lineHeight: 1 }}>{icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 15, fontWeight: 900, color: accent ? "#fff" : "#0f172a", margin: "0 0 2px",
          }}>{label}</p>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, color: accent ? "#94a3b8" : "#64748b", margin: 0, lineHeight: 1.3
          }}>{desc}</p>
        </div>
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 24, color: accent ? "#334155" : "#cbd5e1" }}>chevron_right</span>
      </div>
    </Link>
  )
}
