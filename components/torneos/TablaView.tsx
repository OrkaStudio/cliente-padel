"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Chip } from "@/components/ui/padel/Chip"

interface Categoria { id: string; nombre: string; tipo: string; tcId: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Grupo { id: string; nombre: string; torneo_categoria_id: string; grupo_parejas: any[] }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Partido { id: string; pareja1_id: string; pareja2_id: string; resultado: any; estado: string; categoria_id: string }

function formatPareja(pareja: { jugador1: { nombre: string; apellido: string } | null; jugador2: { nombre: string; apellido: string } | null } | null) {
  if (!pareja) return "—"
  const j1 = pareja.jugador1 ? `${pareja.jugador1.apellido} / ` : ""
  const j2 = pareja.jugador2 ? pareja.jugador2.apellido : ""
  return `${j1}${j2}` || "—"
}

function calcStats(parejaId: string, partidos: Partido[]) {
  const propios = partidos.filter(p => p.pareja1_id === parejaId || p.pareja2_id === parejaId)
  let mp = 0, w = 0, l = 0, gf = 0, gc = 0
  propios.forEach(p => {
    if (!p.resultado) return
    mp++
    const soy1 = p.pareja1_id === parejaId
    const sets1 = p.resultado?.sets_pareja1 ?? 0
    const sets2 = p.resultado?.sets_pareja2 ?? 0
    if (soy1) { gf += sets1; gc += sets2; if (sets1 > sets2) w++; else l++ }
    else { gf += sets2; gc += sets1; if (sets2 > sets1) w++; else l++ }
  })
  return { mp, w, l, sd: gf - gc, pts: w * 3 }
}

export function TablaView({ categorias, grupos, partidos, initialCatId }: {
  categorias: Categoria[]
  grupos: Grupo[]
  partidos: Partido[]
  initialCatId: string | null
}) {
  const [selCatId, setSelCatId] = useState<string | null>(initialCatId)
  const router = useRouter()
  const pathname = usePathname()

  const selectCat = (id: string | null) => {
    setSelCatId(id)
    const url = id ? `${pathname}?cat=${id}` : pathname
    router.replace(url, { scroll: false })
  }

  const activeCats = selCatId ? categorias.filter(c => c.id === selCatId) : categorias

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Chips sticky */}
      <div style={{
        position: "sticky", top: 48, zIndex: 40,
        background: "rgba(248,250,252,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #cbd5e1", padding: "8px 0",
      }}>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "0 16px" }}>
          <Chip small active={!selCatId} onClick={() => selectCat(null)}>Todas</Chip>
          {categorias.map(c => (
            <Chip key={c.id} small active={selCatId === c.id} onClick={() => selectCat(c.id)}>
              {c.nombre}
            </Chip>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px 0" }}>
        {activeCats.map(cat => {
          const catGrupos = grupos.filter(g => g.torneo_categoria_id === cat.tcId)
          if (catGrupos.length === 0) return (
            <div key={cat.id} style={{ marginBottom: 28 }}>
              <CatHeader cat={cat} />
              <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "var(--font-space-grotesk), sans-serif", padding: "12px 0" }}>
                Sin grupos generados aún
              </p>
            </div>
          )
          return (
            <div key={cat.id} style={{ marginBottom: 28 }}>
              <CatHeader cat={cat} />
              {catGrupos.map(grupo => (
                <GrupoTable
                  key={grupo.id}
                  grupo={grupo}
                  partidos={partidos.filter(p => p.categoria_id === cat.id)}
                />
              ))}
            </div>
          )
        })}

        {activeCats.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, display: "block" }}>leaderboard</span>
            <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 13, marginTop: 8 }}>Sin datos de tabla todavía</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CatHeader({ cat }: { cat: Categoria }) {
  const TAG: Record<string, string> = { caballeros: "MASC", damas: "FEM", especial: "ESP" }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <span style={{
        fontFamily: "var(--font-anton), Anton, sans-serif",
        fontSize: 20, fontWeight: 400, color: "#0f172a",
        textTransform: "uppercase", letterSpacing: "0.02em",
      }}>
        {cat.nombre}
      </span>
      <span style={{
        background: "#f1f5f9", border: "1px solid #e2e8f0",
        padding: "2px 10px", borderRadius: 4,
        fontSize: 9, fontWeight: 900, color: "#64748b",
        fontFamily: "var(--font-space-grotesk), sans-serif",
      }}>
        {TAG[cat.tipo] ?? "CAT"}
      </span>
    </div>
  )
}

function GrupoTable({ grupo, partidos }: { grupo: Grupo; partidos: Partido[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (grupo.grupo_parejas ?? []).map((gp: any) => {
    const stats = calcStats(gp.parejas?.id, partidos)
    return {
      pareja: gp.parejas,
      ...stats,
    }
  }).sort((a, b) => b.pts - a.pts || b.w - a.w)

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 4, height: 18, background: "#0f172a", borderRadius: 2 }} />
        <h3 style={{
          fontFamily: "var(--font-anton), Anton, sans-serif",
          fontSize: 14, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0,
        }}>
          GRUPO {grupo.nombre}
        </h3>
        <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
        <span style={{ fontSize: 9, fontWeight: 900, color: "#64748b", fontFamily: "var(--font-space-grotesk), sans-serif", textTransform: "uppercase" }}>
          Top 2 avanzan →
        </span>
      </div>

      <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "28px 1fr 24px 20px 20px 28px 28px",
          padding: "8px 12px", background: "#f8fafc",
          gap: 4, borderBottom: "1px solid #e2e8f0",
        }}>
          {["#", "PAREJA", "PJ", "G", "P", "DS", "PT"].map(h => (
            <span key={h} style={{
              fontSize: 9, fontWeight: 900, color: "#64748b",
              letterSpacing: "0.05em", fontFamily: "var(--font-space-grotesk), sans-serif",
            }}>{h}</span>
          ))}
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: "16px 12px", textAlign: "center" }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "var(--font-space-grotesk), sans-serif" }}>Sin parejas asignadas</span>
          </div>
        ) : rows.map((r, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "28px 1fr 24px 20px 20px 28px 28px",
            padding: "12px 12px", gap: 4, alignItems: "center",
            background: i % 2 === 0 ? "#fff" : "#f8fafc",
            borderLeft: i < 2 ? "4px solid #bcff00" : "4px solid transparent",
            borderBottom: i < rows.length - 1 ? "1px solid #e2e8f0" : "none",
          }}>
            <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontWeight: 400, fontSize: 16, color: i < 2 ? "#0f172a" : "#64748b" }}>
              {i + 1}
            </span>
            <span style={{ fontWeight: 700, fontSize: 12, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {formatPareja(r.pareja)}
            </span>
            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "var(--font-space-grotesk), sans-serif" }}>{r.mp}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", fontFamily: "var(--font-space-grotesk), sans-serif" }}>{r.w}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: r.l > 0 ? "#ef4444" : "#64748b", fontFamily: "var(--font-space-grotesk), sans-serif" }}>{r.l}</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: r.sd >= 0 ? "#16a34a" : "#ef4444", fontFamily: "var(--font-space-grotesk), sans-serif" }}>
              {r.sd >= 0 ? `+${r.sd}` : r.sd}
            </span>
            <span style={{ fontFamily: "var(--font-anton), Anton, sans-serif", fontSize: 16, fontWeight: 400, color: "#0f172a" }}>{r.pts}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
