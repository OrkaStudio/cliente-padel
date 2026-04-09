import { z } from "zod"

export const torneoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1),
  fecha_inicio: z.string().date(),
  fecha_fin: z.string().date(),
  costo_inscripcion: z.number().nonnegative(),
  estado: z.enum(["borrador", "inscripcion", "en_curso", "finalizado"]),
  created_by: z.string().uuid(),
})

export const sedeSchema = z.object({
  id: z.string().uuid(),
  torneo_id: z.string().uuid(),
  nombre: z.string().min(1),
  canchas_count: z.number().int().positive(),
  horario_inicio: z.string(), // "HH:MM"
  horario_fin: z.string(),    // "HH:MM"
  duracion_turno: z.enum(["60", "90", "120"]),
})

export const torneoCategoriasSchema = z.object({
  id: z.string().uuid(),
  torneo_id: z.string().uuid(),
  categoria_id: z.string().uuid(),
  formato: z.enum(["grupos_playoff", "americano", "eliminacion_directa", "interclub"]),
  sets: z.enum(["best_2", "best_3"]),
  tercer_set: z.enum(["completo", "tie_break", "super_tie_break"]),
})

export const categoriaSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1),
  tipo: z.enum(["caballeros", "damas", "especial"]),
  orden: z.number().int(),
})

export const parejaSchema = z.object({
  id: z.string().uuid(),
  torneo_id: z.string().uuid(),
  categoria_id: z.string().uuid(),
  jugador1_id: z.string().uuid(),
  jugador2_id: z.string().uuid().nullable(),
  club_id: z.string().uuid().nullable(),
})

export const grupoSchema = z.object({
  id: z.string().uuid(),
  torneo_categoria_id: z.string().uuid(),
  nombre: z.string().min(1),
})

export const partidoSchema = z.object({
  id: z.string().uuid(),
  torneo_id: z.string().uuid(),
  categoria_id: z.string().uuid(),
  sede_id: z.string().uuid(),
  cancha: z.number().int().positive(),
  horario: z.string(), // ISO datetime
  pareja1_id: z.string().uuid(),
  pareja2_id: z.string().uuid(),
  resultado: z.record(z.unknown()).nullable(),
  estado: z.enum(["pendiente", "en_vivo", "finalizado"]),
  tipo: z.enum(["grupo", "playoff"]),
})

// Input schemas (para Server Actions)
export const crearTorneoInputSchema = torneoSchema.omit({ id: true, created_by: true })
export const crearSedeInputSchema = sedeSchema.omit({ id: true })
export const inscribirParejaInputSchema = parejaSchema.omit({ id: true })
export const cargarResultadoInputSchema = z.object({
  partido_id: z.string().uuid(),
  resultado: z.record(z.unknown()),
})

// Wizard schemas — Spec 1
export const sedeWizardInputSchema = z.object({
  nombre: z.string().min(1),
  horario_inicio: z.string().regex(/^\d{2}:\d{2}$/),
  horario_fin: z.string().regex(/^\d{2}:\d{2}$/),
  disponibilidad: z.record(z.record(z.array(z.string()))),
})

export const reglaInputSchema = z.object({
  categoria_id: z.string().uuid(),
  formato: z.enum(["grupos_playoff", "americano", "eliminacion_directa", "interclub"]),
  sets: z.enum(["best_2", "best_3"]),
  tercer_set: z.enum(["completo", "tie_break", "super_tie_break"]),
})

export const crearTorneoWizardSchema = z.object({
  nombre: z.string().min(1),
  fecha_inicio: z.string().date(),
  fecha_fin: z.string().date(),
  costo_inscripcion: z.number().nonnegative(),
  duracion_turno: z.enum(["60", "90", "120"]),
  sedes: z.array(sedeWizardInputSchema).length(2),
  categorias: z.array(reglaInputSchema).min(1),
})

export const publicarTorneoInputSchema = z.object({
  torneoId: z.string().uuid(),
})
