import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PanelInscripcion } from "@/components/torneos/wizard/PanelInscripcion"
import type { Categoria } from "@/types/torneo"
import type { Jugador } from "@/types/jugador"

export default async function AdminInscripcionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: torneo } = await supabase
    .from("torneos")
    .select("id, nombre, estado")
    .eq("id", id)
    .single()

  if (!torneo) notFound()

  const { data: torneoCats } = await supabase
    .from("torneo_categorias")
    .select("categoria_id, categorias(id, nombre, tipo, orden)")
    .eq("torneo_id", id)

  const categorias: Categoria[] = (torneoCats ?? [])
    .map((tc) => tc.categorias as unknown as Categoria)
    .filter(Boolean)
    .sort((a, b) => a.orden - b.orden)

  const { data: parejasRaw } = await supabase
    .from("parejas")
    .select("id, categoria_id, jugador1_id, jugador2_id")
    .eq("torneo_id", id)

  const jugadorIds = [
    ...(parejasRaw ?? []).map((p) => p.jugador1_id),
    ...(parejasRaw ?? []).flatMap((p) => (p.jugador2_id ? [p.jugador2_id] : [])),
  ].filter((v, i, a) => a.indexOf(v) === i)

  const { data: jugadoresRaw } = jugadorIds.length
    ? await supabase
        .from("jugadores")
        .select("id, nombre, apellido, telefono, categoria_id")
        .in("id", jugadorIds)
    : { data: [] }

  const jugadoresMap = Object.fromEntries(
    (jugadoresRaw ?? []).map((j) => [j.id, j as Jugador])
  )

  const parejas = (parejasRaw ?? [])
    .filter((p) => jugadoresMap[p.jugador1_id])
    .map((p) => ({
      id: p.id,
      categoria_id: p.categoria_id,
      jugador1: jugadoresMap[p.jugador1_id],
      jugador2: p.jugador2_id ? (jugadoresMap[p.jugador2_id] ?? null) : null,
    }))

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <PanelInscripcion
        torneoId={id}
        categorias={categorias}
        parejasIniciales={parejas}
      />
    </main>
  )
}
