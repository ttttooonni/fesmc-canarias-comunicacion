import { accionesDisponibles } from "@/lib/circuito"
import type {
  CanalId,
  ChecklistPublicacion,
  EstadoId,
  Ficha,
  IslaId,
  UsuarioPublico,
} from "@/lib/dominio"
import { ISLAS } from "@/lib/dominio"
import { borradorPublicacion, textoParaCuentaInsular } from "@/lib/textos"
import { aplicarAmbito, puedeVerFicha, validarDatosFicha } from "@/lib/validar"

const CHECKLIST_PUBLICACION = [
  "contrastado",
  "sin_datos_de_mas",
  "imagen",
  "sensible_autorizado",
  "sin_promesa_juridica",
  "cuenta_oficial",
] as const

export function fichasVisibles(fichas: Ficha[], usuario: UsuarioPublico): Ficha[] {
  return fichas.filter((ficha) => puedeVerFicha(usuario, ficha))
}

export function construirFicha(input: {
  id: string
  datos: unknown
  usuario: UsuarioPublico
  ahora: string
}): { ok: true; ficha: Ficha } | { ok: false; error: string; errores?: Record<string, string> } {
  const validado = validarDatosFicha(input.datos)
  if (!validado.ok) return { ok: false, error: "Revisa la ficha.", errores: validado.errores }
  const datos = aplicarAmbito(validado.datos, input.usuario)
  const ficha: Ficha = {
    id: input.id,
    ...datos,
    estado: "borrador",
    creadoPorId: input.usuario.id,
    creadoPorNombre: input.usuario.nombre,
    creadoEn: input.ahora,
    actualizadoEn: input.ahora,
    historial: [
      {
        id: `${input.id}-borrador`,
        estado: "borrador",
        porId: input.usuario.id,
        porNombre: input.usuario.nombre,
        en: input.ahora,
        nota: "Borrador en este dispositivo.",
      },
    ],
    textoPublicacion: "",
    textoCompartir: "",
    programadoPara: null,
    publicadoEn: null,
    difundidoEn: null,
    checklist: null,
    compartidos: [],
    ejemplo: false,
  }
  ficha.textoPublicacion = borradorPublicacion(ficha)
  ficha.textoCompartir = textoParaCuentaInsular(ficha, ficha.isla)
  return { ok: true, ficha }
}

export function actualizarDatos(input: {
  ficha: Ficha
  datos: unknown
  usuario: UsuarioPublico
  ahora: string
  eventoId: string
}): { ok: true; ficha: Ficha } | { ok: false; error: string; errores?: Record<string, string> } {
  if (input.ficha.estado !== "borrador" && input.ficha.estado !== "cambios") {
    return { ok: false, error: "Los datos se corrigen en el borrador o cuando te la devuelven con cambios." }
  }
  const puede =
    input.usuario.rol === "gestor" ||
    input.usuario.rol === "coordinacion" ||
    input.ficha.creadoPorId === input.usuario.id
  if (!puede) return { ok: false, error: "No puedes corregir esta ficha." }

  const validado = validarDatosFicha(input.datos)
  if (!validado.ok) return { ok: false, error: "Revisa la ficha.", errores: validado.errores }
  const datos = aplicarAmbito(validado.datos, input.usuario)
  const siguiente: Ficha = {
    ...input.ficha,
    ...datos,
    actualizadoEn: input.ahora,
    historial: yaEsta(input.ficha, input.eventoId)
      ? input.ficha.historial
      : [
          ...input.ficha.historial,
          {
            id: input.eventoId,
            estado: input.ficha.estado,
            porId: input.usuario.id,
            porNombre: input.usuario.nombre,
            en: input.ahora,
            nota: "Datos de la ficha actualizados.",
          },
        ],
  }
  if (!input.ficha.textoPublicacion.trim()) siguiente.textoPublicacion = borradorPublicacion(siguiente)
  return { ok: true, ficha: siguiente }
}

export function actualizarTextos(input: {
  ficha: Ficha
  textoPublicacion: string
  textoCompartir: string
  usuario: UsuarioPublico
  ahora: string
}): { ok: true; ficha: Ficha } | { ok: false; error: string } {
  if (input.usuario.rol !== "gestor" && input.usuario.rol !== "coordinacion") {
    return { ok: false, error: "La redacción del texto corresponde a gestión o a coordinación." }
  }
  const publicacion = input.textoPublicacion.trim()
  const compartir = input.textoCompartir.trim()
  if (publicacion.length < 8 || compartir.length < 8) {
    return { ok: false, error: "Los dos textos tienen que decir algo útil." }
  }
  if (publicacion.length > 4000 || compartir.length > 4000) {
    return { ok: false, error: "El texto es demasiado largo para una pieza de redes." }
  }
  return {
    ok: true,
    ficha: {
      ...input.ficha,
      textoPublicacion: publicacion,
      textoCompartir: compartir,
      actualizadoEn: input.ahora,
    },
  }
}

