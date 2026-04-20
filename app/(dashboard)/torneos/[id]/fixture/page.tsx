export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { FixtureInterclubView } from "@/components/torneos/interclub/FixtureInterclubView"
import { FixtureView } from "@/components/torneos/FixtureView"
import { CLUB_A, CLUB_B } from "@/components/torneos/interclub/interclub-mock"
import { getCategorias } from "@/lib/interclub-data"

export default async function FixturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: torneo } = await supabase
    .from("torneos")
    .select("tipo")
    .eq("id", id)
    .single()

  if (torneo?.tipo === "regular") {
    const { data: partidos } = await supabase
      .from("partidos")
      .select(`
        id, horario, cancha, estado, resultado, pareja1_id, pareja2_id,
        sedes:sede_id ( id, nombre ),
        categorias:categoria_id ( id, nombre, tipo, orden ),
        pareja1:parejas!pareja1_id (
          jugador1:jugadores!jugador1_id ( id, nombre, apellido ),
          jugador2:jugadores!jugador2_id ( id, nombre, apellido )
        ),
        pareja2:parejas!pareja2_id (
          jugador1:jugadores!jugador1_id ( id, nombre, apellido ),
          jugador2:jugadores!jugador2_id ( id, nombre, apellido )
        )
      `)
      .eq("torneo_id", id)
      .order("horario")

    return <FixtureView partidos={partidos ?? []} />
  }

  // Interclub
  const categorias = await getCategorias(id)
  return (
    <FixtureInterclubView
      categorias={categorias}
      clubA={CLUB_A}
      clubB={CLUB_B}
    />
  )
}
