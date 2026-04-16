export default function VeedorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100dvh" }}>
      {children}
    </div>
  )
}
