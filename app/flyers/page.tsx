"use client"

import { useState } from "react"
import FlyerTorneo from "@/components/flyers/FlyerTorneo"
import FlyerInscripciones from "@/components/flyers/FlyerInscripciones"
import FlyerApp from "@/components/flyers/FlyerApp"

const FLYERS = [
  { id: "torneo",        label: "Torneo Principal" },
  { id: "inscripciones", label: "Inscripciones" },
  { id: "app",           label: "Promo App" },
]

export default function FlyersPage() {
  const [active, setActive] = useState("torneo")

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0a0f1a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingBottom: 48,
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          padding: "20px 24px 0",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 28,
            color: "#fff",
            textTransform: "uppercase",
            fontWeight: 400,
            margin: 0,
            lineHeight: 1,
          }}
        >
          Flyers del Torneo
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "#64748b",
            fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Listo para compartir en redes sociales
        </p>
      </div>

      {/* Tab selector */}
      <div
        style={{
          display: "flex",
          gap: 8,
          margin: "20px 24px 0",
          alignSelf: "stretch",
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {FLYERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
              background: active === f.id ? "#bcff00" : "rgba(255,255,255,0.07)",
              color: active === f.id ? "#0f172a" : "#94a3b8",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Flyer preview */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 16px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {active === "torneo"        && <FlyerTorneo />}
        {active === "inscripciones" && <FlyerInscripciones />}
        {active === "app"           && <FlyerApp />}
      </div>

      {/* Footer hint */}
      <p
        style={{
          marginTop: 20,
          fontSize: 11,
          color: "#475569",
          fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          textAlign: "center",
        }}
      >
        Formato 9:16 — Instagram Stories / WhatsApp
      </p>
    </div>
  )
}
