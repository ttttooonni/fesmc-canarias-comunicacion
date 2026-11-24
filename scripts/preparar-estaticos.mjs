import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const raizDir = join(dirname(fileURLToPath(import.meta.url)), "..")
const base = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "")
const raiz = `${base}/`

function ruta(camino) {
  const limpia = camino.startsWith("/") ? camino : `/${camino}`
  return `${base}${limpia}`
}

const manifiesto = {
  id: raiz,
  name: "Comunicación digital UGT FeSMC Canarias",
  short_name: "UGT Com",
  description:
    "Redacción digital de UGT FeSMC Canarias. La ficha breve y el circuito se comparten por WhatsApp, sin servidor.",
  start_url: raiz,
  scope: raiz,
  display: "standalone",
  orientation: "portrait",
  lang: "es",
  dir: "ltr",
  background_color: "#F3EFEA",
  theme_color: "#E30613",
  icons: [
    { src: ruta("/icons/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
    { src: ruta("/icons/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
    { src: ruta("/icons/icon-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
}

writeFileSync(join(raizDir, "public/manifest.webmanifest"), `${JSON.stringify(manifiesto, null, 2)}\n`)
console.log(`Manifiesto listo: start_url=${raiz}`)
