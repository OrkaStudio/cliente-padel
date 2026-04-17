export default function Loading() {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "radial-gradient(ellipse at 0% 100%, rgba(188,255,0,0.18) 0%, transparent 60%), radial-gradient(ellipse at 100% 0%, rgba(180,83,9,0.12) 0%, transparent 55%), #f8fafc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "3px solid rgba(15,23,42,0.08)",
        borderTopColor: "#0f172a",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  )
}
