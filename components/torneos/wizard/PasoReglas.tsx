import type { Categoria, ReglaInput } from "@/types/torneo"

type ReglaSinId = Omit<ReglaInput, "categoria_id">

type Props = {
  categorias: Categoria[]
  seleccionadas: string[]
  reglas: Record<string, ReglaSinId>
  onUpdateRegla: (categoriaId: string, regla: ReglaSinId) => void
}

type PillGroupProps<T extends string> = {
  label: string
  value: T | undefined
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}

function PillGroup<T extends string>({ label, value, options, onChange }: PillGroupProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <p
        className="text-[10px] font-black uppercase tracking-widest"
        style={{ fontFamily: "Space Grotesk, sans-serif", color: "#64748b" }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              backgroundColor: value === opt.value ? "#0f172a" : "#f1f5f9",
              color: value === opt.value ? "#bcff00" : "#64748b",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const FORMATO_OPTIONS: { value: ReglaInput["formato"]; label: string }[] = [
  { value: "grupos_playoff", label: "Grupos + Playoff" },
  { value: "americano", label: "Americano" },
  { value: "eliminacion_directa", label: "Elim. Directa" },
  { value: "interclub", label: "Interclub" },
]

const SETS_OPTIONS: { value: ReglaInput["sets"]; label: string }[] = [
  { value: "best_2", label: "Best 2" },
  { value: "best_3", label: "Best 3" },
]

const TERCER_SET_OPTIONS: { value: ReglaInput["tercer_set"]; label: string }[] = [
  { value: "completo", label: "Completo" },
  { value: "tie_break", label: "Tie-Break" },
  { value: "super_tie_break", label: "Super Tie-Break" },
]

export function PasoReglas({ categorias, seleccionadas, reglas, onUpdateRegla }: Props) {
  const catMap = Object.fromEntries(categorias.map((c) => [c.id, c]))

  return (
    <div className="flex flex-col gap-4">
      {seleccionadas.map((catId) => {
        const cat = catMap[catId]
        const regla = reglas[catId] ?? {}
        return (
          <div
            key={catId}
            className="flex flex-col gap-4 p-4 rounded-xl border"
            style={{ borderColor: "#e2e8f0", backgroundColor: "#ffffff" }}
          >
            <p
              className="text-sm font-black uppercase tracking-wider"
              style={{ fontFamily: "Anton, sans-serif", color: "#0f172a" }}
            >
              {cat?.nombre ?? catId}
            </p>

            <PillGroup
              label="Formato"
              value={regla.formato}
              options={FORMATO_OPTIONS}
              onChange={(v) => onUpdateRegla(catId, { ...regla, formato: v })}
            />
            <PillGroup
              label="Sets"
              value={regla.sets}
              options={SETS_OPTIONS}
              onChange={(v) => onUpdateRegla(catId, { ...regla, sets: v })}
            />
            <PillGroup
              label="3er Set"
              value={regla.tercer_set}
              options={TERCER_SET_OPTIONS}
              onChange={(v) => onUpdateRegla(catId, { ...regla, tercer_set: v })}
            />
          </div>
        )
      })}
    </div>
  )
}
