import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Endpoint temporal — borrar después de usar
// GET: revierte los 2 partidos mal movidos
export async function GET() {
  const supabase = createAdminClient()

  // Encontrar jugadores involucrados
  const { data: jugadores } = await supabase
    .from("jugadores")
    .select("id, nombre, apellido")
    .in("apellido", ["Orlando", "Canosa", "Juárez", "Griffits", "Barisoni", "Correa"])

  if (!jugadores?.length) return NextResponse.json({ error: "Jugadores no encontrados" })

  const jugMap = new Map(jugadores.map(j => [j.apellido.toLowerCase(), j.id]))

  const jOrlando  = jugMap.get("orlando")
  const jCanosa   = jugMap.get("canosa")
  const jJuarez   = jugMap.get("juárez") ?? jugMap.get("juarez")
  const jGriffits = jugMap.get("griffits")
  const jBarisoni = jugMap.get("barisoni")
  const jCorrea   = jugMap.get("correa")

  // Buscar parejas
  const allJugIds = [jOrlando, jCanosa, jJuarez, jGriffits, jBarisoni, jCorrea].filter(Boolean) as string[]
  const { data: parejas } = await supabase
    .from("parejas")
    .select("id, jugador1_id, jugador2_id")
    .or(allJugIds.map(id => `jugador1_id.eq.${id},jugador2_id.eq.${id}`).join(","))

  if (!parejas?.length) return NextResponse.json({ error: "Parejas no encontradas" })

  function findPareja(j1?: string | null, j2?: string | null) {
    return parejas!.find(p =>
      (p.jugador1_id === j1 || p.jugador2_id === j1) &&
      (p.jugador1_id === j2 || p.jugador2_id === j2)
    )?.id
  }

  const pOrlandoCanosa    = findPareja(jOrlando, jCanosa)
  const pJuarezGriffits   = findPareja(jJuarez, jGriffits)
  const pBarisoni         = parejas.find(p => p.jugador1_id === jBarisoni || p.jugador2_id === jBarisoni)?.id
  const pCorrea           = parejas.find(p => p.jugador1_id === jCorrea   || p.jugador2_id === jCorrea)?.id

  // Los partidos a revertir son:
  // Barisoni vs Orlando/Canosa → buscar el partido que tenga ambas parejas
  // Correa vs Juárez/Griffits  → buscar el partido que tenga ambas parejas
  const parejaIdsToSearch = [pBarisoni, pCorrea, pOrlandoCanosa, pJuarezGriffits].filter(Boolean) as string[]
  const { data: partidos } = await supabase
    .from("partidos")
    .select("id, pareja1_id, pareja2_id")
    .or(parejaIdsToSearch.map(id => `pareja1_id.eq.${id},pareja2_id.eq.${id}`).join(","))

  if (!partidos?.length) return NextResponse.json({ error: "Partidos no encontrados" })

  function hasPareja(p: { pareja1_id: string; pareja2_id: string }, id?: string) {
    return id && (p.pareja1_id === id || p.pareja2_id === id)
  }

  // Barisoni vs Orlando/Canosa
  const pBarisonOrlando = partidos.find(p =>
    hasPareja(p, pBarisoni) && hasPareja(p, pOrlandoCanosa)
  )
  // Correa vs Juárez/Griffits
  const pCorreaJuarez = partidos.find(p =>
    hasPareja(p, pCorrea) && hasPareja(p, pJuarezGriffits)
  )

  const idsToRevert = [pBarisonOrlando?.id, pCorreaJuarez?.id].filter(Boolean) as string[]

  if (!idsToRevert.length) {
    return NextResponse.json({
      error: "No se encontraron los partidos a revertir",
      debug: { pBarisoni, pCorrea, pOrlandoCanosa, pJuarezGriffits, partidos }
    })
  }

  // Borrar de interclub_partidos para que vuelvan al horario original de la DB
  const { error } = await supabase
    .from("interclub_partidos")
    .delete()
    .in("id", idsToRevert)

  if (error) return NextResponse.json({ error: error.message })

  revalidatePath("/torneos/interclubes-abril-2026/interclub")

  return NextResponse.json({
    ok: true,
    revertidos: [
      pBarisonOrlando ? `Barisoni vs Orlando/Canosa (${pBarisonOrlando.id})` : null,
      pCorreaJuarez   ? `Correa vs Juárez/Griffits (${pCorreaJuarez.id})` : null,
    ].filter(Boolean)
  })
}
