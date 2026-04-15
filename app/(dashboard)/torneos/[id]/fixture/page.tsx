import { FixtureInterclubView } from "@/components/torneos/interclub/FixtureInterclubView"
import { MOCK_CATEGORIAS, CLUB_A, CLUB_B } from "@/components/torneos/interclub/interclub-mock"

export default async function FixturePage() {
  return (
    <FixtureInterclubView
      categorias={MOCK_CATEGORIAS}
      clubA={CLUB_A}
      clubB={CLUB_B}
    />
  )
}
