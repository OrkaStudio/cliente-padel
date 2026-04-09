import { SlotPicker } from "./SlotPicker"
import type { SedeWizardInput, DisponibilidadMap } from "@/types/torneo"

type Props = {
  sedes: SedeWizardInput[]
  duracion_turno: "60" | "90" | "120"
  fechas: string[]
  onChangeSede: (index: 0 | 1, sede: SedeWizardInput) => void
}

function SedeForm({
  sede,
  index,
  duracion_turno,
  fechas,
  onChange,
}: {
  sede: SedeWizardInput
  index: 0 | 1
  duracion_turno: string
  fechas: string[]
  onChange: (s: SedeWizardInput) => void
}) {
  return (
    <div
      className="flex flex-col gap-4 p-4 rounded-xl border"
      style={{ borderColor: "#e2e8f0", backgroundColor: "#ffffff" }}
    >
      <p
        className="text-xs font-black uppercase tracking-widest"
        style={{ fontFamily: "Space Grotesk, sans-serif", color: "#64748b" }}
      >
        Sede {index + 1}
      </p>

      <div className="flex flex-col gap-1">
        <label className="field-label">Nombre</label>
        <input
          type="text"
          className="field-input"
          placeholder="Ej: Club El Palomar"
          value={sede.nombre}
          onChange={(e) => onChange({ ...sede, nombre: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="field-label">Horario inicio</label>
          <input
            type="time"
            className="field-input"
            value={sede.horario_inicio}
            onChange={(e) => onChange({ ...sede, horario_inicio: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="field-label">Horario fin</label>
          <input
            type="time"
            className="field-input"
            value={sede.horario_fin}
            min={sede.horario_inicio}
            onChange={(e) => onChange({ ...sede, horario_fin: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="field-label">Disponibilidad de slots</label>
        <SlotPicker
          disponibilidad={sede.disponibilidad as DisponibilidadMap}
          horario_inicio={sede.horario_inicio}
          horario_fin={sede.horario_fin}
          duracion_turno={duracion_turno}
          fechas={fechas}
          onChange={(disp) => onChange({ ...sede, disponibilidad: disp })}
        />
      </div>
    </div>
  )
}

export function PasoSedes({ sedes, duracion_turno, fechas, onChangeSede }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {([0, 1] as const).map((i) => (
        <SedeForm
          key={i}
          sede={sedes[i]}
          index={i}
          duracion_turno={duracion_turno}
          fechas={fechas}
          onChange={(s) => onChangeSede(i, s)}
        />
      ))}
    </div>
  )
}
