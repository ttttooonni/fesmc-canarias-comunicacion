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
const ENVIO: RolId[] = ["gestor", "coordinacion", "insular", "sectorial"]
const LEGAL: RolId[] = ["juridico", "coordinacion"]

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
    case "borrador":
    case "cambios":
      if (puede(ENVIO)) {
        acciones.push(
          avanzar("propuesta", "Enviar propuesta", {
            bloqueo: ficha.materialAutorizado
              ? undefined
              : "Antes confirma el material: fotos autorizadas o pieza sin imagen de personas.",
          }),
        )
      }
      break
    case "propuesta":
      if (puede(MESA)) acciones.push(avanzar("en_revision", "Pedir revisión"))
      if (puede(ENVIO)) acciones.push(devolver("cambios", "Devolver con cambios"))
      break
    case "en_revision":
      if (puede(LEGAL)) acciones.push(avanzar("revision_legal", "Revisión legal"))
      if (puede(MESA) || puede(LEGAL)) acciones.push(devolver("cambios", "Devolver con cambios"))
      break
    case "revision_legal":
      if (ficha.sensible) {
        if (rol === "coordinacion") acciones.push(avanzar("aprobada", "Aprobar"))
      } else if (puede(LEGAL)) {
        acciones.push(avanzar("aprobada", "Aprobar"))
      }
      if (puede(LEGAL)) acciones.push(devolver("cambios", "Devolver con cambios"))
      break
    case "aprobada":
      if (puede(MESA)) {
        acciones.push(avanzar("publicada", "Marcar publicada", { exigeChecklist: true }))
      }
      break
    case "publicada":
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
  if (estado !== "borrador" && estado !== "cambios") return false
  if (rol === "gestor" || rol === "coordinacion") return true
  return creadoPorId === usuarioId
}

export function puedeEditarTextos(rol: RolId, estado: EstadoId): boolean {
  if (rol !== "gestor" && rol !== "coordinacion") return false
  return estado !== "borrador"
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
