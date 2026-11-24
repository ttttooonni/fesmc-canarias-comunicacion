import { randomUUID } from "node:crypto"
import { crearClave } from "@/server/clave"
import { crearConexion, urlDeBase } from "@/server/db"
import { cargarEntorno } from "./entorno"

cargarEntorno()

const ROLES = ["coordinacion", "gestor", "insular", "sectorial", "juridico"] as const
type Rol = (typeof ROLES)[number]

const nombre = (process.env.USUARIO_NOMBRE ?? "").trim()
const email = (process.env.USUARIO_EMAIL ?? "").trim().toLowerCase()
const clave = process.env.USUARIO_CLAVE ?? ""
const rol = (process.env.USUARIO_ROL ?? "").trim() as Rol
const isla = (process.env.USUARIO_ISLA ?? "").trim() || null
const sector = (process.env.USUARIO_SECTOR ?? "").trim() || null

if (!nombre || !email || clave.length < 8 || !ROLES.includes(rol)) {
  console.error("Hacen falta USUARIO_NOMBRE, USUARIO_EMAIL, USUARIO_CLAVE (mínimo 8) y USUARIO_ROL.")
  console.error(`Roles: ${ROLES.join(", ")}.`)
  process.exit(1)
}
if (rol === "insular" && !isla) {
  console.error("Un responsable insular necesita USUARIO_ISLA.")
  process.exit(1)
}
if (rol === "sectorial" && !sector) {
  console.error("Un responsable sectorial necesita USUARIO_SECTOR.")
  process.exit(1)
}

async function main() {
  const { salt, hash } = crearClave(clave)
  const sql = crearConexion(urlDeBase())
  try {
    await sql`
      insert into usuarios (id, email, nombre, rol, isla, sector, ejemplo, salt, hash)
      values (${randomUUID()}, ${email}, ${nombre}, ${rol}, ${isla}, ${sector}, false, ${salt}, ${hash})
    `
    console.log(`Cuenta real creada para ${email} (${rol}). ejemplo=false.`)
  } finally {
    await sql.end()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
