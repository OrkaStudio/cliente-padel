import type { Categoria } from "@/types/torneo"

type Props = {
  categorias: Categoria[]
  seleccionadas: string[]
  onToggle: (id: string) => void
}

const TIPO_LABEL: Record<string, string> = {
  caballeros: "Caballeros",
  damas: "Damas",
  especial: "Especiales",
}

export function PasoCategorias({ categorias, seleccionadas, onToggle }: Props) {
  const grupos = categorias.reduce<Record<string, Categoria[]>>((acc, cat) => {
    const g = acc[cat.tipo] ?? []
    return { ...acc, [cat.tipo]: [...g, cat] }
  }, {})

  return (
    <div className="flex flex-col gap-6">
      {(["caballeros", "damas", "especial"] as const).map((tipo) => {
        const grupo = grupos[tipo]
        if (!grupo?.length) return null
        return (
          <div key={tipo} className="flex flex-col gap-3">
            <p
              className="text-xs font-black uppercase tracking-widest"
              style={{ fontFamily: "Space Grotesk, sans-serif", color: "#64748b" }}
            >
              {TIPO_LABEL[tipo]}
            </p>
            <div className="flex flex-col gap-2">
              {grupo.map((cat) => {
                const checked = seleccionadas.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onToggle(cat.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: checked ? "#bcff00" : "#e2e8f0",
                      backgroundColor: checked ? "#f0ffe0" : "#ffffff",
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all"
                      style={{
                        borderColor: checked ? "#0f172a" : "#cbd5e1",
                        backgroundColor: checked ? "#0f172a" : "transparent",
                      }}
                    >
                      {checked && (
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path
                            d="M1.5 5.5L4 8L9.5 2.5"
                            stroke="#bcff00"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{
                        fontFamily: "Space Grotesk, sans-serif",
                        color: "#0f172a",
                      }}
                    >
                      {cat.nombre}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
