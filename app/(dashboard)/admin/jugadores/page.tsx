import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { JugadoresView } from "@/components/admin/JugadoresView"

export default async function AdminJugadoresPage() {
  const supabase = await createClient()

  const [{ data: jugadores }, { data: categorias }] = await Promise.all([
    supabase.from("jugadores").select("id, nombre, apellido, telefono, categoria_id, categorias(nombre)").order("apellido"),
    supabase.from("categorias").select("id, nombre").order("orden"),
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
        <Link href="/admin" style={{ textDecoration: "none", display: "flex" }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22, color: "#64748b", lineHeight: 1 }}>arrow_back</span>
        </Link>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 16, fontWeight: 400, color: "#0f172a",
            textTransform: "uppercase", margin: 0, lineHeight: 1,
          }}>
            Jugadores
          </p>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, color: "#94a3b8", margin: "2px 0 0", fontWeight: 700,
          }}>
            {jugadores?.length ?? 0} registrados
          </p>
        </div>
      </div>

      <JugadoresView jugadores={jugadores ?? []} categorias={categorias ?? []} />
    </div>
  )
}
