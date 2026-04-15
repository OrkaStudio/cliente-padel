import Link from "next/link"
import { notFound } from "next/navigation"
import { HeroMarcador } from "@/components/torneos/interclub/HeroMarcador"
import type { CategoriaInterclub, Club } from "@/components/torneos/interclub/CategoriasInterclub"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

const CLUB_A: Club = { nombre: "Voleando", color: "#0f172a", abbr: "VOL", logoUrl: "/clubes/voleando.logo.png" }
const CLUB_B: Club = { nombre: "Más Pádel", color: "#b45309", abbr: "+P", logoUrl: "/clubes/mas-padel.logo.png" }

// Mismo mock que la página padre — en producción vendrá de Supabase
const MOCK_CATEGORIAS: CategoriaInterclub[] = [
  {
    id: "1", nombre: "Suma 12", estado: "finalizado", ptsA: 3, ptsB: 1,
    partidos: [
      { id: "p1", pairA: "Gómez / Ruiz", pairB: "López / Torres", resultado: "6-3 7-5", ganador: "A", estado: "finalizado" },
      { id: "p2", pairA: "Gómez / Ruiz", pairB: "Díaz / Funes", resultado: "6-1 6-3", ganador: "A", estado: "finalizado" },
      { id: "p3", pairA: "Silva / Mora", pairB: "López / Torres", resultado: "6-4 6-2", ganador: "A", estado: "finalizado" },
      { id: "p4", pairA: "Silva / Mora", pairB: "Díaz / Funes", resultado: "4-6 3-6", ganador: "B", estado: "finalizado" },
    ],
  },
  {
    id: "2", nombre: "Suma 10", estado: "en_vivo", ptsA: 1, ptsB: 1,
    partidos: [
      { id: "p5", pairA: "Ferreyra / Ríos", pairB: "Campos / Bravo", resultado: "6-3 6-4", ganador: "A", estado: "finalizado" },
      { id: "p6", pairA: "Ferreyra / Ríos", pairB: "Herrera / Sosa", resultado: "3-6 4-6", ganador: "B", estado: "finalizado" },
      { id: "p7", pairA: "Peralta / Luna", pairB: "Campos / Bravo", resultado: "6-3 4-3", ganador: null, estado: "en_vivo", horaInicio: "14:30", sede: "Voleando" },
      { id: "p8", pairA: "Peralta / Luna", pairB: "Herrera / Sosa", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:30", sede: "+Pádel" },
    ],
  },
  {
    id: "3", nombre: "Mixtos A", estado: "en_vivo", ptsA: 0, ptsB: 2,
    partidos: [
      { id: "p9", pairA: "García / Vega", pairB: "Martín / Paz", resultado: "3-6 2-6", ganador: "B", estado: "finalizado" },
      { id: "p10", pairA: "García / Vega", pairB: "Núñez / Reyes", resultado: "1-6 2-6", ganador: "B", estado: "finalizado" },
      { id: "p11", pairA: "Castro / Medina", pairB: "Martín / Paz", resultado: "5-4", ganador: null, estado: "en_vivo", horaInicio: "14:30", sede: "+Pádel" },
      { id: "p12", pairA: "Castro / Medina", pairB: "Núñez / Reyes", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:30", sede: "Voleando" },
    ],
  },
  {
    id: "4", nombre: "Séptima", estado: "finalizado", ptsA: 4, ptsB: 0,
    partidos: [
      { id: "p13", pairA: "Romero / Pinto", pairB: "Acosta / Vera", resultado: "6-0 6-1", ganador: "A", estado: "finalizado" },
      { id: "p14", pairA: "Romero / Pinto", pairB: "Blanco / Ibáñez", resultado: "6-2 6-3", ganador: "A", estado: "finalizado" },
      { id: "p15", pairA: "Vargas / Cruz", pairB: "Acosta / Vera", resultado: "6-4 7-5", ganador: "A", estado: "finalizado" },
      { id: "p16", pairA: "Vargas / Cruz", pairB: "Blanco / Ibáñez", resultado: "7-6 6-3", ganador: "A", estado: "finalizado" },
    ],
  },
  {
    id: "5", nombre: "Sexta", estado: "finalizado", ptsA: 2, ptsB: 2,
    partidos: [
      { id: "p17", pairA: "Domínguez / Soto", pairB: "Flores / Gil", resultado: "6-3 6-4", ganador: "A", estado: "finalizado" },
      { id: "p18", pairA: "Domínguez / Soto", pairB: "Ortega / Ramos", resultado: "4-6 3-6", ganador: "B", estado: "finalizado" },
      { id: "p19", pairA: "Benítez / Ojeda", pairB: "Flores / Gil", resultado: "7-5 4-6 1-6", ganador: "B", estado: "finalizado" },
      { id: "p20", pairA: "Benítez / Ojeda", pairB: "Ortega / Ramos", resultado: "6-4 6-3", ganador: "A", estado: "finalizado" },
    ],
  },
  {
    id: "6", nombre: "Quinta", estado: "en_vivo", ptsA: 1, ptsB: 0,
    partidos: [
      { id: "p21", pairA: "Molina / Quiroga", pairB: "Espinoza / Vidal", resultado: "6-2 6-3", ganador: "A", estado: "finalizado" },
      { id: "p22", pairA: "Molina / Quiroga", pairB: "Aguilar / Rojas", resultado: "4-2", ganador: null, estado: "en_vivo", horaInicio: "15:00", sede: "Voleando" },
      { id: "p23", pairA: "Navarro / Palacios", pairB: "Espinoza / Vidal", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:00", sede: "+Pádel" },
      { id: "p24", pairA: "Navarro / Palacios", pairB: "Aguilar / Rojas", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:30", sede: "Voleando" },
    ],
  },
  {
    id: "7", nombre: "Cuarta", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p25", pairA: "Álvarez / Carrizo", pairB: "Cabrera / Delgado", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:00", sede: "Voleando" },
      { id: "p26", pairA: "Álvarez / Carrizo", pairB: "Fuentes / Guerrero", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:30", sede: "+Pádel" },
      { id: "p27", pairA: "Méndez / Peña", pairB: "Cabrera / Delgado", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:00", sede: "+Pádel" },
      { id: "p28", pairA: "Méndez / Peña", pairB: "Fuentes / Guerrero", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:30", sede: "Voleando" },
    ],
  },
  {
    id: "8", nombre: "Tercera", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p29", pairA: "Heredia / Ávila", pairB: "Paredes / Solís", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:00", sede: "+Pádel" },
      { id: "p30", pairA: "Heredia / Ávila", pairB: "Tapia / Contreras", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:30", sede: "Voleando" },
      { id: "p31", pairA: "Salas / Figueroa", pairB: "Paredes / Solís", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:00", sede: "Voleando" },
      { id: "p32", pairA: "Salas / Figueroa", pairB: "Tapia / Contreras", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:30", sede: "+Pádel" },
    ],
  },
  {
    id: "9", nombre: "Segunda", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p33", pairA: "Córdoba / Mena", pairB: "Ríos / Sandoval", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:00", sede: "Voleando" },
      { id: "p34", pairA: "Córdoba / Mena", pairB: "Zamora / Villareal", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:30", sede: "+Pádel" },
      { id: "p35", pairA: "Lagos / Bustos", pairB: "Ríos / Sandoval", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:00", sede: "+Pádel" },
      { id: "p36", pairA: "Lagos / Bustos", pairB: "Zamora / Villareal", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:30", sede: "Voleando" },
    ],
  },
  {
    id: "10", nombre: "Primera", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p37", pairA: "Muñoz / Serrano", pairB: "Cáceres / Valdivia", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:00", sede: "+Pádel" },
      { id: "p38", pairA: "Muñoz / Serrano", pairB: "Jiménez / Pedraza", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:30", sede: "Voleando" },
      { id: "p39", pairA: "Arce / Escobar", pairB: "Cáceres / Valdivia", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:00", sede: "Voleando" },
      { id: "p40", pairA: "Arce / Escobar", pairB: "Jiménez / Pedraza", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:30", sede: "+Pádel" },
    ],
  },
  {
    id: "11", nombre: "Mixtos B", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p41", pairA: "Ibarra / Leiva", pairB: "Neira / Poblete", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:00", sede: "Voleando" },
      { id: "p42", pairA: "Ibarra / Leiva", pairB: "Quintero / Robles", resultado: null, ganador: null, estado: "pendiente", horaInicio: "15:30", sede: "+Pádel" },
      { id: "p43", pairA: "Trujillo / Uribe", pairB: "Neira / Poblete", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:00", sede: "+Pádel" },
      { id: "p44", pairA: "Trujillo / Uribe", pairB: "Quintero / Robles", resultado: null, ganador: null, estado: "pendiente", horaInicio: "16:30", sede: "Voleando" },
    ],
  },
]

export default async function CategoriaInterclubPage({
  params,
}: {
  params: Promise<{ id: string; catId: string }>
}) {
  const { id, catId } = await params
  const cat = MOCK_CATEGORIAS.find((c) => c.id === catId)
  if (!cat) notFound()

  const isLive = cat.estado === "en_vivo"
  const isFin  = cat.estado === "finalizado"

  const enVivo      = cat.partidos.filter((p) => p.estado === "en_vivo")
  const finalizados = cat.partidos.filter((p) => p.estado === "finalizado")
  const pendientes  = cat.partidos.filter((p) => p.estado === "pendiente")

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 60 }}>

      {/* ── Sticky header ── */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #f1f5f9",
        position: "sticky", top: 45, zIndex: 50,
        display: "flex", alignItems: "center",
        padding: "0 18px", height: 52,
        gap: 12,
      }}>
        {/* Back */}
        <Link
          href={`/torneos/${id}/interclub` as AnyHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            color: "#94a3b8", textDecoration: "none",
            WebkitTapHighlightColor: "transparent", flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, lineHeight: 1 }}>
            arrow_back
          </span>
        </Link>

        {/* Separador */}
        <div style={{ width: 1, height: 20, background: "#e2e8f0", flexShrink: 0 }} />

        {/* Categoría + score */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 16, fontWeight: 400, lineHeight: 1,
            color: "#0f172a", textTransform: "uppercase",
            letterSpacing: "0.02em",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{cat.nombre}</span>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 10 }}>
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 18, lineHeight: 1, color: "#0f172a",
            }}>{cat.ptsA}</span>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 700, color: "#cbd5e1",
            }}>–</span>
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 18, lineHeight: 1, color: "#0f172a",
            }}>{cat.ptsB}</span>

            {isLive && (
              <span className="live-dot" style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#bcff00", flexShrink: 0, display: "inline-block",
                boxShadow: "0 0 6px rgba(188,255,0,0.6)",
              }} />
            )}
          </div>
        </div>
      </div>

      {/* ── Marcador ── */}
      <HeroMarcador
        compact
        clubA={CLUB_A}
        clubB={CLUB_B}
        ptsA={cat.ptsA}
        ptsB={cat.ptsB}
      />

      {/* Progress bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 18px 12px",
        background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
      }}>
        <div style={{ flex: 1, height: 3, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${cat.partidos.length > 0 ? (finalizados.length / cat.partidos.length) * 100 : 0}%`,
            background: isLive ? "#bcff00" : "#0f172a",
            borderRadius: 2,
          }} />
        </div>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 700, color: "#94a3b8", whiteSpace: "nowrap",
        }}>{finalizados.length}/{cat.partidos.length} jugados</span>
      </div>

      {/* ── Contenido ── */}
      <div style={{ padding: "0 14px 8px" }}>

        {/* 1. EN VIVO */}
        {enVivo.map((p) => (
          <LiveCard key={p.id} partido={p} />
        ))}

        {/* 2. FIXTURE */}
        {(pendientes.length > 0 || finalizados.length > 0) && (
          <section style={{ paddingTop: 20 }}>
            <SectionLabel label="Fixture" />

            {/* Próximos */}
            {pendientes.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {pendientes.map((p, i) => (
                  <PartidoCard
                    key={p.id} index={i}
                    pairA={p.pairA} pairB={p.pairB}
                    resultado={null} ganador={null}
                    horaInicio={p.horaInicio} sede={p.sede}
                    clubA={CLUB_A} clubB={CLUB_B}
                  />
                ))}
              </div>
            )}

            {/* Resultados — colapsados */}
            {finalizados.length > 0 && (
              <details style={{ marginTop: pendientes.length > 0 ? 0 : 8 }}>
                <summary style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "14px 0", cursor: "pointer", listStyle: "none",
                  borderTop: pendientes.length > 0 ? "1px solid #f1f5f9" : "none",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 11, fontWeight: 700, color: "#94a3b8",
                  WebkitTapHighlightColor: "transparent",
                }}>
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, lineHeight: 1 }}>expand_more</span>
                  Ver {finalizados.length} resultado{finalizados.length !== 1 ? "s" : ""}
                </summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 8 }}>
                  {finalizados.map((p, i) => (
                    <PartidoCard
                      key={p.id} index={i}
                      pairA={p.pairA} pairB={p.pairB}
                      resultado={p.resultado} ganador={p.ganador}
                      horaInicio={p.horaInicio} sede={p.sede}
                      clubA={CLUB_A} clubB={CLUB_B}
                    />
                  ))}
                </div>
              </details>
            )}
          </section>
        )}

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseLive {
          0%   { opacity: 1; transform: scale(1); box-shadow: 0 0 0 2px rgba(188,255,0,0.3); }
          50%  { opacity: 0.7; transform: scale(1.1); box-shadow: 0 0 0 6px rgba(188,255,0,0.1); }
          100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 2px rgba(188,255,0,0.3); }
        }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary span[style*="expand_more"] {
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  )
}

