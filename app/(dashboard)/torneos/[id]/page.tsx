import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/padel/StatusBadge"
import { CategoriasBento } from "@/components/torneos/CategoriasBento"
import { StatsMarquee } from "@/components/torneos/StatsMarquee"
import { LiveMatchBanner } from "@/components/torneos/LiveMatchBanner"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

export default async function TorneoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Torneo + sedes
  const { data: torneo } = await supabase
    .from("torneos")
    .select("id, nombre, fecha_inicio, fecha_fin, estado, costo_inscripcion")
    .eq("id", id)
    .single()

  if (!torneo) notFound()

  const { data: sedes } = await supabase
    .from("sedes")
    .select("id, nombre")
    .eq("torneo_id", id)

  // Categorías activas con conteo de parejas
  const { data: torneoCategorias } = await supabase
    .from("torneo_categorias")
    .select(`
      id,
      categoria_id,
      categorias ( id, nombre, tipo, orden )
    `)
    .eq("torneo_id", id)
    .order("categorias(orden)")

  // Conteo total de parejas
  const { count: totalParejas } = await supabase
    .from("parejas")
    .select("*", { count: "exact", head: true })
    .eq("torneo_id", id)

  // Contar parejas por categoría
  const { data: parejasPorCat } = await supabase
    .from("parejas")
    .select("categoria_id")
    .eq("torneo_id", id)

  const parejasCountMap: Record<string, number> = {}
  parejasPorCat?.forEach(p => {
    parejasCountMap[p.categoria_id] = (parejasCountMap[p.categoria_id] ?? 0) + 1
  })

  // Partido en vivo (si existe)
  const { data: partidoEnVivo } = await supabase
    .from("partidos")
    .select(`
      id, horario, cancha,
      sedes ( nombre ),
      pareja1:parejas!pareja1_id (
        jugador1:jugadores!jugador1_id ( nombre, apellido ),
        jugador2:jugadores!jugador2_id ( nombre, apellido )
      ),
      pareja2:parejas!pareja2_id (
        jugador1:jugadores!jugador1_id ( nombre, apellido ),
        jugador2:jugadores!jugador2_id ( nombre, apellido )
      )
    `)
    .eq("torneo_id", id)
    .eq("estado", "en_vivo")
    .limit(1)
    .maybeSingle()

  const categorias = (torneoCategorias ?? []).map(tc => ({
    id: tc.categoria_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nombre: (tc.categorias as any)?.nombre ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tipo: (tc.categorias as any)?.tipo ?? "",
    parejas: parejasCountMap[tc.categoria_id] ?? 0,
  }))

  const sedeNombres = (sedes ?? []).map(s => s.nombre).join(" · ")

  return (
    <div style={{ paddingBottom: 100 }}>

      {/* Back */}
      <div style={{ padding: "10px 18px 0" }}>
        <Link
          href={"/torneos" as AnyHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#64748b", textDecoration: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 800, textTransform: "uppercase",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>arrow_back</span>
          Volver a torneos
        </Link>
      </div>

      {/* Hero */}
      <div style={{ padding: "32px 18px 40px", position: "relative", overflow: "hidden" }}>
        {/* Texto decorativo de fondo */}
        <div style={{
          position: "absolute", top: 20, right: -30,
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 160, color: "rgba(0,0,0,0.04)", lineHeight: 1,
          userSelect: "none", pointerEvents: "none",
          transform: "rotate(-10deg)", fontWeight: 400,
        }}>
          2026
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <StatusBadge status={torneo.estado} />
          </div>

          <h1 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 52,
            lineHeight: 0.88,
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            fontWeight: 400,
            margin: 0,
          }}>
            {torneo.nombre.split(" ").map((word: string, i: number) => (
              <span key={i} style={{ display: "block" }}>{word}</span>
            ))}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#bcff00", lineHeight: 1 }}>calendar_month</span>
            <span style={{
              fontSize: 13, fontWeight: 700,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              color: "#64748b", letterSpacing: "0.04em",
            }}>
              {torneo.fecha_inicio} → {torneo.fecha_fin}
              {sedeNombres ? ` · ${sedeNombres}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Marquee */}
      <StatsMarquee
        parejas={totalParejas ?? 0}
        categorias={categorias.length}
        costo={torneo.costo_inscripcion}
      />

      {/* Partido en vivo */}
      {partidoEnVivo && <LiveMatchBanner partido={partidoEnVivo} torneoId={id} />}

      {/* Bento de categorías */}
      <div style={{ padding: "32px 18px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <h2 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 24, textTransform: "uppercase",
            letterSpacing: "0.05em", fontWeight: 400, margin: 0,
          }}>
            Categorías
          </h2>
          <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        </div>

        {categorias.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 36, display: "block" }}>category</span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, marginTop: 8 }}>
              Sin categorías activas
            </p>
          </div>
        ) : (
          <CategoriasBento categorias={categorias} torneoId={id} />
        )}
      </div>

    </div>
  )
}
