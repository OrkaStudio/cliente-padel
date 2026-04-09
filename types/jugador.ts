import type { z } from "zod"
import type {
  jugadorSchema,
  crearJugadorInputSchema,
  buscarJugadoresInputSchema,
} from "@/validations/jugador.schema"

export type Jugador = z.infer<typeof jugadorSchema>
export type CrearJugadorInput = z.infer<typeof crearJugadorInputSchema>
export type BuscarJugadoresInput = z.infer<typeof buscarJugadoresInputSchema>
