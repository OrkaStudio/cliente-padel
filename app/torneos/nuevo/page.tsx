import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WizardCrearTorneo } from "@/components/torneos/wizard/WizardCrearTorneo"
import type { Categoria } from "@/types/torneo"

export default async function NuevoTorneoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: categorias } = await supabase
    .from("categorias")
    .select("id, nombre, tipo, orden")
    .order("orden")

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <WizardCrearTorneo categorias={(categorias ?? []) as Categoria[]} />
    </main>
  )
}
