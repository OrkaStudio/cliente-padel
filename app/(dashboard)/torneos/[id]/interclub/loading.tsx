export default function Loading() {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "radial-gradient(ellipse at 0% 100%, rgba(188,255,0,0.12) 0%, transparent 55%), radial-gradient(ellipse at 100% 0%, rgba(180,83,9,0.10) 0%, transparent 50%), #f8fafc",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .sk { animation: pulse 1.4s ease-in-out infinite; }
      `}</style>

      {/* Hero marcador skeleton */}
      <div style={{ padding: "32px 20px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {/* Badge */}
        <div className="sk" style={{ width: 120, height: 16, borderRadius: 6, background: "#e2e8f0" }} />
        {/* Marcador */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div className="sk" style={{ width: 56, height: 56, borderRadius: 12, background: "#e2e8f0" }} />
            <div className="sk" style={{ width: 40, height: 10, borderRadius: 4, background: "#e2e8f0" }} />
          </div>
          <div className="sk" style={{ width: 48, height: 48, borderRadius: 8, background: "#e2e8f0" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div className="sk" style={{ width: 56, height: 56, borderRadius: 12, background: "#e2e8f0" }} />
            <div className="sk" style={{ width: 40, height: 10, borderRadius: 4, background: "#e2e8f0" }} />
          </div>
        </div>
      </div>

      {/* Categorías skeleton */}
      <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="sk" style={{
            height: 80, borderRadius: 16, background: "#ffffff",
            border: "1px solid #e2e8f0",
            animationDelay: `${i * 80}ms`,
          }} />
        ))}
      </div>
    </div>
  )
}
