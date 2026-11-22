import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

export function crearClave(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 32).toString("hex")
  return { salt, hash }
}

export function verificarClave(password: string, salt: string, hash: string): boolean {
  const obtenido = scryptSync(password, salt, 32)
  const esperado = Buffer.from(hash, "hex")
  if (obtenido.length !== esperado.length) return false
  return timingSafeEqual(obtenido, esperado)
}
