import fs from "node:fs"
import path from "node:path"

function aplicar(ruta: string) {
  if (!fs.existsSync(ruta)) return
  for (const linea of fs.readFileSync(ruta, "utf8").split("\n")) {
    const limpia = linea.trim()
    if (!limpia || limpia.startsWith("#")) continue
    const igual = limpia.indexOf("=")
    if (igual <= 0) continue
    const clave = limpia.slice(0, igual).trim()
    let valor = limpia.slice(igual + 1).trim()
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1)
    }
    if (process.env[clave] === undefined) process.env[clave] = valor
  }
}

export function cargarEntorno() {
  const raiz = process.cwd()
  aplicar(path.join(raiz, ".env"))
  aplicar(path.join(raiz, ".env.local"))
}
