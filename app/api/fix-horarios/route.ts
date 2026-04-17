import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Revertir Russo vs Brahin/Sachetti (movido por error a 22:00)
export async function GET() {
  const supabase = createAdminClient()

  const { data: jugadores } = await supabase
    .from("jugadores")
    .select("id, nombre, apellido")
    .in("apellido", ["Brahin", "Sachetti"])

  if (!jugadores?.length) return NextResponse.json({ error: "Jugadores no encontrados" })

  const jugIds = jugadores.map(j => j.id)
  const { data: parejas } = await supabase
    .from("parejas")
    .select("id, jugador1_id, jugador2_id")
    .or(jugIds.map(id => `jugador1_id.eq.${id},jugador2_id.eq.${id}`).join(","))

  if (!parejas?.length) return NextResponse.json({ error: "Pareja no encontrada", jugadores })

  const pBrahinSachetti = parejas[0].id

  // Buscar el partido Russo vs Brahin/Sachetti
  const pRussoId = "e386f3f9-48c6-41c2-bed9-0ffc47f63c4e" // sabemos que es Russo de antes
  // Buscar pareja de Russo
  const { data: pRusso } = await supabase
    .from("jugadores").select("id").ilike("apellido", "Russo").single()

  const { data: parejaRusso } = await supabase
    .from("parejas").select("id")
    .or(`jugador1_id.eq.${pRusso?.id},jugador2_id.eq.${pRusso?.id}`)

  const russoIds = (parejaRusso ?? []).map(p => p.id)

  const { data: partido } = await supabase
    .from("partidos")
    .select("id, pareja1_id, pareja2_id")
    .or(russoIds.map(id => `pareja1_id.eq.${id},pareja2_id.eq.${id}`).join(","))
    .or(`pareja1_id.eq.${pBrahinSachetti},pareja2_id.eq.${pBrahinSachetti}`)
    .limit(10)

  // Encontrar el que tiene ambos: Russo Y Brahin/Sachetti
  const target = (partido ?? []).find(p =>
    (russoIds.includes(p.pareja1_id) || russoIds.includes(p.pareja2_id)) &&
    (p.pareja1_id === pBrahinSachetti || p.pareja2_id === pBrahinSachetti)
  )

  if (!target) return NextResponse.json({ error: "Partido no encontrado", pBrahinSachetti, russoIds, partido })

  const { error } = await supabase.from("interclub_partidos").delete().eq("id", target.id)
  if (error) return NextResponse.json({ error: error.message })

  revalidatePath("/torneos/interclubes-abril-2026/interclub")
  return NextResponse.json({ ok: true, revertido: target.id })
}
