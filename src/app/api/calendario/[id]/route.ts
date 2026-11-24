import { puedeEditarCalendario } from "@/lib/circuito"
import { construirHueco, leerDatosHueco } from "@/lib/calendario-logica"
import { esUsuario, exigirUsuario, json, mal } from "@/server/http"
import { fichaPorId, guardarHueco, huecoPorId } from "@/server/repositorio"

export async function PATCH(req: Request, contexto: { params: Promise<{ id: string }> }) {
  const usuario = await exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  if (!puedeEditarCalendario(usuario.rol)) return mal("El calendario lo mueven gestión y coordinación.", 403)
  const { id } = await contexto.params
  const anterior = await huecoPorId(id)
  if (!anterior) return mal("No encontramos ese hueco.", 404)
  const cuerpo = await req.json().catch(() => null)
  const datos = leerDatosHueco(cuerpo)
  if (!datos.ok) return mal(datos.error)
  if (datos.datos.fichaId && !(await fichaPorId(datos.datos.fichaId))) {
    return mal("Esa ficha no está en el registro.")
  }
  const creado = construirHueco({ id, datos: datos.datos, ejemplo: anterior.ejemplo })
  if (!creado.ok) return mal(creado.error)
  await guardarHueco(creado.hueco)
  return json({ hueco: creado.hueco })
}
