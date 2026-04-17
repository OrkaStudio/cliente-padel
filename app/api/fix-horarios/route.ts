import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

const RUSSO_IDS = [
  "1f6e1963-e149-494f-9669-e6e0937d8046",
  "025059e3-c6ab-46b9-886c-745dd4e3e671",
]

// GET: muestra los jugadores de cada partido de Russo
export async function GET() {
  const supabase = createAdminClient()

  const { data: partidos } = await supabase
    .from("partidos")
    .select("id, pareja1_id, pareja2_id")
    .in("id", RUSSO_IDS)

  if (!partidos?.length) return NextResponse.json({ error: "No encontrados" })

  const parejaIds = [...new Set(partidos.flatMap(p => [p.pareja1_id, p.pareja2_id]))]
  const { data: parejas } = await supabase
    .from("parejas").select("id, jugador1_id, jugador2_id").in("id", parejaIds)

  const jugIds = [...new Set((parejas ?? []).flatMap(p => [p.jugador1_id, p.jugador2_id]))]
  const { data: jugs } = await supabase
    .from("jugadores").select("id, apellido").in("id", jugIds)

  const jugMap = new Map((jugs ?? []).map(j => [j.id, j.apellido]))
  const parMap = new Map((parejas ?? []).map(p => [
    p.id,
    `${jugMap.get(p.jugador1_id) ?? "?"} / ${jugMap.get(p.jugador2_id) ?? "?"}`
  ]))

  return NextResponse.json(partidos.map(p => ({
    id: p.id,
    pareja1: parMap.get(p.pareja1_id),
    pareja2: parMap.get(p.pareja2_id),
  })))
}

// POST: revierte el partido de Russo que NO es vs Crucce/Arballo
export async function POST() {
  const supabase = createAdminClient()
  const { data: partidos } = await supabase
    .from("partidos").select("id, pareja1_id, pareja2_id").in("id", RUSSO_IDS)

  const parejaIds = [...new Set((partidos ?? []).flatMap(p => [p.pareja1_id, p.pareja2_id]))]
  const { data: parejas } = await supabase
    .from("parejas").select("id, jugador1_id, jugador2_id").in("id", parejaIds)

  const jugIds = [...new Set((parejas ?? []).flatMap(p => [p.jugador1_id, p.jugador2_id]))]
  const { data: jugs } = await supabase
    .from("jugadores").select("id, apellido").in("id", jugIds)

  const jugMap = new Map((jugs ?? []).map(j => [j.id, j.apellido?.toLowerCase() ?? ""]))
  const parMap = new Map((parejas ?? []).map(p => [
    p.id,
    `${jugMap.get(p.jugador1_id) ?? ""} ${jugMap.get(p.jugador2_id) ?? ""}`
  ]))

  // El que NO tiene "crucce" ni "arballo" es el que hay que revertir
  const toRevert = (partidos ?? []).find(p => {
    const names = `${parMap.get(p.pareja1_id) ?? ""} ${parMap.get(p.pareja2_id) ?? ""}`
    return !names.includes("crucce") && !names.includes("arballo")
  })

  if (!toRevert) return NextResponse.json({ error: "No se identificó el partido a revertir", parMap: Object.fromEntries(parMap) })

  const { error } = await supabase.from("interclub_partidos").delete().eq("id", toRevert.id)
  if (error) return NextResponse.json({ error: error.message })

  revalidatePath("/torneos/interclubes-abril-2026/interclub")
  return NextResponse.json({ ok: true, revertido: toRevert.id })
}
