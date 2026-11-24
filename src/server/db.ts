import postgres from "postgres"

export type Sql = postgres.Sql

const globalForDb = globalThis as unknown as { __ugtSql?: Sql }

export function urlDeBase(): string {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("Falta DATABASE_URL.")
  return url
}

export function urlDeMigraciones(): string {
  return process.env.DATABASE_URL_UNPOOLED || urlDeBase()
}

export function opcionesDeConexion(url: string): postgres.Options<Record<string, never>> {
  const sinSsl = url.includes("sslmode=disable") || url.includes("localhost") || url.includes("127.0.0.1")
  return {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
    ssl: sinSsl ? false : "require",
  }
}

export function crearConexion(url = urlDeBase()): Sql {
  return postgres(url, opcionesDeConexion(url))
}

export function obtenerSql(): Sql {
  if (!globalForDb.__ugtSql) globalForDb.__ugtSql = crearConexion()
  return globalForDb.__ugtSql
}

export function comoJson(sql: { json: Sql["json"] }, valor: unknown): postgres.Parameter {
  return sql.json(JSON.parse(JSON.stringify(valor)) as postgres.JSONValue)
}
