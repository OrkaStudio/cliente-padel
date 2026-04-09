"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { siteConfig } from "@/config/site"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/admin"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 32, width: "100%", maxWidth: 400 }}>
        <h1 style={{ fontFamily: "Anton", fontSize: 28, color: "#0f172a", marginBottom: 4, textTransform: "uppercase" }}>
          {siteConfig.name}
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", fontFamily: "Space Grotesk", fontWeight: 700, marginBottom: 28 }}>
          Gestión de torneos de pádel
        </p>

        {sent ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{ fontFamily: "Anton", fontSize: 18, color: "#0f172a", marginBottom: 8 }}>REVISÁ TU EMAIL</p>
            <p style={{ fontSize: 13, color: "#64748b", fontFamily: "Space Grotesk" }}>
              Te enviamos un link mágico a <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <label style={{ fontSize: 9, fontWeight: 900, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 6, fontFamily: "Space Grotesk" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organizador@club.com"
              required
              style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e2e8f0", fontFamily: "Space Grotesk", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 16 }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: "#0f172a", color: "#fff", fontFamily: "Anton", fontSize: 16, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Enviando..." : "Entrar →"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
