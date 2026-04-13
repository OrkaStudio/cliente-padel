export default function Loading() {
  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Sticky header skeleton */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "rgba(248,250,252,0.97)",
        borderBottom: "1px solid #e2e8f0",
        padding: "10px 16px 10px",
      }}>
        <div style={{ height: 38, borderRadius: 10, background: "#e2e8f0", marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 6, paddingBottom: 10 }}>
          {[90, 70, 80].map((w, i) => (
            <div key={i} style={{ width: w, height: 28, borderRadius: 20, background: "#e2e8f0", flexShrink: 0 }} />
          ))}
        </div>
      </div>

      {/* Cards skeleton */}
      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 6 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            height: 72, borderRadius: 12, background: "#f1f5f9",
            animation: `skeletonPulse 1.4s ease-in-out ${i * 60}ms infinite`,
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
