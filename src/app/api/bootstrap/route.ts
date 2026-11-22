import { fichasVisibles } from "@/lib/fichas"
import { esUsuario, exigirUsuario, json } from "@/server/http"
import { leer } from "@/server/store"

export async function GET(req: Request) {
  const usuario = exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  const db = leer()
  const fichas = fichasVisibles(db.fichas, usuario).sort((a, b) => (a.actualizadoEn < b.actualizadoEn ? 1 : -1))
  const calendario = [...db.calendario].sort((a, b) => a.fecha.localeCompare(b.fecha))
  return json({ usuario, fichas, calendario, metricas: db.metricas })
}
