import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { CategoriaInterclub, Club } from "@/components/torneos/interclub/CategoriasInterclub"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHref = any

const CLUB_A: Club = { nombre: "Voleando", color: "#0f172a", abbr: "VOL", logoUrl: "/clubes/voleando.logo.png" }
const CLUB_B: Club = { nombre: "Más Pádel", color: "#b45309", abbr: "MP", logoUrl: "/clubes/mas-padel.logo.png" }

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
  const liderA = cat.ptsA > cat.ptsB
  const liderB = cat.ptsB > cat.ptsA

  const enVivo      = cat.partidos.filter((p) => p.estado === "en_vivo")
  const finalizados = cat.partidos.filter((p) => p.estado === "finalizado")
  const pendientes  = cat.partidos.filter((p) => p.estado === "pendiente")

  // Parejas únicas por club
  const parejasA = [...new Set(cat.partidos.map((p) => p.pairA))]
  const parejasB = [...new Set(cat.partidos.map((p) => p.pairB))]

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 60 }}>

      {/* ── Sticky header ── */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "12px 18px",
        position: "sticky", top: 0, zIndex: 10,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Link
          href={`/torneos/${id}/interclub` as AnyHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            color: "#64748b", textDecoration: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 700,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>
            arrow_back
          </span>
          Interclubes
        </Link>

        {isLive && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "#BCFF00", color: "#000",
            padding: "2px 8px", borderRadius: 100,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            <span className="live-dot" style={{
              width: 5, height: 5, borderRadius: "50%", background: "#000",
            }} />
            En vivo
          </span>
        )}
        {isFin && (
          <span style={{
            background: "#f1f5f9", color: "#64748b",
            padding: "2px 8px", borderRadius: 100,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            Finalizado
          </span>
        )}
      </div>

      {/* ── Marcador — split layout igual a HeroMarcador ── */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>

        {/* Nombre categoría */}
        <div style={{ padding: "14px 18px 0", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--font-anton), Anton, sans-serif",
            fontSize: 20, fontWeight: 400, lineHeight: 1,
            color: "#0f172a", textTransform: "uppercase",
            letterSpacing: "0.03em", margin: 0,
          }}>{cat.nombre}</h2>
        </div>

        {/* Split marcador */}
        <div style={{
          display: "flex", alignItems: "stretch",
          margin: "14px 14px 0",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 2px 20px rgba(0,0,0,0.07)",
        }}>
          {/* Club A */}
          <div style={{
            flex: 1, position: "relative",
            background: "#f8fafc",
            display: "flex", flexDirection: "column",
            alignItems: "flex-start", justifyContent: "flex-end",
            padding: "20px 20px 22px",
            overflow: "hidden", minHeight: 130,
          }}>
            {CLUB_A.logoUrl && (
              <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <Image src={CLUB_A.logoUrl} alt="" fill style={{ objectFit: "contain", padding: 16, opacity: 0.45 }} />
              </div>
            )}
            <span style={{
              position: "relative", zIndex: 1,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: liderA ? 62 : 44, fontWeight: 900, lineHeight: 1,
              color: "#0f172a", letterSpacing: "-0.04em",
            }}>{cat.ptsA}</span>
          </div>

          {/* VS divider */}
          <div style={{
            width: 48, background: "#f8fafc", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: 0, bottom: 0, left: "50%",
              width: 1, background: "#e2e8f0", transform: "translateX(-50%)",
            }} />
            <div style={{
              position: "relative", zIndex: 1,
              width: 34, height: 34, borderRadius: "50%",
              background: "#0f172a",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 3px #f8fafc, 0 4px 12px rgba(0,0,0,0.18)",
            }}>
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 9, fontWeight: 900, color: "#BCFF00",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>vs</span>
            </div>
          </div>

          {/* Club B */}
          <div style={{
            flex: 1, position: "relative",
            background: "#f8fafc",
            display: "flex", flexDirection: "column",
            alignItems: "flex-end", justifyContent: "flex-end",
            padding: "20px 20px 22px",
            overflow: "hidden", minHeight: 130,
          }}>
            {CLUB_B.logoUrl && (
              <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <Image src={CLUB_B.logoUrl} alt="" fill style={{ objectFit: "contain", padding: 16, opacity: 0.45 }} />
              </div>
            )}
            <span style={{
              position: "relative", zIndex: 1,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: liderB ? 62 : 44, fontWeight: 900, lineHeight: 1,
              color: "#0f172a", letterSpacing: "-0.04em",
            }}>{cat.ptsB}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px 14px" }}>
          <div style={{ flex: 1, height: 3, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
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
      </div>

      {/* ── Contenido ── */}
      <div style={{ padding: "0 14px 8px" }}>

        {/* 1. EN VIVO — card lime igual al carousel */}
        {enVivo.map((p) => (
          <LiveCard key={p.id} partido={p} clubA={CLUB_A} clubB={CLUB_B} />
        ))}

        {/* 2. EQUIPOS — 2 cards con las parejas */}
        <section style={{ paddingTop: 16 }}>
          <SectionLabel label="Equipos" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <EquipoCard club={CLUB_A} parejas={parejasA} />
            <EquipoCard club={CLUB_B} parejas={parejasB} />
          </div>
        </section>

        {/* 3. FIXTURE */}
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
                    resultado={null} estado="pendiente" ganador={null}
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
                      resultado={p.resultado} estado="finalizado" ganador={p.ganador}
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

function SectionLabel({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
      {accent ? (
        <span className="live-dot" style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#16a34a", flexShrink: 0,
          display: "inline-block",
          boxShadow: "0 0 6px rgba(22,163,74,0.6)",
        }} />
      ) : (
        <div style={{ width: 12, height: 2, borderRadius: 1, background: "#cbd5e1", flexShrink: 0 }} />
      )}
      <span style={{
        fontFamily: "var(--font-space-grotesk), sans-serif",
        fontSize: 10, fontWeight: 900,
        textTransform: "uppercase", letterSpacing: "0.1em",
        color: accent ? "#16a34a" : "#94a3b8",
      }}>{label}</span>
    </div>
  )
}

// ─── LiveCard ────────────────────────────────────────────────────────────────

function LiveCard({ partido: p, clubA, clubB }: {
  partido: { id: string; pairA: string; pairB: string; resultado: string | null; horaInicio?: string; sede?: string }
  clubA: Club; clubB: Club
}) {
  const sets = p.resultado ? p.resultado.trim().split(/\s+/) : []

  return (
    <div style={{ paddingTop: 16 }}>
      <div style={{
        background: "#BCFF00", borderRadius: 14,
        padding: "14px 16px 12px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Ghost VIVO */}
        <span aria-hidden style={{
          position: "absolute", right: -6, bottom: -10,
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 52, fontWeight: 400, lineHeight: 1,
          color: "rgba(0,0,0,0.07)", letterSpacing: "-0.02em",
          pointerEvents: "none", userSelect: "none", textTransform: "uppercase",
        }}>VIVO</span>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#000", display: "inline-block" }} />
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 8, fontWeight: 900, color: "rgba(0,0,0,0.55)",
            textTransform: "uppercase", letterSpacing: "0.12em",
          }}>En cancha ahora</span>
        </div>

        {/* Parejas + score */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <div>
            <span style={{
              display: "inline-block",
              border: "1px solid rgba(0,0,0,0.18)", color: "rgba(0,0,0,0.45)",
              padding: "1px 5px", borderRadius: 3,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 7, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 4,
            }}>{clubA.abbr}</span>
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, fontWeight: 900, color: "#000",
              lineHeight: 1.2, textTransform: "uppercase",
            }}>{p.pairA}</div>
          </div>

          {/* Score */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {sets.length === 0 ? (
              <span style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)",
              }}>vs</span>
            ) : (
              <>
                {sets.slice(0, -1).map((set, idx) => (
                  <span key={idx} style={{
                    fontFamily: "var(--font-anton), Anton, sans-serif",
                    fontSize: 10, color: "rgba(255,255,255,0.85)",
                    background: "rgba(0,0,0,0.45)",
                    borderRadius: 4, padding: "1px 6px",
                    display: "inline-block", whiteSpace: "nowrap",
                  }}>{set}</span>
                ))}
                <span style={{
                  fontFamily: "var(--font-anton), Anton, sans-serif",
                  fontSize: 15, color: "#fff", background: "#000",
                  borderRadius: 6, padding: "2px 9px",
                  display: "inline-block", whiteSpace: "nowrap",
                }}>{sets[sets.length - 1]}</span>
              </>
            )}
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{
              display: "inline-block",
              border: "1px solid rgba(0,0,0,0.18)", color: "rgba(0,0,0,0.45)",
              padding: "1px 5px", borderRadius: 3,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 7, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 4,
            }}>{clubB.abbr}</span>
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, fontWeight: 900, color: "#000",
              lineHeight: 1.2, textTransform: "uppercase", textAlign: "right",
            }}>{p.pairB}</div>
          </div>
        </div>

        {/* Footer: sede + hora */}
        {(p.sede || p.horaInicio) && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 11, lineHeight: 1, color: "rgba(0,0,0,0.5)" }}>
              location_on
            </span>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 700, color: "rgba(0,0,0,0.55)", letterSpacing: "0.04em",
            }}>
              {[p.sede, p.horaInicio].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── EquipoCard ───────────────────────────────────────────────────────────────

function EquipoCard({ club, parejas }: { club: Club; parejas: string[] }) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      {/* Header del club */}
      <div style={{
        background: "#0f172a",
        padding: "8px 12px",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 900, color: "#fff",
          textTransform: "uppercase", letterSpacing: "0.1em",
        }}>{club.nombre}</span>
      </div>

      {/* Lista de parejas */}
      <div style={{ padding: "8px 0" }}>
        {parejas.map((pareja, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "6px 12px",
            borderBottom: i < parejas.length - 1 ? "1px solid #f8fafc" : "none",
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 8, fontWeight: 900, color: "#94a3b8",
              flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 11, fontWeight: 700, color: "#0f172a",
              lineHeight: 1.3,
            }}>{pareja}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Score helpers ────────────────────────────────────────────────────────────

function getScoreInfo(
  resultado: string | null,
  ganador: "A" | "B" | null,
  estado: "pendiente" | "en_vivo" | "finalizado"
): { main: string; detail: string } | null {
  if (!resultado) return null
  const sets = resultado.trim().split(/\s+/)
  if (estado === "en_vivo") {
    const current = sets[sets.length - 1] ?? "–"
    const prev    = sets.slice(0, -1).join(" · ")
    return { main: current, detail: prev }
  }
  if (!ganador) return { main: sets.join(" · "), detail: "" }
  let wA = 0, wB = 0
  sets.forEach(s => {
    const parts = s.split("-").map(Number)
    const a = parts[0] ?? NaN
    const b = parts[1] ?? NaN
    if (!isNaN(a) && !isNaN(b)) { if (a > b) wA++; else if (b > a) wB++ }
  })
  return { main: `${wA} – ${wB}`, detail: sets.join(" · ") }
}

function PartidoCard({
  pairA, pairB, resultado, estado, ganador, horaInicio, sede, clubA, clubB, index,
}: {
  pairA: string
  pairB: string
  resultado: string | null
  estado: "pendiente" | "en_vivo" | "finalizado"
  ganador: "A" | "B" | null
  horaInicio?: string
  sede?: string
  clubA: Club
  clubB: Club
  index: number
}) {
  const isLive   = estado === "en_vivo"
  const isFin    = estado === "finalizado"
  const ganadorA = ganador === "A"
  const ganadorB = ganador === "B"

  // Borde izquierdo por sede: dos tonos del mismo gris-azul de la app
  const sedeColor = sede === "Voleando" ? "#0f172a" : sede ? "#64748b" : "#e2e8f0"
  const accentColor = isLive ? "#bcff00" : sedeColor

  const scoreInfo = getScoreInfo(resultado, ganador, estado)

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      boxShadow: `inset 4px 0 0 ${accentColor}`,
      borderRadius: 12,
      padding: "10px 14px",
      animation: "fadeUp 250ms cubic-bezier(0.23,1,0.32,1) both",
      animationDelay: `${Math.min(index, 8) * 40}ms`,
    }}>

      {/* Metadata: hora · sede */}
      {(horaInicio || sede) && (
        <div style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: 9, fontWeight: 700,
          color: "#94a3b8", letterSpacing: "0.04em",
          marginBottom: 8,
        }}>{[horaInicio, sede].filter(Boolean).join(" · ")}</div>
      )}

      {/* Grid: Club A | score | Club B */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        gap: 10,
      }}>

        {/* Club A */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
          <span style={{
            display: "inline-block", alignSelf: "flex-start",
            border: "1px solid #e2e8f0", color: "#94a3b8",
            padding: "1px 4px", borderRadius: 3,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>{clubA.abbr}</span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: ganadorA ? 900 : 700,
            color: ganadorB ? "#94a3b8" : "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{pairA}</span>
        </div>

        {/* Score / vs — centrado */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
          {scoreInfo ? (
            <>
              <span style={{
                fontFamily: "var(--font-anton), Anton, sans-serif",
                fontSize: 14, fontWeight: 400,
                color: isLive ? "#0f172a" : "#64748b",
                background: isLive ? "#bcff00" : isFin ? "#f1f5f9" : "transparent",
                padding: "1px 8px", borderRadius: 4,
                whiteSpace: "nowrap",
              }}>{scoreInfo.main}</span>
              {scoreInfo.detail && (
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 8, color: "#94a3b8", fontWeight: 600,
                  letterSpacing: "0.02em", whiteSpace: "nowrap",
                }}>{scoreInfo.detail}</span>
              )}
            </>
          ) : (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 900, color: "#cbd5e1",
              letterSpacing: "0.08em",
            }}>vs</span>
          )}
        </div>

        {/* Club B */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end", minWidth: 0 }}>
          <span style={{
            display: "inline-block", alignSelf: "flex-end",
            border: "1px solid #e2e8f0", color: "#94a3b8",
            padding: "1px 4px", borderRadius: 3,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>{clubB.abbr}</span>
          <span style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: ganadorB ? 900 : 700,
            color: ganadorA ? "#94a3b8" : "#0f172a",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            textAlign: "right",
          }}>{pairB}</span>
        </div>

      </div>
    </div>
  )
}
