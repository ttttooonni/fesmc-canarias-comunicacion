import { puedeEditarMetricas } from "@/lib/circuito"
import { construirMetrica } from "@/lib/metricas-logica"
import { esUsuario, exigirUsuario, json, mal } from "@/server/http"
import { guardarMetrica } from "@/server/repositorio"

export async function PUT(req: Request, contexto: { params: Promise<{ mes: string }> }) {
  const usuario = await exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  if (!puedeEditarMetricas(usuario.rol)) return mal("Las métricas las vuelcan gestión y coordinación.", 403)
  const { mes } = await contexto.params
  const cuerpo = await req.json().catch(() => null)
  const creada = construirMetrica({ mes, entrada: cuerpo, usuario, ahora: new Date().toISOString() })
  if (!creada.ok) return mal(creada.error)
  await guardarMetrica(creada.metrica)
  return json({ metrica: creada.metrica })
}
