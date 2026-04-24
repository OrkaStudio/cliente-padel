export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { VeedorInterclubView } from "@/components/torneos/interclub/VeedorInterclubView"
import { VeedorView } from "@/components/torneos/VeedorView"
import { getCategorias } from "@/lib/interclub-data"

const CLUB_INFO: Record<string, { nombre: string; maxEnVivo: number }> = {
  "voleando":  { nombre: "Voleando",  maxEnVivo: 2 },
  "mas-padel": { nombre: "Más Pádel", maxEnVivo: 2 },
}

export default async function VeedorPage({ params }: { params: Promise<{ club: string }> }) {
  const { club } = await params
  if (!CLUB_INFO[club]) redirect("/torneos")

  const cookieStore = await cookies()
  const pinOk = cookieStore.get(`veedor_pin_${club}`)?.value === "ok"
  if (!pinOk) redirect(`/veedor/${club}/login`)

  const supabase = await createClient()

  const { data: torneos } = await supabase
    .from("torneos")
    .select("id, tipo")
    .eq("estado", "en_curso")
    .order("created_at", { ascending: false })

  const regularTorneo   = torneos?.find(t => t.tipo === "regular")
  const interclubTorneo = torneos?.find(t => t.tipo === "interclub")

  // ── Torneo regular activo: mostrar VeedorView por sede ──
  if (regularTorneo) {
    const { data: todasSedes } = await supabase
      .from("sedes")
      .select("id, nombre")
      .eq("torneo_id", regularTorneo.id)

    const sede = club === "voleando"
      ? todasSedes?.find(s => s.nombre.toLowerCase().includes("oleando")) ?? null
      : todasSedes?.find(s => !s.nombre.toLowerCase().includes("oleando")) ?? null

    if (sede) {
      const { data: partidos } = await supabase
        .from("partidos")
        .select(`
          id, horario, cancha, estado, resultado, pareja1_id, pareja2_id,
          categorias:categoria_id ( id, nombre ),
          pareja1:parejas!pareja1_id (
            jugador1:jugadores!jugador1_id ( id, nombre, apellido ),
            jugador2:jugadores!jugador2_id ( id, nombre, apellido )
          ),
          pareja2:parejas!pareja2_id (
            jugador1:jugadores!jugador1_id ( id, nombre, apellido ),
            jugador2:jugadores!jugador2_id ( id, nombre, apellido )
          )
        `)
        .eq("torneo_id", regularTorneo.id)
        .eq("sede_id", sede.id)
        .order("horario")

      return (
        <VeedorView
          partidos={partidos ?? []}
          sedeName={sede.nombre}
        />
      )
    }
  }

  // ── Fallback interclub ──
  const interclubId = interclubTorneo?.id ?? "11111111-0000-0000-0000-000000000001"
  const [categorias, { data: liveData }] = await Promise.all([
    getCategorias(interclubId),
    supabase.from("interclub_partidos").select("id, resultado, ganador, estado, hora, cancha, fecha, sede"),
  ])

  return (
    <VeedorInterclubView
      club={club}
      clubNombre={CLUB_INFO[club].nombre}
      maxEnVivo={CLUB_INFO[club].maxEnVivo}
      initialCategorias={categorias}
      initialLiveData={liveData ?? []}
    />
  )
}
