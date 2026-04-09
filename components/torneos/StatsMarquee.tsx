// Server component — sin "use client", solo markup

export function StatsMarquee({
  parejas,
  categorias,
  costo,
}: {
  parejas: number
  categorias: number
  costo: number
}) {
  const stats = [
    { label: "PAREJAS",     value: parejas.toString() },
    { label: "CATEGORÍAS",  value: categorias.toString() },
    { label: "INSCRIPCIÓN", value: `$${(costo / 1000).toFixed(0)}K` },
  ]

  return (
    <div style={{
      background: "#f8fafc",
      padding: "12px 0",
      borderTop: "1px solid #e2e8f0",
      borderBottom: "1px solid #e2e8f0",
      overflow: "hidden",
      marginBottom: 8,
    }}>
      {/* Duplicamos el track para el efecto continuo */}
      <div className="marquee-track">
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: "flex", gap: 40, paddingRight: 40, flexShrink: 0 }}>
            {stats.map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 900,
                  color: "#bcff00",
                  fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
                }}>
                  {s.value}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 900,
                  color: "#0f172a",
                  fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
                  letterSpacing: "0.1em",
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
