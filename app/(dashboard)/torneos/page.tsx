import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function TorneosPage() {
  const supabase = await createClient()

  const { data: torneos } = await supabase
    .from("torneos")
    .select("id, nombre, fecha_inicio, fecha_fin, estado")
    .order("created_at", { ascending: false })

  const estadoLabel: Record<string, string> = {
    borrador: "Borrador",
    inscripcion: "Inscripción abierta",
    en_curso: "En curso",
    finalizado: "Finalizado",
  }

  const estadoColor: Record<string, string> = {
    borrador: "#94a3b8",
    inscripcion: "#0f172a",
    en_curso: "#bcff00",
    finalizado: "#64748b",
  }

  return (
    <div style={{ padding: "24px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "Anton", fontSize: 26, color: "#0f172a", textTransform: "uppercase", marginBottom: 2 }}>
            Torneos
          </h1>
          <p style={{ fontSize: 11, color: "#64748b", fontFamily: "Space Grotesk", fontWeight: 700 }}>
            {torneos?.length ?? 0} torneos creados
          </p>
        </div>
        <Link href="/torneos/nuevo" style={{ padding: "12px 20px", borderRadius: 10, background: "#0f172a", color: "#fff", fontFamily: "Anton", fontSize: 14, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          + Nuevo
        </Link>
      </div>

      {(!torneos || torneos.length === 0) && (
        <div style={{ textAlign: "center", padding: "60px 0", border: "2px dashed #e2e8f0", borderRadius: 16 }}>
          <p style={{ fontFamily: "Anton", fontSize: 20, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>
            Sin torneos todavía
          </p>
          <p style={{ fontSize: 12, color: "#94a3b8", fontFamily: "Space Grotesk" }}>
            Creá tu primer torneo con el botón de arriba
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(torneos ?? []).map((t) => (
          <Link key={t.id} href={`/torneos/${t.id}`} style={{ textDecoration: "none" }}>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h2 style={{ fontFamily: "Anton", fontSize: 20, color: "#0f172a", textTransform: "uppercase" }}>
                  {t.nombre}
                </h2>
                <span style={{ fontSize: 9, fontWeight: 900, fontFamily: "Space Grotesk", textTransform: "uppercase", padding: "4px 10px", borderRadius: 99, background: t.estado === "en_curso" ? "#bcff00" : "#f1f5f9", color: estadoColor[t.estado] ?? "#64748b" }}>
                  {estadoLabel[t.estado] ?? t.estado}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#64748b", fontFamily: "Space Grotesk", fontWeight: 700, marginTop: 6 }}>
                {t.fecha_inicio} → {t.fecha_fin}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
