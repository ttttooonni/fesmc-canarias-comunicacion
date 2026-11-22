import { chromium } from "playwright"
import fs from "node:fs"
import path from "node:path"

const base = "http://127.0.0.1:4179"
const dir = path.resolve("docs/capturas")
fs.mkdirSync(dir, { recursive: true })

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox"] })
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  locale: "es-ES",
})
const page = await context.newPage()
const errores = []
page.on("pageerror", (error) => errores.push(error.message))

async function shot(nombre) {
  await page.screenshot({ path: path.join(dir, nombre) })
  console.log("foto", nombre)
}

await page.goto(base, { waitUntil: "networkidle" })
await page.getByRole("heading", { name: "Entra en la mesa del equipo" }).waitFor()
await shot("01-entrada.png")

await page.getByRole("button", { name: "Entrar" }).click()
await page.getByRole("heading", { level: 1 }).waitFor()
await page.waitForTimeout(600)
await shot("02-inicio.png")

await page.getByRole("link", { name: "Fichas" }).click()
await page.getByRole("heading", { name: "Fichas" }).waitFor()
await shot("03-fichas.png")

await page.getByRole("link", { name: /Turno cambiado por mensaje/ }).click()
await page.getByRole("heading", { name: /Turno cambiado/ }).waitFor()
await shot("04-ficha.png")

await page.goto(`${base}/fichas/nueva`, { waitUntil: "networkidle" })
await page.getByRole("heading", { name: "Nueva ficha breve" }).waitFor()
await shot("05-nueva-ficha.png")

await page.goto(`${base}/circuito`, { waitUntil: "networkidle" })
await page.getByRole("heading", { name: "Circuito" }).waitFor()
await shot("06-circuito.png")

await page.goto(`${base}/calendario`, { waitUntil: "networkidle" })
await page.getByRole("heading", { name: "Calendario" }).waitFor()
await shot("07-calendario.png")

await page.goto(`${base}/registro`, { waitUntil: "networkidle" })
await page.getByRole("heading", { name: "Registro" }).waitFor()
await page.getByRole("heading", { name: "Hueco de presencia" }).waitFor()
await shot("08-registro.png")

await page.goto(`${base}/metricas`, { waitUntil: "networkidle" })
await page.getByRole("heading", { name: "Métricas del mes" }).waitFor()
await shot("09-metricas.png")

await page.goto(`${base}/guia`, { waitUntil: "networkidle" })
await page.getByRole("heading", { name: "Guía de estilo y tono" }).waitFor()
await shot("10-guia.png")

await page.goto(`${base}/guia/seguridad`, { waitUntil: "networkidle" })
await page.getByRole("heading", { name: "Seguridad y datos" }).waitFor()
await shot("11-seguridad.png")

await page.goto(base, { waitUntil: "networkidle" })
await page.waitForFunction(async () => {
  const registro = await navigator.serviceWorker?.getRegistration()
  return Boolean(registro?.active)
})
const cacheCaliente = await page.evaluate(async () => {
  const cache = await caches.open("ugt-com-v3")
  const claves = await cache.keys()
  return claves.map((peticion) => new URL(peticion.url).pathname)
})
console.log("cache", cacheCaliente.join(", "))

await context.setOffline(true)
const respuesta = await page.goto(`${base}/guia`, { waitUntil: "domcontentloaded" })
const texto = await page.locator("body").innerText()
console.log("offline status", respuesta?.status(), "guia", texto.includes("Sindi y Cato"))
await shot("12-guia-sin-red.png")

await page.goto(`${base}/`, { waitUntil: "domcontentloaded" })
const inicio = await page.locator("body").innerText()
console.log("offline inicio", inicio.includes("mesa") || inicio.includes("Hola") || inicio.includes("Buenos"))
await shot("13-inicio-sin-red.png")

if (errores.length) {
  console.log("pageerrors", errores)
  process.exitCode = 1
}
await browser.close()
