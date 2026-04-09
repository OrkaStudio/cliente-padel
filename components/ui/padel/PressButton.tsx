"use client"

import { useState } from "react"

// Emil Kowalski: scale(0.97) on press, 160ms ease-out
// Only animate transform — never height/padding/color
// Gate hover behind (hover: hover) for touch devices

export function PressButton({
  onClick,
  children,
  style,
  className,
}: {
  onClick?: () => void
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}) {
  const [pressed, setPressed] = useState(false)

  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      className={className}
      style={{
        ...style,
        transform: pressed ? "scale(0.97)" : "scale(1)",
        transition: "transform 160ms cubic-bezier(0.23, 1, 0.32, 1)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  )
}