// ─── Sub-componentes ────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <span style={{
      fontFamily: "var(--font-space-grotesk), sans-serif",
      fontSize: 10, fontWeight: 900,
      textTransform: "uppercase", letterSpacing: "0.1em",
      color: "#94a3b8",
    }}>{label}</span>
  )
}

// ─── LiveCard — idéntica al carousel ─────────────────────────────────────────

function LiveCard({ partido: p }: {
  partido: { id: string; pairA: string; pairB: string; resultado: string | null; horaInicio?: string; sede?: string }
}) {
  const sets = p.resultado?.trim().split(/\s+/) ?? []
  const parsed = sets.map(s => { const [a, b] = s.split("-"); return { a: a ?? "–", b: b ?? "–" } })

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{
        background: "#ffffff",
        border: "1.5px solid #bcff00",
        borderRadius: 14, padding: "13px 14px",
        position: "relative", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(188,255,0,0.12)",
      }}>
        {/* Ghost VIVO */}
        <span aria-hidden style={{
          position: "absolute", zIndex: 0,
          right: -4, bottom: -10,
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 58, fontWeight: 400, lineHeight: 1,
          color: "rgba(188,255,0,0.32)", letterSpacing: "-0.02em",
          pointerEvents: "none", userSelect: "none", textTransform: "uppercase",
        }}>VIVO</span>

        {/* Degradado sobre VIVO */}
        <div aria-hidden style={{
          position: "absolute", zIndex: 1,
          inset: 0, pointerEvents: "none",
          background: "linear-gradient(to bottom right, transparent 40%, rgba(255,255,255,0.6) 100%)",
        }} />

        {/* Top row: label ← → sede/hora */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 12,
        }}>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 900, color: "#0f172a",
            textTransform: "uppercase", letterSpacing: "0.12em",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#0f172a", display: "inline-block", flexShrink: 0,
            }} />
            En cancha
          </div>
          {(p.sede || p.horaInicio) && (
            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 10, lineHeight: 1, color: "#0f172a" }}>
                location_on
              </span>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 9, fontWeight: 700, color: "#0f172a", letterSpacing: "0.03em",
              }}>
                {[p.sede, p.horaInicio].filter(Boolean).join(" · ")}
              </span>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column" }}>
          {/* Fila A */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, fontWeight: 900, color: "#0f172a",
              lineHeight: 1.2, textTransform: "uppercase",
              flex: 1, minWidth: 0,
            }}>{p.pairA}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {parsed.map((s, idx) => (
                <span key={idx} style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 18, fontWeight: 400, lineHeight: 1,
                  color: "#0f172a", minWidth: 16, textAlign: "center",
                }}>{s.a}</span>
              ))}
              <span className="live-dot" style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#0f172a", flexShrink: 0,
              }} />
            </div>
          </div>

          {/* Separador */}
          <div style={{ height: 1, background: "#f1f5f9", marginBottom: 8 }} />

          {/* Fila B */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, fontWeight: 900, color: "#0f172a",
              lineHeight: 1.2, textTransform: "uppercase",
              flex: 1, minWidth: 0,
            }}>{p.pairB}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {parsed.map((s, idx) => (
                <span key={idx} style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 18, fontWeight: 400, lineHeight: 1,
                  color: "#0f172a", minWidth: 16, textAlign: "center",
                }}>{s.b}</span>
              ))}
              <span className="live-dot" style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#0f172a", flexShrink: 0,
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── PartidoCard ──────────────────────────────────────────────────────────────

