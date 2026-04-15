"use server"

import { createServerAction } from "zsa"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// ─── Marcar en vivo ───────────────────────────────────────────────────────────

export const marcarEnVivoAction = createServerAction()
  .input(z.object({ partidoId: z.string().uuid() }))
  .handler(async ({ input }) => {
    const supabase = createAdminClient()
    const { data: partido } = await supabase
      .from("partidos")
      .select("estado")
      .eq("id", input.partidoId)
      .single()
    if (partido?.estado !== "pendiente") throw new Error("El partido no está pendiente")
    const { error } = await supabase
      .from("partidos")
      .update({ estado: "en_vivo" })
      .eq("id", input.partidoId)
    if (error) throw error
  })

// ─── Actualizar resultado ─────────────────────────────────────────────────────

export const actualizarResultadoAction = createServerAction()
  .input(z.object({
    partidoId: z.string().uuid(),
    sets: z.array(z.object({
      p1: z.number().int().min(0).max(99),
      p2: z.number().int().min(0).max(99),
    })).min(1).max(3),
  }))
  .handler(async ({ input }) => {
    const sets_pareja1 = input.sets.filter(s => s.p1 > s.p2).length
    const sets_pareja2 = input.sets.filter(s => s.p2 > s.p1).length

    const hayGanador = (sets_pareja1 >= 2 || sets_pareja2 >= 2) && (sets_pareja1 !== sets_pareja2)
    const nuevoEstado = hayGanador ? "finalizado" : "en_vivo"

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("partidos")
      .update({
        resultado: { sets_pareja1, sets_pareja2, sets: input.sets },
        estado: nuevoEstado,
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
    const supabase = createAdminClient()

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

      await revalidarFixture(supabase, partido.sede_id)
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

    await revalidarFixture(supabase, partido.sede_id)
    return { movido: true }
  })

// ─── Helper: invalida fixture + llaves del torneo al que pertenece una sede ──

async function revalidarFixture(
  supabase: ReturnType<typeof createAdminClient>,
  sedeId: string
) {
  const { data: sede } = await supabase
    .from("sedes")
    .select("torneo_id")
    .eq("id", sedeId)
    .single()
  if (!sede?.torneo_id) return
  const tid = sede.torneo_id
  revalidatePath(`/torneos/${tid}/fixture`)
  revalidatePath(`/torneos/${tid}/llaves`)
  revalidatePath(`/admin/torneo/${tid}`)
  revalidatePath(`/admin/torneo/${tid}/fixture`)
}

// ─── Cambiar estado del torneo ────────────────────────────────────────────────

export const cambiarEstadoTorneoAction = createServerAction()
  .input(z.object({
    torneoId: z.string().uuid(),
    estado: z.enum(["borrador", "inscripcion", "en_curso", "finalizado"]),
  }))
  .handler(async ({ input }) => {
    const supabase = createAdminClient()
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

// ─── Cerrar sesión veedor ─────────────────────────────────────────────────────

export const cerrarSesionVeedorAction = createServerAction()
  .input(z.object({ club: z.enum(["voleando", "mas-padel"]) }))
  .handler(async ({ input }) => {
    const cookieStore = await cookies()
    cookieStore.delete(`veedor_pin_${input.club}`)
    return { ok: true }
  })
