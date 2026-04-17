import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Endpoint temporal — borrar después de usar
export async function GET() {
  const supabase = createAdminClient()

  const ids = [
    "f9c64d07-02dd-4781-ae62-5de23d105352",
    "1c7d8cd2-4bf3-4199-9788-27a5ab97662b",
    "1f6e1963-e149-494f-9669-e6e0937d8046",
    "025059e3-c6ab-46b9-886c-745dd4e3e671",
    "19a1766b-0c9a-499c-899e-233ea5f59e71",
    "2ec9d04c-5e08-4ca0-b575-f3f145c058f5",
  ]

  const { data: partidos } = await supabase
    .from("partidos")
    .select("id, horario, pareja1_id, pareja2_id")
    .in("id", ids)

  // Mostrar horario original de cada uno en AR timezone
  const result = (partidos ?? []).map(p => {
    const d = new Date(p.horario)
    const h = ((d.getUTCHours() - 3) + 24) % 24
    const min = d.getUTCMinutes()
    const fecha = new Date(d.getTime() - 3 * 3600000).toISOString().slice(0, 10)
    return {
      id: p.id,
      hora_original: `${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}`,
      fecha_original: fecha,
    }
  })

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  // Revertir IDs específicos borrándolos de interclub_partidos
  const supabase = createAdminClient()
  const { ids } = await req.json()
  const { error } = await supabase.from("interclub_partidos").delete().in("id", ids)
  if (error) return NextResponse.json({ error: error.message })
  revalidatePath("/torneos/interclubes-abril-2026/interclub")
  return NextResponse.json({ ok: true, revertidos: ids })
}
