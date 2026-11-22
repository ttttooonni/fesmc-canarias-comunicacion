import type { Ficha, Hueco, MetricaMes, UsuarioPublico } from "@/lib/dominio"

export type UsuarioInterno = UsuarioPublico & {
  salt: string
  hash: string
}

export type Sesion = {
  token: string
  userId: string
  expira: string
}

export type BaseDatos = {
  version: 1
  usuarios: UsuarioInterno[]
  sesiones: Sesion[]
  fichas: Ficha[]
  calendario: Hueco[]
  metricas: MetricaMes[]
}
