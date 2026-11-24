import { puedeEditarCalendario } from "@/lib/circuito"
import { construirHueco, leerDatosHueco } from "@/lib/calendario-logica"
import { esId, esUsuario, exigirUsuario, json, mal } from "@/server/http"
import { fichaPorId, guardarHueco, huecoPorId } from "@/server/repositorio"

export async function POST(req: Request) {
  const usuario = await exigirUsuario(req)
  if (!esUsuario(usuario)) return usuario
  if (!puedeEditarCalendario(usuario.rol)) return mal("El calendario lo mueven gestión y coordinación.", 403)
  const cuerpo = (await req.json().catch(() => null)) as { id?: string } | null
  const id = cuerpo?.id ?? ""
  if (!esId(id)) return mal("El hueco no trae un identificador válido.")
  const ya = await huecoPorId(id)
  if (ya) return json({ hueco: ya })
  const datos = leerDatosHueco(cuerpo)
  if (!datos.ok) return mal(datos.error)
  if (datos.datos.fichaId && !(await fichaPorId(datos.datos.fichaId))) {
    return mal("Esa ficha no está en el registro.")
  }
  const creado = construirHueco({ id, datos: datos.datos })
  if (!creado.ok) return mal(creado.error)
  await guardarHueco(creado.hueco)
  return json({ hueco: creado.hueco }, { status: 201 })
}
