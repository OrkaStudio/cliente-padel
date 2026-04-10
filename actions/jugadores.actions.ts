"use server"

import { createServerAction } from "zsa"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { buscarJugadoresInputSchema, crearJugadorInputSchema } from "@/validations/jugador.schema"

export const buscarJugadoresAction = createServerAction()
  .input(buscarJugadoresInputSchema)
  .handler(async ({ input }) => {
    const supabase = await createClient()
    let query = supabase
      .from("jugadores")
      .select("id, nombre, apellido, categoria_id")
      .or(`nombre.ilike.%${input.query}%,apellido.ilike.%${input.query}%`)
      .limit(10)

    if (input.categoria_id) {
      query = query.eq("categoria_id", input.categoria_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  })

export const crearJugadorAction = createServerAction()
  .input(crearJugadorInputSchema)
  .handler(async ({ input }) => {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("jugadores")
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return data
  })
