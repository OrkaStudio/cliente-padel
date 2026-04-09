import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { siteConfig } from "@/config/site"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header style={{ background: "#0f172a", padding: "0 18px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ fontFamily: "Anton", fontSize: 20, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {siteConfig.name}
        </span>
        <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "Space Grotesk", fontWeight: 700 }}>
          {user.email}
        </span>
      </header>
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "0 0 100px" }}>
        {children}
      </main>
    </div>
  )
}
