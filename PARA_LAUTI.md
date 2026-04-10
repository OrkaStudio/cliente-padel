# Handoff para Lauti — Cliente Pádel

## Contexto rápido

App mobile-first (max 430px) para gestionar torneos de pádel. Stack: **Next.js 15 App Router + Supabase + inline styles** (sin Tailwind). El cliente es Cristián, organizador de torneos en Las Flores.

**Correr en local:**
```bash
npm run dev
# → http://localhost:3000
```

---

## Skills instaladas (leer antes de tocar UI)

| Archivo | Para qué |
|---------|----------|
| `skills_claude/frontend-design.md` | Sistema de diseño: colores, fuentes, componentes |
| `skills_claude/emil-design-eng.md` | Animaciones: spring, transform/opacity only, press states |

**Reglas Emil que hay que respetar siempre:**
- Solo animar `transform` y `opacity` — nunca `height`, `width`, `padding`
- Botones: `scale(0.97)` on press, `160ms cubic-bezier(0.23, 1, 0.32, 1)`
- No animar el BottomNav (se usa constantemente)
- Modales/sheets: spring `stiffness: 300, damping: 30`, desde `y: "100%"`

**Paleta:**
- Fondo: `#f8fafc`
- Principal: `#0f172a` (negro azulado)
- Acento: `#bcff00` (verde neon)
- Texto secundario: `#64748b`

**Fuentes** (via `next/font`, CSS vars):
- `var(--font-anton)` → títulos en mayúsculas
- `var(--font-space-grotesk)` → labels, botones, UI
- Íconos: Material Symbols Outlined (link en `<head>`)

---

## Cambios sesión 10/04 (Fran + Claude)

### Resumen de lo que se hizo

#### RLS — escrituras bloqueadas con anon key
El problema principal era que `actualizarResultadoAction` no hacía nada porque la anon key no tiene permisos de escritura en Supabase (RLS).

**Solución:** se creó `lib/supabase/admin.ts` con el service role key que bypasea RLS:
```ts
// lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js"
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
```

Todas las server actions que escriben usan ahora `createAdminClient()`. **Importante:** la variable `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` debe ser la service_role key (JWT que empieza con `eyJ...` y tiene `"role":"service_role"`), NO la anon key.

#### VeedorView — mejoras
- **Quitado el botón "Iniciar"** de los partidos próximos — el estado `en_vivo` se deriva automáticamente por hora (`aplicarEstadoAuto` en `lib/partidos.ts`)
- **Agregado botón "Corregir resultado"** (gris, discreto) en partidos finalizados para poder editar si hubo un error
- **Cambiado `window.location.reload()`** por `router.refresh()` para que al guardar un resultado la página se actualice sin perder el tab activo (Hoy/Todos)

#### Filtros persistentes en URL
Los filtros de sede/categoría ahora se guardan en la URL (`?sede=<id>` o `?cat=<id>`). Al refrescar la página se mantiene el filtro seleccionado.

Páginas actualizadas con `export const dynamic = "force-dynamic"` y lectura de searchParams:
- `app/(dashboard)/torneos/[id]/fixture/page.tsx` → `?sede=`
- `app/(dashboard)/torneos/[id]/tabla/page.tsx` → `?cat=`
- `app/(dashboard)/torneos/[id]/llaves/page.tsx` → `?cat=`

Componentes actualizados a `useSearchParams()` (ya no usan useState para el filtro):
- `components/torneos/FixtureView.tsx`
- `components/torneos/TablaView.tsx`
- `components/torneos/LlavesView.tsx`

#### Tus cambios (Lauti) integrados
- `BottomNav.tsx` — context-aware para admin (Monitor / Fixture / Inscripciones cuando estás en `/admin/torneo/[id]`)
- `PanelInscripcion.tsx` — `eliminarParejaAction` conectado con optimistic update + rollback si falla

---

## Lo que se construyó esta sesión

### Vistas públicas (jugadores — sin login)
| Ruta | Componente | Estado |
|------|-----------|--------|
| `/torneos` | `app/(dashboard)/torneos/page.tsx` | ✅ |
| `/torneos/[id]` | `app/(dashboard)/torneos/[id]/page.tsx` | ✅ |
| `/torneos/[id]/fixture` | `components/torneos/FixtureView.tsx` | ✅ |
| `/torneos/[id]/tabla` | `components/torneos/TablaView.tsx` | ✅ |
| `/torneos/[id]/llaves` | `components/torneos/LlavesView.tsx` | ✅ |

### Panel Veedor (PIN por sede)
| Ruta | Descripción |
|------|-------------|
| `/veedor/voleando` | Partidos de la sede Voleando — carga resultados |
| `/veedor/mas-padel` | Partidos de Más Pádel — carga resultados |
| `/veedor/[club]/login` | Pantalla de PIN (4 dígitos) |

**PINs en `.env.local`:**
```
VEEDOR_PIN_VOLEANDO=1234
VEEDOR_PIN_MASPADEL=5678
```
Cambiarlo antes del torneo real (17/04).

### Panel Admin (PIN)
| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard: métricas, estado torneo, links |
| `/admin/login` | Pantalla de PIN admin |
| `/admin/torneo/[id]` | Monitor de canchas — todos los partidos |
| `/admin/torneo/[id]/fixture` | Editor de fixture — grilla cancha × horario |
| `/admin/torneo/[id]/inscripcion` | Gestión de parejas |

