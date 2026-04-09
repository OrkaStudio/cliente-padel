import { z } from "zod"

// Schema del JSON que devuelve Claude API
export const fixturePartidoSchema = z.object({
  categoria_id: z.string().uuid(),
  sede_id: z.string().uuid(),
  cancha: z.number().int().positive(),
  horario: z.string(), // ISO datetime
  pareja1_id: z.string().uuid(),
  pareja2_id: z.string().uuid(),
  tipo: z.enum(["grupo", "playoff"]),
  grupo_id: z.string().uuid().optional(),
})

export const fixtureResponseSchema = z.object({
  partidos: z.array(fixturePartidoSchema),
  advertencias: z.array(z.string()).optional(),
})

export type FixtureResponse = z.infer<typeof fixtureResponseSchema>
export type FixturePartido = z.infer<typeof fixturePartidoSchema>
