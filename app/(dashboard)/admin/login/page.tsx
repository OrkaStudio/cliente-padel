"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { verificarPinAdminAction } from "@/actions/partidos.actions"

export default function AdminLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState(["", "", "", ""])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const inputs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...pin]
    next[i] = val
    setPin(next)
    setError(null)
    if (val && i < 3) inputs[i + 1]?.current?.focus()
    if (next.every(d => d !== "")) verificar(next.join(""))
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) {
      inputs[i - 1]?.current?.focus()
    }
  }

  const verificar = (codigo: string) => {
    startTransition(async () => {
      const [, err] = await verificarPinAdminAction({ pin: codigo })
      if (err) {
        setError("PIN incorrecto")
        setPin(["", "", "", ""])
        inputs[0]?.current?.focus()
        return
      }
      router.push("/admin")
    })
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 32, background: "#0f172a",
    }}>
      <span style={{
        fontFamily: "'Material Symbols Outlined'",
        fontSize: 40, color: "#bcff00",
        display: "block", marginBottom: 16, lineHeight: 1,
      }}>
        admin_panel_settings
      </span>

      <h1 style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 24, fontWeight: 400, color: "#fff",
        textTransform: "uppercase", marginBottom: 4, textAlign: "center",
      }}>
        Panel Admin
      </h1>
      <p style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 12, color: "#475569", fontWeight: 700,
        marginBottom: 36, textAlign: "center",
      }}>
        Ingresá el PIN de administrador
      </p>

      {/* PIN inputs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {pin.map((d, i) => (
          <input
            key={i}
            ref={inputs[i]}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            autoFocus={i === 0}
            style={{
              width: 56, height: 64,
              textAlign: "center",
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 28, fontWeight: 400,
              border: `2px solid ${error ? "#ef4444" : d ? "#bcff00" : "#1e293b"}`,
              borderRadius: 12,
              background: "#1e293b",
              color: "#fff",
              outline: "none",
              transition: "border-color 160ms cubic-bezier(0.23,1,0.32,1)",
              WebkitTapHighlightColor: "transparent",
            }}
          />
        ))}
      </div>

      {error && (
        <p style={{
          fontSize: 12, color: "#ef4444",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontWeight: 700,
        }}>
          {error}
        </p>
      )}
      {pending && (
        <p style={{
          fontSize: 12, color: "#475569",
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}>
          Verificando...
        </p>
      )}
    </div>
  )
}
