/**
 * FlyerApp — Flyer de promocion de la app TorneyPro
 * Formato 9:16 (360×640px) para Instagram Stories / WhatsApp
 */
export default function FlyerApp() {
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
      {/* ── Fondo glow verde-bottom ── */}
      <div
        style={{
          position: "absolute",
          bottom: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(188,255,0,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Grid de fondo ── */}
      <svg
        style={{ position: "absolute", inset: 0, opacity: 0.04 }}
        width="360"
        height="640"
        viewBox="0 0 360 640"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="640" stroke="#bcff00" strokeWidth="1" />
        ))}
        {Array.from({ length: 22 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 30} x2="360" y2={i * 30} stroke="#bcff00" strokeWidth="1" />
        ))}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255,255,255,0.06)",
            padding: "4px 10px",
            borderRadius: 100,
          }}
        >
          <span
            style={{
              fontFamily: "'Material Symbols Outlined'",
              fontSize: 12,
              color: "#bcff00",
              lineHeight: 1,
            }}
          >
            smartphone
          </span>
          <span
            style={{
              fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
              fontWeight: 900,
              fontSize: 11,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            App gratuita
          </span>
        </div>
      </div>

      {/* ── Mockup de telefono (CSS) ── */}
      <div
        style={{
          position: "absolute",
          top: 90,
          left: "50%",
          transform: "translateX(-50%)",
          width: 160,
          height: 280,
          background: "#1e293b",
          borderRadius: 24,
          border: "3px solid rgba(188,255,0,0.35)",
          boxShadow: "0 0 40px rgba(188,255,0,0.12), 0 20px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}
      >
        {/* Notch */}
        <div
          style={{
            width: 50,
            height: 8,
            background: "#0f172a",
            borderRadius: 4,
            margin: "10px auto 0",
          }}
        />
        {/* Screen content */}
        <div style={{ padding: "8px 10px" }}>
          {/* Header app */}
          <div
            style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 9,
              color: "#bcff00",
              textTransform: "uppercase",
              fontWeight: 400,
              marginBottom: 6,
            }}
          >
            Fixture — Hoy
          </div>
          {/* Match rows */}
          {[
            { a: "Perez/Gomez", b: "Lopez/Ruiz", score: "6-3" },
            { a: "Torres/Silva", b: "Diaz/Cruz",  score: "4-6" },
            { a: "Vega/Mora",   b: "Reyes/Soto", score: "Live" },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                background: i === 2 ? "rgba(188,255,0,0.08)" : "rgba(255,255,255,0.04)",
                borderRadius: 5,
                padding: "5px 6px",
                marginBottom: 4,
                border: i === 2 ? "1px solid rgba(188,255,0,0.2)" : "1px solid transparent",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
                    fontSize: 7,
                    fontWeight: 700,
                    color: "#94a3b8",
                  }}
                >
                  {m.a}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-anton), Anton, sans-serif",
                    fontSize: 9,
                    color: m.score === "Live" ? "#bcff00" : "#e2e8f0",
                    fontWeight: 400,
                  }}
                >
                  {m.score}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
                  fontSize: 7,
                  fontWeight: 700,
                  color: "#64748b",
                  marginTop: 2,
                }}
              >
                {m.b}
              </div>
            </div>
          ))}

          {/* Standings mini */}
          <div
            style={{
              marginTop: 8,
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 8,
              color: "#bcff00",
              textTransform: "uppercase",
              fontWeight: 400,
              marginBottom: 4,
            }}
          >
            Zona A
          </div>
          {[
            { name: "Perez/Gomez", pts: "6" },
            { name: "Torres/Silva", pts: "4" },
            { name: "Vega/Mora",   pts: "3" },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "3px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span style={{ fontFamily: "var(--font-space-grotesk)", fontSize: 7, color: "#94a3b8", fontWeight: 700 }}>
                {i + 1}. {s.name}
              </span>
              <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 8, color: "#e2e8f0", fontWeight: 400 }}>
                {s.pts}pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES list ── */}
      <div
        style={{
          position: "absolute",
          top: 400,
          left: 24,
          right: 24,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-space-grotesk), Space Grotesk, sans-serif",
            fontWeight: 900,
            fontSize: 10,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 4,
          }}
        >
          Todo en un lugar
        </div>
        <FeatureRow icon="bolt"          text="Fixture en vivo actualizado" />
        <FeatureRow icon="group"         text="Inscripcion por pareja" />
        <FeatureRow icon="emoji_events"  text="Resultados al instante" />
        <FeatureRow icon="schedule"      text="Horarios y canchas" />
      </div>

      {/* ── CTA HEADLINE ── */}
      <div
        style={{
          position: "absolute",
          bottom: 64,
          left: 24,
          right: 24,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 34,
            color: "#fff",
            textTransform: "uppercase",
            lineHeight: 0.95,
            fontWeight: 400,
            margin: 0,
          }}
        >
          GESTION DE<br />
          <span style={{ color: "#bcff00" }}>TORNEOS</span><br />
          EN TU CELULAR
        </h3>
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
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 18,
            color: "#0f172a",
            textTransform: "uppercase",
            fontWeight: 400,
            letterSpacing: "0.04em",
          }}
        >
          DESCARGA GRATIS
        </span>
        <span
          style={{
            fontFamily: "'Material Symbols Outlined'",
            fontSize: 20,
            color: "#0f172a",
            lineHeight: 1,
          }}
        >
          download
        </span>
      </div>
    </div>
  )
}

function FeatureRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 28,
          height: 28,
          background: "rgba(188,255,0,0.1)",
          border: "1px solid rgba(188,255,0,0.2)",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
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
      </div>
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
