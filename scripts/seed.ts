/**
 * SEMILLA DE DEMOSTRACIÓN.
 * No forma parte del arranque ni del build.
 * En producción se niega salvo ALLOW_DEMO_SEED=1.
 */
import { comoJson, crearConexion, urlDeBase } from "@/server/db"
import { crearSemilla } from "@/server/semilla"
import { cargarEntorno } from "./entorno"

async function main() {
  cargarEntorno()

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "1") {
    console.error("La semilla de demostración no se ejecuta en producción.")
    console.error("Si de verdad la quieres en una base de producción, pon ALLOW_DEMO_SEED=1 y vuelve a lanzarla.")
    process.exit(1)
  }

  const clave = process.env.DEMO_PASSWORD ?? ""
  if (clave.trim().length < 8) {
    console.error("Define DEMO_PASSWORD en el entorno (mínimo 8 caracteres). No está en el repositorio.")
    process.exit(1)
  }

  const sql = crearConexion(urlDeBase())
  try {
    const reales = await sql<{ total: number }[]>`
      select count(*)::int as total from usuarios where ejemplo = false
    `
    if ((reales[0]?.total ?? 0) > 0) {
      console.error("Hay cuentas reales en la base. No cargo la semilla de demostración encima.")
      process.exit(1)
    }
    const demos = await sql<{ total: number }[]>`
      select count(*)::int as total from usuarios where ejemplo = true
    `
    if ((demos[0]?.total ?? 0) > 0) {
      console.log("La semilla de demostración ya está cargada. No hago nada.")
      process.exit(0)
    }

    const semilla = crearSemilla(clave)
    await sql.begin(async (tx) => {
      for (const usuario of semilla.usuarios) {
        await tx`
          insert into usuarios (id, email, nombre, rol, isla, sector, ejemplo, salt, hash)
          values (
            ${usuario.id},
            ${usuario.email},
            ${usuario.nombre},
            ${usuario.rol},
            ${usuario.isla},
            ${usuario.sector},
            ${usuario.ejemplo},
            ${usuario.salt},
            ${usuario.hash}
          )
        `
      }
      for (const ficha of semilla.fichas) {
        await tx`
          insert into fichas (id, documento, actualizado_en)
          values (${ficha.id}, ${comoJson(tx, ficha)}, ${ficha.actualizadoEn})
        `
      }
      for (const hueco of semilla.calendario) {
        await tx`
          insert into calendario (id, fecha, documento)
          values (${hueco.id}, ${hueco.fecha}, ${comoJson(tx, hueco)})
        `
      }
      for (const metrica of semilla.metricas) {
        await tx`
          insert into metricas (mes, documento)
          values (${metrica.mes}, ${comoJson(tx, metrica)})
        `
      }
    })
    console.log("Semilla de demostración cargada. Las cuentas usan DEMO_PASSWORD.")
  } finally {
    await sql.end()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
