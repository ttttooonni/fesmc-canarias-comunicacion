import type { UsuarioPublico } from "@/lib/dominio"
import { usuarioDe } from "@/server/sesion"

export function json(datos: unknown, init?: ResponseInit) {
  return Response.json(datos, init)
}

export function mal(error: string, status = 400) {
  return Response.json({ error }, { status })
}

export function exigirUsuario(req: Request): UsuarioPublico | Response {
  const usuario = usuarioDe(req)
  if (!usuario) return mal("Tienes que entrar para continuar.", 401)
  return usuario
}

export function esUsuario(valor: UsuarioPublico | Response): valor is UsuarioPublico {
  return !(valor instanceof Response)
}

export function esId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{8,80}$/.test(id)
}
