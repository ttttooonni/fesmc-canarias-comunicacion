import fs from "node:fs"
import path from "node:path"
import { crearConexion, urlDeMigraciones } from "@/server/db"
import { cargarEntorno } from "./entorno"

async function main() {
  cargarEntorno()
  const sql = crearConexion(urlDeMigraciones())
  try {
    await sql`
      create table if not exists schema_migrations (
        id text primary key,
        aplicada_en timestamptz not null default now()
      )
    `
    const directorio = path.join(process.cwd(), "migrations")
    const archivos = fs
      .readdirSync(directorio)
      .filter((nombre) => nombre.endsWith(".sql"))
      .sort()
    for (const archivo of archivos) {
      const hecha = await sql<{ id: string }[]>`select id from schema_migrations where id = ${archivo}`
      if (hecha.length > 0) {
        console.log(`ya aplicada: ${archivo}`)
        continue
      }
      const ruta = path.join(directorio, archivo)
      await sql.begin(async (tx) => {
        await tx.file(ruta)
        await tx`insert into schema_migrations (id) values (${archivo})`
      })
      console.log(`aplicada: ${archivo}`)
    }
    console.log("Migraciones al día.")
  } finally {
    await sql.end()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
