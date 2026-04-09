import type { Jugador } from "@/types/jugador"
import type { Categoria } from "@/types/torneo"

type Props = {
  jugador: Jugador
  categoria?: Categoria
  torneos?: { nombre: string; fecha_inicio: string }[]
  showContact?: boolean
}

export function JugadorCard({ jugador, categoria, torneos = [], showContact = false }: Props) {
  const iniciales = `${jugador.nombre[0] ?? ""}${jugador.apellido[0] ?? ""}`.toUpperCase()

  const edad = jugador.fecha_nacimiento
    ? Math.floor((Date.now() - new Date(jugador.fecha_nacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 99, background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: "Anton", fontSize: 18, color: "#bcff00" }}>{iniciales}</span>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontFamily: "Anton", fontSize: 20, color: "#0f172a", textTransform: "uppercase", lineHeight: 1.1 }}>
            {jugador.nombre} {jugador.apellido}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            {categoria && (
              <span style={{ fontSize: 9, fontWeight: 900, fontFamily: "Space Grotesk", textTransform: "uppercase", padding: "3px 10px", borderRadius: 99, background: "#f1f5f9", color: "#0f172a" }}>
                {categoria.nombre}
              </span>
            )}
            {edad !== null && edad >= 45 && (
              <span style={{ fontSize: 9, fontWeight: 900, fontFamily: "Space Grotesk", textTransform: "uppercase", padding: "3px 10px", borderRadius: 99, background: "#bcff00", color: "#0f172a" }}>
                VET +{edad >= 55 ? "55" : "45"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Datos de contacto (solo para organizador) */}
      {showContact && (
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, marginBottom: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          {jugador.telefono && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "#64748b", textTransform: "uppercase", fontFamily: "Space Grotesk", width: 70 }}>Teléfono</span>
              <span style={{ fontSize: 13, fontFamily: "Space Grotesk", fontWeight: 600, color: "#0f172a" }}>{jugador.telefono}</span>
            </div>
          )}
          {jugador.email && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "#64748b", textTransform: "uppercase", fontFamily: "Space Grotesk", width: 70 }}>Email</span>
              <span style={{ fontSize: 13, fontFamily: "Space Grotesk", fontWeight: 600, color: "#0f172a" }}>{jugador.email}</span>
            </div>
          )}
          {jugador.fecha_nacimiento && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "#64748b", textTransform: "uppercase", fontFamily: "Space Grotesk", width: 70 }}>Nacimiento</span>
              <span style={{ fontSize: 13, fontFamily: "Space Grotesk", fontWeight: 600, color: "#0f172a" }}>
                {new Date(jugador.fecha_nacimiento).toLocaleDateString("es-AR")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Torneos jugados */}
      {torneos.length > 0 && (
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
          <p style={{ fontSize: 9, fontWeight: 900, color: "#64748b", textTransform: "uppercase", fontFamily: "Space Grotesk", marginBottom: 8 }}>
            Torneos ({torneos.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {torneos.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontFamily: "Anton", color: "#0f172a", textTransform: "uppercase" }}>{t.nombre}</span>
                <span style={{ fontSize: 11, color: "#64748b", fontFamily: "Space Grotesk", fontWeight: 700 }}>{t.fecha_inicio}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {torneos.length === 0 && (
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
          <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "Space Grotesk", fontWeight: 700, textAlign: "center" }}>
            Sin torneos registrados
          </p>
        </div>
      )}
    </div>
  )
}
