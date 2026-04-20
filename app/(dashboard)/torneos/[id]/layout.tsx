import { createClient } from "@/lib/supabase/server"
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

  const [{ data: torneo }, { count: playoffCount }] = await Promise.all([
    supabase.from("torneos").select("tipo").eq("id", id).single(),
    supabase.from("partidos")
      .select("id", { count: "exact", head: true })
      .eq("torneo_id", id)
      .eq("tipo", "playoff"),
  ])

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
