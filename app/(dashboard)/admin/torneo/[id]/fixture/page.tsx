import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { FixtureEditorView } from "@/components/admin/FixtureEditorView"

export default async function AdminFixturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: torneo } = await supabase
    .from("torneos")
    .select("id, nombre")
    .eq("id", id)
    .single()

  if (!torneo) notFound()

  const [{ data: sedes }, { data: partidos }] = await Promise.all([
    supabase
      .from("sedes")
      .select("id, nombre, canchas_count, horario_inicio, horario_fin, duracion_turno")
      .eq("torneo_id", id)
      .order("nombre"),
    supabase
      .from("partidos")
      .select(`
        id, horario, cancha, estado, resultado,
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
      .order("horario"),
  ])

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: "14px 16px 12px",
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", gap: 12,
        position: "sticky", top: 48, zIndex: 30,
      }}>
        <Link href={`/admin/torneo/${id}`} style={{ textDecoration: "none", display: "flex" }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22, color: "#64748b", lineHeight: 1 }}>arrow_back</span>
        </Link>
        <div>
          <p style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 16, fontWeight: 400, color: "#0f172a",
            textTransform: "uppercase", margin: 0, lineHeight: 1,
          }}>
            Editor de Fixture
          </p>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, color: "#94a3b8", margin: "2px 0 0", fontWeight: 700,
          }}>
            {torneo.nombre} — tocá un partido para moverlo
          </p>
        </div>
      </div>

      <FixtureEditorView partidos={partidos ?? []} sedes={sedes ?? []} />
    </div>
  )
}
