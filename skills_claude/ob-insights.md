# Onboarding Insights Agent

Analista de producto para **Agora** (B2B SaaS LATAM). Produce un reporte de onboarding con datos reales, impacto cuantificado y acciones accionables.

---

## Paso 1 — Obtener datos (paralelo)

Ejecutá este script. Corre todos los fetches en background y espera al final.

```bash
KEY="9b9866917c3165f29b0383a54679ca7"
SECRET="fea871d3e9684aaa28e73ab534677109"
AUTH=$(printf '%s' "$KEY:$SECRET" | base64 | tr -d '\n')

today=$(date +%Y%m%d)
d7=$(date -d "7 days ago"  +%Y%m%d 2>/dev/null || date -v-7d  +%Y%m%d)
d14=$(date -d "14 days ago" +%Y%m%d 2>/dev/null || date -v-14d +%Y%m%d)
d30=$(date -d "30 days ago" +%Y%m%d 2>/dev/null || date -v-30d +%Y%m%d)
d31=$(date -d "31 days ago" +%Y%m%d 2>/dev/null || date -v-31d +%Y%m%d)
d61=$(date -d "61 days ago" +%Y%m%d 2>/dev/null || date -v-61d +%Y%m%d)

# Funnel (ordered)
ff() {
  local lbl=$1 s=$2 e=$3; shift 3
  local p=""; for ev in "$@"; do p+="e=$(node -e "process.stdout.write(encodeURIComponent(JSON.stringify({event_type:'$ev'}))")&"; done
  local r=$(curl -s -H "Authorization: Basic $AUTH" "https://amplitude.com/api/2/funnels?${p%&}&start=$s&end=$e&mode=ordered&i=1")
  echo "$r" | node -e "
const c=[]; process.stdin.on('data',d=>c.push(d)); process.stdin.on('end',()=>{
  try {
    const r=JSON.parse(c.join('')); const d=r.data?.[0];
    if(!d){console.log('$lbl: NO_DATA'); return;}
    const cnt=d.convertedUniqueCounts||{};
    const keys=Object.keys(cnt).sort((a,b)=>+a-+b);
    const times=(d.dayAvgTransTimes?.series?.[0]||[]).map(t=>t?Math.round(t/60000):0);
    console.log('$lbl counts:'+keys.map(k=>cnt[k]).join(','));
    if(times.length) console.log('$lbl times:'+times.join(','));
  } catch(e){ console.log('$lbl: PARSE_ERROR'); }
});"
}

# Evento individual (totals)
fe() {
  local lbl=$1 ev=$2 s=$3 e=$4
  local p=$(node -e "process.stdout.write(encodeURIComponent(JSON.stringify({event_type:'$ev'}))")
  local r=$(curl -s -H "Authorization: Basic $AUTH" "https://amplitude.com/api/2/events/segmentation?e=$p&start=$s&end=$e&i=1&m=totals")
  echo "$r" | node -e "
const c=[]; process.stdin.on('data',d=>c.push(d)); process.stdin.on('end',()=>{
  try {
    const s=(JSON.parse(c.join('')).data?.series?.[0]||[]);
    console.log('$lbl:'+s.reduce((a,b)=>a+b,0));
  } catch(e){ console.log('$lbl:0'); }
});"
}

# ── Funnels 30d ──────────────────────────────────────────────────────────
ff ONB30 $d30 $today \
  "Onboarding Started" "Onboarding Step 1 Completed" "Onboarding Step 2 Completed" \
  "Onboarding Step 3 Completed" "Onboarding Step 4 Completed" "Onboarding Step 5 Completed" \
  "Onboarding Step 6 Completed" "Onboarding Completed" &

ff S130 $d30 $today \
  "Setup 1 Started" "Setup 1 Step 1 Completed" "Setup 1 Step 2 Completed" \
  "Setup 1 Step 3 Completed" "Setup 1 Step 4 Completed" "Setup 1 Step 5 Completed" \
  "Setup 1 Completed" &

ff S230 $d30 $today \
  "Setup 2 Started" "Setup 2 Step 0 Completed" "Setup 2 Step 1 Completed" \
  "Setup 2 Step 2 Completed" "Setup 2 Completed" &

# ── Período anterior 30d (para delta) ────────────────────────────────────
ff ONBP $d61 $d31 "Onboarding Started" "Onboarding Completed" &
ff S1P  $d61 $d31 "Setup 1 Started" "Setup 1 Completed" &
ff S2P  $d61 $d31 "Setup 2 Started" "Setup 2 Completed" &

# ── Pulso semanal (últimos 7d vs 7d anteriores) ───────────────────────────
ff ONB7  $d7  $today "Onboarding Started" "Onboarding Completed" &
ff ONB7P $d14 $d7   "Onboarding Started" "Onboarding Completed" &
ff S27   $d7  $today "Setup 2 Started" "Setup 2 Completed" &

# ── Eventos de fricción (últimos 30d) ─────────────────────────────────────
fe WA_FAIL   "Onboarding Step 5 Failed"    $d30 $today &
fe PLAN_SEL  "Onboarding Step 6 Plan Selected" $d30 $today &
fe S1_SKIP1  "Setup 1 Step 1 Skipped"     $d30 $today &
fe S1_SKIP3  "Setup 1 Step 3 Skipped"     $d30 $today &
fe S1_FAIL4  "Setup 1 Step 4 Failed"      $d30 $today &
fe S1_FAIL5  "Setup 1 Step 5 Failed"      $d30 $today &
fe S1_BACK   "Setup 1 Step Previous Clicked" $d30 $today &

wait
```

