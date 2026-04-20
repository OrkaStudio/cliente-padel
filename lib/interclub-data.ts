import { createClient } from "@/lib/supabase/server"
import { MOCK_CATEGORIAS } from "@/components/torneos/interclub/interclub-mock"
import type { CategoriaInterclub, Partido } from "@/components/torneos/interclub/CategoriasInterclub"

function arHour(iso: string): string {
  const d = new Date(iso)
  const h = ((d.getUTCHours() - 3) + 24) % 24
  const m = d.getUTCMinutes()
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function arDate(iso: string): string {
  return new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function formatJug(nombre: string, apellido: string): string {
  if (!apellido) return nombre
  return `${nombre[0]}.${apellido}`
}

function formatPair(j1n: string, j1a: string, j2n?: string | null, j2a?: string | null): string {
  const p1 = formatJug(j1n, j1a)
  if (!j2n) return p1
  return `${p1} / ${formatJug(j2n, j2a ?? "")}`
}

const SHORT_NAME: Record<string, string> = {
  "2da Caballeros": "Segunda", "3ra Caballeros": "Tercera",
  "4ta Caballeros": "Cuarta",  "5ta Caballeros": "Quinta",
  "6ta Caballeros": "Sexta",   "7ma Caballeros": "Séptima",
  "4ta Damas": "Cuarta",       "5ta Damas": "Quinta",
  "6ta Damas": "Sexta",
}

function mapCategoria(nombre: string, tipo: string): { short: string; genero: "masc" | "dam" | "mixto" } {
  return {
    short:  SHORT_NAME[nombre] ?? nombre,
    genero: tipo === "caballeros" ? "masc" : tipo === "damas" ? "dam" : "mixto",
  }
}

export async function getCategorias(torneoId: string): Promise<CategoriaInterclub[]> {
  try {
    const supabase = await createClient()

    const { data: partidos, error: errPart } = await supabase
      .from("partidos")
      .select("id, horario, cancha, estado, resultado, sede_id, categoria_id, pareja1_id, pareja2_id")
      .eq("torneo_id", torneoId)
      .order("horario")

    if (errPart || !partidos?.length) return MOCK_CATEGORIAS

    const parejaIds    = [...new Set([...partidos.map(p => p.pareja1_id), ...partidos.map(p => p.pareja2_id)])]
    const categoriaIds = [...new Set(partidos.map(p => p.categoria_id))]
    const sedeIds      = [...new Set(partidos.map(p => p.sede_id))]

    const [{ data: parejas }, { data: categorias }, { data: sedes }, { data: liveData }] = await Promise.all([
      supabase.from("parejas").select("id, club_id, jugador1_id, jugador2_id").in("id", parejaIds),
      supabase.from("categorias").select("id, nombre, tipo, orden").in("id", categoriaIds),
      supabase.from("sedes").select("id, nombre").in("id", sedeIds),
      supabase.from("interclub_partidos").select("id, resultado, ganador, estado, hora, cancha, fecha, sede"),
    ])

    const jugadorIds = [...new Set((parejas ?? []).flatMap(p => [p.jugador1_id, p.jugador2_id].filter(Boolean)))]
    const clubIds    = [...new Set((parejas ?? []).map(p => p.club_id).filter(Boolean))]

    const [{ data: jugadores }, { data: clubes }] = await Promise.all([
      supabase.from("jugadores").select("id, nombre, apellido").in("id", jugadorIds),
      supabase.from("clubes").select("id, nombre").in("id", clubIds),
    ])

    const parejaMap    = new Map((parejas   ?? []).map(p => [p.id, p]))
    const jugadorMap   = new Map((jugadores ?? []).map(j => [j.id, j]))
    const clubMap      = new Map((clubes    ?? []).map(c => [c.id, c]))
    const categoriaMap = new Map((categorias ?? []).map(c => [c.id, c]))
    const sedeMap      = new Map((sedes     ?? []).map(s => [s.id, s]))
    const liveMap      = new Map((liveData  ?? []).map(r => [r.id, r]))

    const catMeta     = new Map<string, { nombre: string; genero: "masc" | "dam" | "mixto"; orden: number }>()
    const catPartidos = new Map<string, Partido[]>()

    for (const row of partidos) {
      const cat  = categoriaMap.get(row.categoria_id)
      const sede = sedeMap.get(row.sede_id)
      const par1 = parejaMap.get(row.pareja1_id)
      const par2 = parejaMap.get(row.pareja2_id)
      if (!cat || !par1 || !par2) continue

      const club1   = clubMap.get(par1.club_id)
      const p1IsVol = club1?.nombre === "Voleando"
      const pVol    = p1IsVol ? par1 : par2
      const pMP     = p1IsVol ? par2 : par1

      const jV1 = jugadorMap.get(pVol.jugador1_id)
      const jV2 = jugadorMap.get(pVol.jugador2_id)
      const jM1 = jugadorMap.get(pMP.jugador1_id)
      const jM2 = jugadorMap.get(pMP.jugador2_id)

      const live = liveMap.get(row.id)

      const partido: Partido = {
        id:         row.id,
        pairA:      formatPair(jV1?.nombre ?? "?", jV1?.apellido ?? "", jV2?.nombre, jV2?.apellido),
        pairB:      formatPair(jM1?.nombre ?? "?", jM1?.apellido ?? "", jM2?.nombre, jM2?.apellido),
        resultado:  live?.resultado  ?? null,
        ganador:    (live?.ganador   ?? null) as "A" | "B" | null,
        estado:     (live?.estado    ?? row.estado) as "pendiente" | "en_vivo" | "finalizado",
        horaInicio: live?.hora       ?? arHour(row.horario),
        cancha:     live?.cancha     ?? (row.cancha > 0 ? row.cancha : undefined),
        fecha:      live?.fecha      ?? arDate(row.horario),
        sede:       live?.sede       ?? sede?.nombre,
      }

      if (!catMeta.has(cat.id)) {
        const { short, genero } = mapCategoria(cat.nombre, cat.tipo)
        catMeta.set(cat.id, { nombre: short, genero, orden: cat.orden })
        catPartidos.set(cat.id, [])
      }
      catPartidos.get(cat.id)!.push(partido)
    }

    const result: CategoriaInterclub[] = Array.from(catMeta.entries())
      .sort((a, b) => a[1].orden - b[1].orden)
      .map(([catId, meta]) => {
        const parts = catPartidos.get(catId) ?? []
        const fin   = parts.filter(p => p.estado === "finalizado")
        const ptsA  = fin.filter(p => p.ganador === "A").length
        const ptsB  = fin.filter(p => p.ganador === "B").length
        const estado = parts.every(p => p.estado === "finalizado") && parts.length > 0
          ? "finalizado"
          : parts.some(p => p.estado === "en_vivo") ? "en_vivo" : "pendiente"
        return { id: catId, nombre: meta.nombre, genero: meta.genero, estado, ptsA, ptsB, partidos: parts }
      })

    return result.length > 0 ? result : MOCK_CATEGORIAS
  } catch (e) {
    console.error("getCategorias error:", e)
    return MOCK_CATEGORIAS
  }
}
