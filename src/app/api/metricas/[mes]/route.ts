import { puedeEditarMetricas } from "@/lib/circuito"
import { construirMetrica } from "@/lib/metricas-logica"
import { esUsuario, exigirUsuario, json, mal } from "@/server/http"
import { guardar, leer } from "@/server/store"

export async function PUT(req: Request, contexto: { params: Promise<{ mes: string }> }) {
  const usuario = exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  if (!puedeEditarMetricas(usuario.rol)) return mal("Las métricas las vuelcan gestión y coordinación.", 403)
  const { mes } = await contexto.params
  const cuerpo = await req.json().catch(() => null)
  const creada = construirMetrica({ mes, entrada: cuerpo, usuario, ahora: new Date().toISOString() })
  if (!creada.ok) return mal(creada.error)
  guardar((db) => {
    const indice = db.metricas.findIndex((item) => item.mes === mes)
    if (indice >= 0) db.metricas[indice] = creada.metrica
    else db.metricas.push(creada.metrica)
  })
  const metrica = leer().metricas.find((item) => item.mes === mes)
  return json({ metrica })
}
