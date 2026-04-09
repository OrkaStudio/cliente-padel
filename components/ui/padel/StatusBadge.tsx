"use client"

import { useEffect, useState } from "react"

export function StatusBadge({ status }: { status: string }) {
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    if (status !== "live") return
    const t = setInterval(() => setPulse(p => !p), 1000)
    return () => clearInterval(t)
  }, [status])

  const map: Record<string, { bg: string; c: string; t: string }> = {
    live:      { bg: "#bcff00", c: "#000", t: "EN VIVO" },
    en_curso:  { bg: "#bcff00", c: "#000", t: "EN VIVO" },
    finished:  { bg: "#e2e8f0", c: "#64748b", t: "FIN" },
    finalizado:{ bg: "#e2e8f0", c: "#64748b", t: "FIN" },
    upcoming:  { bg: "#bcff00", c: "#000", t: "PRÓX" },
    inscripcion:{ bg: "#dbeafe", c: "#1e40af", t: "INSCRIPCIÓN" },
    borrador:  { bg: "#f1f5f9", c: "#94a3b8", t: "BORRADOR" },
    tbd:       { bg: "#e2e8f0", c: "#cbd5e1", t: "TBD" },
  }

  const s = map[status] ?? map["tbd"] ?? { bg: "#e2e8f0", c: "#64748b", t: "?" }
  const isLive = status === "live" || status === "en_curso"

  return (
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
            opacity: pulse ? 1 : 0.3,
            transition: "opacity 0.5s",
          }}
        />
      )}
      {s.t}
    </span>
  )
}
