# Plan: Inscripciones + Jugadores

## Objetivo
Mejorar el flujo de inscripción de parejas y la gestión de jugadores en el panel admin.

---

## 1. Fix urgente — `crearJugadorAction` no guarda

**Archivo:** `actions/jugadores.actions.ts`

El problema: usa `createClient()` (anon key) → RLS bloquea la escritura.

**Fix:** cambiar a `createAdminClient()` igual que en `partidos.actions.ts`:

```ts
import { createAdminClient } from "@/lib/supabase/admin"

export const crearJugadorAction = createServerAction()
  .input(crearJugadorInputSchema)
  .handler(async ({ input }) => {
    const supabase = createAdminClient()   // ← este cambio
    const { data, error } = await supabase
      .from("jugadores")
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return data
  })
```

También aplicar lo mismo a `buscarJugadoresAction` para ser consistentes.

---

## 2. Página global de jugadores — `/admin/jugadores`

**Archivo existente:** `app/(dashboard)/admin/jugadores/page.tsx`  
**Componente existente:** `components/admin/JugadoresView.tsx`

### Qué agregar
Un formulario inline arriba de la lista para crear jugadores nuevos directamente desde esta página (sin pasar por la inscripción).

**Campos del form:**
- Nombre
- Apellido  
- Teléfono (opcional)
- Categoría (select con las categorías existentes)

**UX:** botón "+" flotante o sección colapsable arriba del listado → llama `crearJugadorAction` → optimistic add a la lista.

La página ya fetchea todos los jugadores con `categorias(nombre)`. Agregar también el fetch de categorías para el select del form.

---

## 3. Mejorar sheet "Crear jugador" en JugadorSearch

**Archivo:** `components/torneos/shared/JugadorSearch.tsx`

Hoy: cuando se hace click en "Crear X", llama `onCrear(query)` → abre algo que no funciona bien (ver `PanelInscripcion.tsx` para ver cómo maneja `onCrear`).

**Nuevo comportamiento:**
Al hacer click en "Crear jugador" → abrir un sheet (slide-up, mismo estilo que `ResultadoSheet`) con:
- Campo Nombre (pre-completado con lo que escribió en el search)
- Campo Apellido
- Campo Teléfono (opcional)
- Botón "Guardar jugador" → llama `crearJugadorAction` → al éxito, selecciona el jugador recién creado (`onSelect`)

El sheet vive dentro de `JugadorSearch` o se puede hacer un `CrearJugadorSheet.tsx` separado.

---

## 4. Flujo de inscripción en 2 pasos

**Archivo:** `components/torneos/wizard/PanelInscripcion.tsx`

### Problema actual
El form para agregar parejas pide J1 y J2 al mismo tiempo, lo que no es muy claro. Además no permite guardar una pareja incompleta (solo J1).

### Nuevo flujo propuesto

**Paso 1 — Seleccionar J1:**
- Buscador de jugadores (JugadorSearch)
- Al seleccionar: aparece badge del jugador con su nombre + botón "×" para quitar
- Mientras no hay J1, no se muestra nada de J2

**Paso 2 — Seleccionar J2 (opcional):**
- Una vez elegido J1, aparece el slot de J2 con su propio buscador
- Botón "Guardar pareja" siempre visible (aunque J2 esté vacío → pareja incompleta)
- Badge de J2 igual que J1

**Visual sugerido:**
```
┌──────────────────────────────┐
│  JUGADOR 1                   │
│  [Buscar jugador...]         │
│                              │
│  JUGADOR 2  (opcional)       │  ← aparece solo si J1 está elegido
│  [Buscar jugador...]         │
│                              │
│  [Guardar pareja]            │
└──────────────────────────────┘
```

Al guardar con solo J1: `jugador2_id = null` en la DB (ya soportado por el schema).

---

## 5. Lista de jugadores por torneo

En `/admin/torneo/[id]/inscripcion` — agregar una segunda tab o sección colapsable que muestre todos los jugadores inscriptos en ese torneo (los que tienen pareja en ese torneo).

Permite ver rápidamente quién está inscripto sin ir a la vista global.

**Datos ya disponibles:** la página de inscripción ya fetchea `jugadoresMap` con todos los jugadores del torneo.

---

## Orden de implementación sugerido

| # | Tarea | Archivo | Tiempo est. |
|---|-------|---------|-------------|
| 1 | Fix `crearJugadorAction` → `createAdminClient` | `actions/jugadores.actions.ts` | 5 min |
| 2 | Sheet "Crear jugador" en JugadorSearch | `JugadorSearch.tsx` + nuevo `CrearJugadorSheet.tsx` | 45 min |
| 3 | Flujo inscripción 2 pasos | `PanelInscripcion.tsx` | 1h |
| 4 | Form "Agregar jugador" en `/admin/jugadores` | `JugadoresView.tsx` | 30 min |
| 5 | Lista jugadores del torneo en inscripción | `PanelInscripcion.tsx` | 30 min |
