export const dynamic = "force-dynamic"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OrganizadorInterclubView } from "@/components/torneos/interclub/OrganizadorInterclubView"

export default async function OrganizadorPage() {
  const cookieStore = await cookies()
  const pinOk = cookieStore.get("veedor_pin_organizador")?.value === "ok"
  if (!pinOk) redirect("/veedor/organizador/login")

  const supabase = await createClient()
  const { data: liveData } = await supabase
    .from("interclub_partidos")
    .select("id, resultado, ganador, estado, hora, cancha, fecha, sede")

  return <OrganizadorInterclubView initialLiveData={liveData ?? []} />
}
