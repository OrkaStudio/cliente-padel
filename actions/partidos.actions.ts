"use server"

import { createServerAction } from "zsa"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

// ─── Marcar en vivo ───────────────────────────────────────────────────────────

export const marcarEnVivoAction = createServerAction()
  .input(z.object({ partidoId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const supabase = await createClient()
    const { error } = await supabase
      .from("partidos")
      .update({ estado: "en_vivo" })
      .eq("id", input.partidoId)
    if (error) throw error
  })

// ─── Actualizar resultado ─────────────────────────────────────────────────────

export const actualizarResultadoAction = createServerAction()
  .input(z.object({
    partidoId:    z.string().uuid(),
    sets_pareja1: z.number().int().min(0).max(3),
    sets_pareja2: z.number().int().min(0).max(3),
  }))
  .handler(async ({ input }) => {
    const supabase = await createClient()
    const { error } = await supabase
      .from("partidos")
      .update({
        resultado: { sets_pareja1: input.sets_pareja1, sets_pareja2: input.sets_pareja2 },
        estado: "finalizado",
      })
      .eq("id", input.partidoId)
    if (error) throw error
  })

// ─── Mover partido (con detección de conflicto y swap opcional) ───────────────

export const moverPartidoAction = createServerAction()
  .input(z.object({
    partidoId:        z.string().uuid(),
    nuevoHorario:     z.string(), // ISO timestamp
    nuevaCancha:      z.number().int().min(1),
    intercambiarCon:  z.string().uuid().optional(), // si quiere hacer swap
  }))
  .handler(async ({ input }) => {
    const supabase = await createClient()

    // Traer datos del partido a mover
    const { data: partido, error: errPartido } = await supabase
      .from("partidos")
      .select("id, horario, cancha, sede_id")
      .eq("id", input.partidoId)
      .single()
    if (errPartido || !partido) throw new Error("Partido no encontrado")

    if (input.intercambiarCon) {
      // SWAP: intercambiar horario+cancha entre los dos partidos
      const { data: otro, error: errOtro } = await supabase
        .from("partidos")
        .select("id, horario, cancha")
        .eq("id", input.intercambiarCon)
        .single()
      if (errOtro || !otro) throw new Error("Partido destino no encontrado")

      const { error: e1 } = await supabase
        .from("partidos")
        .update({ horario: otro.horario, cancha: otro.cancha })
        .eq("id", input.partidoId)
      if (e1) throw e1

      const { error: e2 } = await supabase
        .from("partidos")
        .update({ horario: partido.horario, cancha: partido.cancha })
        .eq("id", input.intercambiarCon)
      if (e2) throw e2

      return { swapped: true }
    }

    // Verificar conflicto en el slot destino
    const { data: conflicto } = await supabase
      .from("partidos")
      .select("id, pareja1_id, pareja2_id")
      .eq("sede_id", partido.sede_id)
      .eq("horario", input.nuevoHorario)
      .eq("cancha", input.nuevaCancha)
      .neq("id", input.partidoId)
      .maybeSingle()

    if (conflicto) {
      // Devolvemos el conflicto para que el cliente ofrezca swap
      return { conflicto: { partidoId: conflicto.id } }
    }

    // Sin conflicto: mover
    const { error } = await supabase
      .from("partidos")
      .update({ horario: input.nuevoHorario, cancha: input.nuevaCancha })
      .eq("id", input.partidoId)
    if (error) throw error

    return { movido: true }
  })

// ─── Cambiar estado del torneo ────────────────────────────────────────────────

export const cambiarEstadoTorneoAction = createServerAction()
  .input(z.object({
    torneoId: z.string().uuid(),
    estado: z.enum(["borrador", "inscripcion", "en_curso", "finalizado"]),
  }))
  .handler(async ({ input }) => {
    const supabase = await createClient()
    const { error } = await supabase
      .from("torneos")
      .update({ estado: input.estado })
      .eq("id", input.torneoId)
    if (error) throw error
  })

// ─── Verificar PIN veedor ─────────────────────────────────────────────────────

export const verificarPinAction = createServerAction()
  .input(z.object({
    club: z.enum(["voleando", "mas-padel"]),
    pin:  z.string().length(4),
  }))
  .handler(async ({ input }) => {
    const envKey = input.club === "voleando"
      ? process.env.VEEDOR_PIN_VOLEANDO
      : process.env.VEEDOR_PIN_MASPADEL

    if (!envKey || input.pin !== envKey) {
      throw new Error("PIN incorrecto")
    }

    const cookieStore = await cookies()
    cookieStore.set(`veedor_pin_${input.club}`, "ok", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })

    return { ok: true }
  })

// ─── Verificar PIN admin ──────────────────────────────────────────────────────

export const verificarPinAdminAction = createServerAction()
  .input(z.object({ pin: z.string().length(4) }))
  .handler(async ({ input }) => {
    const envKey = process.env.ADMIN_PIN
    if (!envKey || input.pin !== envKey) {
      throw new Error("PIN incorrecto")
    }
    const cookieStore = await cookies()
    cookieStore.set("admin_pin", "ok", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 horas
      path: "/",
    })
    return { ok: true }
  })
