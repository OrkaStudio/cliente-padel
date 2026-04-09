import { z } from "zod"

export const jugadorSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  telefono: z.string().nullable(),
  email: z.string().email().nullable(),
  fecha_nacimiento: z.string().date().nullable(),
  categoria_id: z.string().uuid().nullable(),
  created_at: z.string(),
})

export const crearJugadorInputSchema = jugadorSchema.omit({ id: true, created_at: true })

export const buscarJugadoresInputSchema = z.object({
  query: z.string().min(2),
  categoria_id: z.string().uuid().optional(),
})
