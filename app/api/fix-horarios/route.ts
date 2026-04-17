import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Los 4 partidos mal movidos y sus IDs de pareja
// Barisoni = e386f3f9, Correa = 8558bea4
// Oponente A = caae177a, Oponente B = 03a6bfcd
//
// Partido 19a1766b: Barisoni vs caae177a
// Partido 1c7d8cd2: 03a6bfcd  vs Barisoni
// Partido f9c64d07: caae177a  vs Correa
// Partido 2ec9d04c: Correa    vs 03a6bfcd
//
// Queremos mover:
//   Barisoni vs Juárez/Griffits → Dom 14:00
//   Correa   vs Orlando/Canosa  → Dom 19:00
// Y revertir los otros dos.

export async function GET() {
  const supabase = createAdminClient()

  // Ver quiénes son caae177a y 03a6bfcd
  const { data: parejas } = await supabase
    .from("parejas")
    .select("id, jugador1_id, jugador2_id")
    .in("id", ["caae177a-7cda-4fdb-ab1b-45f1bb7cfe9d", "03a6bfcd-7217-4f16-b76c-5fbe551307d1"])

  if (!parejas?.length) return NextResponse.json({ error: "Parejas no encontradas" })

  const jugIds = parejas.flatMap(p => [p.jugador1_id, p.jugador2_id]).filter(Boolean)
  const { data: jugs } = await supabase
    .from("jugadores").select("id, nombre, apellido").in("id", jugIds)

  const jugMap = new Map((jugs ?? []).map(j => [j.id, `${j.nombre[0]}.${j.apellido}`]))

  const info = parejas.map(p => ({
    pareja_id: p.id,
    jugadores: `${jugMap.get(p.jugador1_id) ?? "?"} / ${jugMap.get(p.jugador2_id) ?? "?"}`,
  }))

  return NextResponse.json({ info })
}

export async function POST() {
  // Llamar una vez identificado cuáles revertir
  const supabase = createAdminClient()

  // Según lo que devuelva GET, completar acá cuáles son los IDs a revertir
  // (los que NO deberían haberse movido)
  const idsToRevert: string[] = [
    "1c7d8cd2-4bf3-4199-9788-27a5ab97662b", // Orlando/Canosa vs Barisoni
    "f9c64d07-02dd-4781-ae62-5de23d105352", // Juárez/Griffits vs Correa
  ]

  if (!idsToRevert.length) return NextResponse.json({ error: "Sin IDs para revertir" })

  const { error } = await supabase.from("interclub_partidos").delete().in("id", idsToRevert)
  if (error) return NextResponse.json({ error: error.message })
  revalidatePath("/torneos/interclubes-abril-2026/interclub")
  return NextResponse.json({ ok: true, revertidos: idsToRevert })
}
