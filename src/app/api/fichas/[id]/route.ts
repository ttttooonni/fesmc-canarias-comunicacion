import type { EstadoId, IslaId } from "@/lib/dominio"
import { actualizarDatos, actualizarTextos, aclararFicha, aplicarTransicion, registrarCompartido } from "@/lib/fichas"
import { puedeVerFicha } from "@/lib/validar"
import { esId, esUsuario, exigirUsuario, json, mal } from "@/server/http"
import { guardar, leer } from "@/server/store"

type Cuerpo = {
  tipo?: string
  eventoId?: string
  destino?: EstadoId
  nota?: string
  programadoPara?: string
  checklist?: string[]
  textoPublicacion?: string
  textoCompartir?: string
  isla?: IslaId
}

export async function GET(req: Request, contexto: { params: Promise<{ id: string }> }) {
  const usuario = exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  const { id } = await contexto.params
  const ficha = leer().fichas.find((item) => item.id === id)
  if (!ficha || !puedeVerFicha(usuario, ficha)) return mal("No encontramos esa ficha.", 404)
  return json({ ficha })
}

export async function PATCH(req: Request, contexto: { params: Promise<{ id: string }> }) {
  const usuario = exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  const { id } = await contexto.params
  if (!esId(id)) return mal("Identificador no válido.")
  const cuerpo = (await req.json().catch(() => null)) as Cuerpo | null
  if (!cuerpo?.tipo) return mal("Falta el tipo de cambio.")
  const actual = leer().fichas.find((item) => item.id === id)
  if (!actual || !puedeVerFicha(usuario, actual)) return mal("No encontramos esa ficha.", 404)
  const ahora = new Date().toISOString()
  const eventoId = cuerpo.eventoId || ""
  if ((cuerpo.tipo === "transicion" || cuerpo.tipo === "aclaracion" || cuerpo.tipo === "datos" || cuerpo.tipo === "compartir") && !esId(eventoId)) {
    return mal("Falta el identificador del cambio.")
  }

  let resultado: { ok: true; ficha: typeof actual } | { ok: false; error: string; errores?: Record<string, string> }
  if (cuerpo.tipo === "datos") {
    resultado = actualizarDatos({ ficha: actual, datos: cuerpo, usuario, ahora, eventoId })
  } else if (cuerpo.tipo === "textos") {
    resultado = actualizarTextos({
      ficha: actual,
      textoPublicacion: cuerpo.textoPublicacion ?? "",
      textoCompartir: cuerpo.textoCompartir ?? "",
      usuario,
      ahora,
    })
  } else if (cuerpo.tipo === "transicion") {
    resultado = aplicarTransicion({
      ficha: actual,
      destino: cuerpo.destino as EstadoId,
      eventoId,
      usuario,
      ahora,
      nota: cuerpo.nota,
      programadoPara: cuerpo.programadoPara,
      checklist: cuerpo.checklist,
    })
  } else if (cuerpo.tipo === "aclaracion") {
    resultado = aclararFicha({ ficha: actual, nota: cuerpo.nota ?? "", eventoId, usuario, ahora })
  } else if (cuerpo.tipo === "compartir") {
    resultado = registrarCompartido({
      ficha: actual,
      isla: cuerpo.isla as IslaId,
      eventoId,
      usuario,
      ahora,
    })
  } else {
    return mal("No reconozco ese cambio.")
  }

  if (!resultado.ok) {
    return json({ error: resultado.error, errores: "errores" in resultado ? resultado.errores : undefined }, { status: 400 })
  }
  const ficha = resultado.ficha
  guardar((db) => {
    const indice = db.fichas.findIndex((item) => item.id === id)
    if (indice >= 0) db.fichas[indice] = ficha
  })
  return json({ ficha })
}