**PIN admin en `.env.local`:**
```
ADMIN_PIN=0000
```
Cambiar antes de entregar al cliente.

### Componentes nuevos importantes
```
components/
├── layout/
│   ├── BottomNav.tsx          # Nav inferior context-aware (dentro/fuera de torneo)
│   └── AdminMenu.tsx          # Botón "Acceso" en header → menú con logos de clubes
├── admin/
│   ├── EstadoTorneoButton.tsx # Botón cambiar estado torneo
│   ├── FixtureEditorView.tsx  # Grilla cancha × horario
│   └── FixtureEditSheet.tsx   # Sheet para mover partido + detección de conflictos
├── torneos/
│   ├── FixtureView.tsx        # Vista pública de fixture con búsqueda
│   ├── TablaView.tsx          # Tabla de posiciones por grupo
│   ├── LlavesView.tsx         # Llaves/playoff
│   ├── VeedorView.tsx         # Vista veedor: iniciar partido + cargar resultado
│   ├── ResultadoSheet.tsx     # Sheet para cargar sets (slide-up)
│   ├── StatsMarquee.tsx       # Ticker de estadísticas
│   ├── LiveMatchBanner.tsx    # Banner partido en vivo
│   └── CategoriasBento.tsx    # Grid de categorías con navegación
└── ui/padel/
    ├── Chip.tsx               # Filtro chip con press state
    ├── StatusBadge.tsx        # Badge de estado (en vivo, finalizado, etc.)
    └── PressButton.tsx        # Botón con Emil press effect
```

### Server Actions nuevas
```
actions/partidos.actions.ts
├── marcarEnVivoAction        # estado → en_vivo
├── actualizarResultadoAction # carga resultado + estado → finalizado
├── moverPartidoAction        # cambia horario/cancha, detecta conflictos, hace swap
├── cambiarEstadoTorneoAction # cambia estado del torneo
├── verificarPinAction        # valida PIN veedor, setea cookie
└── verificarPinAdminAction   # valida PIN admin, setea cookie (8hs)
```

### Base de datos
- Se agregó columna `ronda` a `partidos` (para LlavesView — cuartos/semis/final)
- Se creó `supabase/seed.sql` con datos de ejemplo completos (correr en Supabase SQL Editor)
- Se agregaron políticas de lectura pública a todas las tablas que las necesitaban

---

## Lo que quedó pendiente

### 1. Inscripciones + Jugadores ⬅ PRÓXIMO (ver `PLAN_INSCRIPCION_JUGADORES.md`)
Ver el plan detallado en ese archivo. Resumen:
- Fix `crearJugadorAction` → usar `createAdminClient()` (no guarda porque usa anon key)
- Mejorar sheet "Crear jugador" en el search
- Flujo de inscripción en 2 pasos (J1 primero, luego J2)
- Form de alta de jugadores en `/admin/jugadores`

### 4. Logos de clubes en el header veedor
Los logos están en `public/clubes/` correctamente nombrados:
- `public/clubes/voleando.logo.png`
- `public/clubes/mas-padel.logo.png`

### 5. Simulaciones (deadline: 14/04)
Hay datos de ejemplo cargados vía seed.sql. Falta probar el flujo completo end-to-end:
- Veedor inicia partido → aparece en vivo para jugadores
- Veedor carga resultado → aparece en tabla
- Admin mueve partido en fixture → se refleja en fixture público

### 6. `hasInterclub` — NO implementar todavía
Hay preguntas abiertas de Cristián (ver CLAUDE.md). No tocar hasta tener respuestas.

---

## Arquitectura de auth / acceso

```
Jugadores (sin login)     → /torneos/**  (todo público)
Admin (Cristián)          → /admin/**    → PIN 4 dígitos → cookie admin_pin (8hs)
Veedor Voleando           → /veedor/voleando → PIN → cookie veedor_pin_voleando (1 día)
Veedor Más Pádel          → /veedor/mas-padel → PIN → cookie veedor_pin_mas-padel (1 día)
```

El middleware en `middleware.ts` maneja todo esto.

---

## Datos de ejemplo (seed)

Si la DB está vacía, correr `supabase/seed.sql` en el SQL Editor de Supabase.
Crea: 1 torneo "Interclub Las Flores 2026" con 2 sedes, 12 jugadores, 6 parejas, grupos, partidos.

---

## Variables de entorno necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
VEEDOR_PIN_VOLEANDO=1234
VEEDOR_PIN_MASPADEL=5678
ADMIN_PIN=0000
```

---

## Patrones de código importantes

### Server Component (data fetching)
```tsx
// app/(dashboard)/torneos/[id]/fixture/page.tsx
export default async function Page({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("partidos").select("...").eq("torneo_id", id)
  return <ClientView partidos={data ?? []} />
}
```

### Client Component (interacción)
```tsx
"use client"
import { useTransition } from "react"
import { marcarEnVivoAction } from "@/actions/partidos.actions"

const [pending, startTransition] = useTransition()
const handleClick = () => startTransition(async () => {
  const [, err] = await marcarEnVivoAction({ partidoId })
  if (err) console.error(err)
})
```

### Sheet animado (Emil)
```tsx
<motion.div
  initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
  style={{ position: "fixed", bottom: 0, ... }}
/>
```
