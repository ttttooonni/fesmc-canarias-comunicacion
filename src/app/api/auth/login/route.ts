import { abrirSesion, cabeceraSesion } from "@/server/sesion"
import { json, mal } from "@/server/http"

export async function POST(req: Request) {
  const cuerpo = (await req.json().catch(() => null)) as { email?: string; password?: string } | null
  const email = cuerpo?.email ?? ""
  const password = cuerpo?.password ?? ""
  if (!email || !password) return mal("Escribe el correo y la clave.")
  const sesion = abrirSesion(email, password)
  if (!sesion) return mal("Correo o clave incorrectos.", 401)
  return json(
    { usuario: sesion.usuario },
    { headers: { "Set-Cookie": cabeceraSesion(sesion.token, req) } },
  )
}
