import { abrirSesion, cabeceraSesion } from "@/server/sesion"
import { json, mal } from "@/server/http"

export async function POST(req: Request) {
  const cuerpo = (await req.json().catch(() => null)) as { email?: string; password?: string } | null
  const email = cuerpo?.email ?? ""
  const password = cuerpo?.password ?? ""
  if (!email || !password) return mal("Escribe el correo y la clave.")
  let sesion: Awaited<ReturnType<typeof abrirSesion>>
  try {
    sesion = await abrirSesion(email, password)
  } catch (error) {
    if (error instanceof Error && error.message.includes("SESSION_SECRET")) {
      return mal("El servidor no tiene SESSION_SECRET configurado.", 500)
    }
    throw error
  }
  if (!sesion) return mal("Correo o clave incorrectos.", 401)
  return json(
    { usuario: sesion.usuario },
    { headers: { "Set-Cookie": cabeceraSesion(sesion.token, req) } },
  )
}