export function aplicarTransicion(input: {
  ficha: Ficha
  destino: EstadoId
  eventoId: string
  usuario: UsuarioPublico
  ahora: string
  nota?: string
  programadoPara?: string | null
  checklist?: string[] | null
}): { ok: true; ficha: Ficha } | { ok: false; error: string } {
  if (input.ficha.historial.some((paso) => paso.id === input.eventoId)) {
    return { ok: true, ficha: input.ficha }
  }
  const accion = accionesDisponibles(input.ficha, input.usuario.rol).find(
    (item) => item.destino === input.destino,
  )
  if (!accion) return { ok: false, error: "Ese paso no corresponde a tu rol o al estado actual." }
  if (accion.bloqueo) return { ok: false, error: accion.bloqueo }
  const nota = (input.nota ?? "").trim()
  if (accion.exigeNota && nota.length < 8) {
    return { ok: false, error: "Escribe una nota breve para quien retome la pieza." }
  }
  let programadoPara = input.ficha.programadoPara
  if (accion.exigeFecha) {
    const fecha = (input.programadoPara ?? "").trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return { ok: false, error: "Indica la fecha de programación." }
    }
    programadoPara = fecha
  }
  let checklist: ChecklistPublicacion | null = input.ficha.checklist
  if (accion.exigeChecklist) {
    const marcas = new Set(input.checklist ?? [])
    const completo = CHECKLIST_PUBLICACION.every((id) => marcas.has(id))
    if (!completo) {
      return { ok: false, error: "Confirma el checklist de publicación antes de marcarla publicada." }
    }
    checklist = { porId: input.usuario.id, porNombre: input.usuario.nombre, en: input.ahora }
  }

  const siguiente: Ficha = {
    ...input.ficha,
    estado: input.destino,
    actualizadoEn: input.ahora,
    programadoPara,
    checklist,
    publicadoEn: input.destino === "publicada" ? input.ahora : input.ficha.publicadoEn,
    difundidoEn: input.ficha.difundidoEn,
    historial: [
      ...input.ficha.historial,
      {
        id: input.eventoId,
        estado: input.destino,
        porId: input.usuario.id,
        porNombre: input.usuario.nombre,
        en: input.ahora,
        nota: nota || undefined,
      },
    ],
  }
  if (input.destino === "publicada") {
    if (!siguiente.textoPublicacion.trim()) siguiente.textoPublicacion = borradorPublicacion(siguiente)
    if (!siguiente.textoCompartir.trim()) {
      siguiente.textoCompartir = textoParaCuentaInsular(siguiente, siguiente.isla)
    }
  }
  return { ok: true, ficha: siguiente }
}

export function registrarCompartido(input: {
  ficha: Ficha
  isla: IslaId
  eventoId: string
  usuario: UsuarioPublico
  ahora: string
}): { ok: true; ficha: Ficha } | { ok: false; error: string } {
  if (input.ficha.estado !== "publicada") {
    return { ok: false, error: "Solo se registra el compartido cuando la pieza ya está publicada." }
  }
  if (input.usuario.rol !== "insular" && input.usuario.rol !== "gestor" && input.usuario.rol !== "coordinacion") {
    return { ok: false, error: "El registro del compartido lo hace la isla, gestión o coordinación." }
  }
  let isla = input.isla
  if (input.usuario.rol === "insular") {
    if (!input.usuario.isla || input.usuario.isla === "regional") {
      return { ok: false, error: "Tu usuario no tiene una isla asignada." }
    }
    isla = input.usuario.isla
  }
  if (!ISLAS.some((item) => item.id === isla)) {
    return { ok: false, error: "Elige una isla." }
  }
  if (input.ficha.compartidos.some((item) => item.id === input.eventoId || item.isla === isla)) {
    return { ok: true, ficha: input.ficha }
  }
  return {
    ok: true,
    ficha: {
      ...input.ficha,
      actualizadoEn: input.ahora,
      compartidos: [
        ...input.ficha.compartidos,
        {
          id: input.eventoId,
          isla,
          porId: input.usuario.id,
          porNombre: input.usuario.nombre,
          en: input.ahora,
        },
      ],
    },
  }
}

export function aclararFicha(input: {
  ficha: Ficha
  nota: string
  eventoId: string
  usuario: UsuarioPublico
  ahora: string
}): { ok: true; ficha: Ficha } | { ok: false; error: string } {
  if (input.ficha.historial.some((paso) => paso.id === input.eventoId)) {
    return { ok: true, ficha: input.ficha }
  }
  if (input.ficha.estado !== "borrador" && input.ficha.estado !== "cambios") {
    return { ok: false, error: "La aclaración se añade en el borrador o cuando hay cambios pedidos." }
  }
  const puede =
    input.usuario.rol === "gestor" ||
    input.usuario.rol === "coordinacion" ||
    input.ficha.creadoPorId === input.usuario.id
  if (!puede) return { ok: false, error: "No puedes añadir una aclaración a esta ficha." }
  const nota = input.nota.trim()
  if (nota.length < 8) return { ok: false, error: "Escribe la aclaración con un poco de contexto." }
  return {
    ok: true,
    ficha: {
      ...input.ficha,
      actualizadoEn: input.ahora,
      historial: [
        ...input.ficha.historial,
        {
          id: input.eventoId,
          estado: input.ficha.estado,
          porId: input.usuario.id,
          porNombre: input.usuario.nombre,
          en: input.ahora,
          nota,
        },
      ],
    },
  }
}

function yaEsta(ficha: Ficha, eventoId: string): boolean {
  return ficha.historial.some((paso) => paso.id === eventoId)
}

export const IDS_CHECKLIST_PUBLICACION: readonly string[] = CHECKLIST_PUBLICACION

export function canalesDe(valor: unknown): CanalId[] {
  if (!Array.isArray(valor)) return []
  return valor.filter((item): item is CanalId => item === "instagram" || item === "facebook" || item === "tiktok")
}
