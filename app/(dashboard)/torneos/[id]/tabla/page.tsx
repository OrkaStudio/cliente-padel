export const revalidate = 15

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { TablaView } from "@/components/torneos/TablaView"
import { PuntosPlaceholder } from "@/components/torneos/PuntosPlaceholder"

export default async function TablaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ vista?: string }>
}) {
  const { id } = await params
  const { vista = "grupos" } = await searchParams
  const supabase = await createClient()

  const { data: torneoCategorias } = await supabase
    .from("torneo_categorias")
    .select(`id, categoria_id, categorias ( id, nombre, tipo, orden )`)
    .eq("torneo_id", id)
    .order("categorias(orden)")

  if (!torneoCategorias) notFound()

  const [{ data: grupos }, { data: partidos }] = await Promise.all([
    supabase.from("grupos").select(`
      id, nombre,
      torneo_categoria_id,
      grupo_parejas (
        posicion,
        parejas (
          id, jugador1_id, jugador2_id,
          jugador1:jugadores!jugador1_id ( nombre, apellido ),
          jugador2:jugadores!jugador2_id ( nombre, apellido )
        )
      )
    `).in("torneo_categoria_id", torneoCategorias.map(tc => tc.id)),
    supabase.from("partidos")
      .select("id, pareja1_id, pareja2_id, resultado, estado, categoria_id")
      .eq("torneo_id", id)
      .eq("tipo", "grupo")
      .eq("estado", "finalizado"),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categorias = (torneoCategorias ?? []).map(tc => ({
    id: tc.categoria_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nombre: (tc.categorias as any)?.nombre ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tipo: (tc.categorias as any)?.tipo ?? "",
    tcId: tc.id,
  }))

  return (
    <div>
      {/* Tab switcher */}
      <TabSwitcher torneoId={id} vista={vista} />

      {vista === "puntos" ? (
        <PuntosPlaceholder />
      ) : (
        <TablaView
          categorias={categorias}
          grupos={grupos ?? []}
          partidos={partidos ?? []}
          initialCatId={null}
        />
      )}
    </div>
  )
}

function TabSwitcher({ torneoId, vista }: { torneoId: string; vista: string }) {
  const tabs = [
    { key: "grupos", label: "Grupos" },
    { key: "puntos", label: "Puntos" },
  ]
  return (
    <div style={{
      display: "flex",
      borderBottom: "1px solid #e2e8f0",
      background: "#fff",
      position: "sticky",
      top: 48,
      zIndex: 30,
    }}>
      {tabs.map(t => (
        <a
          key={t.key}
          href={`/torneos/${torneoId}/tabla?vista=${t.key}`}
          style={{
            flex: 1,
            padding: "14px 0",
            textAlign: "center",
            textDecoration: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13,
            fontWeight: 900,
            textTransform: "uppercase" as const,
            letterSpacing: "0.05em",
            color: vista === t.key ? "#0f172a" : "#94a3b8",
            borderBottom: vista === t.key ? "2px solid #bcff00" : "2px solid transparent",
          }}
        >
          {t.label}
        </a>
      ))}
    </div>
  )
}
