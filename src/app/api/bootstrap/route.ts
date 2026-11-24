import { fichasVisibles } from "@/lib/fichas"
import { esUsuario, exigirUsuario, json } from "@/server/http"
import { listarCalendario, listarFichas, listarMetricas } from "@/server/repositorio"

export async function GET(req: Request) {
  const usuario = await exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  const [fichasTodas, calendario, metricas] = await Promise.all([
    listarFichas(),
    listarCalendario(),
    listarMetricas(),
  ])
  const fichas = fichasVisibles(fichasTodas, usuario).sort((a, b) => (a.actualizadoEn < b.actualizadoEn ? 1 : -1))
  return json({ usuario, fichas, calendario, metricas })
}
