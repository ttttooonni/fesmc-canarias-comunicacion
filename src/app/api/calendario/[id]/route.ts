import { puedeEditarCalendario } from "@/lib/circuito"
import { construirHueco, leerDatosHueco } from "@/lib/calendario-logica"
import { esUsuario, exigirUsuario, json, mal } from "@/server/http"
import { guardar, leer } from "@/server/store"

export async function PATCH(req: Request, contexto: { params: Promise<{ id: string }> }) {
  const usuario = exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  if (!puedeEditarCalendario(usuario.rol)) return mal("El calendario lo mueven gestión y coordinación.", 403)
  const { id } = await contexto.params
  const anterior = leer().calendario.find((hueco) => hueco.id === id)
  if (!anterior) return mal("No encontramos ese hueco.", 404)
  const cuerpo = await req.json().catch(() => null)
  const datos = leerDatosHueco(cuerpo)
  if (!datos.ok) return mal(datos.error)
  if (datos.datos.fichaId && !leer().fichas.some((ficha) => ficha.id === datos.datos.fichaId)) {
    return mal("Esa ficha no está en el registro.")
  }
  const creado = construirHueco({ id, datos: datos.datos, ejemplo: anterior.ejemplo })
  if (!creado.ok) return mal(creado.error)
  guardar((db) => {
    const indice = db.calendario.findIndex((hueco) => hueco.id === id)
    if (indice >= 0) db.calendario[indice] = creado.hueco
  })
  return json({ hueco: creado.hueco })
}