---

## Paso 2 — Analizar

Con los datos, calculá todo esto antes de escribir el output:

**Conversiones:**
- `conv_onb = ONB30[last] / ONB30[0] * 100`
- `conv_s1 = S130[last] / S130[0] * 100`
- `conv_s2 = S230[last] / S230[0] * 100`
- `e2e = S230[last] / ONB30[0] * 100`
- Deltas: comparar con período anterior (ONBP, S1P, S2P)

**Dropoff por step (onboarding):**
Para cada step N: `dropoff = (step[N-1] - step[N]) / step[N-1] * 100`
Usuarios perdidos absolutos: `step[N-1] - step[N]`

**Impacto cuantificado (calcular para cada punto crítico):**
`usuarios_ganados_si_mejoro_10pp = ONB30[0] * 0.10 * conv_downstream`
donde `conv_downstream` = % de usuarios que completan Setup 2 entre los que pasan ese step.

**Pulso semanal:**
`conv_7d = ONB7[last] / ONB7[0] * 100` vs `conv_7d_prev = ONB7P[last] / ONB7P[0] * 100`

**Eventos de fricción:**
- `WA_FAIL` = fallas reales en verificación WhatsApp
- `PLAN_SEL / ONB30[step_6]` = % que abre el plan pero no convierte (si < 80% = hay fricción en pricing)
- `S1_BACK / S1_NEXT` = ratio de navegación hacia atrás en Setup 1 (>0.3 = confusión)

**Setup 1:** Los steps 2 y 3 son skippables → el ordered funnel los cuenta como abandono. Para Setup 1, la conversión real es `S130[last] / S130[0]`, no los steps intermedios. Usá los eventos `S1_SKIP1` y `S1_SKIP3` para separar skips de abandonos reales.

---

## Paso 3 — Output

**Máximo 1 pantalla. Sin notas de metodología. Sin cálculos intermedios.**

El output tiene exactamente 4 secciones, en este orden:

---

## Onboarding · [fecha] · e2e X%

### Qué cambió
- [▲/▼ Xpp en ONB vs período anterior — 1 frase con causa probable]
- [▲/▼ Xpp en S2 o señal de semana — 1 frase]
- (máx 3 bullets; si nada cambió significativamente: "Sin cambios relevantes vs período anterior")

### Mejoras
- [Lo que mejoró, con número. Ej: "Setup 2: ▲Xpp — proceso estable"]
- (si nada mejoró: omitir esta sección)

### Puntos de mejora

| # | Step | Dropoff | Perdidos/mes | Si +10pp → | Fix | Esfuerzo |
|---|------|---------|-------------|------------|-----|----------|
| 1 | [nombre] | X% | X usuarios | +X activaciones | [acción ≤8 palabras] | Bajo |
| 2 | [nombre] | X% | X usuarios | +X activaciones | [acción] | Bajo |
| 3 | [nombre] | X% | X usuarios | +X activaciones | [acción] | Medio |

