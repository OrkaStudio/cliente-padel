import Image from "next/image"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"

type Club = { nombre: string; color: string; abbr: string; logoUrl?: string }

type Props = {
  torneoNombre?: string
  torneoFecha?: string
  clubA: Club
  clubB: Club
  ptsA: number
  ptsB: number
  partidosEnVivo?: number
  partidosFinalizados?: number
  partidosPendientes?: number
  compact?: boolean
}

export function HeroMarcador({
  torneoNombre,
  torneoFecha,
  clubA,
  clubB,
  ptsA,
  ptsB,
  partidosEnVivo = 0,
  partidosFinalizados = 0,
  partidosPendientes = 0,
  compact = false,
}: Props) {
  const stats = [
    { label: "En cancha", value: partidosEnVivo, live: partidosEnVivo > 0 },
    { label: "Finalizados", value: partidosFinalizados },
    { label: "Pendientes", value: partidosPendientes },
  ]

  return (
    <div style={{
      background: "radial-gradient(ellipse at 0% 100%, rgba(188,255,0,0.12) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(180,83,9,0.09) 0%, transparent 55%), #f8fafc",
      borderBottom: "1px solid #e2e8f0",
    }}>

      {/* Torneo info strip */}
      {!compact && (
        <div style={{
          padding: "16px 18px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ width: 8 }} />

          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 700, color: "#94a3b8",
          }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 11, lineHeight: 1 }}>
              calendar_today
            </span>
            {torneoFecha}
          </div>
        </div>
      )}

      {/* Torneo nombre */}
      {!compact && (
        <div style={{ padding: "10px 18px 20px", textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 22, fontWeight: 400, lineHeight: 1,
            color: "#0f172a", textTransform: "uppercase",
            letterSpacing: "0.03em", margin: 0,
          }}>{torneoNombre}</h1>
        </div>
      )}

      {/* Marcador split */}
      <div style={{ position: "relative", display: "flex", alignItems: "stretch" }}>

        {/* Club A */}
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
          alignItems: "flex-start", justifyContent: "flex-end",
          padding: "20px 20px 22px", minHeight: 160,
        }}>
          {/* Fondo dinámico A */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at 30% 60%, rgba(188,255,0,0.08) 0%, transparent 70%)",
          }} />
          {clubA.logoUrl && (
            <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.9, mixBlendMode: "multiply" }}>
              <Image src={clubA.logoUrl} alt="" fill
                style={{ objectFit: "contain", padding: "8px 10px 36px 10px" }}
              />
            </div>
          )}
          <span style={{
            position: "relative", zIndex: 1,
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 56, fontWeight: 400, lineHeight: 1,
            color: "#0f172a", letterSpacing: "-0.02em",
          }}>{ptsA}</span>
        </div>

        {/* Línea divisoria vertical */}
        <div style={{ width: 1, background: "#e2e8f0", flexShrink: 0 }} />

        {/* Club B */}
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column",
          alignItems: "flex-end", justifyContent: "flex-end",
          padding: "20px 20px 22px", minHeight: 160,
        }}>
          {/* Fondo dinámico B */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at 70% 60%, rgba(180,83,9,0.07) 0%, transparent 70%)",
          }} />
          {clubB.logoUrl && (
            <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.9, mixBlendMode: "multiply" }}>
              <Image src={clubB.logoUrl} alt="" fill
                style={{ objectFit: "contain", padding: "8px 8px 36px 8px" }}
              />
            </div>
          )}
          <span style={{
            position: "relative", zIndex: 1,
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 56, fontWeight: 400, lineHeight: 1,
            color: "#0f172a", letterSpacing: "-0.02em",
          }}>{ptsB}</span>
        </div>

      </div>

      {/* Stats strip — carrusel infinito */}
      {!compact && (
        <div style={{ position: "relative", overflow: "hidden" }}>
          <InfiniteSlider gap={0} duration={18} className="py-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "0 28px",
                  borderRight: "1px solid rgba(255,255,255,0.08)",
                  flexShrink: 0,
                }}
              >
                {/* Número */}
                <span style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 20, fontWeight: 400, lineHeight: 1,
                  color: stat.live ? "#bcff00" : "#0f172a",
                  letterSpacing: "-0.01em",
                  flexShrink: 0,
                }}>{stat.value}</span>
                {/* Texto — dos líneas centradas */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 8, fontWeight: 700, color: "#94a3b8",
                    textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1,
                  }}>Partidos</span>
                  <span style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 8, fontWeight: 900, color: "#cbd5e1",
                    textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1,
                  }}>{stat.label}</span>
                </div>
              </div>
            ))}
          </InfiniteSlider>
          <ProgressiveBlur blurIntensity={0.6} className="pointer-events-none absolute top-0 left-0 h-full w-16" direction="left" />
          <ProgressiveBlur blurIntensity={0.6} className="pointer-events-none absolute top-0 right-0 h-full w-16" direction="right" />
        </div>
      )}

    </div>
  )
}
