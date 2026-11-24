import { usuarioDe } from "@/server/sesion"
import { json, mal } from "@/server/http"

export async function GET(req: Request) {
  const usuario = await usuarioDe(req)
  if (!usuario) return mal("Sin sesión.", 401)
  return json({ usuario })
}
