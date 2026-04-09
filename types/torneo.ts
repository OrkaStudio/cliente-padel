import type { z } from "zod"
import type {
  torneoSchema,
  sedeSchema,
  torneoCategoriasSchema,
  parejaSchema,
  grupoSchema,
  partidoSchema,
  categoriaSchema,
  sedeWizardInputSchema,
  reglaInputSchema,
  crearTorneoWizardSchema,
} from "@/validations/torneo.schema"

export type Torneo = z.infer<typeof torneoSchema>
export type Sede = z.infer<typeof sedeSchema>
export type TorneoCategorias = z.infer<typeof torneoCategoriasSchema>
export type Pareja = z.infer<typeof parejaSchema>
export type Grupo = z.infer<typeof grupoSchema>
export type Partido = z.infer<typeof partidoSchema>
export type Categoria = z.infer<typeof categoriaSchema>
export type SedeWizardInput = z.infer<typeof sedeWizardInputSchema>
export type ReglaInput = z.infer<typeof reglaInputSchema>
export type CrearTorneoWizardInput = z.infer<typeof crearTorneoWizardSchema>

export type TorneoEstado = "borrador" | "inscripcion" | "en_curso" | "finalizado"
export type PartidoEstado = "pendiente" | "en_vivo" | "finalizado"
export type PartidoTipo = "grupo" | "playoff"
export type TorneoFormato = "grupos_playoff" | "americano" | "eliminacion_directa" | "interclub"
export type TercerSet = "completo" | "tie_break" | "super_tie_break"
export type SetsFormato = "best_2" | "best_3"
export type CategoriaTipo = "caballeros" | "damas" | "especial"
export type DisponibilidadMap = Record<string, Record<string, string[]>>

export type WizardState = {
  step: 1 | 2 | 3 | 4
  datos: {
    nombre: string
    fecha_inicio: string
    fecha_fin: string
    costo_inscripcion: number
    duracion_turno: "60" | "90" | "120"
  } | null
  sedes: SedeWizardInput[]
  categorias: string[]
  reglas: Record<string, Omit<ReglaInput, "categoria_id">>
}
