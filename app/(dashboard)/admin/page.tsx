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
      recaudacion: (parejas ?? 0) * (activo.costo_inscripcion ?? 0),
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

          {/* Métricas */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 10, marginBottom: 20,
          }}>
            <MetricCard icon="group" label="Parejas" value={String(metricas.parejas)} />
            <MetricCard icon="payments" label="Recaudado" value={`$${(metricas.recaudacion / 1000).toFixed(0)}K`} accent />
            <MetricCard icon="check_circle" label="Jugados" value={String(metricas.jugados)} />
            <MetricCard icon="schedule" label="Pendientes" value={String(metricas.pendientes)} />
          </div>
          {metricas.enVivo > 0 && (
            <div style={{
              background: "#bcff00", borderRadius: 10, padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0f172a" }} />
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 13, fontWeight: 900, color: "#0f172a",
              }}>
                {metricas.enVivo} partido{metricas.enVivo > 1 ? "s" : ""} en vivo ahora
              </span>
            </div>
          )}

          {/* Links rápidos */}
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 900, color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10,
          }}>
            Gestión
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AdminLink href={`/admin/torneo/${activo.id}`} icon="sports_tennis" label="Monitor de canchas" desc="Ver y cargar resultados de todos los partidos" />
            <AdminLink href={`/admin/torneo/${activo.id}/fixture`} icon="edit_calendar" label="Editor de fixture" desc="Cambiar horarios y canchas de partidos" />
            <AdminLink href={`/admin/torneo/${activo.id}/inscripcion`} icon="person_add" label="Inscripciones" desc="Gestionar parejas inscritas" />
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

function AdminLink({ href, icon, label, desc }: { href: string; icon: string; label: string; desc: string }) {
  return (
    <Link href={href as never} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
        padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "#f1f5f9", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: "#0f172a", lineHeight: 1 }}>{icon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0,
          }}>{label}</p>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, color: "#94a3b8", margin: "2px 0 0",
          }}>{desc}</p>
        </div>
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: "#cbd5e1" }}>chevron_right</span>
      </div>
    </Link>
  )
}
