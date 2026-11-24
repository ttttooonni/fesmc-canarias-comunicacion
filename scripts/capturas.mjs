import { chromium } from "playwright"
import fs from "node:fs"

const dir = "/opt/cursor/artifacts"
fs.mkdirSync(dir, { recursive: true })
const base = "http://127.0.0.1:4179"
const dato = process.argv[2]
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox"] })
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "es-ES" })
await page.goto(base, { waitUntil: "networkidle" })
await page.getByLabel("Tu nombre").fill("Yaiza León")
await page.getByRole("radio", { name: "Responsable insular" }).check()
await page.getByRole("button", { name: "Empezar" }).click()
await page.getByRole("button", { name: "Saltar" }).click()
await page.getByRole("button", { name: /Cargar ejemplo/ }).click()
await page.getByRole("heading", { name: /Yaiza/ }).waitFor()
await page.evaluate(() => window.scrollTo(0, 0))
await page.screenshot({ path: `${dir}/inicio.png` })
await page.goto(`${base}/fichas/`, { waitUntil: "networkidle" })
await page.getByRole("link", { name: /Turno cambiado/ }).click()
const whatsapp = page.getByRole("button", { name: "Compartir por WhatsApp" })
await whatsapp.waitFor()
await whatsapp.evaluate((elemento) => elemento.scrollIntoView({ block: "center" }))
await page.screenshot({ path: `${dir}/ficha-whatsapp.png` })
await page.goto(`${base}/#/importar?d=${dato}`, { waitUntil: "networkidle" })
await page.getByText(/Ficha actualizada|Ficha importada/).waitFor()
await page.goto(`${base}/fichas/`, { waitUntil: "networkidle" })
await page.getByRole("link", { name: /Turno cambiado/ }).click()
await page.getByText("Aprobada").first().waitFor()
await page.screenshot({ path: `${dir}/ficha-importada.png` })
const cuerpo = await page.locator("body").innerText()
if (!cuerpo.includes("Aprobada")) {
  console.error("importacion no visible")
  process.exitCode = 1
}
console.log("capturas listas")
await browser.close()
