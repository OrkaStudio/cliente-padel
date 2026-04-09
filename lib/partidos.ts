// Deriva el estado visual de un partido según el horario actual.
// Si ya pasó la hora y no está finalizado → en_vivo automáticamente.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function derivarEstado(partido: any): any {
  if (partido.estado === "finalizado") return partido
  if (partido.estado === "pendiente" && partido.horario && new Date(partido.horario) <= new Date()) {
    return { ...partido, estado: "en_vivo" }
  }
  return partido
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function aplicarEstadoAuto(partidos: any[]): any[] {
  return partidos.map(derivarEstado)
}
