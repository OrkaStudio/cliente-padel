export const revalidate = 15

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { LlavesView } from "@/components/torneos/LlavesView"

export default async function LlavesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: torneo }, { data: partidos }, { data: torneoCategorias }] = await Promise.all([
    supabase.from("torneos").select("id, nombre").eq("id", id).single(),
    supabase.from("partidos").select(`
      id, horario, cancha, estado, resultado, tipo, ronda,
      sedes ( nombre ),
      categorias ( id, nombre, orden ),
      pareja1:parejas!pareja1_id (
        jugador1:jugadores!jugador1_id ( nombre, apellido ),
        jugador2:jugadores!jugador2_id ( nombre, apellido )
      ),
      pareja2:parejas!pareja2_id (
        jugador1:jugadores!jugador1_id ( nombre, apellido ),
        jugador2:jugadores!jugador2_id ( nombre, apellido )
      )
    `).eq("torneo_id", id).eq("tipo", "playoff").order("horario"),
    supabase.from("torneo_categorias")
      .select("categoria_id, categorias ( id, nombre, orden )")
      .eq("torneo_id", id)
      .order("categorias(orden)"),
  ])

  if (!torneo) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categorias = (torneoCategorias ?? []).map(tc => ({
    id: tc.categoria_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nombre: (tc.categorias as any)?.nombre ?? "",
  }))

  return <LlavesView partidos={partidos ?? []} categorias={categorias} initialCatId={null} />
}
