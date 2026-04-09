"use client"

import { useState, useEffect } from "react"

interface LiveMatchBannerProps {
  partido: {
    id: string
    horario: string
    cancha: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sedes: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pareja1: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pareja2: any
  }
  torneoId: string
}

function formatPareja(pareja: { jugador1: { nombre: string; apellido: string } | null; jugador2: { nombre: string; apellido: string } | null } | null) {
  if (!pareja) return "—"
  const j1 = pareja.jugador1 ? `${pareja.jugador1.nombre} ${pareja.jugador1.apellido}` : ""
  const j2 = pareja.jugador2 ? `${pareja.jugador2.nombre} ${pareja.jugador2.apellido}` : ""
  return j2 ? `${j1} / ${j2}` : j1
}

export function LiveMatchBanner({ partido }: LiveMatchBannerProps) {
  const [pulse, setPulse] = useState(true)

  // Emil: animación decorativa — no afecta funcionalidad
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1000)
    return () => clearInterval(t)
  }, [])

  const hora = new Date(partido.horario).toLocaleTimeString("es-AR", {
    hour: "2-digit", minute: "2-digit",
  })
  const sede = partido.sedes?.nombre ?? ""
  const nombreA = formatPareja(partido.pareja1)
  const nombreB = formatPareja(partido.pareja2)

  return (
    <div style={{
      margin: "16px 18px",
      borderRadius: 4,
      background: "#bcff00",
      padding: 16,
      boxShadow: "0 10px 30px rgba(188,255,0,0.35)",
      position: "relative",
      overflow: "hidden",
      // Emil: animate opacity solo, no transform en elementos que se ven siempre
    }}>
      {/* Texto decorativo */}
      <div style={{
        position: "absolute", right: -5, bottom: -10,
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 60, color: "rgba(0,0,0,0.1)",
        lineHeight: 1, pointerEvents: "none",
        userSelect: "none", transform: "rotate(-5deg)", fontWeight: 400,
      }}>
        VIVO
      </div>

      {/* Indicador */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, position: "relative", zIndex: 1 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%", background: "#000",
          // Emil: solo opacity, GPU-friendly
          opacity: pulse ? 1 : 0.3,
          transition: "opacity 500ms ease",
        }} />
        <span style={{
          fontSize: 10, fontWeight: 900, letterSpacing: "0.2em",
          color: "#000", textTransform: "uppercase",
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}>
          EN CANCHA AHORA
        </span>
      </div>

      {/* Equipos */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", gap: 12, position: "relative", zIndex: 1,
      }}>
        <p style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 18, color: "#000", textTransform: "uppercase",
          letterSpacing: "0.02em", margin: 0, fontWeight: 400,
        }}>
          {nombreA}
        </p>
        <span style={{ fontSize: 12, fontWeight: 900, color: "rgba(0,0,0,0.4)", fontStyle: "italic" }}>VS</span>
        <p style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 18, color: "#000", textTransform: "uppercase",
          letterSpacing: "0.02em", textAlign: "right", margin: 0, fontWeight: 400,
        }}>
          {nombreB}
        </p>
      </div>

      {/* Info */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginTop: 12, borderTop: "1px solid rgba(0,0,0,0.1)",
        paddingTop: 12, position: "relative", zIndex: 1,
      }}>
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: "#000", lineHeight: 1 }}>location_on</span>
        <span style={{
          fontSize: 11, color: "#000", fontWeight: 700,
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}>
          Cancha {partido.cancha} · {sede} · {hora}
        </span>
      </div>
    </div>
  )
}
