import fs from "node:fs"
import path from "node:path"
import { crearSemilla } from "@/server/semilla"
import type { BaseDatos } from "@/server/tipos"

const RUTA = process.env.DATA_FILE || path.join(process.cwd(), "data", "store.json")

let memoria: BaseDatos | null = null

function persistir(db: BaseDatos) {
  fs.mkdirSync(/* turbopackIgnore: true */ path.dirname(RUTA), { recursive: true })
  const temporal = `${RUTA}.tmp`
  fs.writeFileSync(/* turbopackIgnore: true */ temporal, JSON.stringify(db))
  fs.renameSync(/* turbopackIgnore: true */ temporal, RUTA)
}

export function leer(): BaseDatos {
  if (memoria) return memoria
  if (fs.existsSync(/* turbopackIgnore: true */ RUTA)) {
    memoria = JSON.parse(fs.readFileSync(/* turbopackIgnore: true */ RUTA, "utf8")) as BaseDatos
    return memoria
  }
  memoria = crearSemilla()
  persistir(memoria)
  return memoria
}

export function guardar(mutar: (db: BaseDatos) => void) {
  const db = leer()
  mutar(db)
  persistir(db)
}
