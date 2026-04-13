export default function Loading() {
  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Back placeholder */}
      <div style={{ padding: "16px 18px 10px", background: "#0f172a", height: 44 }} />

      {/* Hero skeleton */}
      <div style={{
        padding: "20px 18px 40px",
        background: "#0f172a",
        borderRadius: "0 0 32px 32px",
      }}>
        <div style={{ width: 80, height: 20, borderRadius: 4, background: "rgba(255,255,255,0.08)", marginBottom: 16 }} />
        <div style={{ width: "70%", height: 48, borderRadius: 4, background: "rgba(255,255,255,0.08)", marginBottom: 8 }} />
        <div style={{ width: "50%", height: 32, borderRadius: 4, background: "rgba(255,255,255,0.08)" }} />
      </div>

      {/* Marquee placeholder */}
      <div style={{ height: 44, background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }} />

      {/* Categorías skeleton */}
      <div style={{ padding: "32px 18px 0" }}>
        <div style={{ width: 120, height: 24, borderRadius: 4, background: "#e2e8f0", marginBottom: 20 }} />
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            height: 64, borderRadius: 12, background: "#f1f5f9",
            marginBottom: 10,
            animation: `skeletonPulse 1.4s ease-in-out ${i * 100}ms infinite`,
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
