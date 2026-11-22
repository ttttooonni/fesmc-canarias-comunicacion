import { cabeceraSesion, cerrarSesion, tokenDe } from "@/server/sesion"
import { json } from "@/server/http"

export async function POST(req: Request) {
  cerrarSesion(tokenDe(req))
  return json({ ok: true }, { headers: { "Set-Cookie": cabeceraSesion("", req, 0) } })
}
