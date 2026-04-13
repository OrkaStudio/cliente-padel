import Image from "next/image"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { ProgressiveBlur } from "@/components/ui/progressive-blur"
import { BorderRotate } from "@/components/ui/border-rotate"

type Club = { nombre: string; color: string; abbr: string; logoUrl?: string }

type Props = {
  torneoNombre: string
  torneoFecha: string
  clubA: Club
  clubB: Club
  ptsA: number
  ptsB: number
  totalCategorias: number
  categoriasEnJuego: number
  categoriasFinalizadas: number
}

type StatItem = { label: string; value: number; live?: boolean }

export function HeroMarcador({
  torneoNombre,
  torneoFecha,
  clubA,
  clubB,
  ptsA,
  ptsB,
  totalCategorias,
  categoriasEnJuego,
  categoriasFinalizadas,
}: Props) {
  const total = ptsA + ptsB
  const pctA = total > 0 ? (ptsA / total) * 100 : 50
  const liderA = ptsA > ptsB
  const liderB = ptsB > ptsA
  const pendientes = totalCategorias - categoriasEnJuego - categoriasFinalizadas
  const puckColor = liderA ? clubA.color : liderB ? clubB.color : "#94a3b8"

  const stats: StatItem[] = [
    { label: "Categorías", value: totalCategorias },
    { label: "En juego", value: categoriasEnJuego, live: categoriasEnJuego > 0 },
    { label: "Finalizadas", value: categoriasFinalizadas },
    { label: "Pendientes", value: pendientes },
  ]

  // Colores del borde animado por club
  const colorsA = { primary: '#0f172a', secondary: '#334155', accent: '#BCFF00' }
  const colorsB = { primary: '#78350f', secondary: '#b45309', accent: '#fbbf24' }

  return (
    <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>

      {/* Badge + fecha + título centrado */}
      <div style={{ padding: "20px 18px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{
            background: "#BCFF00", color: "#000",
            padding: "3px 10px", borderRadius: 2,
            fontSize: 9, fontWeight: 900,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            textTransform: "uppercase", letterSpacing: "0.12em",
          }}>Interclub</span>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 700, color: "#64748b",
          }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 12, lineHeight: 1 }}>calendar_today</span>
            {torneoFecha}
          </span>
        </div>

        <h1 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 28, fontWeight: 400, lineHeight: 1,
          color: "#0f172a", textTransform: "uppercase",
          letterSpacing: "0.01em", margin: "0 0 20px",
          textAlign: "center",
        }}>{torneoNombre}</h1>
      </div>

      {/* Dos cards con borde animado */}
      <div style={{ padding: "0 14px 20px", display: "flex", gap: 10, alignItems: "stretch" }}>

        {/* Card Club A */}
        <BorderRotate
          animationMode="auto-rotate"
          animationSpeed={liderA ? 3 : 6}
          gradientColors={colorsA}
          backgroundColor="#ffffff"
          borderWidth={2}
          borderRadius={14}
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            minHeight: 190,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "12px 12px 20px",
          }}
        >
          {/* Logo como fondo */}
          {clubA.logoUrl && (
            <div aria-hidden style={{
              position: "absolute", inset: 0,
              pointerEvents: "none",
            }}>
              <Image
                src={clubA.logoUrl} alt=""
                fill
                style={{ objectFit: "contain", padding: 20, opacity: liderA ? 0.28 : 0.14 }}
              />
            </div>
          )}
          {/* Número abajo — no tapa el logo */}
          <span style={{
            position: "relative", zIndex: 1,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 76, fontWeight: 900, lineHeight: 1,
            color: liderA ? clubA.color : "#d1d5db",
            letterSpacing: "-0.05em",
          }}>{ptsA}</span>
        </BorderRotate>

        {/* VS central */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, width: 32,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#0f172a",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 7, fontWeight: 900, color: "#ffffff",
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>VS</span>
          </div>
        </div>

        {/* Card Club B */}
        <BorderRotate
          animationMode="auto-rotate"
          animationSpeed={liderB ? 3 : 6}
          gradientColors={colorsB}
          backgroundColor="#ffffff"
          borderWidth={2}
          borderRadius={14}
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            minHeight: 190,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "12px 12px 20px",
          }}
        >
          {clubB.logoUrl && (
            <div aria-hidden style={{
              position: "absolute", inset: 0,
              pointerEvents: "none",
            }}>
              <Image
                src={clubB.logoUrl} alt=""
                fill
                style={{ objectFit: "contain", padding: 20, opacity: liderB ? 0.28 : 0.14 }}
              />
            </div>
          )}
          <span style={{
            position: "relative", zIndex: 1,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 76, fontWeight: 900, lineHeight: 1,
            color: liderB ? clubB.color : "#d1d5db",
            letterSpacing: "-0.05em",
          }}>{ptsB}</span>
        </BorderRotate>
      </div>

      {/* Barra gamificada */}
      <div style={{ padding: "0 14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900,
            color: "#fff", background: clubA.color,
            padding: "2px 7px", borderRadius: 3,
            textTransform: "uppercase", letterSpacing: "0.08em",
            flexShrink: 0,
          }}>{clubA.abbr}</span>

          <div style={{ flex: 1, position: "relative", height: 8, borderRadius: 4 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 4, background: "#f1f5f9" }} />
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${pctA}%`,
              background: clubA.color,
              borderRadius: "4px 0 0 4px",
              transition: "width 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
            }} />
            <div style={{
              position: "absolute", right: 0, top: 0, height: "100%",
              width: `${100 - pctA}%`,
              background: clubB.color, opacity: 0.7,
              borderRadius: "0 4px 4px 0",
              transition: "width 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
            }} />
            {/* Puck */}
            <div style={{
              position: "absolute",
              top: "50%", left: `${pctA}%`,
              transform: "translate(-50%, -50%)",
              width: 22, height: 22, borderRadius: "50%",
              background: "#ffffff",
              border: "2px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              zIndex: 2,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "left 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: puckColor,
                transition: "background 400ms ease",
              }} />
            </div>
          </div>

          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900,
            color: "#fff", background: clubB.color,
            padding: "2px 7px", borderRadius: 3,
            textTransform: "uppercase", letterSpacing: "0.08em",
            flexShrink: 0,
          }}>{clubB.abbr}</span>
        </div>
      </div>

      {/* Stats strip — carrusel infinito */}
      <div style={{ position: "relative", borderTop: "1px solid #f1f5f9", overflow: "hidden" }}>
        <InfiniteSlider gap={0} duration={18} className="py-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "0 28px",
                borderRight: "1px solid #f1f5f9",
                flexShrink: 0,
              }}
            >
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 20, fontWeight: 900, lineHeight: 1,
                color: stat.live ? "#000" : "#0f172a",
                background: stat.live ? "#BCFF00" : "transparent",
                borderRadius: stat.live ? 4 : 0,
                padding: stat.live ? "1px 6px" : 0,
                display: "inline-block",
                letterSpacing: "-0.03em",
              }}>{stat.value}</span>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 9, fontWeight: 700, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: "0.12em",
              }}>{stat.label}</span>
            </div>
          ))}
        </InfiniteSlider>
        <ProgressiveBlur blurIntensity={0.6} className="pointer-events-none absolute top-0 left-0 h-full w-16" direction="left" />
        <ProgressiveBlur blurIntensity={0.6} className="pointer-events-none absolute top-0 right-0 h-full w-16" direction="right" />
      </div>
    </div>
  )
}
