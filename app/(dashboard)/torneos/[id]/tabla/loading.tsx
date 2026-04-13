export default function Loading() {
  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Categorías chips skeleton */}
      <div style={{
        display: "flex", gap: 6, padding: "12px 16px",
        borderBottom: "1px solid #e2e8f0", overflowX: "auto",
      }}>
        {[80, 90, 70, 85, 75].map((w, i) => (
          <div key={i} style={{
            width: w, height: 30, borderRadius: 20, background: "#e2e8f0",
            flexShrink: 0,
            animation: `skeletonPulse 1.4s ease-in-out ${i * 80}ms infinite`,
          }} />
        ))}
      </div>

      {/* Table skeleton */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ height: 28, width: 140, borderRadius: 4, background: "#e2e8f0", marginBottom: 12 }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            height: 52, borderRadius: 8, background: "#f1f5f9", marginBottom: 6,
            animation: `skeletonPulse 1.4s ease-in-out ${i * 80}ms infinite`,
          }} />
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
