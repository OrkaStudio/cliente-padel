// Server component — sin "use client"
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
    <div
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "20px 18px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Badge interclub + nombre del torneo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 22,
          position: "relative",
          zIndex: 2,
        }}
      >
        <span
          style={{
            background: "#0f172a",
            color: "#bcff00",
            padding: "3px 10px",
            borderRadius: 2,
            fontSize: 9,
            fontWeight: 900,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          Interclub
        </span>
        <span
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10,
            fontWeight: 900,
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {torneoNombre} · {torneoFecha}
        </span>
      </div>

      {/* Marcador central */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 8,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Club A */}
        <div style={{ position: "relative" }}>
          {/* Escudo Club A */}
          {clubA.logoUrl && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                userSelect: "none",
                overflow: "hidden",
              }}
            >
              <Image
                src={clubA.logoUrl}
                alt=""
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "left center",
                  opacity: 0.09,
                  transform: "rotate(-4deg) scale(1.1) translateX(-10%)",
                }}
              />
            </div>
          )}

          {/* Score */}
          <div style={{ paddingTop: 8, paddingBottom: 8 }}>
            <div
              style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 88,
                fontWeight: 400,
                color: "#0f172a",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {ptsA}
            </div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11,
                fontWeight: 900,
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: 6,
              }}
            >
              {clubA.nombre}
            </div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 8,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              puntos
            </div>
          </div>
        </div>

        {/* VS central */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: "0 4px",
          }}
        >
          <div
            style={{
              width: 1,
              height: 28,
              background: "#e2e8f0",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10,
              fontWeight: 900,
              color: "#cbd5e1",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            VS
          </span>
          <div
            style={{
              width: 1,
              height: 28,
              background: "#e2e8f0",
            }}
          />
        </div>

        {/* Club B */}
        <div style={{ position: "relative", textAlign: "right" }}>
          {/* Escudo Club B */}
          {clubB.logoUrl && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                userSelect: "none",
                overflow: "hidden",
              }}
            >
              <Image
                src={clubB.logoUrl}
                alt=""
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "right center",
                  opacity: 0.09,
                  transform: "rotate(4deg) scale(1.1) translateX(10%)",
                }}
              />
            </div>
          )}

          {/* Score */}
          <div style={{ paddingTop: 8, paddingBottom: 8 }}>
            <div
              style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 88,
                fontWeight: 400,
                color: "#b45309",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {ptsB}
            </div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11,
                fontWeight: 900,
                color: "#b45309",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: 6,
              }}
            >
              {clubB.nombre}
            </div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 8,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              puntos
            </div>
          </div>
        </div>
      </div>

      {/* Barra tug-of-war */}
      <div style={{ marginTop: 20, position: "relative", zIndex: 2 }}>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "#f1f5f9",
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${pctA}%`,
              background: "#0f172a",
              borderRadius: "3px 0 0 3px",
              transition: "width 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
          <div
            style={{
              flex: 1,
              background: "#b45309",
              borderRadius: "0 3px 3px 0",
            }}
          />
        </div>

        {/* Etiqueta bajo la barra */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          {lider ? (
            <span
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10,
                fontWeight: 900,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {lider} lidera por{" "}
              <span style={{ color: "#0f172a" }}>
                {ventaja} {ventaja === 1 ? "pt" : "pts"}
              </span>
            </span>
          ) : total > 0 ? (
            <span
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10,
                fontWeight: 900,
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Empate
            </span>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10,
                fontWeight: 900,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Sin partidos jugados aún
            </span>
          )}
        </div>
      </div>

      {/* Stats fila inferior */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid #f1f5f9",
          position: "relative",
          zIndex: 2,
        }}
      >
        {[
          { label: "Categorías", value: totalCategorias },
          { label: "En juego", value: categoriasEnJuego },
          { label: "Finalizadas", value: categoriasFinalizadas },
          { label: "Pendientes", value: pendientes },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 22,
                fontWeight: 400,
                color: "#0f172a",
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 8,
                fontWeight: 900,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginTop: 3,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
