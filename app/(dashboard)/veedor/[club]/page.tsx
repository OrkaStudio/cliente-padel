export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Image from "next/image"
import { VeedorView } from "@/components/torneos/VeedorView"
import { aplicarEstadoAuto } from "@/lib/partidos"

const CLUB_INFO: Record<string, { nombre: string; logo: string; sedeKeyword: string }> = {
  "voleando":  { nombre: "Voleando",  logo: "/clubes/voleando.logo.png",  sedeKeyword: "voleando" },
  "mas-padel": { nombre: "Más Pádel", logo: "/clubes/mas-padel.logo.png", sedeKeyword: "pádel" },
}

export default async function VeedorPage({ params }: { params: Promise<{ club: string }> }) {
  const { club } = await params
  const info = CLUB_INFO[club]
  if (!info) redirect("/torneos")

  // Verificar cookie PIN
  const cookieStore = await cookies()
  const pinOk = cookieStore.get(`veedor_pin_${club}`)?.value === "ok"
  if (!pinOk) redirect(`/veedor/${club}/login`)

  const supabase = await createClient()

  // Buscar torneo activo
  const { data: torneo } = await supabase
    .from("torneos")
    .select("id, nombre, estado")
    .eq("estado", "en_curso")
    .limit(1)
    .single()

  if (!torneo) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 48, color: "#cbd5e1", display: "block" }}>
          sports_tennis
        </span>
        <p style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 20, color: "#94a3b8",
          textTransform: "uppercase", marginTop: 12,
        }}>
          Sin torneo en curso
        </p>
      </div>
    )
  }

  // Primero buscamos la sede (necesitamos su ID para filtrar partidos en DB)
  const { data: sedes } = await supabase
    .from("sedes")
    .select("id, nombre")
    .eq("torneo_id", torneo.id)
    .ilike("nombre", `%${info.sedeKeyword}%`)

  const sede = sedes?.[0]
  if (!sede) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 14, color: "#64748b" }}>
          No se encontró la sede de {info.nombre} en el torneo activo.
        </p>
      </div>
    )
  }

  // Traemos solo los partidos de esta sede, filtrando en DB
  const { data: partidos } = await supabase
    .from("partidos")
    .select(`
      id, horario, cancha, estado, resultado, tipo,
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
    .eq("sede_id", sede.id)
    .order("horario")

  return (
    <div>
      {/* Header de sede */}
      <div style={{
        padding: "16px 16px 12px",
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: "#f8fafc", border: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", flexShrink: 0,
        }}>
          <Image src={info.logo} alt={info.nombre} width={36} height={36} style={{ objectFit: "contain" }} />
        </div>
        <div>
          <p style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 18, fontWeight: 400, color: "#0f172a",
            textTransform: "uppercase", margin: 0,
          }}>
            {sede.nombre}
          </p>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, color: "#64748b", fontWeight: 700, margin: 0,
          }}>
            {torneo.nombre}
          </p>
        </div>
        <div style={{
          marginLeft: "auto",
          background: "#bcff00", borderRadius: 4, padding: "4px 10px",
        }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 900, color: "#0f172a",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Veedor
          </span>
        </div>
      </div>

      <VeedorView partidos={aplicarEstadoAuto(partidos ?? [])} sedeName={sede.nombre} />
    </div>
  )
}
