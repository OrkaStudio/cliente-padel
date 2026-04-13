import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { StatusBadge } from "@/components/ui/padel/StatusBadge"
import { CategoriasBento } from "@/components/torneos/CategoriasBento"
import { StatsMarquee } from "@/components/torneos/StatsMarquee"
import { LiveMatchBanner } from "@/components/torneos/LiveMatchBanner"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

export const revalidate = 30

export default async function TorneoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Torneo primero (necesario para notFound)
  const { data: torneo } = await supabase
    .from("torneos")
    .select("id, nombre, fecha_inicio, fecha_fin, estado, costo_inscripcion")
    .eq("id", id)
    .single()

  if (!torneo) notFound()

  // Resto en paralelo
  const [
    { data: sedes },
    { data: torneoCategorias },
    { data: parejasPorCat },
    { data: partidoEnVivo },
  ] = await Promise.all([
    supabase.from("sedes").select("id, nombre").eq("torneo_id", id),
    supabase.from("torneo_categorias")
      .select("id, categoria_id, categorias ( id, nombre, tipo, orden )")
      .eq("torneo_id", id)
      .order("categorias(orden)"),
    supabase.from("parejas").select("categoria_id").eq("torneo_id", id),
    supabase.from("partidos").select(`
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
    `).eq("torneo_id", id).eq("estado", "en_vivo").limit(1).maybeSingle(),
  ])

  const parejasCountMap: Record<string, number> = {}
  parejasPorCat?.forEach(p => {
    parejasCountMap[p.categoria_id] = (parejasCountMap[p.categoria_id] ?? 0) + 1
  })

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
      <div style={{ padding: "16px 18px 10px", background: "#0f172a" }}>
        <Link
          href={"/torneos" as AnyHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#94a3b8", textDecoration: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 800, textTransform: "uppercase",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>arrow_back</span>
          Volver a torneos
        </Link>
      </div>

      {/* Hero Premium */}
      <div style={{
        padding: "20px 18px 40px", position: "relative", overflow: "hidden",
        background: "#0f172a", borderRadius: "0 0 32px 32px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.15)"
      }}>
        {/* Mesh glow effects */}
        <div style={{
          position: "absolute", top: -80, right: -60,
          width: 250, height: 250, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(188,255,0,0.15) 0%, rgba(188,255,0,0) 70%)",
          filter: "blur(40px)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(188,255,0,0.08) 0%, rgba(188,255,0,0) 70%)",
          filter: "blur(40px)", pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <StatusBadge status={torneo.estado} />
            {torneo.estado === "en_curso" && (
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 9, fontWeight: 900,
                color: "#15803d", background: "#bbf7d0", padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em"
              }}>Active</span>
            )}
          </div>

          <h1 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 52,
            lineHeight: 0.88,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            fontWeight: 400,
            margin: 0,
            textShadow: "0 4px 24px rgba(0,0,0,0.3)"
          }}>
            {torneo.nombre.split(" ").map((word: string, i: number) => (
              <span key={i} style={{ display: "block" }}>{word}</span>
            ))}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24, flexWrap: "wrap" }}>
            <div style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)",
              padding: "6px 12px", borderRadius: 100, display: "flex", alignItems: "center", gap: 6
            }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#bcff00", lineHeight: 1 }}>calendar_month</span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                fontFamily: "var(--font-space-grotesk), sans-serif",
                color: "#f8fafc", letterSpacing: "0.02em",
              }}>
                {torneo.fecha_inicio} → {torneo.fecha_fin}
              </span>
            </div>
            {sedeNombres && (
              <div style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)",
                padding: "6px 12px", borderRadius: 100, display: "flex", alignItems: "center", gap: 6
              }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 15, color: "#bcff00", lineHeight: 1 }}>location_on</span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  color: "#f8fafc", letterSpacing: "0.02em",
                }}>
                  {sedeNombres}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Marquee */}
      <StatsMarquee
        parejas={parejasPorCat?.length ?? 0}
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
