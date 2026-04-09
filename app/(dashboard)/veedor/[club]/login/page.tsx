"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { verificarPinAction } from "@/actions/partidos.actions"

const CLUB_INFO: Record<string, { nombre: string; logo: string }> = {
  "voleando":  { nombre: "Voleando",  logo: "/clubes/voleando.logo.png" },
  "mas-padel": { nombre: "Más Pádel", logo: "/clubes/mas-padel.logo.png" },
}

export default function VeedorLoginPage() {
  const params  = useParams()
  const router  = useRouter()
  const club    = params.club as string
  const info    = CLUB_INFO[club]

  const [pin, setPin] = useState(["", "", "", ""])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const inputs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...pin]
    next[i] = val
    setPin(next)
    setError(null)
    if (val && i < 3) inputs[i + 1]?.current?.focus()
    if (next.every(d => d !== "") && next.join("").length === 4) {
      verificar(next.join(""))
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) {
      inputs[i - 1]?.current?.focus()
    }
  }

  const verificar = (codigo: string) => {
    startTransition(async () => {
      const [, err] = await verificarPinAction({ club: club as "voleando" | "mas-padel", pin: codigo })
      if (err) {
        setError("PIN incorrecto")
        setPin(["", "", "", ""])
        inputs[0]?.current?.focus()
        return
      }
      router.push(`/veedor/${club}`)
    })
  }

  if (!info) return <p style={{ padding: 24 }}>Sede no encontrada</p>

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 32, background: "#f8fafc",
    }}>
      {/* Logo del club */}
      <div style={{
        width: 80, height: 80, borderRadius: 16,
        background: "#fff", border: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20, overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}>
        <Image src={info.logo} alt={info.nombre} width={64} height={64} style={{ objectFit: "contain" }} />
      </div>

      <h1 style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 24, fontWeight: 400, color: "#0f172a",
        textTransform: "uppercase", marginBottom: 4, textAlign: "center",
      }}>
        {info.nombre}
      </h1>
      <p style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 12, color: "#64748b", fontWeight: 700,
        marginBottom: 36, textAlign: "center",
      }}>
        Ingresá el PIN de acceso veedor
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
              border: `2px solid ${error ? "#ef4444" : d ? "#0f172a" : "#e2e8f0"}`,
              borderRadius: 12,
              background: "#fff",
              color: "#0f172a",
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
          fontWeight: 700, marginBottom: 12,
        }}>
          {error}
        </p>
      )}

      {pending && (
        <p style={{
          fontSize: 12, color: "#64748b",
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}>
          Verificando...
        </p>
      )}
    </div>
  )
}
