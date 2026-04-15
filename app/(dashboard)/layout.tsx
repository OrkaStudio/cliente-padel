import { siteConfig } from "@/config/site"
import { BottomNav } from "@/components/layout/BottomNav"
import { AdminMenu } from "@/components/layout/AdminMenu"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", maxWidth: 430, margin: "0 auto", position: "relative" }}>
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #e2e8f0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontVariationSettings: "'FILL' 1, 'wght' 400", fontSize: 20, color: "#bcff00", lineHeight: 1 }}>
            sports_tennis
          </span>
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontWeight: 400,
            fontSize: 16,
            color: "#0f172a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {siteConfig.name}
          </span>
        </div>
        <AdminMenu />
      </header>

      <main style={{ paddingBottom: 80 }}>
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
