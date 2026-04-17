export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { VeedorInterclubView } from "@/components/torneos/interclub/VeedorInterclubView"
import { getCategorias } from "@/lib/interclub-data"

const CLUB_INFO: Record<string, { nombre: string; maxEnVivo: number }> = {
  "voleando":  { nombre: "Voleando",  maxEnVivo: 2 },
  "mas-padel": { nombre: "Más Pádel", maxEnVivo: 2 },
}

export default async function VeedorPage({ params }: { params: Promise<{ club: string }> }) {
  const { club } = await params
  const info = CLUB_INFO[club]
  if (!info) redirect("/torneos")

  const cookieStore = await cookies()
  const pinOk = cookieStore.get(`veedor_pin_${club}`)?.value === "ok"
  if (!pinOk) redirect(`/veedor/${club}/login`)

  const supabase = await createClient()
  const [categorias, { data: liveData }] = await Promise.all([
    getCategorias("interclubes-abril-2026"),
    supabase.from("interclub_partidos").select("id, resultado, ganador, estado, hora, cancha, fecha, sede"),
  ])

  return (
    <VeedorInterclubView
      club={club}
      clubNombre={info.nombre}
      maxEnVivo={info.maxEnVivo}
      initialCategorias={categorias}
      initialLiveData={liveData ?? []}
    />
  )
}
