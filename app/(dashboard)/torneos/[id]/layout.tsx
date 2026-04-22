import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { TorneoBottomNav } from "@/components/torneos/TorneoBottomNav"

export default async function TorneoLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>
  children: React.ReactNode
}) {
  const { id } = await params
  const supabase = await createClient()
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("admin_pin")?.value === "ok"

  const [{ data: torneo }, { count: playoffCount }] = await Promise.all([
    supabase.from("torneos").select("tipo, estado, oculto").eq("id", id).single(),
    supabase.from("partidos")
      .select("id", { count: "exact", head: true })
      .eq("torneo_id", id)
      .eq("tipo", "playoff"),
  ])

  const isDev = process.env.NODE_ENV === "development"
  if (!torneo || (!isDev && !isAdmin && (torneo.estado === "borrador" || torneo.oculto))) notFound()

  return (
    <>
      {children}
      <TorneoBottomNav
        torneoId={id}
        tipo={torneo?.tipo ?? "regular"}
        hasPlayoffs={(playoffCount ?? 0) > 0}
      />
    </>
  )
}
