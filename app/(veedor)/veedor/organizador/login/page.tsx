"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { verificarPinAction } from "@/actions/partidos.actions"

const PAGE_BG = "radial-gradient(ellipse at 0% 100%, rgba(188,255,0,0.18) 0%, transparent 60%), radial-gradient(ellipse at 100% 0%, rgba(180,83,9,0.12) 0%, transparent 55%), #f8fafc"

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [null, "0", "⌫"],
]

export default function OrganizadorLoginPage() {
  const router = useRouter()
  const [digits, setDigits]        = useState<string[]>([])
  const [error, setError]          = useState(false)
  const [shaking, setShaking]      = useState(false)
  const [pending, startTransition] = useTransition()

  const press = (d: string) => {
    if (digits.length >= 4 || pending) return
    setError(false)
    const next = [...digits, d]
    setDigits(next)
    if (next.length === 4) verificar(next.join(""))
  }

  const backspace = () => {
    if (digits.length === 0 || pending) return
    setError(false)
    setDigits(prev => prev.slice(0, -1))
  }

  const verificar = (codigo: string) => {
    startTransition(async () => {
      const [, err] = await verificarPinAction({ club: "organizador", pin: codigo })
      if (err) {
        setError(true)
        setShaking(true)
        setDigits([])
        setTimeout(() => setShaking(false), 500)
        return
      }
      router.push("/veedor/organizador")
    })
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: PAGE_BG,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      padding: "24px 20px",
      paddingTop: "max(24px, env(safe-area-inset-top))",
      paddingBottom: "max(24px, env(safe-area-inset-bottom))",
    }}>


      {/* Botón volver */}
      <button
        onClick={() => router.push("/torneos/interclubes-abril-2026/interclub")}
        style={{
          position: "absolute",
          top: "max(20px, env(safe-area-inset-top))", left: 20,
          display: "flex", alignItems: "center", gap: 4,
          background: "none", border: "none", cursor: "pointer",
          padding: "6px 0",
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 700, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.08em",
          WebkitTapHighlightColor: "transparent", zIndex: 10,
        }}
      >
        <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>arrow_back</span>
        Torneos
      </button>

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", width: "100%", maxWidth: 320,
        position: "relative", zIndex: 1,
      }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center",
          background: "#0f172a", borderRadius: 3,
          padding: "4px 10px", marginBottom: 10,
        }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900, color: "#bcff00",
            textTransform: "uppercase", letterSpacing: "0.14em",
          }}>Organizador</span>
        </div>

        <h1 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 32, fontWeight: 400, lineHeight: 1,
          color: "#0f172a", textTransform: "uppercase",
          textAlign: "center", margin: "0 0 4px",
        }}>Cristian</h1>

        <p style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 700, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: "0.08em",
          margin: "0 0 40px",
        }}>Torneo Interclubes · Abr 2026</p>

        {/* PIN dots */}
        <motion.div
          animate={shaking ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          style={{ display: "flex", gap: 20, marginBottom: 8 }}
        >
          {[0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ scale: digits.length === i + 1 ? [1, 1.25, 1] : 1 }}
              transition={{ duration: 0.15 }}
              style={{
                width: 15, height: 15, borderRadius: "50%",
                background: i < digits.length ? (error ? "#ef4444" : "#0f172a") : "transparent",
                border: error
                  ? "2px solid #ef4444"
                  : `2px solid ${i < digits.length ? "#0f172a" : "#cbd5e1"}`,
                transition: "background 100ms, border-color 100ms",
              }}
            />
          ))}
        </motion.div>

        <div style={{ height: 24, display: "flex", alignItems: "center", marginBottom: 28 }}>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 10, fontWeight: 900, color: "#ef4444",
                  margin: 0, textTransform: "uppercase", letterSpacing: "0.08em",
                }}
              >
                PIN incorrecto
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Teclado */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: "14px 14px" }}>
          {KEYS.flat().map((k, idx) => {
            if (k === null) return <div key={idx} />
            const isBack = k === "⌫"
            return (
              <div key={idx} style={{ display: "flex", justifyContent: "center" }}>
                <LiquidButton
                  onClick={() => isBack ? backspace() : press(k)}
                  disabled={pending}
                  className="w-[76px] h-[76px] rounded-full"
                  style={{ opacity: pending ? 0.4 : 1 }}
                >
                  {isBack ? (
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22, lineHeight: 1, color: "#64748b" }}>backspace</span>
                  ) : (
                    <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 30, lineHeight: 1, color: "#0f172a" }}>{k}</span>
                  )}
                </LiquidButton>
              </div>
            )
          })}
        </div>

        {pending && (
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, color: "#94a3b8",
            letterSpacing: "0.08em", textTransform: "uppercase",
            marginTop: 22,
          }}>
            Verificando...
          </p>
        )}
      </div>
    </div>
  )
}
