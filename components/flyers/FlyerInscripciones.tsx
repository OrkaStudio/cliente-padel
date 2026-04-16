/**
 * FlyerInscripciones — Flyer de urgencia para inscripciones abiertas
 * Formato 9:16 (360×640px) para Instagram Stories / WhatsApp
 */
export default function FlyerInscripciones() {
  return (
    <div
      style={{
        width: 360,
        height: 640,
        background: "#0f172a",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        borderRadius: 16,
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}
    >
      {/* ── Fondo neon superior ── */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: "50%",
          transform: "translateX(-50%)",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(188,255,0,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Lineas anguladas decorativas ── */}
      <svg
        style={{ position: "absolute", inset: 0, opacity: 0.15 }}
        width="360"
        height="640"
        viewBox="0 0 360 640"
      >
        <line x1="0" y1="200" x2="360" y2="120" stroke="#bcff00" strokeWidth="1" />
        <line x1="0" y1="440" x2="360" y2="360" stroke="#bcff00" strokeWidth="1" />
        <line x1="0" y1="540" x2="360" y2="460" stroke="#bcff00" strokeWidth="0.5" />
      </svg>

      {/* ── TOP: Logo ── */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 24,
          right: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            background: "#bcff00",
            padding: "4px 12px",
            borderRadius: 6,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "#0f172a",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            TorneyPro
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
            fontWeight: 900,
            fontSize: 11,
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Torneo 2026
        </span>
      </div>

      {/* ── HEADLINE CENTRAL ── */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 24,
          right: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
            fontWeight: 900,
            fontSize: 11,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 8,
          }}
        >
          — Abiertas las —
        </div>

        <h2
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 76,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 0.88,
            fontWeight: 400,
            margin: 0,
          }}
        >
          INSCRIP-<br />
          <span style={{ color: "#bcff00" }}>CIONES</span>
        </h2>

        {/* Franja debajo del titulo */}
        <div
          style={{
            marginTop: 16,
            height: 3,
            background: "linear-gradient(90deg, #bcff00, transparent)",
          }}
        />
      </div>

      {/* ── DATOS DEL TORNEO ── */}
      <div
        style={{
          position: "absolute",
          top: 340,
          left: 24,
          right: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
            fontWeight: 900,
            fontSize: 11,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 16,
          }}
        >
          Detalles del evento
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <DataCard label="Fecha" value="17 — 19 ABR 2026" highlight />
          <DataCard label="Sede" value="Voleando · Mas Padel" />
          <DataCard label="Categorias" value="1ra · 2da · 3ra · 4ta" />
          <DataCard label="Formato" value="Dobles · Round Robin + KO" />
        </div>
      </div>

      {/* ── CUPOS LIMITADOS badge ── */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          left: 24,
          right: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "1.5px solid rgba(188,255,0,0.4)",
            borderRadius: 100,
            padding: "6px 16px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#bcff00",
              animation: "none",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
              fontWeight: 900,
              fontSize: 12,
              color: "#bcff00",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Cupos limitados
          </span>
        </div>
      </div>

      {/* ── CTA BOTTOM ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 56,
          background: "#bcff00",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 20,
            color: "#0f172a",
            textTransform: "uppercase",
            fontWeight: 400,
            letterSpacing: "0.04em",
          }}
        >
          SUMATE EN TORNEYPRO
        </span>
      </div>
    </div>
  )
}

function DataCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 10,
        border: highlight ? "1px solid rgba(188,255,0,0.25)" : "1px solid transparent",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
          fontWeight: 700,
          fontSize: 11,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
          fontWeight: 900,
          fontSize: 13,
          color: highlight ? "#bcff00" : "#e2e8f0",
        }}
      >
        {value}
      </span>
    </div>
  )
}
