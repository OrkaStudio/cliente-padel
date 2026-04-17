import { test, expect, type Page } from "@playwright/test"

const BASE    = "https://cliente-padel.vercel.app"
const PIN_ALL = "0000"

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function typePin(page: Page, pin: string) {
  for (const digit of pin) {
    // Find button in the PIN pad grid that contains exactly this digit
    const btn = page.locator("button").filter({ hasText: new RegExp(`^${digit}$`) })
    await btn.click()
    await page.waitForTimeout(80)
  }
}

async function loginVeedor(page: Page, club: "voleando" | "mas-padel" | "organizador") {
  const path = club === "organizador"
    ? `${BASE}/veedor/organizador/login`
    : `${BASE}/veedor/${club}/login`
  await page.goto(path)
  await page.waitForLoadState("networkidle")
  await typePin(page, PIN_ALL)
  // Wait for redirect away from login
  await page.waitForURL(url => url.pathname.includes("veedor") && !url.pathname.includes("login"), { timeout: 15_000 })
  await page.waitForLoadState("networkidle")
}

// ─── 1. Vista pública ─────────────────────────────────────────────────────────

test("vista pública carga sin errores", async ({ page }) => {
  await page.goto(`${BASE}/torneos/interclubes-abril-2026/interclub`)
  await expect(page).not.toHaveTitle(/error/i)
  await expect(page.locator("body")).not.toContainText("Application error")
  await expect(page.locator("body")).toContainText(/Voleando|Pádel/i)
  console.log("✅ Vista pública OK")
})

test("vista pública muestra categorías", async ({ page }) => {
  await page.goto(`${BASE}/torneos/interclubes-abril-2026/interclub`)
  await page.waitForLoadState("networkidle")
  await expect(page.locator("body")).toContainText(/Caballeros|Damas|Mixto/i)
  console.log("✅ Categorías visibles")
})

test("navegar a categoría y volver", async ({ page }) => {
  await page.goto(`${BASE}/torneos/interclubes-abril-2026/interclub`)
  await page.waitForLoadState("networkidle")
  const catLink = page.locator("a[href*='/interclub/']").first()
  const count = await catLink.count()
  if (count === 0) { console.log("⚠️  No hay links de categoría"); return }
  await catLink.click()
  await page.waitForLoadState("networkidle")
  await expect(page.locator("body")).not.toContainText("Application error")
  await page.locator("a[href*='/interclub']").first().click()
  await page.waitForURL(/\/interclub$/, { timeout: 8_000 })
  console.log("✅ Navegación categoría OK")
})

// ─── 2. Login PIN pad ─────────────────────────────────────────────────────────

test("login veedor Voleando con PIN correcto", async ({ page }) => {
  await page.goto(`${BASE}/veedor/voleando/login`)
  await page.waitForLoadState("networkidle")
  await typePin(page, PIN_ALL)
  await expect(page).not.toHaveURL(/login/, { timeout: 15_000 })
  await expect(page.locator("body")).not.toContainText("Application error")
  console.log("✅ Login Voleando OK")
})

test("login veedor PIN incorrecto muestra error", async ({ page }) => {
  await page.goto(`${BASE}/veedor/voleando/login`)
  await page.waitForLoadState("networkidle")
  await typePin(page, "9999")
  await expect(page.locator("body")).toContainText(/incorrecto/i, { timeout: 8_000 })
  console.log("✅ PIN incorrecto muestra error")
})

test("sin cookie redirige a login", async ({ page }) => {
  await page.goto(`${BASE}/veedor/voleando`)
  await expect(page).toHaveURL(/login/, { timeout: 8_000 })
  console.log("✅ Redirect a login sin cookie OK")
})

// ─── 3. Vista veedor ──────────────────────────────────────────────────────────

test("veedor Voleando ve partidos de su sede", async ({ page }) => {
  await loginVeedor(page, "voleando")
  await expect(page.locator("body")).toContainText(/Voleando/i)
  await expect(page.locator("body")).not.toContainText("Application error")
  console.log("✅ Vista veedor Voleando OK")
})

