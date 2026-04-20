export function PuntosPlaceholder() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "64px 24px",
      gap: 12,
    }}>
      <span style={{
        fontFamily: "'Material Symbols Outlined'",
        fontSize: 48,
        color: "#cbd5e1",
        lineHeight: 1,
      }}>
        emoji_events
      </span>
      <p style={{
        fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
        fontSize: 13,
        fontWeight: 700,
        color: "#94a3b8",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        margin: 0,
      }}>
        Puntos por jugador próximamente
      </p>
    </div>
  )
}
