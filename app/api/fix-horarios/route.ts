import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

const RUSSO_IDS = [
  "1f6e1963-e149-494f-9669-e6e0937d8046",
  "025059e3-c6ab-46b9-886c-745dd4e3e671",
]

// El que era 15:00 original es Russo vs Crucce/Arballo → KEEP
// El otro (Brahin/Sachetti) → REVERT
export async function GET() {
  const supabase = createAdminClient()

  const { data: partidos } = await supabase
    .from("partidos")
    .select("id, horario")
    .in("id", RUSSO_IDS)

  if (!partidos?.length) return NextResponse.json({ error: "No encontrados" })

  function toAR(iso: string) {
    const d = new Date(iso)
    const h = ((d.getUTCHours() - 3) + 24) % 24
    const m = d.getUTCMinutes()
    const fecha = new Date(d.getTime() - 3 * 3600000).toISOString().slice(0, 10)
    return `${fecha} ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`
  }

  // El que originalmente era 15:00 lo queremos mantener en 22:00
  // El otro lo revertimos (borramos de interclub_partidos)
  const conHorario = partidos.map(p => ({ id: p.id, original: toAR(p.horario) }))

  const toRevert = conHorario.find(p => !p.original.includes("15:00"))
  const toKeep   = conHorario.find(p =>  p.original.includes("15:00"))

  if (!toRevert) return NextResponse.json({ info: conHorario, msg: "Ninguno era 15:00 — revisar manualmente" })

  const { error } = await supabase.from("interclub_partidos").delete().eq("id", toRevert.id)
  if (error) return NextResponse.json({ error: error.message })

  revalidatePath("/torneos/interclubes-abril-2026/interclub")
  return NextResponse.json({ ok: true, revertido: toRevert, mantenido: toKeep })
}
