import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { VeedorView } from "@/components/torneos/VeedorView"
import { aplicarEstadoAuto } from "@/lib/partidos"

export default async function AdminTorneoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: torneo } = await supabase
    .from("torneos")
    .select("id, nombre, estado")
    .eq("id", id)
    .single()

  if (!torneo) notFound()

  const { data: partidos } = await supabase
    .from("partidos")
    .select(`
      id, horario, cancha, estado, resultado, tipo,
      sedes ( id, nombre ),
      categorias ( nombre ),
      pareja1:parejas!pareja1_id (
        jugador1:jugadores!jugador1_id ( nombre, apellido ),
        jugador2:jugadores!jugador2_id ( nombre, apellido )
      ),
      pareja2:parejas!pareja2_id (
        jugador1:jugadores!jugador1_id ( nombre, apellido ),
        jugador2:jugadores!jugador2_id ( nombre, apellido )
      )
    `)
    .eq("torneo_id", id)
    .order("horario")

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: "14px 16px 12px",
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/admin" style={{ textDecoration: "none", display: "flex" }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22, color: "#64748b", lineHeight: 1 }}>arrow_back</span>
        </Link>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 16, fontWeight: 400, color: "#0f172a",
            textTransform: "uppercase", margin: 0, lineHeight: 1,
          }}>{torneo.nombre}</p>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, color: "#94a3b8", margin: "2px 0 0", fontWeight: 700,
          }}>Monitor de canchas</p>
        </div>
        <Link href={`/admin/torneo/${id}/fixture`} style={{ textDecoration: "none" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#f1f5f9", borderRadius: 8, padding: "8px 12px",
            border: "1px solid #e2e8f0",
          }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#0f172a", lineHeight: 1 }}>edit_calendar</span>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 900, color: "#0f172a",
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>Fixture</span>
          </div>
        </Link>
      </div>

      <VeedorView partidos={aplicarEstadoAuto(partidos ?? [])} sedeName="Todos" isAdmin />
    </div>
  )
}
