/**
 * FlyerTorneo — Flyer principal del torneo interclubes
 * Formato 9:16 (360×640px) para Instagram Stories / WhatsApp
 */
export default function FlyerTorneo() {
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
      {/* ── Fondo: lineas de cancha ── */}
      <CourtLines />

      {/* ── Franja diagonal neon ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: -60,
          width: 480,
          height: 4,
          background: "#bcff00",
          transform: "rotate(-8deg) translateY(200px)",
          opacity: 0.5,
        }}
      />

      {/* ── Numero grande ghost ── */}
      <div
        style={{
          position: "absolute",
          right: -20,
          top: 60,
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 220,
          color: "rgba(188,255,0,0.04)",
          lineHeight: 1,
          fontWeight: 400,
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-10px",
        }}
      >
        26
      </div>

      {/* ── TOP: Badge "EN VIVO" + logo app ── */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          right: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#bcff00",
              boxShadow: "0 0 8px #bcff00",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
              fontWeight: 900,
              fontSize: 11,
              color: "#bcff00",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Interclubes 2026
          </span>
        </div>
        <AppBadge />
      </div>

      {/* ── VS CENTRAL ── */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 24,
          right: 24,
        }}
      >
        {/* Club A */}
        <ClubBlock
          name="VOLEANDO"
          color="#bcff00"
          align="left"
        />

        {/* VS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "10px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span
            style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 48,
              color: "#fff",
              fontWeight: 400,
              lineHeight: 1,
            }}
          >
            VS
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Club B */}
        <ClubBlock
          name="MAS PADEL"
          color="#fff"
          align="right"
        />
      </div>

      {/* ── TITULO principal ── */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 24,
          right: 24,
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#bcff00",
            padding: "3px 10px",
            borderRadius: 4,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
              fontWeight: 900,
              fontSize: 10,
              color: "#0f172a",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Torneo Interclubes
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 58,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 0.9,
            fontWeight: 400,
            margin: 0,
          }}
        >
          PADEL<br />
          <span style={{ color: "#bcff00" }}>ABIERTO</span><br />
          2026
        </h2>
      </div>

      {/* ── INFO DATOS ── */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <InfoRow icon="calendar_today" text="17 — 19 de Abril, 2026" />
        <InfoRow icon="location_on"    text="Voleando · Mas Padel" />
        <InfoRow icon="sports_tennis"  text="Categorias: 1ra · 2da · 3ra" />
      </div>

      {/* ── CTA BOTTOM ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          background: "#bcff00",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 22,
            color: "#0f172a",
            textTransform: "uppercase",
            fontWeight: 400,
            letterSpacing: "0.05em",
          }}
        >
          INSCRIBITE EN LA APP
        </span>
        <span
          style={{
            fontFamily: "'Material Symbols Outlined'",
            fontSize: 22,
            color: "#0f172a",
            lineHeight: 1,
          }}
        >
          arrow_forward
        </span>
      </div>
    </div>
  )
}

/* ── Sub-components ── */

function CourtLines() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, opacity: 0.06 }}
      width="360"
      height="640"
      viewBox="0 0 360 640"
    >
      {/* Rectangulo exterior */}
      <rect x="20" y="60" width="320" height="520" fill="none" stroke="#bcff00" strokeWidth="1.5" />
      {/* Linea central horizontal */}
      <line x1="20" y1="320" x2="340" y2="320" stroke="#bcff00" strokeWidth="1" />
      {/* Linea central vertical */}
      <line x1="180" y1="60" x2="180" y2="580" stroke="#bcff00" strokeWidth="1" />
      {/* Rectangulos de servicio */}
      <rect x="20" y="180" width="320" height="140" fill="none" stroke="#bcff00" strokeWidth="1" />
      <rect x="20" y="320" width="320" height="140" fill="none" stroke="#bcff00" strokeWidth="1" />
    </svg>
  )
}

function ClubBlock({ name, color, align }: { name: string; color: string; align: "left" | "right" }) {
  return (
    <div style={{ textAlign: align }}>
      <div
        style={{
          fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
          fontWeight: 900,
          fontSize: 11,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 4,
        }}
      >
        Club
      </div>
      <div
        style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 40,
          color,
          textTransform: "uppercase",
          lineHeight: 1,
          fontWeight: 400,
        }}
      >
        {name}
      </div>
    </div>
  )
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontFamily: "'Material Symbols Outlined'",
          fontSize: 14,
          color: "#bcff00",
          lineHeight: 1,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          color: "#cbd5e1",
        }}
      >
        {text}
      </span>
    </div>
  )
}

function AppBadge() {
  return (
    <div
      style={{
        background: "rgba(188,255,0,0.12)",
        border: "1px solid rgba(188,255,0,0.3)",
        borderRadius: 6,
        padding: "4px 10px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
          fontWeight: 900,
          fontSize: 11,
          color: "#bcff00",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        TorneyPro
      </span>
    </div>
  )
}
