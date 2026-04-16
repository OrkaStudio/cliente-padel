# Plan de trabajo — Interclub — Para Fran

## Estado actual

El sistema está operativo para el torneo del 17/04. Las vistas del veedor, organizador y espectadores tienen auto-refresh, guardado con manejo de errores y sort correcto por fecha+hora. Lo que sigue son los pendientes.

---

## BLOQUE A — Crítico antes del 17/04

### A1. Cargar parejas reales
**Archivo:** `components/torneos/interclub/interclub-mock.ts`

Todo el fixture usa nombres de prueba (Gómez / Ruiz, etc.). Cuando Lautaro entregue la lista real, hay que reemplazar los `pairA` y `pairB` en los 44 partidos distribuidos en 14 categorías.

Convenio fijo: `pairA` = pareja de **Voleando**, `pairB` = pareja de **+Pádel**, siempre.

---

### A2. Los veedores no ven cambios de slot del organizador
**Archivos involucrados:**
- `app/(veedor)/veedor/[club]/page.tsx` (línea ~23)
- `components/torneos/interclub/VeedorInterclubView.tsx` — tipo `InterclubLiveRow` y función `buildPartidos`

**Problema:** El `page.tsx` del veedor solo selecciona `id, resultado, ganador, estado` de Supabase. Si el organizador mueve un partido a otra cancha u horario, el veedor sigue viendo el slot original del mock.

**Fix en `page.tsx`:**
```ts
const { data: liveData } = await supabase
  .from("interclub_partidos")
  .select("id, resultado, ganador, estado, hora, cancha, fecha, sede")
```

**Fix en `VeedorInterclubView.tsx`:**

1. Extender el tipo `InterclubLiveRow`:
```ts
export type InterclubLiveRow = {
  id: string
  resultado: string | null
  ganador: string | null
  estado: string
  hora: string | null    // agregar
  cancha: number | null  // agregar
  fecha: string | null   // agregar
  sede: string | null    // agregar
}
```

2. En `buildPartidos`, usar los campos del live para slot:
```ts
result.push({
  // ...
  hora:   live?.hora   ?? p.horaInicio ?? "",
  fecha:  live?.fecha  ?? p.fecha      ?? "",
  cancha: live?.cancha ?? p.cancha     ?? 1,
  sede:   live?.sede   ?? p.sede       ?? sede,
  // ...
})
```

---

### A3. `guardarParcial` cierra el sheet — no debería
**Archivo:** `components/torneos/interclub/VeedorInterclubView.tsx` — función `guardarParcial`

```ts
const guardarParcial = async (id: string, sets: SetScore[]) => {
  setPartidos(prev => prev.map(p => p.id === id ? { ...p, sets } : p))
  setSheetPartido(null)  // ← QUITAR esta línea
  // ...
}
```

El veedor hace click en "Actualizar set" mientras el partido está en vivo para ir registrando set a set. Si el sheet se cierra, tiene que volver a abrirlo cada vez. Debe quedarse abierto.

También falta revert si hay error: guardar el estado previo de los sets antes del optimistic update y restaurarlos si `err` es truthy.

---

### A4. HeroMarcador sin nombres de club
**Archivo:** `components/torneos/interclub/HeroMarcador.tsx` (líneas ~80–139)

El marcador muestra los puntos en grande pero no indica qué club corresponde a cada lado. Un espectador que no conoce la convención (izquierda = Voleando) no puede interpretar el score.

**Fix:** Agregar el nombre abreviado del club debajo del número en cada panel. Panel izquierdo (Club A):
```tsx
<span style={{ fontSize: 56, ... }}>{ptsA}</span>
<span style={{
  fontFamily: "var(--font-space-grotesk), sans-serif",
  fontSize: 10, fontWeight: 900,
  color: clubA.color,
  textTransform: "uppercase", letterSpacing: "0.1em",
  position: "relative", zIndex: 1,
}}>
  {clubA.abbr}
</span>
```
Mismo para el panel derecho con `clubB.abbr` y `ptsB`. En modo `compact` (página de categoría) reducir font-size a ~8px.

---

## BLOQUE B — Deuda técnica (post-torneo)

### B1. Hardcoded torneoId `"123"`
**Archivos:**
- `actions/partidos.actions.ts` — múltiples `revalidatePath("/torneos/123/interclub"...)`
- `components/torneos/interclub/VeedorInterclubView.tsx` — botón "← Torneo"
- `components/torneos/interclub/OrganizadorInterclubView.tsx` — botón "← Torneo"

Solución recomendada: agregar `NEXT_PUBLIC_INTERCLUB_TORNEO_ID=123` en `.env` y leerlo desde ahí.

---

### B2. Hardcoded nombre "Cristian"
**Archivo:** `components/torneos/interclub/OrganizadorInterclubView.tsx` línea ~865

```tsx
<h1 ...>Cristian</h1>
```

Reemplazar por una prop `organizadorNombre` que llegue desde `app/(veedor)/veedor/organizador/page.tsx`, y leerla de env var o DB.

---

### B3. Hardcoded fechas y horarios del torneo
**Archivo:** `components/torneos/interclub/OrganizadorInterclubView.tsx` líneas ~68–71

```ts
const FECHAS  = ["2026-04-17", "2026-04-18", "2026-04-19"]
const HORAS   = ["10:00","11:30","13:00","14:30","16:00","17:30","19:00","20:30"]
```

Para torneos futuros estas fechas y horas van a cambiar. Moverlos a env vars o a una configuración en DB.

---

### B4. Polling → Supabase Realtime
**Archivo:** `components/torneos/interclub/InterclubAutoRefresh.tsx`

Actualmente el auto-refresh llama a `router.refresh()` cada 15 segundos. Funciona, pero genera requests innecesarios. La mejora es usar `supabase.channel().on('postgres_changes', ...)` para reaccionar solo cuando hay un cambio en `interclub_partidos`. Implementar post-torneo.

---

### B5. Eliminar `FixtureInterclubView` (código muerto)
```bash
grep -r "FixtureInterclubView" --include="*.tsx" .
```
Componente que quedó sin uso tras la refactorización. Eliminar para no confundir.

---

## Resumen de prioridades

| # | Tarea | Urgencia | Archivos clave |
|---|-------|----------|----------------|
| A1 | Cargar parejas reales | Antes del 17/04 | `interclub-mock.ts` |
| A2 | Veedor no ve slot moves del organizador | Antes del 17/04 | `veedor/[club]/page.tsx`, `VeedorInterclubView.tsx` |
| A3 | `guardarParcial` no debe cerrar sheet + revert en error | Antes del 17/04 | `VeedorInterclubView.tsx` |
| A4 | HeroMarcador sin nombre de club | Antes del 17/04 | `HeroMarcador.tsx` |
| B1 | Hardcoded torneoId `"123"` | Post-torneo | `partidos.actions.ts`, vistas |
| B2 | Hardcoded nombre "Cristian" | Post-torneo | `OrganizadorInterclubView.tsx` |
| B3 | Hardcoded fechas/horas | Post-torneo | `OrganizadorInterclubView.tsx` |
| B4 | Supabase Realtime | Post-torneo | `InterclubAutoRefresh.tsx` |
| B5 | Eliminar `FixtureInterclubView` | Post-torneo | — |
