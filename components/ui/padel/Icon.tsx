"use client"

export function Icon({
  name,
  size = 20,
  color = "#0f172a",
  filled = false,
}: {
  name: string
  size?: number
  color?: string
  filled?: boolean
}) {
  return (
    <span
      style={{
        fontFamily: "'Material Symbols Outlined'",
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400`,
        fontSize: size,
        color,
        lineHeight: 1,
        userSelect: "none",
        display: "inline-block",
      }}
    >
      {name}
    </span>
  )
}
