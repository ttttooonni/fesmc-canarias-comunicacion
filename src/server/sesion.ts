import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import type { UsuarioPublico } from "@/lib/dominio"
import { verificarClave } from "@/server/clave"
import { borrarSesion, guardarSesion, sesionVigente, usuarioPorEmail } from "@/server/repositorio"
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

function secreto(): string {
  const valor = process.env.SESSION_SECRET ?? ""
  if (valor.length < 16) {
    throw new Error("Falta SESSION_SECRET (mínimo 16 caracteres).")
  }
  return valor
}

function firmar(token: string): string {
  const mac = createHmac("sha256", secreto()).update(token).digest("base64url")
  return `${token}.${mac}`
}

function abrirFirma(valor: string): string | null {
  const punto = valor.lastIndexOf(".")
  if (punto <= 0) return null
  const token = valor.slice(0, punto)
  const mac = valor.slice(punto + 1)
  const esperado = createHmac("sha256", secreto()).update(token).digest("base64url")
  const recibido = Buffer.from(mac)
  const calculado = Buffer.from(esperado)
  if (recibido.length !== calculado.length || !timingSafeEqual(recibido, calculado)) return null
  return token
}

function esHttps(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto")
  if (proto) return proto.split(",")[0].trim() === "https"
  return new URL(req.url).protocol === "https:"
}

export function cabeceraSesion(tokenFirmado: string, req: Request, maxAge = SEGUNDOS): string {
  const partes = [
    `${COOKIE}=${encodeURIComponent(tokenFirmado)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ]
  if (process.env.NODE_ENV === "production" || esHttps(req)) partes.push("Secure")
  return partes.join("; ")
}

export function tokenDe(req: Request): string | null {
  const crudo = req.headers.get("cookie") ?? ""
  for (const parte of crudo.split(";")) {
    const [nombre, ...resto] = parte.trim().split("=")
    if (nombre === COOKIE) return abrirFirma(decodeURIComponent(resto.join("=")))
  }
  return null
}

export async function usuarioDe(req: Request): Promise<UsuarioPublico | null> {
  const token = tokenDe(req)
  if (!token) return null
  const usuario = await sesionVigente(token)
  return usuario ? publico(usuario) : null
}

export async function abrirSesion(
  email: string,
  password: string,
): Promise<{ token: string; usuario: UsuarioPublico } | null> {
  const usuario = await usuarioPorEmail(email)
  if (!usuario || !verificarClave(password, usuario.salt, usuario.hash)) return null
  const token = randomBytes(32).toString("hex")
  const expira = new Date(Date.now() + SEGUNDOS * 1000).toISOString()
  await guardarSesion(token, usuario.id, expira)
  return { token: firmar(token), usuario: publico(usuario) }
}

export async function cerrarSesion(token: string | null): Promise<void> {
  if (!token) return
  await borrarSesion(token)
}
