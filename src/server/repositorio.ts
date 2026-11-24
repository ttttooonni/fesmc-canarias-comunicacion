import type { Ficha, Hueco, MetricaMes } from "@/lib/dominio"
import { comoJson, obtenerSql } from "@/server/db"
import type { UsuarioInterno } from "@/server/tipos"

type FilaUsuario = {
  id: string
  email: string
  nombre: string
  rol: UsuarioInterno["rol"]
  isla: UsuarioInterno["isla"]
  sector: UsuarioInterno["sector"]
  ejemplo: boolean
  salt: string
  hash: string
}

function aUsuario(fila: FilaUsuario): UsuarioInterno {
  return {
    id: fila.id,
    email: fila.email,
    nombre: fila.nombre,
    rol: fila.rol,
    isla: fila.isla,
    sector: fila.sector,
    ejemplo: fila.ejemplo,
    salt: fila.salt,
    hash: fila.hash,
  }
}

export async function usuarioPorEmail(email: string): Promise<UsuarioInterno | null> {
  const sql = obtenerSql()
  const filas = await sql<FilaUsuario[]>`
    select id, email, nombre, rol, isla, sector, ejemplo, salt, hash
    from usuarios
    where email = ${email.trim().toLowerCase()}
  `
  return filas[0] ? aUsuario(filas[0]) : null
}

export async function usuarioPorId(id: string): Promise<UsuarioInterno | null> {
  const sql = obtenerSql()
  const filas = await sql<FilaUsuario[]>`
    select id, email, nombre, rol, isla, sector, ejemplo, salt, hash
    from usuarios
    where id = ${id}
  `
  return filas[0] ? aUsuario(filas[0]) : null
}

export async function guardarSesion(token: string, userId: string, expira: string): Promise<void> {
  const sql = obtenerSql()
  const ahora = new Date().toISOString()
  await sql`delete from sesiones where expira <= ${ahora}`
  await sql`
    insert into sesiones (token, user_id, expira)
    values (${token}, ${userId}, ${expira})
  `
}

export async function sesionVigente(token: string): Promise<UsuarioInterno | null> {
  const sql = obtenerSql()
  const ahora = new Date().toISOString()
  const filas = await sql<FilaUsuario[]>`
    select u.id, u.email, u.nombre, u.rol, u.isla, u.sector, u.ejemplo, u.salt, u.hash
    from sesiones s
    join usuarios u on u.id = s.user_id
    where s.token = ${token} and s.expira > ${ahora}
  `
  return filas[0] ? aUsuario(filas[0]) : null
}

export async function borrarSesion(token: string): Promise<void> {
  const sql = obtenerSql()
  await sql`delete from sesiones where token = ${token}`
}

export async function listarFichas(): Promise<Ficha[]> {
  const sql = obtenerSql()
  const filas = await sql<{ documento: Ficha }[]>`
    select documento from fichas order by actualizado_en desc
  `
  return filas.map((fila) => fila.documento)
}

export async function fichaPorId(id: string): Promise<Ficha | null> {
  const sql = obtenerSql()
  const filas = await sql<{ documento: Ficha }[]>`select documento from fichas where id = ${id}`
  return filas[0]?.documento ?? null
}

export async function guardarFicha(ficha: Ficha): Promise<void> {
  const sql = obtenerSql()
  await sql`
    insert into fichas (id, documento, actualizado_en)
    values (${ficha.id}, ${comoJson(sql, ficha)}, ${ficha.actualizadoEn})
    on conflict (id) do update
      set documento = excluded.documento,
          actualizado_en = excluded.actualizado_en
  `
}

export async function listarCalendario(): Promise<Hueco[]> {
  const sql = obtenerSql()
  const filas = await sql<{ documento: Hueco }[]>`
    select documento from calendario order by fecha
  `
  return filas.map((fila) => fila.documento)
}

export async function huecoPorId(id: string): Promise<Hueco | null> {
  const sql = obtenerSql()
  const filas = await sql<{ documento: Hueco }[]>`select documento from calendario where id = ${id}`
  return filas[0]?.documento ?? null
}

export async function guardarHueco(hueco: Hueco): Promise<void> {
  const sql = obtenerSql()
  await sql`
    insert into calendario (id, fecha, documento)
    values (${hueco.id}, ${hueco.fecha}, ${comoJson(sql, hueco)})
    on conflict (id) do update
      set fecha = excluded.fecha,
          documento = excluded.documento
  `
}

export async function listarMetricas(): Promise<MetricaMes[]> {
  const sql = obtenerSql()
  const filas = await sql<{ documento: MetricaMes }[]>`select documento from metricas order by mes`
  return filas.map((fila) => fila.documento)
}

export async function guardarMetrica(metrica: MetricaMes): Promise<void> {
  const sql = obtenerSql()
  await sql`
    insert into metricas (mes, documento)
    values (${metrica.mes}, ${comoJson(sql, metrica)})
    on conflict (mes) do update set documento = excluded.documento
  `
}
