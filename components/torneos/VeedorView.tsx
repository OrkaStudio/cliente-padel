"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { ResultadoSheet } from "./ResultadoSheet"
import { marcarEnVivoAction, actualizarCanchaAction, revertirAPendienteAction } from "@/actions/partidos.actions"
import { Toast } from "@/components/ui/Toast"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any

const TZ = "America/Argentina/Buenos_Aires"

function formatHora(horario: string | null) {
  if (!horario) return "--:--"
  return new Date(horario).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ })
}

function nombrePareja(p: { jugador1: { nombre: string; apellido: string } | null; jugador2: { nombre: string; apellido: string } | null } | null) {
  if (!p) return "—"
  const j1 = p.jugador1 ? p.jugador1.apellido : ""
  const j2 = p.jugador2 ? p.jugador2.apellido : ""
  return [j1, j2].filter(Boolean).join(" / ") || "—"
}

export function VeedorView({ partidos, sedeName }: { partidos: Partido[]; sedeName: string; isAdmin?: boolean }) {
  const router = useRouter()
  const [tab, setTab] = useState<"hoy" | "todos">("hoy")
  const [sheetPartido, setSheetPartido] = useState<Partido | null>(null)
  const [iniciando, startInicio] = useTransition()
  const [iniciandoId, setIniciandoId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const [confirmarRevertir, setConfirmarRevertir] = useState<Partido | null>(null)
  const [revirtiendo, startRevertir] = useTransition()

  const handleConfirmarRevertir = () => {
    if (!confirmarRevertir) return
    const id = confirmarRevertir.id
    startRevertir(async () => {
      const [, err] = await revertirAPendienteAction({ partidoId: id })
      setConfirmarRevertir(null)
      if (err) {
        setToastMsg(err.message ?? "No se pudo revertir el partido")
        return
      }
      router.refresh()
    })
  }

  const [editingCanchaPartido, setEditingCanchaPartido] = useState<Partido | null>(null)
  const [editingCanchaVal, setEditingCanchaVal] = useState(1)
  const [savingCancha, startSavingCancha] = useTransition()

  const handleOpenCanchaEdit = (p: Partido) => {
    setEditingCanchaVal(p.cancha ?? 1)
    setEditingCanchaPartido(p)
  }

  const handleSaveCancha = () => {
    if (!editingCanchaPartido) return
    const id = editingCanchaPartido.id
    startSavingCancha(async () => {
      const [, err] = await actualizarCanchaAction({ partidoId: id, cancha: editingCanchaVal })
      setEditingCanchaPartido(null)
      if (err) {
        setToastMsg(err.message ?? "No se pudo cambiar la cancha")
        return
      }
      router.refresh()
    })
  }

  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: TZ })

  const filtrados = useMemo(() => {
    if (tab === "hoy") {
      return partidos.filter((p: Partido) =>
        p.horario && new Date(p.horario).toLocaleDateString("en-CA", { timeZone: TZ }) === hoy
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
      const [, err] = await marcarEnVivoAction({ partidoId: p.id })
      setIniciandoId(null)
      if (err) {
        setToastMsg(err.message ?? "No se pudo iniciar el partido")
        return
      }
      router.refresh()
    })
  }

  return (
    <div style={{ padding: "0 0 100px" }}>
      {/* Header con back */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px",
        borderBottom: "1px solid #f1f5f9",
        background: "#fff",
      }}>
        <motion.button
          onClick={() => router.back()}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34, borderRadius: 10,
            border: "1px solid #e2e8f0", background: "#f8fafc",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: "#0f172a", lineHeight: 1 }}>arrow_back</span>
        </motion.button>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 13, fontWeight: 900, color: "#0f172a",
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          {sedeName}
        </span>
      </div>

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
                onEditCancha={() => handleOpenCanchaEdit(p)}
                accion={
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <motion.button
                      onClick={() => setSheetPartido(p)}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                      style={btnStyle("#0f172a", "#bcff00")}
                    >
                      <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>edit_note</span>
                      Resultado
                    </motion.button>
                    <motion.button
                      onClick={() => setConfirmarRevertir(p)}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 5, width: "100%", padding: "8px",
                        borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
                        background: "transparent", color: "rgba(255,255,255,0.4)",
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 11, fontWeight: 700,
                        cursor: "pointer", WebkitTapHighlightColor: "transparent",
                        letterSpacing: "0.04em",
                      }}
                    >
                      <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 13, lineHeight: 1 }}>undo</span>
                      Revertir a pendiente
                    </motion.button>
                  </div>
                }
              />
            ))}
          </Section>
        )}

        {/* PRÓXIMOS — con botón manual para iniciar */}
        {proximos.length > 0 && (
          <Section label="Próximos">
            {proximos.map((p: Partido, i: number) => (
              <PartidoCard
                key={p.id} partido={p} index={i}
                onEditCancha={() => handleOpenCanchaEdit(p)}
                accion={
                  <motion.button
                    onClick={() => handleIniciar(p)}
                    disabled={iniciando && iniciandoId === p.id}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                    style={btnStyle("#f1f5f9", "#0f172a", iniciando && iniciandoId === p.id)}
                  >
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, lineHeight: 1 }}>play_arrow</span>
                    {iniciando && iniciandoId === p.id ? "Iniciando..." : "Iniciar partido"}
                  </motion.button>
                }
              />
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

      {/* Sheet de confirmación para revertir */}
      <ConfirmRevertirSheet
        partido={confirmarRevertir}
        onConfirm={handleConfirmarRevertir}
        onClose={() => setConfirmarRevertir(null)}
        loading={revirtiendo}
      />

      {/* Sheet de edición de cancha */}
      <CanchaSheet
        partido={editingCanchaPartido}
        canchaVal={editingCanchaVal}
        onCanchaChange={setEditingCanchaVal}
        onSave={handleSaveCancha}
        onClose={() => setEditingCanchaPartido(null)}
        saving={savingCancha}
      />

      <Toast message={toastMsg} type="error" onDismiss={() => setToastMsg(null)} />
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

function PartidoCard({ partido: p, index, accion, finalizado, onEditCancha }: {
  partido: Partido; index: number; accion?: React.ReactNode; finalizado?: boolean; onEditCancha?: () => void
}) {
  const score = p.resultado
    ? `${p.resultado.sets_pareja1} – ${p.resultado.sets_pareja2}`
    : null
  const isLive = p.estado === "en_vivo"

  return (
    <div style={{
      background: isLive ? "#0f172a" : "#fff",
      border: `1px solid ${isLive ? "#bcff00" : "#e2e8f0"}`,
      borderRadius: 12,
      overflow: "hidden",
      opacity: finalizado ? 0.7 : 1,
      animation: "fadeUp 300ms cubic-bezier(0.23,1,0.32,1) both",
      animationDelay: `${Math.min(index, 8) * 40}ms`,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px",
        background: isLive ? "rgba(255,255,255,0.05)" : "#f8fafc",
        borderBottom: `1px solid ${isLive ? "rgba(255,255,255,0.1)" : "#f1f5f9"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLive && (
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: "#bcff00",
              boxShadow: "0 0 8px #bcff00", animation: "pulseLive 2s infinite"
            }} />
          )}
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 13, color: isLive ? "#fff" : "#0f172a",
          }}>
            {formatHora(p.horario)}
          </span>
          {onEditCancha ? (
            <button
              onClick={onEditCancha}
              style={{
                display: "flex", alignItems: "center", gap: 3,
                fontSize: 10, fontWeight: 700,
                color: isLive ? "#0f172a" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                background: isLive ? "#bcff00" : "#f1f5f9",
                padding: "2px 6px", borderRadius: 3,
                border: "none", cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {p.cancha > 0 ? `C${p.cancha}` : "C -"}
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 10, lineHeight: 1 }}>edit</span>
            </button>
          ) : (
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: isLive ? "#0f172a" : "#64748b",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              background: isLive ? "#bcff00" : "#f1f5f9",
              padding: "2px 6px", borderRadius: 3,
            }}>
              {p.cancha > 0 ? `C${p.cancha}` : "C -"}
            </span>
          )}
        </div>
        {p.categorias?.nombre && (
          <span style={{
            fontSize: 9, fontWeight: 900, color: isLive ? "#bcff00" : "#94a3b8",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {p.categorias.nombre}
          </span>
        )}
      </div>

      {/* Equipos */}
      <div style={{ padding: "10px 12px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: isLive ? "#f8fafc" : "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif", lineHeight: 1.3 }}>
          {nombrePareja(p.pareja1)}
        </span>
        <span style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: score ? 18 : 12, color: score && isLive ? "#0f172a" : score ? "#0f172a" : (isLive ? "#64748b" : "#94a3b8"),
          background: score && isLive ? "#bcff00" : score ? "#f1f5f9" : "transparent",
          padding: score ? "2px 8px" : "0",
          borderRadius: 4, textAlign: "center", minWidth: 48,
        }}>
          {score ?? "VS"}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: isLive ? "#f8fafc" : "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif", lineHeight: 1.3, textAlign: "right" }}>
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

function ConfirmRevertirSheet({ partido, onConfirm, onClose, loading }: {
  partido: Partido | null
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  return (
    <AnimatePresence>
      {partido && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 70,
              background: "#fff", borderRadius: "20px 20px 0 0",
              padding: "16px 20px 44px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 20px" }} />

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 24 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 24, color: "#ef4444", lineHeight: 1 }}>undo</span>
              </div>
              <p style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 15, fontWeight: 900, color: "#0f172a",
                margin: 0, textAlign: "center",
              }}>
                ¿Revertir a pendiente?
              </p>
              <p style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 12, color: "#64748b",
                margin: 0, textAlign: "center", lineHeight: 1.5,
              }}>
                {nombrePareja(partido.pareja1)} vs {nombrePareja(partido.pareja2)}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "14px", borderRadius: 10,
                  border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <motion.button
                onClick={onConfirm}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  flex: 2, padding: "14px", borderRadius: 10, border: "none",
                  background: loading ? "#94a3b8" : "#ef4444",
                  color: "#fff",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900,
                  cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                {loading ? "Revirtiendo..." : "Sí, revertir"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CanchaSheet({ partido, canchaVal, onCanchaChange, onSave, onClose, saving }: {
  partido: Partido | null
  canchaVal: number
  onCanchaChange: (v: number) => void
  onSave: () => void
  onClose: () => void
  saving: boolean
}) {
  return (
    <AnimatePresence>
      {partido && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 70,
              background: "#fff", borderRadius: "20px 20px 0 0",
              padding: "16px 20px 44px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 16px" }} />

            <p style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, fontWeight: 900, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.08em",
              margin: "0 0 24px", textAlign: "center",
            }}>
              Modificar Cancha
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginBottom: 28 }}>
              <button
                onClick={() => onCanchaChange(Math.max(1, canchaVal - 1))}
                disabled={canchaVal <= 1}
                style={{
                  width: 52, height: 52, borderRadius: 14,
                  border: "1px solid #e2e8f0", background: "#f8fafc",
                  cursor: canchaVal <= 1 ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: canchaVal <= 1 ? 0.35 : 1,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 28, color: "#64748b", lineHeight: 1 }}>remove</span>
              </button>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 9, fontWeight: 900, color: "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2,
                }}>
                  Cancha
                </div>
                <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 72, color: "#0f172a", lineHeight: 1 }}>
                  {canchaVal}
                </span>
              </div>

              <button
                onClick={() => onCanchaChange(Math.min(2, canchaVal + 1))}
                disabled={canchaVal >= 2}
                style={{
                  width: 64, height: 52, borderRadius: 14,
                  border: "none", background: "#0f172a",
                  cursor: canchaVal >= 2 ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  WebkitTapHighlightColor: "transparent",
                  boxShadow: "0 4px 12px rgba(15,23,42,0.15)",
                  opacity: canchaVal >= 2 ? 0.35 : 1,
                }}
              >
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 32, color: "#bcff00", lineHeight: 1 }}>add</span>
              </button>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "14px", borderRadius: 10,
                  border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <motion.button
                onClick={onSave}
                disabled={saving}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  flex: 2, padding: "14px", borderRadius: 10, border: "none",
                  background: saving ? "#94a3b8" : "#0f172a",
                  color: "#bcff00",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900,
                  cursor: saving ? "not-allowed" : "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                {saving ? "Guardando..." : "Guardar"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
