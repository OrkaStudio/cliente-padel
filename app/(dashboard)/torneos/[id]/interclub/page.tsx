export const dynamic = "force-dynamic"

import { HeroMarcador } from "@/components/torneos/interclub/HeroMarcador"
import { CategoriasInterclub } from "@/components/torneos/interclub/CategoriasInterclub"
import { PartidosEnVivoCarousel } from "@/components/torneos/interclub/PartidosEnVivoCarousel"
import { MOCK_CATEGORIAS, CLUB_A, CLUB_B } from "@/components/torneos/interclub/interclub-mock"
import type { CategoriaInterclub } from "@/components/torneos/interclub/CategoriasInterclub"
import { createClient } from "@/lib/supabase/server"
import { InterclubAutoRefresh } from "@/components/torneos/interclub/InterclubAutoRefresh"

async function getCategorias(): Promise<CategoriaInterclub[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("interclub_partidos")
      .select("id, resultado, ganador, estado, hora, cancha, fecha, sede")

    if (!data || data.length === 0) return MOCK_CATEGORIAS

    // Indexar por id para O(1) lookup
    const liveMap = new Map(data.map(r => [r.id, r]))

    return MOCK_CATEGORIAS.map(cat => ({
      ...cat,
      partidos: cat.partidos.map(p => {
        const live = liveMap.get(p.id)
        if (!live) return p
        return {
          ...p,
          resultado:  live.resultado ?? p.resultado,
          ganador:    (live.ganador as "A" | "B" | null) ?? p.ganador,
          estado:     (live.estado as "pendiente" | "en_vivo" | "finalizado") ?? p.estado,
          horaInicio: live.hora   ?? p.horaInicio,
          cancha:     live.cancha ?? p.cancha,
          fecha:      live.fecha  ?? p.fecha,
          sede:       live.sede   ?? p.sede,
        }
      }),
    })).map(cat => {
      // Recalcular ptsA/ptsB y estado de la categoría
      const finalizados = cat.partidos.filter(p => p.estado === "finalizado")
      const ptsA = finalizados.filter(p => p.ganador === "A").length
      const ptsB = finalizados.filter(p => p.ganador === "B").length
      const hayVivo = cat.partidos.some(p => p.estado === "en_vivo")
      const todosFin = cat.partidos.every(p => p.estado === "finalizado")
      const estadoCat = todosFin ? "finalizado" : hayVivo ? "en_vivo" : "pendiente"
      return { ...cat, ptsA, ptsB, estado: estadoCat }
    })
  } catch {
    return MOCK_CATEGORIAS
  }
}

export default async function InterclubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const categorias = await getCategorias()

  const ptsA = categorias.reduce((s, c) => s + c.ptsA, 0)
  const ptsB = categorias.reduce((s, c) => s + c.ptsB, 0)
  const todosPartidos = categorias.flatMap(c => c.partidos)
  const partidosEnVivo      = todosPartidos.filter(p => p.estado === "en_vivo").length
  const partidosFinalizados = todosPartidos.filter(p => p.estado === "finalizado").length
  const partidosPendientes  = todosPartidos.filter(p => p.estado === "pendiente").length

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 40 }}>
      <InterclubAutoRefresh />

      <HeroMarcador
        torneoNombre="Torneo Interclubes Abril"
        torneoFecha="Abr 17–19, 2026"
        clubA={CLUB_A}
        clubB={CLUB_B}
        ptsA={ptsA}
        ptsB={ptsB}
        partidosEnVivo={partidosEnVivo}
        partidosFinalizados={partidosFinalizados}
        partidosPendientes={partidosPendientes}
      />

      <PartidosEnVivoCarousel
        categorias={categorias}
        clubA={CLUB_A}
        clubB={CLUB_B}
      />

      <CategoriasInterclub
        categorias={categorias}
        clubA={CLUB_A}
        clubB={CLUB_B}
        torneoId={id}
      />

    </div>
  )
}
