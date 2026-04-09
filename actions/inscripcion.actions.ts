"use server"

import { createServerAction } from "zsa"
import { createClient } from "@/lib/supabase/server"
import { inscribirParejaInputSchema } from "@/validations/torneo.schema"
import { z } from "zod"

export const inscribirParejaAction = createServerAction()
  .input(inscribirParejaInputSchema)
  .handler(async ({ input }) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("parejas")
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return data
  })

export const eliminarParejaAction = createServerAction()
  .input(z.object({ parejaId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const supabase = await createClient()
    const { error } = await supabase
      .from("parejas")
      .delete()
      .eq("id", input.parejaId)
    if (error) throw error
  })
