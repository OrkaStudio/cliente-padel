"use client"

import { useReducer } from "react"
import { useRouter } from "next/navigation"
import { useServerAction } from "zsa-react"
import { crearTorneoAction } from "@/actions/torneos.actions"
import { StepIndicator } from "./StepIndicator"
import { PasoDatos } from "./PasoDatos"
import { PasoSedes } from "./PasoSedes"
import { PasoCategorias } from "./PasoCategorias"
import { PasoReglas } from "./PasoReglas"
import type { Categoria, WizardState, SedeWizardInput } from "@/types/torneo"
import type { ReglaInput } from "@/types/torneo"

type ReglaSinId = Omit<ReglaInput, "categoria_id">

type Action =
  | { type: "SET_STEP"; payload: 1 | 2 | 3 | 4 }
  | { type: "UPDATE_DATOS"; payload: WizardState["datos"] }
  | { type: "UPDATE_SEDE"; payload: { index: 0 | 1; sede: SedeWizardInput } }
  | { type: "TOGGLE_CATEGORIA"; payload: string }
  | { type: "UPDATE_REGLA"; payload: { categoriaId: string; regla: ReglaSinId } }

const emptySede: SedeWizardInput = {
  nombre: "",
  horario_inicio: "",
  horario_fin: "",
  disponibilidad: {},
}

function init(): WizardState {
  return {
    step: 1,
    datos: null,
    sedes: [{ ...emptySede }, { ...emptySede }],
    categorias: [],
    reglas: {},
  }
}

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload }
    case "UPDATE_DATOS":
      return { ...state, datos: action.payload }
    case "UPDATE_SEDE": {
      const sedes = [...state.sedes] as SedeWizardInput[]
      sedes[action.payload.index] = action.payload.sede
      return { ...state, sedes }
    }
    case "TOGGLE_CATEGORIA": {
      const id = action.payload
      const current = state.categorias
      const categorias = current.includes(id)
        ? current.filter((c) => c !== id)
        : [...current, id]
      return { ...state, categorias }
    }
    case "UPDATE_REGLA":
      return {
        ...state,
        reglas: {
          ...state.reglas,
          [action.payload.categoriaId]: action.payload.regla,
        },
      }
    default:
      return state
  }
}

function generarFechas(inicio: string, fin: string): string[] {
  if (!inicio || !fin || inicio > fin) return []
  const fechas: string[] = []
  const cursor = new Date(inicio + "T12:00:00")
  const end = new Date(fin + "T12:00:00")
  while (cursor <= end) {
    fechas.push(cursor.toISOString().split("T")[0])
    cursor.setDate(cursor.getDate() + 1)
  }
  return fechas
}

function canProceed(state: WizardState): boolean {
  const { step, datos, sedes, categorias, reglas } = state
  if (step === 1) {
    if (!datos) return false
    return (
      datos.nombre.trim().length > 0 &&
      datos.fecha_inicio.length > 0 &&
      datos.fecha_fin.length > 0 &&
      datos.fecha_fin >= datos.fecha_inicio &&
      datos.costo_inscripcion >= 0
    )
  }
  if (step === 2) {
    return sedes.every(
      (s) =>
        s.nombre.trim().length > 0 &&
        Object.values(s.disponibilidad).some((cancha) =>
          Object.values(cancha).some((slots) => slots.length > 0)
        )
    )
  }
  if (step === 3) return categorias.length > 0
  if (step === 4) {
    return categorias.every((id) => {
      const r = reglas[id]
      return r?.formato && r?.sets && r?.tercer_set
    })
  }
  return false
}

const STEP_LABELS = ["Datos", "Sedes", "Categorías", "Reglas"]

type Props = {
  categorias: Categoria[]
}

export function WizardCrearTorneo({ categorias }: Props) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const router = useRouter()
  const { execute, isPending, error } = useServerAction(crearTorneoAction)

  const fechas = generarFechas(
    state.datos?.fecha_inicio ?? "",
    state.datos?.fecha_fin ?? ""
  )

  async function handleSubmit() {
    if (!state.datos) return
    const payload = {
      nombre: state.datos.nombre,
      fecha_inicio: state.datos.fecha_inicio,
      fecha_fin: state.datos.fecha_fin,
      costo_inscripcion: state.datos.costo_inscripcion,
      duracion_turno: state.datos.duracion_turno,
      sedes: state.sedes,
      categorias: state.categorias.map((catId) => ({
        categoria_id: catId,
        ...state.reglas[catId],
      })),
    }
    const [data, err] = await execute(payload)
    if (!err && data?.torneoId) {
      router.push(`/torneos/${data.torneoId}/inscripcion`)
    }
  }

  const ok = canProceed(state)

  return (
    <div className="max-w-lg mx-auto flex flex-col min-h-screen">
      {/* Header */}
      <div
        className="px-6 pt-8 pb-4"
        style={{ backgroundColor: "#0f172a" }}
      >
        <h1
          className="text-3xl uppercase text-white"
          style={{ fontFamily: "Anton, sans-serif" }}
        >
          Nuevo torneo
        </h1>
      </div>

      {/* Step indicator */}
      <div style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <StepIndicator currentStep={state.step} labels={STEP_LABELS} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {state.step === 1 && (
          <PasoDatos
            datos={state.datos}
            onChange={(datos) => dispatch({ type: "UPDATE_DATOS", payload: datos })}
          />
        )}
        {state.step === 2 && (
          <PasoSedes
            sedes={state.sedes}
            duracion_turno={state.datos?.duracion_turno ?? "90"}
            fechas={fechas}
            onChangeSede={(index, sede) =>
              dispatch({ type: "UPDATE_SEDE", payload: { index, sede } })
            }
          />
        )}
        {state.step === 3 && (
          <PasoCategorias
            categorias={categorias}
            seleccionadas={state.categorias}
            onToggle={(id) => dispatch({ type: "TOGGLE_CATEGORIA", payload: id })}
          />
        )}
        {state.step === 4 && (
          <PasoReglas
            categorias={categorias}
            seleccionadas={state.categorias}
            reglas={state.reglas}
            onUpdateRegla={(catId, regla) =>
              dispatch({ type: "UPDATE_REGLA", payload: { categoriaId: catId, regla } })
            }
          />
        )}

        {error && (
          <p className="mt-4 text-sm text-red-500">
            Error: {error.message}
          </p>
        )}
      </div>

      {/* Nav */}
      <div
        className="px-6 py-4 flex gap-3 border-t"
        style={{ borderColor: "#e2e8f0", backgroundColor: "#ffffff" }}
      >
        {state.step > 1 && (
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_STEP", payload: (state.step - 1) as 1 | 2 | 3 | 4 })}
            className="flex-1 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              borderColor: "#e2e8f0",
              color: "#0f172a",
            }}
          >
            Atrás
          </button>
        )}

        {state.step < 4 ? (
          <button
            type="button"
            disabled={!ok}
            onClick={() => dispatch({ type: "SET_STEP", payload: (state.step + 1) as 1 | 2 | 3 | 4 })}
            className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              backgroundColor: ok ? "#0f172a" : "#e2e8f0",
              color: ok ? "#bcff00" : "#94a3b8",
              cursor: ok ? "pointer" : "not-allowed",
            }}
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            disabled={!ok || isPending}
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              backgroundColor: ok && !isPending ? "#bcff00" : "#e2e8f0",
              color: ok && !isPending ? "#0f172a" : "#94a3b8",
              cursor: ok && !isPending ? "pointer" : "not-allowed",
            }}
          >
            {isPending ? "Creando..." : "Crear Torneo"}
          </button>
        )}
      </div>
    </div>
  )
}
