"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Categoria {
  id: string
  nombre: string
  tipo: string
  parejas: number
}

// Etiqueta corta por tipo
const TAG: Record<string, string> = {
  caballeros: "MASC",
  damas:      "FEM",
  especial:   "ESP",
}

export function CategoriasBento({ categorias, torneoId }: { categorias: Categoria[]; torneoId: string }) {
  const router = useRouter()
  const [pressed, setPressed] = useState<string | null>(null)

  const handleClick = (catId: string) => {
    // Emil: scale(0.95) entry, ease-out-strong, 160ms
    setPressed(catId)
    setTimeout(() => {
      setPressed(null)
      router.push(`/torneos/${torneoId}/tabla?cat=${catId}` as never)
    }, 160)
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
    }}>
      {categorias.map((cat, i) => {
        const isLarge = i === 0 || i === 3
        const isPressed = pressed === cat.id
        const tag = TAG[cat.tipo] ?? "CAT"

        return (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            onPointerDown={() => setPressed(cat.id)}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            style={{
              gridColumn: isLarge ? "span 2" : "span 1",
              background: isLarge ? "#0f172a" : "#f8fafc",
              border: `1px solid ${isLarge ? "#0f172a" : "#e2e8f0"}`,
              borderRadius: 4,
              padding: isLarge ? "24px" : "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: isLarge ? 140 : 110,
              cursor: "pointer",
              textAlign: "left",
              position: "relative",
              overflow: "hidden",
              // Emil: scale(0.97) on press, 160ms ease-out-strong
              transform: isPressed ? "scale(0.97)" : "scale(1)",
              transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Texto decorativo de fondo */}
            <div style={{
              position: "absolute",
              right: isLarge ? -5 : -2,
              bottom: isLarge ? -15 : -8,
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: isLarge ? 80 : 40,
              color: isLarge ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)",
              lineHeight: 1,
              pointerEvents: "none",
              userSelect: "none",
              transform: "rotate(-5deg)",
              fontWeight: 400,
            }}>
              {tag}
            </div>

            {/* Nombre */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: isLarge ? 26 : 16,
                color: isLarge ? "#fff" : "#0f172a",
                lineHeight: 1, marginTop: 4,
                textTransform: "uppercase", margin: 0,
                fontWeight: 400,
              }}>
                {cat.nombre}
              </p>
            </div>

            {/* Footer */}
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between",
              width: "100%", marginTop: 12,
              position: "relative", zIndex: 1,
            }}>
              <span style={{
                background: isLarge ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)",
                padding: "4px 10px", borderRadius: 2,
                fontSize: 10, fontWeight: 900,
                color: isLarge ? "#fff" : "#0f172a",
                fontFamily: "var(--font-space-grotesk), sans-serif",
              }}>
                {cat.parejas} PAREJAS
              </span>
              <span style={{
                fontFamily: "'Material Symbols Outlined'",
                fontSize: 18,
                color: isLarge ? "#fff" : "#bcff00",
                lineHeight: 1,
              }}>
                arrow_forward
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
