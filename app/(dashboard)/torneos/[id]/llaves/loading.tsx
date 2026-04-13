export default function Loading() {
  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Categorías chips skeleton */}
      <div style={{
        display: "flex", gap: 6, padding: "12px 16px",
        borderBottom: "1px solid #e2e8f0", overflowX: "auto",
      }}>
        {[80, 90, 70, 85].map((w, i) => (
          <div key={i} style={{
            width: w, height: 30, borderRadius: 20, background: "#e2e8f0",
            flexShrink: 0,
            animation: `skeletonPulse 1.4s ease-in-out ${i * 80}ms infinite`,
          }} />
        ))}
      </div>

      {/* Bracket skeleton */}
      <div style={{ padding: "20px 16px 0", display: "flex", gap: 16 }}>
        {[1, 2].map(col => (
          <div key={col} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                height: 80, borderRadius: 12, background: "#f1f5f9",
                animation: `skeletonPulse 1.4s ease-in-out ${(col * 2 + i) * 80}ms infinite`,
              }} />
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
