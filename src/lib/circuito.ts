import type { EstadoId, Ficha, RolId } from "@/lib/dominio"

export type AccionCircuito = {
  destino: EstadoId
  etiqueta: string
  estilo: "avanzar" | "devolver"
  exigeNota: boolean
  exigeFecha: boolean
  exigeChecklist: boolean
  bloqueo?: string
}

const MESA: RolId[] = ["gestor", "coordinacion"]
const REVISION: RolId[] = ["juridico", "coordinacion"]

function avanzar(
  destino: EstadoId,
  etiqueta: string,
  extra: Partial<AccionCircuito> = {},
): AccionCircuito {
  return {
    destino,
    etiqueta,
    estilo: "avanzar",
    exigeNota: false,
    exigeFecha: false,
    exigeChecklist: false,
    ...extra,
  }
}

function devolver(destino: EstadoId, etiqueta: string): AccionCircuito {
  return {
    destino,
    etiqueta,
    estilo: "devolver",
    exigeNota: true,
    exigeFecha: false,
    exigeChecklist: false,
  }
}

export function accionesDisponibles(
  ficha: Pick<Ficha, "estado" | "sensible" | "materialAutorizado">,
  rol: RolId,
): AccionCircuito[] {
  const puede = (roles: RolId[]) => roles.includes(rol)
  const acciones: AccionCircuito[] = []

  switch (ficha.estado) {
    case "recibido":
      if (puede(MESA)) acciones.push(avanzar("comprobado", "Marcar como comprobada"))
      break
    case "comprobado":
      if (puede(MESA)) {
        acciones.push(
          avanzar("redaccion", "Pasar a redacción", {
            bloqueo: ficha.materialAutorizado
              ? undefined
              : "Antes hay que dejar constancia del material: fotos autorizadas o pieza sin imagen de personas.",
          }),
        )
        acciones.push(devolver("recibido", "Pedir los datos que faltan"))
      }
      break
    case "redaccion":
      if (puede(MESA)) {
        acciones.push(avanzar("revision", "Enviar a revisión jurídica e imagen"))
        acciones.push(devolver("comprobado", "Devolver a comprobación"))
      }
      break
    case "revision":
      if (puede(REVISION)) {
        if (ficha.sensible) {
          acciones.push(
            avanzar("pendiente_autorizacion", "Elevar a supervisión"),
          )
        } else {
          acciones.push(
            avanzar("programado", "Dar paso y programar", { exigeFecha: true }),
          )
        }
        acciones.push(devolver("redaccion", "Devolver a redacción"))
      }
      break
    case "pendiente_autorizacion":
      if (rol === "coordinacion") {
        acciones.push(
          avanzar("programado", "Autorizar y programar", { exigeFecha: true }),
        )
        acciones.push(devolver("redaccion", "No autorizar y devolver"))
      }
      break
    case "programado":
      if (puede(MESA)) {
        acciones.push(
          avanzar("publicado", "Marcar como publicada", { exigeChecklist: true }),
        )
        acciones.push(devolver("redaccion", "Sacar de programación"))
      }
      break
    case "publicado":
      if (puede(MESA)) {
        acciones.push(avanzar("difundido", "Marcar difundida a las cuentas insulares"))
      }
      break
    case "difundido":
      break
  }

  return acciones
}

export function puedeCrear(rol: RolId): boolean {
  return rol === "coordinacion" || rol === "gestor" || rol === "insular" || rol === "sectorial"
}

export function puedeEditarDatos(
  rol: RolId,
  creadoPorId: string,
  usuarioId: string,
  estado: EstadoId,
): boolean {
  if (estado !== "recibido" && estado !== "comprobado") return false
  if (rol === "gestor" || rol === "coordinacion") return true
  return creadoPorId === usuarioId
}

export function puedeEditarTextos(rol: RolId, estado: EstadoId): boolean {
  if (rol !== "gestor" && rol !== "coordinacion") return false
  return estado !== "recibido" && estado !== "comprobado"
}

export function puedeEditarCalendario(rol: RolId): boolean {
  return rol === "gestor" || rol === "coordinacion"
}

export function puedeEditarMetricas(rol: RolId): boolean {
  return rol === "gestor" || rol === "coordinacion"
}

export function puedeRegistrarCompartido(rol: RolId): boolean {
  return rol === "insular" || rol === "gestor" || rol === "coordinacion"
}
