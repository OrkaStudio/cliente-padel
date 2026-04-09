type DatosInput = {
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  costo_inscripcion: number
  duracion_turno: "60" | "90" | "120"
}

type Props = {
  datos: DatosInput | null
  onChange: (datos: DatosInput) => void
}

const empty: DatosInput = {
  nombre: "",
  fecha_inicio: "",
  fecha_fin: "",
  costo_inscripcion: 0,
  duracion_turno: "90",
}

export function PasoDatos({ datos, onChange }: Props) {
  const values = datos ?? empty

  function update(field: keyof DatosInput, value: string | number) {
    onChange({ ...values, [field]: value })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label className="field-label">Nombre del torneo</label>
        <input
          type="text"
          className="field-input"
          placeholder="Ej: Torneo Primavera 2026"
          value={values.nombre}
          onChange={(e) => update("nombre", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="field-label">Fecha inicio</label>
          <input
            type="date"
            className="field-input"
            value={values.fecha_inicio}
            onChange={(e) => update("fecha_inicio", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="field-label">Fecha fin</label>
          <input
            type="date"
            className="field-input"
            value={values.fecha_fin}
            min={values.fecha_inicio}
            onChange={(e) => update("fecha_fin", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="field-label">Costo inscripción ($)</label>
          <input
            type="number"
            className="field-input"
            min={0}
            value={values.costo_inscripcion}
            onChange={(e) => update("costo_inscripcion", Number(e.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="field-label">Duración de turno</label>
          <select
            className="field-input"
            value={values.duracion_turno}
            onChange={(e) => update("duracion_turno", e.target.value as DatosInput["duracion_turno"])}
          >
            <option value="60">60 min</option>
            <option value="90">90 min</option>
            <option value="120">120 min</option>
          </select>
        </div>
      </div>
    </div>
  )
}