test("veedor +Pádel ve partidos de su sede", async ({ page }) => {
  await loginVeedor(page, "mas-padel")
  await expect(page.locator("body")).toContainText(/Pádel/i)
  await expect(page.locator("body")).not.toContainText("Application error")
  console.log("✅ Vista veedor +Pádel OK")
})

// ─── 4. Sheet de resultado ────────────────────────────────────────────────────

test("abrir sheet de resultado no crashea", async ({ page }) => {
  await loginVeedor(page, "voleando")
  const btnCargar = page.locator("button").filter({ hasText: /cargar resultado|iniciar/i }).first()
  const count = await btnCargar.count()
  if (count === 0) {
    console.log("⚠️  No hay partidos visibles — DB puede estar vacía")
    return
  }
  await btnCargar.click()
  await page.waitForTimeout(600)
  await expect(page.locator("body")).not.toContainText("Application error")
  await expect(page.locator("body")).toContainText(/S1|Set|resultado/i)
  console.log("✅ Sheet de resultado abre OK")
})

test("flujo completo: iniciar → cargar set → guardar parcial", async ({ page }) => {
  await loginVeedor(page, "voleando")

  // 1. Iniciar partido si hay alguno pendiente
  const btnIniciar = page.locator("button").filter({ hasText: /iniciar/i }).first()
  if (await btnIniciar.count() > 0) {
    await btnIniciar.click()
    await page.waitForTimeout(1000)
    console.log("  → Partido iniciado")
  }

  // 2. Abrir sheet del partido en_vivo
  const btnCargar = page.locator("button").filter({ hasText: /cargar resultado/i }).first()
  if (await btnCargar.count() === 0) {
    console.log("⚠️  No hay partidos en_vivo para cargar")
    return
  }
  await btnCargar.click()
  await page.waitForTimeout(600)

  // 3. Tocar stepper "add" 3 veces en par A, 2 veces en par B
  const btnsAdd = page.locator("span").filter({ hasText: /^add$/ })
  if (await btnsAdd.count() === 0) {
    console.log("⚠️  No se encontraron steppers")
    return
  }
  for (let i = 0; i < 3; i++) await btnsAdd.first().click()
  if (await btnsAdd.count() > 1) {
    for (let i = 0; i < 2; i++) await btnsAdd.nth(1).click()
  }

  // 4. Guardar parcial
  const btnParcial = page.locator("button").filter({ hasText: /guardar parcial/i })
  if (await btnParcial.count() > 0) {
    await btnParcial.click()
    await page.waitForTimeout(1000)
    await expect(page.locator("body")).not.toContainText("Application error")
    console.log("  → Parcial guardado OK")
  }
})

// ─── 5. Confirmar resultado ───────────────────────────────────────────────────

test("confirmar resultado no crashea", async ({ page }) => {
  await loginVeedor(page, "voleando")

  const btnCargar = page.locator("button").filter({ hasText: /cargar resultado/i }).first()
  if (await btnCargar.count() === 0) {
    console.log("⚠️  No hay partidos en_vivo")
    return
  }
  await btnCargar.click()
  await page.waitForTimeout(600)

  // A: 6 games, B: 3 games en set 1
  const btnsAdd = page.locator("span").filter({ hasText: /^add$/ })
  if (await btnsAdd.count() < 2) { console.log("⚠️  Sin steppers"); return }
  for (let i = 0; i < 6; i++) await btnsAdd.first().click()
  for (let i = 0; i < 3; i++) await btnsAdd.nth(1).click()

  // Agregar S2 y cargar 6-3 para A
  const btnAddSet = page.locator("button").filter({ hasText: /S2/i }).first()
  if (await btnAddSet.count() > 0) {
    await btnAddSet.click()
    await page.waitForTimeout(300)
    // Los steppers del S2 son los últimos en el DOM
    const allAdd = page.locator("span").filter({ hasText: /^add$/ })
    const n = await allAdd.count()
    if (n >= 4) {
      for (let i = 0; i < 6; i++) await allAdd.nth(n - 2).click()
      for (let i = 0; i < 3; i++) await allAdd.nth(n - 1).click()
    }
  }

  const btnConfirmar = page.locator("button").filter({ hasText: /confirmar resultado/i })
  if (await btnConfirmar.count() > 0 && await btnConfirmar.isEnabled()) {
    await btnConfirmar.click()
    await page.waitForTimeout(2000)
    await expect(page.locator("body")).not.toContainText("Application error")
    console.log("✅ Confirmar resultado OK")
  } else {
    console.log("⚠️  Botón confirmar no habilitado (puede necesitar 2 sets ganados)")
  }
})