### Wireframes
Para los top 2-3 puntos de mejora, crear wireframes ANTES/DESPUÉS usando la herramienta `mcp__claude_ai_tldraw__create_shapes`.

Cada wireframe debe mostrar:
- **ANTES**: el estado actual del step (causa del dropoff)
- **DESPUÉS**: el cambio propuesto (fix de la tabla)
- Etiqueta con: dropoff%, usuarios perdidos/mes, backend note (si aplica)

Agrupar los wireframes en una sola canvas. Usar el mapa de steps (al final de este archivo) para describir correctamente cada pantalla.

---

## Paso 4 — Distribuir en Slack (opcional)

Al final del reporte, preguntá siempre: "¿Querés que postee esto en Slack? ¿En qué canal?"

Si el usuario acepta, usá `mcp__claude_ai_Slack__slack_send_message` con este mensaje (reemplazando los valores reales):

```
:bar_chart: *Onboarding Report* · [fecha, ej: 27 Mar 2026]

[2 oraciones del resumen ejecutivo]

---
*Métricas 30 días* · Semana: ONB X% [▲/▼ vs anterior]

• Onboarding: X iniciaron → X completaron · *X%* [▲/▼ Xpp]
• Setup 1: X iniciaron → X completaron · *X%* [▲/▼ Xpp]
• Setup 2: X iniciaron → X completaron · *X%* [▲/▼ Xpp]
• *End-to-end: X iniciaron → X activaron · *X%* [▲/▼ Xpp]*

---
:warning: *Puntos críticos*

1. *[Step]* — X% dropoff · X usuarios/mes · Si +10pp → +X activaciones
   Fix: [acción ≤8 palabras] · [Equipo] · Esfuerzo [Alto/Medio/Bajo]
2. *[Step]* — X% dropoff · X usuarios/mes · Si +10pp → +X activaciones
   Fix: [acción] · [Equipo] · Esfuerzo [Alto/Medio/Bajo]
3. *[Step]* — X% dropoff · X usuarios/mes · Si +10pp → +X activaciones
   Fix: [acción] · [Equipo] · Esfuerzo [Alto/Medio/Bajo]

---
:friction: *Fricción*
• WA: X fallas · [1 frase]
• Plan: X% vio pero no eligió · [1 frase]
• S1 back/next: X · [1 frase]

---
:chart_with_upwards_trend: *Tendencia*
• ONB: [▲/▼ Xpp] — [causa]
• S1: [▲/▼ Xpp] — [causa]
• S2: [▲/▼ Xpp] — [causa]

_Datos: Amplitude · Período: [fecha inicio] – [fecha fin] · /ob-insights_
```

Notas de formato Slack:
- Usar `*texto*` para negrita (no `**`)
- No usar tablas Markdown — Slack no las renderiza
- Usar `:emoji:` para estructura visual
- El bloque `---` se renderiza como separador horizontal en Slack

---

## Paso 5 — Proceso recurrente

Para automatizar este reporte semanalmente, al final del análisis ofrecé al usuario:

> "¿Querés que programe este reporte para que corra automáticamente cada semana? Puedo configurarlo con `/schedule`."

Si acepta, ejecutá el skill `/schedule` con:
- Frecuencia: lunes a las 9am
- Prompt: `/ob-insights` (opcionalmente con "y postealo en #[canal]")

---

## Mapa de steps

| Step | Onboarding | Setup 1 | Setup 2 |
|------|-----------|---------|---------|
| Start | Onboarding Started | Setup 1 Started | Setup 2 Started |
| 1 | Email + contraseña | Métodos de pago | Expansión servicios |
| 2 | Categoría (skippable) | Tipo negocio (skippable) | Configuración |
| 3 | Nombre del negocio | Creación equipo (skippable) | Confirmación |
| 4 | Teléfono | Horarios de trabajo | — |
| 5 | Verificación WhatsApp | Primer servicio | — |
| 6 | Selección de plan | — | — |
| End | Onboarding Completed | Setup 1 Completed | Setup 2 Completed |

**Fricción conocida:** WhatsApp (step 5 ONB) requiere acción fuera de la app · Plan (step 6 ONB) es decisión de compra · Horarios (step 4 S1) tiene muchos campos · Equipo (step 3 S1) confuso para profesionales solos.
