import { randomBytes } from "node:crypto"
import type { UsuarioPublico } from "@/lib/dominio"
import { verificarClave } from "@/server/clave"
import { guardar, leer } from "@/server/store"
import type { UsuarioInterno } from "@/server/tipos"

export const COOKIE = "ugt_com_sesion"
const SEGUNDOS = 14 * 24 * 60 * 60

export function publico(usuario: UsuarioInterno): UsuarioPublico {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    isla: usuario.isla,
    sector: usuario.sector,
    ejemplo: usuario.ejemplo,
  }
}

function esHttps(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto")
  if (proto) return proto.split(",")[0].trim() === "https"
  return new URL(req.url).protocol === "https:"
}

export function cabeceraSesion(token: string, req: Request, maxAge = SEGUNDOS): string {
  const partes = [`${COOKIE}=${token}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${maxAge}`]
  if (esHttps(req)) partes.push("Secure")
  return partes.join("; ")
}

export function tokenDe(req: Request): string | null {
  const crudo = req.headers.get("cookie") ?? ""
  for (const parte of crudo.split(";")) {
    const [nombre, ...resto] = parte.trim().split("=")
    if (nombre === COOKIE) return decodeURIComponent(resto.join("="))
  }
  return null
}

export function usuarioDe(req: Request): UsuarioPublico | null {
  const token = tokenDe(req)
  if (!token) return null
  const ahora = new Date().toISOString()
  const db = leer()
  const sesion = db.sesiones.find((item) => item.token === token && item.expira > ahora)
  if (!sesion) return null
  const usuario = db.usuarios.find((item) => item.id === sesion.userId)
  return usuario ? publico(usuario) : null
}

export function abrirSesion(email: string, password: string): { token: string; usuario: UsuarioPublico } | null {
  const usuario = leer().usuarios.find((item) => item.email === email.trim().toLowerCase())
  if (!usuario || !verificarClave(password, usuario.salt, usuario.hash)) return null
  const token = randomBytes(32).toString("hex")
  const expira = new Date(Date.now() + SEGUNDOS * 1000).toISOString()
  guardar((db) => {
    const ahora = new Date().toISOString()
    db.sesiones = db.sesiones.filter((item) => item.expira > ahora)
    db.sesiones.push({ token, userId: usuario.id, expira })
  })
  return { token, usuario: publico(usuario) }
}

export function cerrarSesion(token: string | null) {
  if (!token) return
  guardar((db) => {
    db.sesiones = db.sesiones.filter((item) => item.token !== token)
  })
}