function PartidoCard({
  pairA, pairB, resultado, ganador, horaInicio, sede, clubA, clubB, index,
}: {
  pairA: string
  pairB: string
  resultado: string | null
  ganador: "A" | "B" | null
  horaInicio?: string
  sede?: string
  clubA: Club
  clubB: Club
  index: number
}) {
  const ganadorA = ganador === "A"
  const ganadorB = ganador === "B"
  const sets = resultado?.trim().split(/\s+/) ?? []
  const parsed = sets.map(s => { const [a, b] = s.split("-"); return { a: a ?? "–", b: b ?? "–" } })
  const hasScore = parsed.length > 0
  const sedeColor = sede === "Voleando" ? clubA.color : sede ? clubB.color : "#e2e8f0"

  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #f1f5f9",
      borderRadius: 12,
      padding: "12px 14px",
      animation: "fadeUp 250ms cubic-bezier(0.23,1,0.32,1) both",
      animationDelay: `${Math.min(index, 8) * 40}ms`,
    }}>

      {/* Hora · sede */}
      {(horaInicio || sede) && (
        <div style={{
          display: "flex", alignItems: "center", gap: 4, marginBottom: 10,
        }}>
          <span style={{
            fontFamily: "'Material Symbols Outlined'",
            fontSize: 11, lineHeight: 1, color: sedeColor, flexShrink: 0,
          }}>location_on</span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 9, fontWeight: 700, letterSpacing: "0.04em",
            color: sedeColor,
          }}>{sede}</span>
          {horaInicio && (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 600, color: "#94a3b8",
            }}>· {horaInicio}</span>
          )}
        </div>
      )}

      {/* Fila A */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.08em",
            color: "#94a3b8", border: "1px solid #e2e8f0",
            borderRadius: 3, padding: "1px 4px", flexShrink: 0,
          }}>{clubA.abbr}</span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, lineHeight: 1.3,
            fontWeight: ganadorA ? 900 : 600,
            color: ganadorB ? "#94a3b8" : "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{pairA}</span>
        </div>
        {hasScore && (
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            {parsed.map((s, idx) => (
              <span key={idx} style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 16, fontWeight: 400, lineHeight: 1,
                color: ganadorA ? "#0f172a" : "#94a3b8",
                minWidth: 14, textAlign: "center",
              }}>{s.a}</span>
            ))}
          </div>
        )}
      </div>

      {/* Separador */}
      <div style={{ height: 1, background: "#f8fafc", marginBottom: 8 }} />

      {/* Fila B */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.08em",
            color: "#94a3b8", border: "1px solid #e2e8f0",
            borderRadius: 3, padding: "1px 4px", flexShrink: 0,
          }}>{clubB.abbr}</span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, lineHeight: 1.3,
            fontWeight: ganadorB ? 900 : 600,
            color: ganadorA ? "#94a3b8" : "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{pairB}</span>
        </div>
        {hasScore && (
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            {parsed.map((s, idx) => (
              <span key={idx} style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 16, fontWeight: 400, lineHeight: 1,
                color: ganadorB ? "#0f172a" : "#94a3b8",
                minWidth: 14, textAlign: "center",
              }}>{s.b}</span>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