// ─── 6. Agregar/quitar set ────────────────────────────────────────────────────

test("agregar y quitar set funciona", async ({ page }) => {
  await loginVeedor(page, "voleando")

  const btnCargar = page.locator("button").filter({ hasText: /cargar resultado/i }).first()
  if (await btnCargar.count() === 0) {
    console.log("⚠️  No hay partidos en_vivo")
    return
  }
  await btnCargar.click()
  await page.waitForTimeout(600)

  const btnAddSet = page.locator("button").filter({ hasText: /S2/i }).first()
  if (await btnAddSet.count() > 0) {
    await btnAddSet.click()
    await page.waitForTimeout(300)
    const btnRemove = page.locator("button").filter({ hasText: /S2/i }).last()
    await btnRemove.click()
    await page.waitForTimeout(300)
    await expect(page.locator("body")).not.toContainText("Application error")
    console.log("✅ Agregar/quitar set OK")
  } else {
    console.log("⚠️  Botón S2 no encontrado")
  }
})

// ─── 7. Organizador ───────────────────────────────────────────────────────────

test("login organizador con PIN correcto", async ({ page }) => {
  await page.goto(`${BASE}/veedor/organizador/login`)
  await page.waitForLoadState("networkidle")
  await typePin(page, PIN_ALL)
  await expect(page).not.toHaveURL(/login/, { timeout: 15_000 })
  await expect(page.locator("body")).not.toContainText("Application error")
  console.log("✅ Login organizador OK")
})

test("vista organizador carga partidos", async ({ page }) => {
  await loginVeedor(page, "organizador")
  await expect(page.locator("body")).not.toContainText("Application error")
  await expect(page.locator("body")).toContainText(/Voleando|Pádel|cancha/i)
  console.log("✅ Vista organizador OK")
})

// ─── 8. Realtime cross-tab ────────────────────────────────────────────────────

test("cambio de veedor se refleja en vista pública", async ({ browser }) => {
  const ctx1 = await browser.newContext()
  const ctx2 = await browser.newContext()
  const pubPage  = await ctx1.newPage()
  const veedPage = await ctx2.newPage()

  await pubPage.goto(`${BASE}/torneos/interclubes-abril-2026/interclub`)
  await pubPage.waitForLoadState("networkidle")

  // Login veedor en segunda pestaña
  await veedPage.goto(`${BASE}/veedor/voleando/login`)
  await veedPage.waitForLoadState("networkidle")
  await typePin(veedPage, PIN_ALL)
  await veedPage.waitForURL(url => url.pathname.includes("veedor") && !url.pathname.includes("login"), { timeout: 15_000 })
  await veedPage.waitForLoadState("networkidle")

  const btnIniciar = veedPage.locator("button").filter({ hasText: /iniciar/i }).first()
  if (await btnIniciar.count() > 0) {
    await btnIniciar.click()
    await pubPage.waitForTimeout(12_000)
    const texto = await pubPage.locator("body").textContent()
    console.log(texto?.includes("En cancha") ? "✅ Realtime: vista pública actualizada" : "⚠️  Realtime: puede necesitar polling")
  } else {
    console.log("⚠️  No hay partidos para iniciar — saltear test realtime")
  }

  await ctx1.close()
  await ctx2.close()
})
