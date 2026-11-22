import { puedeCrear } from "@/lib/circuito"
import { construirFicha } from "@/lib/fichas"
import { esId, esUsuario, exigirUsuario, json, mal } from "@/server/http"
import { guardar, leer } from "@/server/store"

export async function POST(req: Request) {
  const usuario = exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  if (!puedeCrear(usuario.rol)) return mal("Tu rol no envía fichas.", 403)
  const cuerpo = (await req.json().catch(() => null)) as { id?: string } | null
  const id = cuerpo?.id ?? ""
  if (!esId(id)) return mal("La ficha no trae un identificador válido.")
  const existente = leer().fichas.find((ficha) => ficha.id === id)
  if (existente) {
    if (existente.creadoPorId !== usuario.id && usuario.rol !== "gestor" && usuario.rol !== "coordinacion") {
      return mal("Ya existe una ficha con ese identificador.", 409)
    }
    return json({ ficha: existente })
  }
  const creada = construirFicha({ id, datos: cuerpo, usuario, ahora: new Date().toISOString() })
  if (!creada.ok) return json({ error: creada.error, errores: creada.errores }, { status: 400 })
  guardar((db) => {
    if (!db.fichas.some((ficha) => ficha.id === id)) db.fichas.push(creada.ficha)
  })
  return json({ ficha: creada.ficha }, { status: 201 })
}
