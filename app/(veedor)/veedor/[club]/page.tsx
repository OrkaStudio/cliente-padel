export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { VeedorView } from "@/components/torneos/VeedorView"
import { VeedorInterclubView } from "@/components/torneos/interclub/VeedorInterclubView"
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
    // Interclub: traer estado live de Supabase
    const { data: liveData } = await supabase
      .from("interclub_partidos")
      .select("id, resultado, ganador, estado")
    return <VeedorInterclubView club={club} clubNombre={info.nombre} initialLiveData={liveData ?? []} />
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
    <VeedorView
      partidos={aplicarEstadoAuto(partidos ?? [])}
      sedeName={sede.nombre}
    />
  )
}
