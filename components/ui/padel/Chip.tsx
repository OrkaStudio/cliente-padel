"use client"

import { useState } from "react"

export function Chip({
  children,
  active,
  color = "#0f172a",
  onClick,
  small,
}: {
  children: React.ReactNode
  active: boolean
  color?: string
  onClick?: () => void
  small?: boolean
}) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => { setPressed(false); onClick?.() }}
      style={{
        padding: small ? "4px 10px" : "6px 14px",
        borderRadius: 4,
        fontSize: small ? 10 : 11,
        fontWeight: 900,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        border: "none",
        cursor: "pointer",
        background: active ? color : "#e2e8f0",
        color: active ? "#000" : "#64748b",
        transition: "all 0.12s",
        whiteSpace: "nowrap",
        transform: pressed ? "scale(0.93)" : "scale(1)",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      {children}
    </button>
  )
}
