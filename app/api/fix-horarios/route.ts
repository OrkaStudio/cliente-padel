import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Endpoint temporal para mover 3 partidos — borrar después de usar
export async function GET() {
  const supabase = createAdminClient()

  // Buscar todos los jugadores involucrados
  const apellidos = ["Barisoni", "Correa", "Russo"]
  const { data: jugadores } = await supabase
    .from("jugadores")
    .select("id, nombre, apellido")
    .in("apellido", apellidos)

  if (!jugadores?.length) {
    return NextResponse.json({ error: "Jugadores no encontrados", jugadores })
  }

  const jugMap = new Map(jugadores.map(j => [j.apellido.toLowerCase(), j.id]))

  // Buscar parejas de cada jugador
  const jugIds = jugadores.map(j => j.id)
  const { data: parejas } = await supabase
    .from("parejas")
    .select("id, jugador1_id, jugador2_id")
    .or(jugIds.map(id => `jugador1_id.eq.${id},jugador2_id.eq.${id}`).join(","))

  if (!parejas?.length) {
    return NextResponse.json({ error: "Parejas no encontradas" })
  }

  function findParejaId(apellido: string) {
    const jid = jugMap.get(apellido.toLowerCase())
    if (!jid) return null
    return parejas!.find(p => p.jugador1_id === jid || p.jugador2_id === jid)?.id ?? null
  }

  const pBarisonId = findParejaId("Barisoni")
  const pCorreaId  = findParejaId("Correa")
  const pRussoId   = findParejaId("Russo")

  // Buscar los partidos
  const parejaIds = [pBarisonId, pCorreaId, pRussoId].filter(Boolean) as string[]
  const { data: partidos } = await supabase
    .from("partidos")
    .select("id, horario, pareja1_id, pareja2_id")
    .or(parejaIds.map(id => `pareja1_id.eq.${id},pareja2_id.eq.${id}`).join(","))

  if (!partidos?.length) {
    return NextResponse.json({ error: "Partidos no encontrados", pBarisonId, pCorreaId, pRussoId })
  }

  // Mapear cada partido al cambio que corresponde
  const cambios: { id: string; hora: string; fecha: string; label: string }[] = []

  for (const p of partidos) {
    const ids = [p.pareja1_id, p.pareja2_id]
    if (pBarisonId && ids.includes(pBarisonId)) {
      cambios.push({ id: p.id, hora: "14:00", fecha: "2026-04-19", label: "Barisoni → Dom 14:00" })
    } else if (pCorreaId && ids.includes(pCorreaId)) {
      cambios.push({ id: p.id, hora: "19:00", fecha: "2026-04-19", label: "Correa → Dom 19:00" })
    } else if (pRussoId && ids.includes(pRussoId)) {
      cambios.push({ id: p.id, hora: "22:00", fecha: "2026-04-18", label: "Russo → Sáb 22:00" })
    }
  }

  if (!cambios.length) {
    return NextResponse.json({ error: "No se mapearon cambios", partidos, parejaIds })
  }

  // Aplicar en interclub_partidos (overlay)
  const now = new Date().toISOString()
  const { error } = await supabase
    .from("interclub_partidos")
    .upsert(
      cambios.map(c => ({
        id: c.id,
        hora: c.hora,
        fecha: c.fecha,
        updated_at: now,
      })),
      { onConflict: "id" }
    )

  if (error) return NextResponse.json({ error: error.message })

  revalidatePath("/torneos/interclubes-abril-2026/interclub")

  return NextResponse.json({ ok: true, cambios })
}
