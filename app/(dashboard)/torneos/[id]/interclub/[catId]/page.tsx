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
      { id: "p7", pairA: "Peralta / Luna", pairB: "Campos / Bravo", resultado: "4-3", ganador: null, estado: "en_vivo" },
      { id: "p8", pairA: "Peralta / Luna", pairB: "Herrera / Sosa", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "3", nombre: "Mixtos A", estado: "en_vivo", ptsA: 0, ptsB: 2,
    partidos: [
      { id: "p9", pairA: "García / Vega", pairB: "Martín / Paz", resultado: "3-6 2-6", ganador: "B", estado: "finalizado" },
      { id: "p10", pairA: "García / Vega", pairB: "Núñez / Reyes", resultado: "1-6 2-6", ganador: "B", estado: "finalizado" },
      { id: "p11", pairA: "Castro / Medina", pairB: "Martín / Paz", resultado: "5-4", ganador: null, estado: "en_vivo" },
      { id: "p12", pairA: "Castro / Medina", pairB: "Núñez / Reyes", resultado: null, ganador: null, estado: "pendiente" },
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
      { id: "p22", pairA: "Molina / Quiroga", pairB: "Aguilar / Rojas", resultado: "4-2", ganador: null, estado: "en_vivo" },
      { id: "p23", pairA: "Navarro / Palacios", pairB: "Espinoza / Vidal", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p24", pairA: "Navarro / Palacios", pairB: "Aguilar / Rojas", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "7", nombre: "Cuarta", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p25", pairA: "Álvarez / Carrizo", pairB: "Cabrera / Delgado", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p26", pairA: "Álvarez / Carrizo", pairB: "Fuentes / Guerrero", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p27", pairA: "Méndez / Peña", pairB: "Cabrera / Delgado", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p28", pairA: "Méndez / Peña", pairB: "Fuentes / Guerrero", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "8", nombre: "Tercera", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p29", pairA: "Heredia / Ávila", pairB: "Paredes / Solís", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p30", pairA: "Heredia / Ávila", pairB: "Tapia / Contreras", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p31", pairA: "Salas / Figueroa", pairB: "Paredes / Solís", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p32", pairA: "Salas / Figueroa", pairB: "Tapia / Contreras", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "9", nombre: "Segunda", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p33", pairA: "Córdoba / Mena", pairB: "Ríos / Sandoval", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p34", pairA: "Córdoba / Mena", pairB: "Zamora / Villareal", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p35", pairA: "Lagos / Bustos", pairB: "Ríos / Sandoval", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p36", pairA: "Lagos / Bustos", pairB: "Zamora / Villareal", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "10", nombre: "Primera", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p37", pairA: "Muñoz / Serrano", pairB: "Cáceres / Valdivia", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p38", pairA: "Muñoz / Serrano", pairB: "Jiménez / Pedraza", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p39", pairA: "Arce / Escobar", pairB: "Cáceres / Valdivia", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p40", pairA: "Arce / Escobar", pairB: "Jiménez / Pedraza", resultado: null, ganador: null, estado: "pendiente" },
    ],
  },
  {
    id: "11", nombre: "Mixtos B", estado: "pendiente", ptsA: 0, ptsB: 0,
    partidos: [
      { id: "p41", pairA: "Ibarra / Leiva", pairB: "Neira / Poblete", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p42", pairA: "Ibarra / Leiva", pairB: "Quintero / Robles", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p43", pairA: "Trujillo / Uribe", pairB: "Neira / Poblete", resultado: null, ganador: null, estado: "pendiente" },
      { id: "p44", pairA: "Trujillo / Uribe", pairB: "Quintero / Robles", resultado: null, ganador: null, estado: "pendiente" },
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
  const isFin = cat.estado === "finalizado"
  const liderA = cat.ptsA > cat.ptsB
  const liderB = cat.ptsB > cat.ptsA

  const parejasA = [...new Set(cat.partidos.map((p) => p.pairA))]
  const parejasB = [...new Set(cat.partidos.map((p) => p.pairB))]

  const enVivo = cat.partidos.filter((p) => p.estado === "en_vivo")
  const finalizados = cat.partidos.filter((p) => p.estado === "finalizado")
  const pendientes = cat.partidos.filter((p) => p.estado === "pendiente")

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", paddingBottom: 60 }}>

      {/* Header nav */}
      <div style={{
        background: "#ffffff", borderBottom: "1px solid #e2e8f0",
        padding: "12px 18px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link
          href={`/torneos/${id}/interclub` as AnyHref}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: "#64748b", textDecoration: "none",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12, fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.06em",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>arrow_back</span>
          Interclubes
        </Link>
      </div>

      {/* Hero categoría */}
      <div style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "24px 18px 28px",
      }}>
        {/* Badge estado */}
        <div style={{ marginBottom: 12 }}>
          {isLive && (
            <span style={{
              background: "#BCFF00", color: "#000",
              padding: "3px 10px", borderRadius: 2,
              fontSize: 9, fontWeight: 900,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              textTransform: "uppercase", letterSpacing: "0.12em",
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#000" }} />
              En juego
            </span>
          )}
          {isFin && (
            <span style={{
              background: "#f1f5f9", color: "#64748b",
              padding: "3px 10px", borderRadius: 2,
              fontSize: 9, fontWeight: 900,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              textTransform: "uppercase", letterSpacing: "0.12em",
              display: "inline-block",
            }}>
              Finalizado
            </span>
          )}
          {cat.estado === "pendiente" && (
            <span style={{
              background: "#f8fafc", color: "#94a3b8",
              border: "1px solid #e2e8f0",
              padding: "3px 10px", borderRadius: 2,
              fontSize: 9, fontWeight: 900,
              fontFamily: "var(--font-space-grotesk), sans-serif",
              textTransform: "uppercase", letterSpacing: "0.12em",
              display: "inline-block",
            }}>
              Pendiente
            </span>
          )}
        </div>

        {/* Nombre categoría */}
        <h1 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 36, fontWeight: 400, lineHeight: 1,
          color: "#0f172a", textTransform: "uppercase",
          margin: "0 0 24px",
        }}>
          {cat.nombre}
        </h1>

        {/* Marcador con logos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>

          {/* Club A */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: "#f8fafc",
              border: `2px solid ${liderA ? "#BCFF00" : "#e2e8f0"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", position: "relative",
              boxShadow: liderA ? "0 0 0 3px rgba(188,255,0,0.2)" : "none",
            }}>
              {CLUB_A.logoUrl
                ? <Image src={CLUB_A.logoUrl} alt={CLUB_A.nombre} fill style={{ objectFit: "contain", padding: 4 }} />
                : <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 14, color: "#0f172a" }}>{CLUB_A.abbr}</span>
              }
            </div>
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 900, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}>
              {CLUB_A.nombre}
            </div>
            <div style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 72, fontWeight: 400, lineHeight: 1,
              color: liderA ? "#0f172a" : "#cbd5e1",
              letterSpacing: "-0.03em",
            }}>
              {cat.ptsA}
            </div>
          </div>

          {/* VS */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 1, height: 16, background: "#e2e8f0" }} />
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 10, fontWeight: 900, color: "#94a3b8",
              textTransform: "uppercase",
            }}>VS</span>
            <div style={{ width: 1, height: 16, background: "#e2e8f0" }} />
          </div>

          {/* Club B */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: "#f8fafc",
              border: `2px solid ${liderB ? "#BCFF00" : "#e2e8f0"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", position: "relative",
              boxShadow: liderB ? "0 0 0 3px rgba(188,255,0,0.2)" : "none",
            }}>
              {CLUB_B.logoUrl
                ? <Image src={CLUB_B.logoUrl} alt={CLUB_B.nombre} fill style={{ objectFit: "contain", padding: 4 }} />
                : <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 14, color: "#0f172a" }}>{CLUB_B.abbr}</span>
              }
            </div>
            <div style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 9, fontWeight: 900, color: "#64748b",
              textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right",
            }}>
              {CLUB_B.nombre}
            </div>
            <div style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 72, fontWeight: 400, lineHeight: 1,
              color: liderB ? "#0f172a" : "#cbd5e1",
              letterSpacing: "-0.03em", textAlign: "right",
            }}>
              {cat.ptsB}
            </div>
          </div>
        </div>
      </div>

      {/* Parejas */}
      <div style={{ padding: "24px 18px 0" }}>
        <SectionTitle>Parejas</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
          {/* Club A */}
          <div style={{
            background: "#ffffff", borderRadius: 10,
            border: `2px solid ${liderA ? "#BCFF00" : "#e2e8f0"}`,
            padding: "14px",
            boxShadow: liderA ? "0 2px 8px rgba(188,255,0,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 5,
                background: "#f8fafc", border: "1px solid #e2e8f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden", flexShrink: 0,
              }}>
                {CLUB_A.logoUrl
                  ? <Image src={CLUB_A.logoUrl} alt={CLUB_A.nombre} fill style={{ objectFit: "contain", padding: 2 }} />
                  : null
                }
              </div>
              <div style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 8, fontWeight: 900,
                color: liderA ? "#0f172a" : "#64748b",
                textTransform: "uppercase", letterSpacing: "0.12em",
              }}>
                {CLUB_A.nombre}
              </div>
            </div>
            {parejasA.map((pareja) => (
              <div key={pareja} style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 6, paddingLeft: 8,
                borderLeft: "2px solid #0f172a",
              }}>
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, fontWeight: 700,
                  color: "#0f172a", lineHeight: 1.3,
                }}>
                  {pareja}
                </span>
              </div>
            ))}
          </div>

          {/* Club B */}
          <div style={{
            background: "#ffffff", borderRadius: 10,
            border: `2px solid ${liderB ? "#BCFF00" : "#e2e8f0"}`,
            padding: "14px",
            boxShadow: liderB ? "0 2px 8px rgba(188,255,0,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 5,
                background: "#f8fafc", border: "1px solid #e2e8f0",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden", flexShrink: 0,
              }}>
                {CLUB_B.logoUrl
                  ? <Image src={CLUB_B.logoUrl} alt={CLUB_B.nombre} fill style={{ objectFit: "contain", padding: 2 }} />
                  : null
                }
              </div>
              <div style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 8, fontWeight: 900,
                color: liderB ? "#0f172a" : "#64748b",
                textTransform: "uppercase", letterSpacing: "0.12em",
              }}>
                {CLUB_B.nombre}
              </div>
            </div>
            {parejasB.map((pareja) => (
              <div key={pareja} style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 6, paddingLeft: 8,
                borderLeft: "2px solid #b45309",
              }}>
                <span style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 12, fontWeight: 700,
                  color: "#0f172a", lineHeight: 1.3,
                }}>
                  {pareja}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partidos en vivo */}
      {enVivo.length > 0 && (
        <div style={{ padding: "24px 18px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: "#16a34a",
              display: "inline-block", boxShadow: "0 0 8px rgba(22,163,74,0.5)",
            }} />
            <SectionTitle>En cancha</SectionTitle>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {enVivo.map((p) => (
              <PartidoCard key={p.id} pairA={p.pairA} pairB={p.pairB}
                resultado={p.resultado} estado="en_vivo" ganador={null} />
            ))}
          </div>
        </div>
      )}

      {/* Próximos */}
      {pendientes.length > 0 && (
        <div style={{ padding: "24px 18px 0" }}>
          <SectionTitle>Próximos partidos</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {pendientes.map((p) => (
              <PartidoCard key={p.id} pairA={p.pairA} pairB={p.pairB}
                resultado={null} estado="pendiente" ganador={null} />
            ))}
          </div>
        </div>
      )}

      {/* Resultados */}
      {finalizados.length > 0 && (
        <div style={{ padding: "24px 18px 0" }}>
          <SectionTitle>Resultados</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            {finalizados.map((p) => (
              <PartidoCard key={p.id} pairA={p.pairA} pairB={p.pairB}
                resultado={p.resultado} estado="finalizado" ganador={p.ganador} />
            ))}
          </div>
        </div>
      )}

      {/* Fixture */}
      <div style={{ padding: "24px 18px 0" }}>
        <SectionTitle>Fixture</SectionTitle>
        <div style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "32%" }} />
              {parejasB.map((_, i) => (
                <col key={i} style={{ width: `${68 / parejasB.length}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th style={{
                  padding: "8px 10px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 8, fontWeight: 900, color: "#94a3b8",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  textAlign: "left",
                }}>
                  {CLUB_A.abbr} ↓ / {CLUB_B.abbr} →
                </th>
                {parejasB.map((pareja) => (
                  <th key={pareja} style={{
                    padding: "8px 6px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 10, fontWeight: 700, color: "#0f172a",
                    textAlign: "center", lineHeight: 1.3,
                  }}>
                    {pareja.split(" / ").map((n, i) => (
                      <div key={i}>{n}</div>
                    ))}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parejasA.map((pA) => (
                <tr key={pA}>
                  <td style={{
                    padding: "8px 10px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: 10, fontWeight: 700, color: "#0f172a", lineHeight: 1.3,
                  }}>
                    {pA.split(" / ").map((n, i) => (
                      <div key={i}>{n}</div>
                    ))}
                  </td>
                  {parejasB.map((pB) => {
                    const partido = cat.partidos.find((p) => p.pairA === pA && p.pairB === pB)
                    return (
                      <td key={pB} style={{
                        padding: "8px 6px",
                        background: partido?.estado === "en_vivo"
                          ? "#fefce8"
                          : "#ffffff",
                        border: partido?.estado === "en_vivo"
                          ? "1px solid #BCFF00"
                          : "1px solid #e2e8f0",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}>
                        {!partido ? (
                          <span style={{ color: "#e2e8f0", fontSize: 12 }}>–</span>
                        ) : partido.estado === "finalizado" ? (
                          <div>
                            <div style={{
                              fontFamily: "var(--font-space-grotesk), sans-serif",
                              fontSize: 11, fontWeight: 900,
                              color: "#0f172a",
                              letterSpacing: "0.02em",
                            }}>
                              {partido.resultado}
                            </div>
                            <div style={{
                              fontFamily: "var(--font-space-grotesk), sans-serif",
                              fontSize: 8, fontWeight: 900,
                              color: partido.ganador === "A" ? "#16a34a"
                                : partido.ganador === "B" ? "#dc2626"
                                : "#94a3b8",
                              textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3,
                              background: partido.ganador === "A" ? "rgba(22,163,74,0.08)"
                                : partido.ganador === "B" ? "rgba(220,38,38,0.08)"
                                : "transparent",
                              borderRadius: 2, padding: "1px 3px",
                              display: "inline-block",
                            }}>
                              {partido.ganador === "A" ? CLUB_A.abbr
                                : partido.ganador === "B" ? CLUB_B.abbr
                                : "–"}
                            </div>
                          </div>
                        ) : partido.estado === "en_vivo" ? (
                          <div>
                            <div style={{
                              fontFamily: "var(--font-anton), Anton, sans-serif",
                              fontSize: 15, fontWeight: 400,
                              color: "#0f172a",
                              background: "#BCFF00",
                              borderRadius: 4, padding: "1px 6px",
                              display: "inline-block",
                            }}>
                              {partido.resultado ?? "–"}
                            </div>
                          </div>
                        ) : (
                          <span style={{
                            fontFamily: "var(--font-space-grotesk), sans-serif",
                            fontSize: 11, color: "#cbd5e1",
                          }}>—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--font-anton), Anton, sans-serif",
      fontSize: 20, fontWeight: 400, textTransform: "uppercase",
      letterSpacing: "0.05em", margin: 0, color: "#0f172a",
    }}>
      {children}
    </h2>
  )
}

function PartidoCard({
  pairA, pairB, resultado, estado, ganador,
}: {
  pairA: string
  pairB: string
  resultado: string | null
  estado: "pendiente" | "en_vivo" | "finalizado"
  ganador: "A" | "B" | null
}) {
  const isLive = estado === "en_vivo"
  const isFin = estado === "finalizado"

  return (
    <div style={{
      background: "#ffffff",
      border: isLive ? "2px solid #BCFF00" : "1px solid #e2e8f0",
      borderRadius: 10, padding: "12px 14px",
      boxShadow: isLive ? "0 2px 10px rgba(188,255,0,0.15)" : "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
        {/* Pareja A */}
        <div>
          <span style={{
            display: "inline-block",
            background: "#0f172a", color: "#ffffff",
            padding: "1px 6px", borderRadius: 3,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: 5,
          }}>
            {CLUB_A.abbr}
          </span>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12,
            fontWeight: ganador === "A" ? 900 : 700,
            color: ganador === "A" ? "#0f172a" : ganador === "B" ? "#94a3b8" : "#334155",
            lineHeight: 1.3,
          }}>
            {pairA}
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: "center" }}>
          {isFin && (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, fontWeight: 900,
              color: "#0f172a", letterSpacing: "0.04em",
            }}>
              {resultado}
            </span>
          )}
          {isLive && (
            <span style={{
              fontFamily: "var(--font-anton), Anton, sans-serif",
              fontSize: 18, fontWeight: 400,
              color: "#000",
              background: "#BCFF00",
              borderRadius: 6, padding: "2px 8px",
              display: "inline-block",
              letterSpacing: "0.02em",
            }}>
              {resultado ?? "–"}
            </span>
          )}
          {estado === "pendiente" && (
            <span style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13, color: "#e2e8f0",
            }}>—</span>
          )}
        </div>

        {/* Pareja B */}
        <div style={{ textAlign: "right" }}>
          <span style={{
            display: "inline-block",
            background: "#b45309", color: "#ffffff",
            padding: "1px 6px", borderRadius: 3,
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 7, fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: 5,
          }}>
            {CLUB_B.abbr}
          </span>
          <div style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: 12,
            fontWeight: ganador === "B" ? 900 : 700,
            color: ganador === "B" ? "#0f172a" : ganador === "A" ? "#94a3b8" : "#334155",
            lineHeight: 1.3,
          }}>
            {pairB}
          </div>
        </div>
      </div>
    </div>
  )
}
