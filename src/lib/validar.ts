import {
  CANALES,
  ISLAS,
  PILARES,
  SECTORES,
  type CanalId,
  type Ficha,
  type IslaId,
  type PilarId,
  type SectorId,
  type UsuarioPublico,
} from "@/lib/dominio"

export type Errores = Record<string, string>

export type DatosFicha = {
  titulo: string
  queOcurrio: string
  isla: IslaId
  cuando: string
  sector: SectorId
  fuentes: string
  materialAutorizado: boolean
  descripcionMaterial: string
  contactoNombre: string
  contactoMedio: string
  sensible: boolean
  motivoSensible: string
  pilar: PilarId
  canales: CanalId[]
  referenciaMaterial: string
}

const IDS_ISLA = new Set<string>([...ISLAS.map((isla) => isla.id), "regional"])
const IDS_SECTOR = new Set<string>(SECTORES.map((sector) => sector.id))
const IDS_PILAR = new Set<string>(PILARES.map((pilar) => pilar.id))
const IDS_CANAL = new Set<string>(CANALES.map((canal) => canal.id))

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : ""
}

export function aplicarAmbito(datos: DatosFicha, usuario: UsuarioPublico): DatosFicha {
  const siguiente = { ...datos }
  if (usuario.rol === "insular" && usuario.isla && usuario.isla !== "regional") {
    siguiente.isla = usuario.isla
  }
  if (usuario.rol === "sectorial" && usuario.sector) {
    siguiente.sector = usuario.sector
  }
  return siguiente
}

export function validarDatosFicha(entrada: unknown): { ok: true; datos: DatosFicha } | { ok: false; errores: Errores } {
  const bruto = (entrada && typeof entrada === "object" ? entrada : {}) as Record<string, unknown>
  const errores: Errores = {}
  const titulo = texto(bruto.titulo)
  const queOcurrio = texto(bruto.queOcurrio)
  const isla = texto(bruto.isla)
  const cuando = texto(bruto.cuando)
  const sector = texto(bruto.sector)
  const fuentes = texto(bruto.fuentes)
  const descripcionMaterial = texto(bruto.descripcionMaterial)
  const contactoNombre = texto(bruto.contactoNombre)
  const contactoMedio = texto(bruto.contactoMedio)
  const motivoSensible = texto(bruto.motivoSensible)
  const pilar = texto(bruto.pilar)
  const referenciaMaterial = texto(bruto.referenciaMaterial)
  const materialAutorizado = bruto.materialAutorizado === true
  const sensible = bruto.sensible === true
  const canales = Array.isArray(bruto.canales)
    ? [...new Set(bruto.canales.map((canal) => texto(canal)).filter((canal) => IDS_CANAL.has(canal)))]
    : []

  if (titulo.length < 8) errores.titulo = "Escribe un título claro, de al menos 8 caracteres."
  if (titulo.length > 140) errores.titulo = "El título no debería pasar de 140 caracteres."
  if (queOcurrio.length < 40) errores.queOcurrio = "Cuenta qué ocurrió con un poco de detalle (mínimo 40 caracteres)."
  if (queOcurrio.length > 4000) errores.queOcurrio = "El relato es demasiado largo. Resume el hecho."
  if (!IDS_ISLA.has(isla)) errores.isla = "Elige la isla o marca toda la federación."
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cuando)) errores.cuando = "Indica la fecha del hecho."
  if (!IDS_SECTOR.has(sector)) errores.sector = "Elige el sector."
  if (fuentes.length < 8) errores.fuentes = "Indica de dónde sale la información."
  if (fuentes.length > 1000) errores.fuentes = "Resume las fuentes."
  if (descripcionMaterial.length < 8) {
    errores.descripcionMaterial = "Describe el material o indica que la pieza irá sin fotos de personas."
  }
  if (contactoNombre.length < 3) errores.contactoNombre = "¿Quién del equipo puede aclarar la ficha?"
  if (contactoMedio.length < 3) errores.contactoMedio = "Indica un canal interno de contacto, sin datos personales reales."
  if (!IDS_PILAR.has(pilar)) errores.pilar = "Elige el pilar o la sección."
  if (canales.length === 0) errores.canales = "Marca al menos un canal."
  if (referenciaMaterial.length > 300) errores.referenciaMaterial = "La referencia del material no debería pasar de 300 caracteres."
  if (/^javascript:/i.test(referenciaMaterial)) errores.referenciaMaterial = "Esa referencia no es válida."
  if (sensible && motivoSensible.length < 8) {
    errores.motivoSensible = "Si es sensible, explica por qué sin añadir datos de más."
  }

  if (Object.keys(errores).length > 0) return { ok: false, errores }

  return {
    ok: true,
    datos: {
      titulo,
      queOcurrio,
      isla: isla as IslaId,
      cuando,
      sector: sector as SectorId,
      fuentes,
      materialAutorizado,
      descripcionMaterial,
      contactoNombre,
      contactoMedio,
      sensible,
      motivoSensible: sensible ? motivoSensible : "",
      pilar: pilar as PilarId,
      canales: canales as CanalId[],
      referenciaMaterial,
    },
  }
}

export function puedeVerFicha(usuario: UsuarioPublico, ficha: Ficha): boolean {
  if (usuario.rol === "coordinacion" || usuario.rol === "gestor" || usuario.rol === "juridico") {
    return true
  }
  void usuario
  void ficha
  return true
}
