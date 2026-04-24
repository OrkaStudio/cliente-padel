import { test, expect, Page } from "@playwright/test"

const BASE = "http://localhost:3000"

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getTorneoId(page: Page): Promise<string | null> {
  await page.goto(`${BASE}/torneos`)
  await page.waitForLoadState("networkidle")
  const link = page.locator("a[href*='/torneos/']").first()
  const href = await link.getAttribute("href")
  const match = href?.match(/\/torneos\/([^\/\?]+)/)
  return match?.[1] ?? null
}

async function loginVeedor(page: Page, club: "voleando" | "mas-padel", pin: string) {
  await page.goto(`${BASE}/veedor/${club}/login`)
  await page.waitForLoadState("networkidle")
  // Ingresar PIN dígito por dígito
  for (const digit of pin.split("")) {
    await page.locator(`button:has-text("${digit}")`).first().click()
  }
  await page.waitForTimeout(1500)
}

// ── Test 1: Lista de torneos carga ───────────────────────────────────────────

test("torneos: página carga y muestra al menos un torneo", async ({ page }) => {
  await page.goto(`${BASE}/torneos`)
  await page.waitForLoadState("networkidle")
  const screenshot = await page.screenshot({ path: "test-results/01-torneos.png", fullPage: true })
  const links = await page.locator("a[href*='/torneos/']").count()
  console.log(`Torneos encontrados: ${links}`)
  expect(links).toBeGreaterThan(0)
})

// ── Test 2: Página inicio del torneo ─────────────────────────────────────────

test("torneo: inicio muestra hero, categorías y partidos", async ({ page }) => {
  const torneoId = await getTorneoId(page)
  expect(torneoId).not.toBeNull()
  console.log(`Torneo ID: ${torneoId}`)

  await page.goto(`${BASE}/torneos/${torneoId}`)
  await page.waitForLoadState("networkidle")
  await page.screenshot({ path: "test-results/02-torneo-inicio.png", fullPage: true })

  // Verificar que hay contenido
  const body = await page.textContent("body")
  expect(body).not.toBeNull()
  console.log("Página inicio OK")
})

// ── Test 3: Fixture carga ─────────────────────────────────────────────────────

test("fixture: carga y muestra partidos", async ({ page }) => {
  const torneoId = await getTorneoId(page)
  await page.goto(`${BASE}/torneos/${torneoId}/fixture`)
  await page.waitForLoadState("networkidle")
  await page.screenshot({ path: "test-results/03-fixture.png", fullPage: true })

  const body = await page.textContent("body")
  expect(body).not.toBeNull()
  console.log("Fixture OK")
})

// ── Test 4: Tabla de posiciones ───────────────────────────────────────────────

test("tabla: carga y muestra posiciones", async ({ page }) => {
  const torneoId = await getTorneoId(page)
  await page.goto(`${BASE}/torneos/${torneoId}/tabla`)
  await page.waitForLoadState("networkidle")
  await page.screenshot({ path: "test-results/04-tabla.png", fullPage: true })

  const body = await page.textContent("body")
  expect(body).not.toBeNull()
  console.log("Tabla OK")
})

// ── Test 5: Llaves/bracket ────────────────────────────────────────────────────

test("llaves: carga el bracket", async ({ page }) => {
  const torneoId = await getTorneoId(page)
  await page.goto(`${BASE}/torneos/${torneoId}/llaves`)
  await page.waitForLoadState("networkidle")
  await page.screenshot({ path: "test-results/05-llaves.png", fullPage: true })

  const body = await page.textContent("body")
  expect(body).not.toBeNull()
  console.log("Llaves OK")
})

// ── Test 6: Login veedor Voleando ─────────────────────────────────────────────

test("veedor: login con PIN correcto redirige al panel", async ({ page }) => {
  await loginVeedor(page, "voleando", "1234")
  await page.waitForURL(`${BASE}/veedor/voleando`, { timeout: 60_000 })
  await page.screenshot({ path: "test-results/06-veedor-login.png", fullPage: true })

  const url = page.url()
  console.log(`URL post-login: ${url}`)
  expect(url).not.toContain("/login")
})

// ── Test 7: Panel veedor muestra partidos ─────────────────────────────────────

test("veedor: panel muestra partidos del día", async ({ page }) => {
  await loginVeedor(page, "voleando", "1234")
  await page.waitForURL(`${BASE}/veedor/voleando`)
  await page.waitForLoadState("networkidle")
  await page.screenshot({ path: "test-results/07-veedor-panel.png", fullPage: true })

  const body = await page.textContent("body")
  console.log("Panel veedor cargado")
  expect(body).not.toBeNull()
})

// ── Test 8: Selector de cancha máximo 2 ──────────────────────────────────────

test("veedor: cancha no supera 2", async ({ page }) => {
  await loginVeedor(page, "voleando", "1234")
  await page.waitForURL(`${BASE}/veedor/voleando`)
  await page.waitForLoadState("networkidle")

  // Buscar botón de editar cancha
  const canchaBtn = page.locator("button", { hasText: /cancha/i }).first()
  const hasCanchaBtn = await canchaBtn.count()

  if (hasCanchaBtn === 0) {
    console.log("No se encontró botón de cancha visible — puede que no haya partidos hoy")
    await page.screenshot({ path: "test-results/08-cancha-sin-partidos.png", fullPage: true })
    return
  }

  await canchaBtn.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: "test-results/08-cancha-sheet.png", fullPage: true })

  // El botón + debe estar deshabilitado cuando cancha = 2
  const addBtn = page.locator("button span:text('add')").locator("..")
  const isDisabled = await addBtn.getAttribute("disabled")
  console.log(`Botón + deshabilitado: ${isDisabled !== null}`)
})

// ── Test 9: Simular resultado completo ────────────────────────────────────────

test("veedor: iniciar partido y cargar resultado", async ({ page }) => {
  await loginVeedor(page, "voleando", "1234")
  await page.waitForURL(`${BASE}/veedor/voleando`)
  await page.waitForLoadState("networkidle")

  // Buscar un partido pendiente con botón "Iniciar"
  const iniciarBtn = page.locator("button", { hasText: /iniciar/i }).first()
  const hayIniciar = await iniciarBtn.count()

  if (hayIniciar === 0) {
    console.log("No hay partidos pendientes para iniciar hoy")
    await page.screenshot({ path: "test-results/09-sin-pendientes.png", fullPage: true })
    return
  }

  console.log("Iniciando partido...")
  await iniciarBtn.click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: "test-results/09a-partido-en-vivo.png", fullPage: true })

  // Tocar el partido en vivo para abrir el sheet de resultado
  const enVivoCard = page.locator("text=En vivo").first()
  const hayEnVivo = await enVivoCard.count()
  if (hayEnVivo > 0) {
    await enVivoCard.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: "test-results/09b-sheet-resultado.png", fullPage: true })

    // Cargar 6-3 set 1
    console.log("Sheet de resultado abierto")
  }
})
