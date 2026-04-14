import Image from "next/image"

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
  const liderA = ptsA >= ptsB
  const liderB = ptsB > ptsA
  const pendientes = totalCategorias - categoriasEnJuego - categoriasFinalizadas
  const isLive = categoriasEnJuego > 0

  return (
    <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>

      {/* Torneo info strip */}
      <div style={{
        padding: "16px 18px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          background: "#0f172a", color: "#fff",
          padding: "3px 10px", borderRadius: 2,
          fontSize: 9, fontWeight: 900,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>Interclub</span>

        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 700, color: "#94a3b8",
        }}>
          {isLive && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              color: "#16a34a", fontWeight: 900,
              fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em",
              marginRight: 4,
            }}>
              <span className="live-dot" style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#16a34a", display: "inline-block",
                boxShadow: "0 0 6px rgba(22,163,74,0.7)",
              }} />
              En vivo
            </span>
          )}
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 11, lineHeight: 1 }}>
            calendar_today
          </span>
          {torneoFecha}
        </div>
      </div>

      {/* Torneo nombre */}
      <div style={{ padding: "10px 18px 20px", textAlign: "center" }}>
        <h1 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 22, fontWeight: 400, lineHeight: 1,
          color: "#0f172a", textTransform: "uppercase",
          letterSpacing: "0.03em", margin: 0,
        }}>{torneoNombre}</h1>
      </div>

      {/* Marcador split */}
      <div style={{ display: "flex", alignItems: "stretch", margin: "0 14px 20px", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,0.07)" }}>

        {/* Club A */}
        <div style={{
          flex: 1,
          position: "relative",
          background: "#f8fafc",
          display: "flex", flexDirection: "column",
          alignItems: "flex-start", justifyContent: "flex-end",
          padding: "20px 20px 22px",
          overflow: "hidden",
          minHeight: 160,
        }}>
          {clubA.logoUrl && (
            <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <Image
                src={clubA.logoUrl} alt=""
                fill
                style={{ objectFit: "contain", padding: 20, opacity: 0.09 }}
              />
            </div>
          )}
          <span style={{
            position: "relative", zIndex: 1,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: liderA ? 62 : 44, fontWeight: 900, lineHeight: 1,
            color: "#0f172a",
            letterSpacing: "-0.04em",
          }}>{ptsA}</span>
        </div>

        {/* VS divider */}
        <div style={{
          width: 48,
          background: "#f8fafc",
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          {/* Línea separadora */}
          <div style={{
            position: "absolute", top: 0, bottom: 0, left: "50%",
            width: 1, background: "#e2e8f0",
            transform: "translateX(-50%)",
          }} />
          {/* Badge VS */}
          <div style={{
            position: "relative", zIndex: 1,
            width: 34, height: 34, borderRadius: "50%",
            background: "#0f172a",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 0 3px #f8fafc, 0 4px 12px rgba(0,0,0,0.18)",
          }}>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 900,
              color: "#BCFF00",
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>vs</span>
          </div>
        </div>

        {/* Club B */}
        <div style={{
          flex: 1,
          position: "relative",
          background: "#f8fafc",
          display: "flex", flexDirection: "column",
          alignItems: "flex-end", justifyContent: "flex-end",
          padding: "20px 20px 22px",
          overflow: "hidden",
          minHeight: 160,
        }}>
          {clubB.logoUrl && (
            <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <Image
                src={clubB.logoUrl} alt=""
                fill
                style={{ objectFit: "contain", padding: 20, opacity: 0.09 }}
              />
            </div>
          )}
          <span style={{
            position: "relative", zIndex: 1,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: liderB ? 62 : 44, fontWeight: 900, lineHeight: 1,
            color: "#0f172a",
            letterSpacing: "-0.04em",
          }}>{ptsB}</span>
        </div>
      </div>

      {/* Stats strip — 3 pills simples */}
      <div style={{
        display: "flex", gap: 0,
        borderTop: "1px solid #f1f5f9",
        padding: "12px 18px 14px",
      }}>
        {[
          { label: "En juego", value: categoriasEnJuego, live: true },
          { label: "Finalizadas", value: categoriasFinalizadas },
          { label: "Pendientes", value: pendientes },
        ].map((stat, i, arr) => (
          <div key={stat.label} style={{
            flex: 1,
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "0 8px",
            borderRight: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
          }}>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 22, fontWeight: 900, lineHeight: 1,
              color: stat.live && stat.value > 0 ? "#000" : "#0f172a",
              background: stat.live && stat.value > 0 ? "#BCFF00" : "transparent",
              borderRadius: stat.live && stat.value > 0 ? 4 : 0,
              padding: stat.live && stat.value > 0 ? "0 6px" : 0,
              letterSpacing: "-0.03em",
              display: "inline-block",
            }}>{stat.value}</span>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 700, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.1em",
              marginTop: 4,
            }}>{stat.label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
