"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { ResultadoSheet } from "./ResultadoSheet"
import { marcarEnVivoAction } from "@/actions/partidos.actions"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any

function formatHora(horario: string | null) {
  if (!horario) return "--:--"
  return new Date(horario).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

function nombrePareja(p: { jugador1: { nombre: string; apellido: string } | null; jugador2: { nombre: string; apellido: string } | null } | null) {
  if (!p) return "—"
  const j1 = p.jugador1 ? p.jugador1.apellido : ""
  const j2 = p.jugador2 ? p.jugador2.apellido : ""
  return [j1, j2].filter(Boolean).join(" / ") || "—"
}

export function VeedorView({ partidos, sedeName, isAdmin }: { partidos: Partido[]; sedeName: string; isAdmin?: boolean }) {
  const router = useRouter()
  const [tab, setTab] = useState<"hoy" | "todos">("hoy")
  const [sheetPartido, setSheetPartido] = useState<Partido | null>(null)
  const [iniciando, startInicio] = useTransition()
  const [iniciandoId, setIniciandoId] = useState<string | null>(null)

  const hoy = new Date().toISOString().slice(0, 10)

  const filtrados = useMemo(() => {
    if (tab === "hoy") {
      return partidos.filter((p: Partido) =>
        p.horario && new Date(p.horario).toISOString().slice(0, 10) === hoy
      )
    }
    return partidos
  }, [partidos, tab, hoy])

  const live      = filtrados.filter((p: Partido) => p.estado === "en_vivo")
  const proximos  = filtrados.filter((p: Partido) => p.estado === "pendiente")
  const finalizados = filtrados.filter((p: Partido) => p.estado === "finalizado")

  const handleIniciar = (p: Partido) => {
    setIniciandoId(p.id)
    startInicio(async () => {
      await marcarEnVivoAction({ partidoId: p.id })
      setIniciandoId(null)
    })
  }

  return (
    <div style={{ padding: "0 0 100px" }}>
      {/* Tabs Hoy / Todos */}
      <div style={{
        display: "flex", gap: 0,
        borderBottom: "1px solid #e2e8f0",
        padding: "0 16px",
        background: "#fff",
      }}>
        {(["hoy", "todos"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "14px 0",
              border: "none", background: "transparent",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, fontWeight: 900,
              color: tab === t ? "#0f172a" : "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.05em",
              borderBottom: tab === t ? "2px solid #bcff00" : "2px solid transparent",
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              transition: "color 160ms cubic-bezier(0.23,1,0.32,1)",
            }}
          >
            {t === "hoy" ? "Hoy" : "Todos"}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* EN VIVO */}
        {live.length > 0 && (
          <Section label="En vivo" accent>
            {live.map((p: Partido, i: number) => (
              <PartidoCard
                key={p.id} partido={p} index={i}
                accion={
                  <motion.button
                    onClick={() => setSheetPartido(p)}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                    style={btnStyle("#0f172a", "#bcff00")}
                  >
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>edit_note</span>
                    Resultado
                  </motion.button>
                }
              />
            ))}
          </Section>
        )}

        {/* PRÓXIMOS — sin botón, se inician solos por hora */}
        {proximos.length > 0 && (
          <Section label="Próximos">
            {proximos.map((p: Partido, i: number) => (
              <PartidoCard key={p.id} partido={p} index={i} />
            ))}
          </Section>
        )}

        {/* FINALIZADOS */}
        {finalizados.length > 0 && (
          <Section label="Finalizados">
            {finalizados.map((p: Partido, i: number) => (
              <PartidoCard
                key={p.id} partido={p} index={i} finalizado
                accion={
                  <motion.button
                    onClick={() => setSheetPartido(p)}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                    style={btnStyle("#f1f5f9", "#64748b")}
                  >
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>edit</span>
                    Corregir resultado
                  </motion.button>
                }
              />
            ))}
          </Section>
        )}

        {filtrados.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, display: "block" }}>sports_tennis</span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, marginTop: 8 }}>
              {tab === "hoy" ? "Sin partidos hoy en " + sedeName : "Sin partidos"}
            </p>
          </div>
        )}
      </div>

      {/* Sheet de resultado */}
      <ResultadoSheet
        partido={sheetPartido}
        onClose={() => setSheetPartido(null)}
        onSuccess={() => { setSheetPartido(null); router.refresh() }}
      />
    </div>
  )
}

function Section({ label, accent, children }: { label: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        {accent && (
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#bcff00" }} />
        )}
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 10, fontWeight: 900, color: "#64748b",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          {label}
        </span>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  )
}

function PartidoCard({ partido: p, index, accion, finalizado }: {
  partido: Partido; index: number; accion?: React.ReactNode; finalizado?: boolean
}) {
  const score = p.resultado
    ? `${p.resultado.sets_pareja1} – ${p.resultado.sets_pareja2}`
    : null
  const isLive = p.estado === "en_vivo"

  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${isLive ? "#bcff00" : "#e2e8f0"}`,
      borderRadius: 12,
      overflow: "hidden",
      opacity: finalizado ? 0.7 : 1,
      animation: "fadeUp 300ms cubic-bezier(0.23,1,0.32,1) both",
      animationDelay: `${index * 40}ms`,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px",
        background: isLive ? "#0f172a" : "#f8fafc",
        borderBottom: "1px solid #f1f5f9",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 13, color: isLive ? "#fff" : "#0f172a",
          }}>
            {formatHora(p.horario)}
          </span>
          {p.cancha && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: isLive ? "#bcff00" : "#64748b",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              background: isLive ? "rgba(188,255,0,0.15)" : "#f1f5f9",
              padding: "2px 6px", borderRadius: 3,
            }}>
              C{p.cancha}
            </span>
          )}
        </div>
        {p.categorias?.nombre && (
          <span style={{
            fontSize: 9, fontWeight: 900, color: isLive ? "#94a3b8" : "#94a3b8",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {p.categorias.nombre}
          </span>
        )}
      </div>

      {/* Equipos */}
      <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif", lineHeight: 1.3 }}>
          {nombrePareja(p.pareja1)}
        </span>
        <span style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: score ? 18 : 12, color: score ? "#0f172a" : "#94a3b8",
          background: score && isLive ? "#bcff00" : score ? "#f1f5f9" : "transparent",
          padding: score ? "2px 8px" : "0",
          borderRadius: 4, textAlign: "center", minWidth: 48,
        }}>
          {score ?? "VS"}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif", lineHeight: 1.3, textAlign: "right" }}>
          {nombrePareja(p.pareja2)}
        </span>
      </div>

      {/* Acción */}
      {accion && (
        <div style={{ padding: "0 12px 12px" }}>
          {accion}
        </div>
      )}
    </div>
  )
}

function btnStyle(bg: string, color: string, disabled?: boolean) {
  return {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 6, width: "100%", padding: "10px",
    borderRadius: 8, border: "none",
    background: disabled ? "#94a3b8" : bg,
    color: disabled ? "#fff" : color,
    fontFamily: "var(--font-space-grotesk), sans-serif",
    fontSize: 12, fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    WebkitTapHighlightColor: "transparent",
    letterSpacing: "0.04em",
  } as React.CSSProperties
}
