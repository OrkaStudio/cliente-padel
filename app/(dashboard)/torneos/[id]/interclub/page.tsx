import { HeroMarcador } from "@/components/torneos/interclub/HeroMarcador"
import { CategoriasInterclub } from "@/components/torneos/interclub/CategoriasInterclub"
import { PartidosEnVivoCarousel } from "@/components/torneos/interclub/PartidosEnVivoCarousel"
import { MOCK_CATEGORIAS, CLUB_A, CLUB_B } from "@/components/torneos/interclub/interclub-mock"

export default async function InterclubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const ptsA = MOCK_CATEGORIAS.reduce((s, c) => s + c.ptsA, 0)
  const ptsB = MOCK_CATEGORIAS.reduce((s, c) => s + c.ptsB, 0)
  const todosPartidos = MOCK_CATEGORIAS.flatMap(c => c.partidos)
  const partidosEnVivo = todosPartidos.filter(p => p.estado === "en_vivo").length
  const partidosFinalizados = todosPartidos.filter(p => p.estado === "finalizado").length
  const partidosPendientes = todosPartidos.filter(p => p.estado === "pendiente").length

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 40 }}>
      {/* Hero */}
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

      {/* Carrusel en vivo */}
      <PartidosEnVivoCarousel
        categorias={MOCK_CATEGORIAS}
        clubA={CLUB_A}
        clubB={CLUB_B}
      />

      {/* Categorías */}
      <CategoriasInterclub
        categorias={MOCK_CATEGORIAS}
        clubA={CLUB_A}
        clubB={CLUB_B}
        torneoId={id}
      />
    </div>
  )
}
