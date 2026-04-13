export const revalidate = 15

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { FixtureView } from "@/components/torneos/FixtureView"
import { aplicarEstadoAuto } from "@/lib/partidos"

export default async function FixturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: torneo }, { data: partidos }] = await Promise.all([
    supabase.from("torneos").select("id, nombre").eq("id", id).single(),
    supabase.from("partidos").select(`
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
    `).eq("torneo_id", id).order("horario"),
  ])

  if (!torneo) notFound()

  return <FixtureView partidos={aplicarEstadoAuto(partidos ?? [])} />
}
