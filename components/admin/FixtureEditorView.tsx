"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"
import { moverPartidoAction } from "@/actions/partidos.actions"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Partido = any
type Sede = { id: string; nombre: string }

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
}

function nombrePareja(p: { jugador1: { apellido: string } | null; jugador2: { apellido: string } | null } | null) {
  if (!p) return "—"
  return [p.jugador1?.apellido, p.jugador2?.apellido].filter(Boolean).join(" / ") || "—"
}

const ESTADO_COLOR: Record<string, string> = {
  pendiente:  "#e2e8f0",
  en_vivo:    "#bcff00",
  finalizado: "#94a3b8",
}

export function FixtureEditorView({ partidos, sedes }: { partidos: Partido[]; sedes: Sede[] }) {
  const [selSede, setSelSede] = useState<string>(sedes[0]?.id ?? "")
  const [selCat, setSelCat] = useState<string>("todas")

  const partidosDeSede = partidos.filter((p: Partido) => p.sedes?.id === selSede)

  const categorias = Array.from(
    new Map(
      partidosDeSede
        .filter((p: Partido) => p.categorias?.id)
        .map((p: Partido) => [p.categorias.id, p.categorias.nombre])
    ).entries()
  )

  const partidosFiltrados = selCat === "todas"
    ? partidosDeSede
    : partidosDeSede.filter((p: Partido) => p.categorias?.id === selCat)

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Selector de sede */}
      {sedes.length > 1 && (
        <div style={{
          display: "flex", gap: 8, padding: "10px 16px",
          overflowX: "auto", borderBottom: "1px solid #e2e8f0", background: "#fff",
        }}>
          {sedes.map(s => (
            <button key={s.id} onClick={() => { setSelSede(s.id); setSelCat("todas") }}
              style={{
                padding: "7px 14px", borderRadius: 8, border: "none", flexShrink: 0,
                background: selSede === s.id ? "#0f172a" : "#f1f5f9",
                color: selSede === s.id ? "#fff" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 900, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.04em",
                WebkitTapHighlightColor: "transparent",
              }}>
              {s.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Filtro por categoría */}
      {categorias.length > 1 && (
        <div style={{
          display: "flex", gap: 6, padding: "10px 16px",
          overflowX: "auto", borderBottom: "1px solid #e2e8f0", background: "#fff",
        }}>
          {[["todas", "Todas"] as [string, string], ...categorias].map(([id, nombre]) => (
            <button key={id} onClick={() => setSelCat(id)}
              style={{
                padding: "5px 12px", borderRadius: 20, border: "1.5px solid", flexShrink: 0,
                borderColor: selCat === id ? "#0f172a" : "#e2e8f0",
                background: selCat === id ? "#0f172a" : "#fff",
                color: selCat === id ? "#fff" : "#64748b",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 10, fontWeight: 700, cursor: "pointer",
                textTransform: "uppercase", letterSpacing: "0.04em",
                WebkitTapHighlightColor: "transparent",
              }}>
              {nombre}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {partidosFiltrados.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 32, display: "block", marginBottom: 8 }}>
              sports_tennis
            </span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 12 }}>
              No hay partidos en esta sede
            </p>
          </div>
        ) : (
          partidosFiltrados.map((p: Partido) => (
            <FilaPartido
              key={p.id}
              partido={p}
              todosPartidos={partidosDeSede}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Fila de un partido ───────────────────────────────────────────────────────

function FilaPartido({ partido, todosPartidos }: { partido: Partido; todosPartidos: Partido[] }) {
  const [sheetAbierto, setSheetAbierto] = useState(false)
  const accentColor = ESTADO_COLOR[partido.estado] ?? "#e2e8f0"

  return (
    <>
      <div style={{
        background: "#fff", borderRadius: 12,
        border: "1px solid #e2e8f0",
        borderLeft: `4px solid ${accentColor}`,
        padding: "14px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {partido.categorias?.nombre && (
            <p style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 900, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px",
            }}>
              {partido.categorias.nombre}
            </p>
          )}
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 13, fontWeight: 700, color: "#0f172a",
            margin: "0 0 8px", lineHeight: 1.3,
          }}>
            {nombrePareja(partido.pareja1)}
            <span style={{ fontWeight: 400, color: "#94a3b8", margin: "0 5px" }}>vs</span>
            {nombrePareja(partido.pareja2)}
          </p>

          {/* Slot actual */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontFamily: "'Material Symbols Outlined'", fontSize: 13,
              color: "#94a3b8", lineHeight: 1,
            }}>schedule</span>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, fontWeight: 700, color: "#64748b",
            }}>
              {partido.horario ? formatHora(partido.horario) : "—"}
            </span>
            <span style={{ color: "#cbd5e1", fontSize: 10 }}>·</span>
            <span style={{
              fontFamily: "'Material Symbols Outlined'", fontSize: 13,
              color: "#94a3b8", lineHeight: 1,
            }}>stadium</span>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, fontWeight: 700, color: "#64748b",
            }}>
              {partido.cancha ? `Cancha ${partido.cancha}` : "—"}
            </span>
          </div>
        </div>

        {/* Botón swap */}
        <button
          onClick={() => setSheetAbierto(true)}
          style={{
            flexShrink: 0, padding: "8px 12px",
            borderRadius: 8, border: "1px solid #e2e8f0",
            background: "#f8fafc", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: "#64748b", lineHeight: 1 }}>
            swap_vert
          </span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 10, fontWeight: 900, color: "#64748b",
            textTransform: "uppercase", letterSpacing: "0.04em",
          }}>
            Reasignar Turno
          </span>
        </button>
      </div>

      {/* Sheet selector */}
      <AnimatePresence>
        {sheetAbierto && (
          <SwapSheet
            partido={partido}
            opciones={todosPartidos.filter(p => p.id !== partido.id)}
            onClose={() => setSheetAbierto(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Sheet de selección del partido a intercambiar ────────────────────────────

function SwapSheet({ partido, opciones, onClose }: {
  partido: Partido
  opciones: Partido[]
  onClose: () => void
}) {
  const [seleccionado, setSeleccionado] = useState<Partido | null>(null)
  const [filtroDia, setFiltroDia] = useState<string>("todos")
  const [filtroCancha, setFiltroCancha] = useState<string>("todas")
  const [pending, startTransition] = useTransition()
  const [ok, setOk] = useState(false)
  const router = useRouter()

  const handleSwap = () => {
    if (!seleccionado) return
    startTransition(async () => {
      const [, err] = await moverPartidoAction({
        partidoId: partido.id,
        nuevoHorario: seleccionado.horario,
        nuevaCancha: seleccionado.cancha,
        intercambiarCon: seleccionado.id,
      })
      if (!err) {
        setOk(true)
        router.refresh()
        setTimeout(() => { setOk(false); onClose() }, 1200)
      }
    })
  }

  // Días y canchas únicas para filtros
  const dias = Array.from(new Set(
    opciones
      .filter(p => p.horario)
      .map(p => new Date(p.horario).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "numeric" }))
  ))
  const diaKeys = Array.from(new Set(
    opciones.filter(p => p.horario).map(p => new Date(p.horario).toISOString().slice(0, 10))
  )).sort()
  const canchas = Array.from(new Set(opciones.filter(p => p.cancha).map(p => p.cancha as number))).sort((a, b) => a - b)

  // Filtrar y ordenar cronológicamente
  const opcionesFiltradas = opciones
    .filter(p => {
      if (filtroDia !== "todos" && p.horario) {
        if (new Date(p.horario).toISOString().slice(0, 10) !== filtroDia) return false
      }
      if (filtroCancha !== "todas" && p.cancha !== Number(filtroCancha)) return false
      return true
    })
    .sort((a, b) => {
      if (!a.horario) return 1
      if (!b.horario) return -1
      return new Date(a.horario).getTime() - new Date(b.horario).getTime()
    })

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, margin: "0 auto",
          width: "100%", maxWidth: 430, zIndex: 70,
          background: "#fff", borderRadius: "20px 20px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          maxHeight: "80vh", display: "flex", flexDirection: "column",
        }}
      >
        {/* Handle + header */}
        <div style={{ padding: "16px 20px 12px", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0", margin: "0 auto 16px" }} />
          <h3 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 18, fontWeight: 400, color: "#0f172a",
            textTransform: "uppercase", margin: "0 0 2px",
          }}>
            Destino del Mapeo
          </h3>
          <p style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 11, color: "#94a3b8", margin: 0,
          }}>
            {nombrePareja(partido.pareja1)} vs {nombrePareja(partido.pareja2)}
            {partido.horario && (
              <span style={{ color: "#cbd5e1", margin: "0 4px" }}>·</span>
            )}
            {partido.horario && (
              <span style={{ fontWeight: 700, color: "#64748b" }}>
                {formatHora(partido.horario)} · Cancha {partido.cancha}
              </span>
            )}
          </p>
        </div>

        {/* Filtros */}
        <div style={{ padding: "0 16px 10px", flexShrink: 0, borderBottom: "1px solid #f1f5f9" }}>
          {/* Filtro día */}
          {diaKeys.length > 1 && (
            <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 8, scrollbarWidth: "none" }}>
              {[["todos", "Todos los días"], ...diaKeys.map((k, i) => [k, dias[i] ?? k])].map(([key, label]) => (
                <button key={key} onClick={() => { setFiltroDia(key); setSeleccionado(null) }}
                  style={{
                    flexShrink: 0, padding: "4px 10px", borderRadius: 20, border: "1.5px solid",
                    borderColor: filtroDia === key ? "#0f172a" : "#e2e8f0",
                    background: filtroDia === key ? "#0f172a" : "#fff",
                    color: filtroDia === key ? "#fff" : "#64748b",
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 10, fontWeight: 700, cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          )}
          {/* Filtro cancha */}
          {canchas.length > 1 && (
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
              {[["todas", "Todas"], ...canchas.map(c => [String(c), `C${c}`])].map(([key, label]) => (
                <button key={key} onClick={() => { setFiltroCancha(key); setSeleccionado(null) }}
                  style={{
                    flexShrink: 0, padding: "4px 10px", borderRadius: 20, border: "1.5px solid",
                    borderColor: filtroCancha === key ? "#0f172a" : "#e2e8f0",
                    background: filtroCancha === key ? "#0f172a" : "#fff",
                    color: filtroCancha === key ? "#fff" : "#64748b",
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 10, fontWeight: 700, cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista cronológica */}
        <div style={{ overflowY: "auto", flex: 1, padding: "8px 16px" }}>
          {opcionesFiltradas.length === 0 ? (
            <p style={{
              textAlign: "center", padding: "24px 0",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 12, color: "#94a3b8",
            }}>
              No hay partidos con ese filtro
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {opcionesFiltradas.map(p => {
                const esSel = seleccionado?.id === p.id
                const difCat = p.categorias?.id !== partido.categorias?.id
                const difDia = p.horario && partido.horario && p.horario.slice(0, 10) !== partido.horario.slice(0, 10)
                
                return (
                  <button key={p.id} onClick={() => setSeleccionado(esSel ? null : p)}
                    style={{
                      width: "100%", padding: "10px 12px",
                      borderRadius: 10, cursor: "pointer", textAlign: "left",
                      border: esSel ? "2px solid #0f172a" : "1px solid #e2e8f0",
                      background: esSel ? "#0f172a" : (difCat ? "#fef2f2" : "#f8fafc"),
                      WebkitTapHighlightColor: "transparent",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                    }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        {p.categorias?.nombre && (
                          <span style={{
                            fontFamily: "var(--font-space-grotesk), sans-serif",
                            fontSize: 8, fontWeight: 900,
                            color: esSel ? "#bcff00" : (difCat ? "#ef4444" : "#94a3b8"),
                            textTransform: "uppercase", letterSpacing: "0.06em",
                          }}>
                            {p.categorias.nombre}
                          </span>
                        )}
                        {difCat && !esSel && (
                          <span style={{ fontSize: 9, background: "#fee2e2", color: "#b91c1c", padding: "2px 4px", borderRadius: 4, fontWeight: 700 }}>
                            ⚠️ OTRA CATEGORÍA
                          </span>
                        )}
                        {difDia && !esSel && (
                          <span style={{ fontSize: 9, background: "#ffedd5", color: "#c2410c", padding: "2px 4px", borderRadius: 4, fontWeight: 700 }}>
                            ⚠️ OTRO DÍA
                          </span>
                        )}
                      </div>
                      <span style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontSize: 12, fontWeight: 700,
                        color: esSel ? "#fff" : "#0f172a", display: "block"
                      }}>
                        {nombrePareja(p.pareja1)}
                        <span style={{ fontWeight: 400, color: esSel ? "#94a3b8" : "#94a3b8", margin: "0 4px" }}>vs</span>
                        {nombrePareja(p.pareja2)}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: 10, fontWeight: 700, flexShrink: 0,
                      color: esSel ? "#bcff00" : "#64748b",
                    }}>
                      {p.horario ? formatHora(p.horario) : "—"} · C{p.cancha ?? "—"}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer con botón confirmar */}
        <div style={{ padding: "12px 16px 32px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
          {ok ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px", background: "#f0fff4", borderRadius: 10,
            }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: "#22c55e", lineHeight: 1 }}>
                check_circle
              </span>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 13, fontWeight: 900, color: "#166534",
              }}>
                Partidos intercambiados
              </span>
            </div>
          ) : seleccionado ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "13px", borderRadius: 10,
                  border: "1px solid #e2e8f0", background: "#f8fafc",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, fontWeight: 700, color: "#64748b", cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Cancelar
              </button>
              <motion.button
                onClick={handleSwap}
                disabled={pending}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.16, type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  flex: 2, padding: "13px", borderRadius: 10, border: "none",
                  background: pending ? "#e2e8f0" : "#0f172a",
                  color: pending ? "#94a3b8" : "#bcff00",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 13, fontWeight: 900, cursor: pending ? "not-allowed" : "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {pending ? "Intercambiando..." : "↕ Intercambiar"}
              </motion.button>
            </div>
          ) : (
            <p style={{
              textAlign: "center",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 12, color: "#94a3b8", margin: 0,
            }}>
              Seleccioná un partido para intercambiar
            </p>
          )}
        </div>
      </motion.div>
    </>
  )
}
