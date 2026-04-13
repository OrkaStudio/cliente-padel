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
  const total = ptsA + ptsB
  const pctA = total > 0 ? (ptsA / total) * 100 : 50
  const lider = ptsA > ptsB ? clubA.nombre : ptsB > ptsA ? clubB.nombre : null
  const ventaja = Math.abs(ptsA - ptsB)
  const pendientes = totalCategorias - categoriasEnJuego - categoriasFinalizadas

  return (
    <div style={{ background: "#0d0d0d", padding: "24px 18px 28px", position: "relative", overflow: "hidden" }}>

      {/* Logo watermark A */}
      {clubA.logoUrl && (
        <div aria-hidden style={{
          position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)",
          width: 200, height: 200, pointerEvents: "none", userSelect: "none",
        }}>
          <Image src={clubA.logoUrl} alt="" fill
            style={{ objectFit: "contain", objectPosition: "left center", opacity: 0.06 }} />
        </div>
      )}
      {/* Logo watermark B */}
      {clubB.logoUrl && (
        <div aria-hidden style={{
          position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)",
          width: 200, height: 200, pointerEvents: "none", userSelect: "none",
        }}>
          <Image src={clubB.logoUrl} alt="" fill
            style={{ objectFit: "contain", objectPosition: "right center", opacity: 0.06 }} />
        </div>
      )}

      {/* Badge interclub */}
      <div style={{ marginBottom: 16, position: "relative", zIndex: 2 }}>
        <span style={{
          background: "#BCFF00", color: "#000",
          padding: "3px 10px", borderRadius: 2,
          fontSize: 9, fontWeight: 900,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          Interclub
        </span>
      </div>

      {/* Nombre del torneo */}
      <h1 style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 40, fontWeight: 400,
        color: "#ffffff", lineHeight: 1,
        textTransform: "uppercase", letterSpacing: "0.01em",
        margin: "0 0 16px", position: "relative", zIndex: 2,
      }}>
        {torneoNombre}
      </h1>

      {/* Fecha + sedes chip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, position: "relative", zIndex: 2, flexWrap: "wrap" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.08)", borderRadius: 4,
          padding: "5px 10px",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)",
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 13, lineHeight: 1 }}>calendar_today</span>
          {torneoFecha}
        </span>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.08)", borderRadius: 4,
          padding: "5px 10px",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)",
        }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 13, lineHeight: 1 }}>location_on</span>
          {clubA.nombre} · {clubB.nombre}
        </span>
      </div>

      {/* Marcador */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", gap: 12, position: "relative", zIndex: 2, marginBottom: 20,
      }}>
        {/* Club A */}
        <div>
          <div style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 80, fontWeight: 400, lineHeight: 1,
            color: ptsA >= ptsB ? "#BCFF00" : "rgba(255,255,255,0.25)",
            letterSpacing: "-0.03em",
          }}>
            {ptsA}
          </div>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4,
          }}>
            {clubA.nombre}
          </div>
        </div>

        {/* VS */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.2)",
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>VS</span>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Club B */}
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 80, fontWeight: 400, lineHeight: 1,
            color: ptsB > ptsA ? "#BCFF00" : "rgba(255,255,255,0.25)",
            letterSpacing: "-0.03em",
          }}>
            {ptsB}
          </div>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4,
          }}>
            {clubB.nombre}
          </div>
        </div>
      </div>

      {/* Barra tug-of-war */}
      <div style={{ position: "relative", zIndex: 2, marginBottom: 8 }}>
        <div style={{
          height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)",
          overflow: "hidden", display: "flex",
        }}>
          <div style={{
            width: `${pctA}%`, background: "#BCFF00",
            borderRadius: "2px 0 0 2px",
            transition: "width 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
          }} />
          <div style={{ flex: 1, background: "rgba(255,255,255,0.15)", borderRadius: "0 2px 2px 0" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          {lider ? (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 900,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {lider} lidera por{" "}
              <span style={{ color: "#BCFF00" }}>{ventaja} {ventaja === 1 ? "pt" : "pts"}</span>
            </span>
          ) : total > 0 ? (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 900, color: "#BCFF00",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>Empate</span>
          ) : (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>Sin partidos jugados aún</span>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        display: "flex", justifyContent: "space-around",
        marginTop: 20, paddingTop: 16,
        borderTop: "1px solid rgba(255,255,255,0.07)",
        position: "relative", zIndex: 2,
      }}>
        {[
          { label: "Categorías", value: totalCategorias },
          { label: "En juego", value: categoriasEnJuego, highlight: categoriasEnJuego > 0 },
          { label: "Finalizadas", value: categoriasFinalizadas },
          { label: "Pendientes", value: pendientes },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 22, fontWeight: 400, lineHeight: 1,
              color: stat.highlight ? "#BCFF00" : "#ffffff",
            }}>
              {stat.value}
            </div>
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900,
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
