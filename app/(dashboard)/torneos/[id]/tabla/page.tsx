export const revalidate = 15

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TablaView } from "@/components/torneos/TablaView"

export default async function TablaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Categorías primero (necesitamos sus IDs para la query de grupos)
  const { data: torneoCategorias } = await supabase
    .from("torneo_categorias")
    .select(`id, categoria_id, categorias ( id, nombre, tipo, orden )`)
    .eq("torneo_id", id)
    .order("categorias(orden)")

  if (!torneoCategorias) notFound()

  // Grupos y partidos en paralelo
  const [{ data: grupos }, { data: partidos }] = await Promise.all([
    supabase.from("grupos").select(`
      id, nombre,
      torneo_categoria_id,
      grupo_parejas (
        posicion,
        parejas (
          id, jugador1_id, jugador2_id,
          jugador1:jugadores!jugador1_id ( nombre, apellido ),
          jugador2:jugadores!jugador2_id ( nombre, apellido )
        )
      )
    `).in("torneo_categoria_id", torneoCategorias.map(tc => tc.id)),
    supabase.from("partidos")
      .select("id, pareja1_id, pareja2_id, resultado, estado, categoria_id")
      .eq("torneo_id", id)
      .eq("tipo", "grupo")
      .eq("estado", "finalizado"),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categorias = (torneoCategorias ?? []).map(tc => ({
    id: tc.categoria_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nombre: (tc.categorias as any)?.nombre ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tipo: (tc.categorias as any)?.tipo ?? "",
    tcId: tc.id,
  }))

  return (
    <TablaView
      categorias={categorias}
      grupos={grupos ?? []}
      partidos={partidos ?? []}
      initialCatId={null}
    />
  )
}
