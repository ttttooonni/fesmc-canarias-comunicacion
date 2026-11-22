import { puedeEditarCalendario } from "@/lib/circuito"
import { construirHueco, leerDatosHueco } from "@/lib/calendario-logica"
import { esId, esUsuario, exigirUsuario, json, mal } from "@/server/http"
import { guardar, leer } from "@/server/store"

export async function POST(req: Request) {
  const usuario = exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  if (!puedeEditarCalendario(usuario.rol)) return mal("El calendario lo mueven gestión y coordinación.", 403)
  const cuerpo = (await req.json().catch(() => null)) as { id?: string } | null
  const id = cuerpo?.id ?? ""
  if (!esId(id)) return mal("El hueco no trae un identificador válido.")
  const ya = leer().calendario.find((hueco) => hueco.id === id)
  if (ya) return json({ hueco: ya })
  const datos = leerDatosHueco(cuerpo)
  if (!datos.ok) return mal(datos.error)
  if (datos.datos.fichaId && !leer().fichas.some((ficha) => ficha.id === datos.datos.fichaId)) {
    return mal("Esa ficha no está en el registro.")
  }
  const creado = construirHueco({ id, datos: datos.datos })
  if (!creado.ok) return mal(creado.error)
  guardar((db) => {
    if (!db.calendario.some((hueco) => hueco.id === id)) db.calendario.push(creado.hueco)
  })
  return json({ hueco: creado.hueco }, { status: 201 })
}
