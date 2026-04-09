"use server"

import { createServerAction } from "zsa"
import { createClient } from "@/lib/supabase/server"
import { crearTorneoWizardSchema, publicarTorneoInputSchema } from "@/validations/torneo.schema"

export const crearTorneoAction = createServerAction()
  .input(crearTorneoWizardSchema)
  .handler(async ({ input }) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .rpc("crear_torneo_completo", { payload: input })
    if (error) throw error
    return { torneoId: data as string }
  })

export const publicarTorneoAction = createServerAction()
  .input(publicarTorneoInputSchema)
  .handler(async ({ input }) => {
    const supabase = await createClient()
    const { error } = await supabase
      .from("torneos")
      .update({ estado: "inscripcion" })
      .eq("id", input.torneoId)
    if (error) throw error
  })
