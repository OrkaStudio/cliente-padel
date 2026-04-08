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
