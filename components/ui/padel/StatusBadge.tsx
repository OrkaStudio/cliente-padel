"use client"

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; c: string; t: string }> = {
    // Estados de partidos
    pendiente:  { bg: "#f1f5f9", c: "#64748b", t: "PDTE" },
    en_vivo:    { bg: "#bcff00", c: "#000",    t: "EN VIVO" },
    finalizado: { bg: "#e2e8f0", c: "#64748b", t: "FIN" },
    // Estados de torneos
    live:       { bg: "#bcff00", c: "#000",    t: "EN VIVO" },
    en_curso:   { bg: "#bcff00", c: "#000",    t: "EN CURSO" },
    finished:   { bg: "#e2e8f0", c: "#64748b", t: "FIN" },
    inscripcion:{ bg: "#dbeafe", c: "#1e40af", t: "INSCRIPCIÓN" },
    borrador:   { bg: "#f1f5f9", c: "#94a3b8", t: "BORRADOR" },
    upcoming:   { bg: "#f1f5f9", c: "#64748b", t: "PRÓX" },
  }

  const s = map[status] ?? { bg: "#e2e8f0", c: "#64748b", t: status.toUpperCase() }
  const isLive = status === "live" || status === "en_vivo"

  return (
    <>
      {isLive && (
        <style>{`
          @keyframes statusPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      )}
      <span
        style={{
          padding: "2px 7px",
          borderRadius: 2,
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.1em",
          background: s.bg,
          color: s.c,
          fontFamily: "Space Grotesk, sans-serif",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {isLive && (
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#000",
              animation: "statusPulse 2s ease-in-out infinite",
            }}
          />
        )}
        {s.t}
      </span>
    </>
  )
}
