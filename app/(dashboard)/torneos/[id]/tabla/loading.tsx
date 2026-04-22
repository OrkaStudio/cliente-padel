import Image from "next/image"

export default function Loading() {
  return (
    <div style={{
      minHeight: "100dvh",
      position: "relative",
      overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Image
        src="/clubes/torneo-campeones-bg.jpg"
        alt=""
        fill
        style={{
          objectFit: "cover", objectPosition: "center 35%",
          filter: "blur(22px)",
          transform: "scale(1.1)",
        }}
        priority
      />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, rgba(188,255,0,0.14) 0%, transparent 60%)",
      }} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid rgba(188,255,0,0.12)",
          borderTopColor: "#bcff00",
          animation: "spin 0.75s linear infinite",
        }} />
      </div>
    </div>
  )
}
