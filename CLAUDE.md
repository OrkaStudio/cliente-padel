# CLAUDE.md — Cliente: Pádel (nombre pendiente)

Base: forkeado de `vertical-deportes`. Aplicar todas sus reglas y dominio.

---

## Features activas

```
hasTorneos    ✅
hasFixtureIA  ✅
hasEnVivo     ✅
hasBracket    ✅
hasInterclub  ⏸ pendiente respuestas de Cristián
```

---

## Deadlines

- **14/04:** simulaciones listas
- **17/04:** torneo real interclub en vivo

Para este primer torneo las parejas las carga Orka manualmente.

---

## Pendientes — NO implementar interclub hasta tener estas respuestas

1. ¿Cómo suman puntos las parejas para su club?
2. ¿Cómo se calculan los puntos por club?
3. ¿Los clubes son fijos (Más Pádel / Voleando) o pueden sumarse más?
4. ¿Las parejas juegan entre clubes o también entre ellas?
5. ¿La tabla final muestra solo ganador o ranking completo?
6. ¿Suma 12, Suma 10 y Mixtos son exclusivos del interclub?
7. ¿Cuándo llega la lista de parejas por categoría?
8. ¿Ya hay veedores designados por sede?
9. ¿Los 3 días tienen el mismo rango horario?
10. ¿Los jugadores entran con login o link público?
11. ¿Tiene logo/colores del torneo?

---

## Regla de trabajo

No implementar features no aprobadas explícitamente.
No implementar `hasInterclub` hasta tener todas las respuestas anteriores.

---

## Skills activas

| Skill | Archivo | Cuándo usarla |
|-------|---------|---------------|
| **Frontend Design** | `skills_claude/frontend-design.md` | Siempre — paleta, tipografía, layout, componentes |
| **Emil Design Eng** | `skills_claude/emil-design-eng.md` | Siempre que haya animaciones, transiciones o interacciones |

### Reglas de la skill Emil (aplicar siempre):
- Solo animar `transform` y `opacity` — nunca `height`, `width`, `padding`
- Duración UI < 300ms. Botones: 100-160ms. Modales: 200-500ms
- Easing: `cubic-bezier(0.23, 1, 0.32, 1)` para entradas, nunca `ease-in`
- Botones y cards: `scale(0.97)` on press, transición 160ms
- Nunca animar desde `scale(0)` — empezar desde `scale(0.95)` + `opacity: 0`
- Stagger en listas: 30-80ms entre ítems
- App mobile: gate hover animations con `@media (hover: hover) and (pointer: fine)`
- Respetar `prefers-reduced-motion`
