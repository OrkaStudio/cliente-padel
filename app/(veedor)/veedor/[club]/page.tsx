export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { VeedorInterclubView } from "@/components/torneos/interclub/VeedorInterclubView"

const CLUB_INFO: Record<string, { nombre: string }> = {
  "voleando":  { nombre: "Voleando"  },
  "mas-padel": { nombre: "Más Pádel" },
}

export default async function VeedorPage({ params }: { params: Promise<{ club: string }> }) {
  const { club } = await params
  const info = CLUB_INFO[club]
  if (!info) redirect("/torneos")

  const cookieStore = await cookies()
  const pinOk = cookieStore.get(`veedor_pin_${club}`)?.value === "ok"
  if (!pinOk) redirect(`/veedor/${club}/login`)

  const supabase = await createClient()
  const { data: liveData } = await supabase
    .from("interclub_partidos")
    .select("id, resultado, ganador, estado")

  return <VeedorInterclubView club={club} clubNombre={info.nombre} initialLiveData={liveData ?? []} />
}
