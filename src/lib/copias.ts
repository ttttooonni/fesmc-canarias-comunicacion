import { anotarRegistro, migrarMesa, type EntradaRegistroCopia, type MesaLocal } from "@/lib/almacen"
import { recursoDesdeCopia, type RecursoBiblioteca } from "@/lib/biblioteca"
import { ESTADOS, type Ficha, type Hueco, type MetricaMes } from "@/lib/dominio"
import { fusionarEpisodio, fusionarPorId, type DocumentoSerie, type EpisodioSerie, type PersonajeSerie, type PublicacionSerie } from "@/lib/sindi-cato"
import { fusionarFicha } from "@/lib/whatsapp"

export const TIPO_COPIA = "ugt-fesmc-copia"
/** 1 y 2 son las copias de versiones anteriores; siguen siendo importables. */
export const VERSION_COPIA = 3
const VERSIONES_ADMITIDAS = new Set([1, 2, 3])
export const MAX_BYTES_COPIA = 15 * 1024 * 1024

export type CopiaJson = {
  tipo: typeof TIPO_COPIA
  version: number
  aplicacion?: string
  esquema?: number
  generadoEn?: string
  recuento?: Record<string, number>
  perfil?: unknown
  fichas: Ficha[]
  calendario: Hueco[]
  metricas: MetricaMes[]
  personajesSerie: PersonajeSerie[]
  episodiosSerie: EpisodioSerie[]
  documentosSerie: DocumentoSerie[]
  publicacionesSerie: PublicacionSerie[]
  biblioteca: RecursoBiblioteca[]
}

export type ResumenColeccion = { total: number; nuevas: number; actualizadas: number; iguales: number; descartadas: number }

export type ResumenImportacion = {
  version: number
  generadoEn: string | null
  colecciones: Record<"fichas" | "calendario" | "metricas" | "personajesSerie" | "episodiosSerie" | "documentosSerie" | "publicacionesSerie" | "biblioteca", ResumenColeccion>
  avisos: string[]
}

export const NOMBRES_COLECCION: Record<keyof ResumenImportacion["colecciones"], string> = {
  fichas: "Fichas",
  calendario: "Huecos del calendario",
  metricas: "Registros mensuales",
  personajesSerie: "Personajes",
  episodiosSerie: "Episodios",
  documentosSerie: "Documentación de la serie",
  publicacionesSerie: "Publicaciones de la serie",
  biblioteca: "Recursos de biblioteca",
}

export function construirCopia(mesa: MesaLocal, ahora = new Date().toISOString()): CopiaJson {
  return {
    tipo: TIPO_COPIA,
    version: VERSION_COPIA,
    aplicacion: "Comunicación digital UGT FeSMC Canarias",
    esquema: mesa.esquema,
    generadoEn: ahora,
    recuento: {
      fichas: mesa.fichas.length,
      calendario: mesa.calendario.length,
      metricas: mesa.metricas.length,
      personajesSerie: mesa.personajesSerie.length,
      episodiosSerie: mesa.episodiosSerie.length,
      documentosSerie: mesa.documentosSerie.length,
      publicacionesSerie: mesa.publicacionesSerie.length,
      biblioteca: mesa.biblioteca.length,
    },
    perfil: mesa.perfil,
    fichas: mesa.fichas,
    calendario: mesa.calendario,
    metricas: mesa.metricas,
    personajesSerie: mesa.personajesSerie,
    episodiosSerie: mesa.episodiosSerie,
    documentosSerie: mesa.documentosSerie,
    publicacionesSerie: mesa.publicacionesSerie,
    biblioteca: mesa.biblioteca,
  }
}

export function nombreArchivoCopia(ahora = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return `ugt-fesmc-copia-${ahora.getFullYear()}-${p(ahora.getMonth() + 1)}-${p(ahora.getDate())}-${p(ahora.getHours())}${p(ahora.getMinutes())}.json`
}

const ESTADOS_OK = new Set<string>(ESTADOS.map((item) => item.id))

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return Boolean(valor) && typeof valor === "object" && !Array.isArray(valor)
}

function fichaValida(valor: unknown): Ficha | null {
  if (!esObjeto(valor)) return null
  if (typeof valor.id !== "string" || !valor.id || typeof valor.titulo !== "string") return null
  if (typeof valor.estado !== "string" || !ESTADOS_OK.has(valor.estado)) return null
  if (typeof valor.isla !== "string" || typeof valor.sector !== "string") return null
  const ahora = typeof valor.actualizadoEn === "string" ? valor.actualizadoEn : new Date(0).toISOString()
  return {
    queOcurrio: "",
    cuando: ahora.slice(0, 10),
    fuentes: "",
    materialAutorizado: false,
    descripcionMaterial: "",
    contactoNombre: "",
    contactoMedio: "",
    sensible: false,
    motivoSensible: "",
    pilar: "actualidad",
    canales: [],
    creadoPorId: "importada",
    creadoPorNombre: "Equipo",
    creadoEn: ahora,
    textoPublicacion: "",
    textoCompartir: "",
    programadoPara: null,
    publicadoEn: null,
    difundidoEn: null,
    checklist: null,
    compartidos: [],
    referenciaMaterial: "",
    ...(valor as Partial<Ficha>),
    historial: Array.isArray(valor.historial) ? (valor.historial as Ficha["historial"]) : [],
    actualizadoEn: ahora,
    ejemplo: valor.ejemplo === true,
  } as Ficha
}

function conId<T>(valor: unknown, campoTexto?: string): T | null {
  if (!esObjeto(valor) || typeof valor.id !== "string" || !valor.id) return null
  if (campoTexto && typeof valor[campoTexto] !== "string") return null
  return valor as T
}

function huecoValido(valor: unknown): Hueco | null {
  const hueco = conId<Hueco>(valor, "titulo")
  if (!hueco || typeof hueco.fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(hueco.fecha)) return null
  return { ...hueco, canales: Array.isArray(hueco.canales) ? hueco.canales : [], isla: hueco.isla ?? null, sector: hueco.sector ?? null }
}

function metricaValida(valor: unknown): MetricaMes | null {
  if (!esObjeto(valor) || typeof valor.mes !== "string" || !/^\d{4}-\d{2}$/.test(valor.mes) || !esObjeto(valor.canales)) return null
  return valor as unknown as MetricaMes
}

function episodioValido(valor: unknown): EpisodioSerie | null {
  const ep = conId<EpisodioSerie>(valor, "titulo")
  if (!ep) return null
  return {
    ...ep,
    comentarios: Array.isArray(ep.comentarios) ? ep.comentarios : [],
    checklist: esObjeto(ep.checklist) ? ep.checklist : { datosVerificados: false, identidadProtegida: false, hechosVsRecreacion: false, revisionLegal: false },
    actualizadoEn: typeof ep.actualizadoEn === "string" ? ep.actualizadoEn : new Date(0).toISOString(),
  }
}

function filtrar<T>(valor: unknown, validar: (item: unknown) => T | null): { items: T[]; descartadas: number } {
  if (!Array.isArray(valor)) return { items: [], descartadas: 0 }
  const items: T[] = []
  let descartadas = 0
  for (const bruto of valor) {
    const item = validar(bruto)
    if (item) items.push(item)
    else descartadas += 1
  }
  return { items, descartadas }
}

export type ResultadoValidacion =
  | { ok: true; copia: CopiaJson; descartadas: Record<string, number>; avisos: string[] }
  | { ok: false; error: string }

/** Comprueba que el texto es una copia de esta app y deja fuera, contándolos, los elementos dañados. */
export function validarCopia(texto: string): ResultadoValidacion {
  if (!texto.trim()) return { ok: false, error: "El archivo está vacío." }
  if (texto.length > MAX_BYTES_COPIA) return { ok: false, error: "El archivo es demasiado grande para ser una copia de esta app (máximo 15 MB)." }
  let bruto: unknown
  try {
    bruto = JSON.parse(texto)
  } catch {
    return { ok: false, error: "El archivo no es un JSON válido. ¿Es la copia descargada desde Copias?" }
  }
  if (!esObjeto(bruto)) return { ok: false, error: "El archivo no tiene el formato de una copia." }
  if (bruto.tipo !== TIPO_COPIA) return { ok: false, error: "Ese archivo no es una copia de esta aplicación (falta «tipo: ugt-fesmc-copia»)." }
  const version = typeof bruto.version === "number" ? bruto.version : 1
  if (!VERSIONES_ADMITIDAS.has(version)) {
    return { ok: false, error: `La copia es de una versión más nueva (v${version}). Actualiza la app antes de importarla.` }
  }
  if (!Array.isArray(bruto.fichas)) return { ok: false, error: "La copia no trae la lista de fichas." }

  const fichas = filtrar(bruto.fichas, fichaValida)
  const calendario = filtrar(bruto.calendario, huecoValido)
  const metricas = filtrar(bruto.metricas, metricaValida)
  const personajesSerie = filtrar(bruto.personajesSerie, (item) => conId<PersonajeSerie>(item, "nombre"))
  const episodiosSerie = filtrar(bruto.episodiosSerie, episodioValido)
  const documentosSerie = filtrar(bruto.documentosSerie, (item) => conId<DocumentoSerie>(item, "titulo"))
  const publicacionesSerie = filtrar(bruto.publicacionesSerie, (item) => conId<PublicacionSerie>(item))
  const biblioteca = filtrar(bruto.biblioteca, recursoDesdeCopia)
  const descartadas = {
    fichas: fichas.descartadas,
    calendario: calendario.descartadas,
    metricas: metricas.descartadas,
    personajesSerie: personajesSerie.descartadas,
    episodiosSerie: episodiosSerie.descartadas,
    documentosSerie: documentosSerie.descartadas,
    publicacionesSerie: publicacionesSerie.descartadas,
    biblioteca: biblioteca.descartadas,
  }
  const avisos: string[] = []
  const totalDescartadas = Object.values(descartadas).reduce((a, b) => a + b, 0)
  if (totalDescartadas > 0) avisos.push(`${totalDescartadas} elemento${totalDescartadas === 1 ? "" : "s"} dañado${totalDescartadas === 1 ? "" : "s"} se dejará${totalDescartadas === 1 ? "" : "n"} fuera.`)
  if (version < VERSION_COPIA) avisos.push(`Copia de una versión anterior (v${version}). Se importa igual.`)
  return {
    ok: true,
    descartadas,
    avisos,
    copia: {
      tipo: TIPO_COPIA,
      version,
      generadoEn: typeof bruto.generadoEn === "string" ? bruto.generadoEn : undefined,
      fichas: fichas.items,
      calendario: calendario.items,
      metricas: metricas.items,
      personajesSerie: personajesSerie.items,
      episodiosSerie: episodiosSerie.items,
      documentosSerie: documentosSerie.items,
      publicacionesSerie: publicacionesSerie.items,
      biblioteca: biblioteca.items,
    },
  }
}

function contar<T>(locales: T[], entrantes: T[], clave: (item: T) => string, version: (item: T) => string, descartadas: number): ResumenColeccion {
  const mapa = new Map(locales.map((item) => [clave(item), item]))
  const resumen: ResumenColeccion = { total: entrantes.length, nuevas: 0, actualizadas: 0, iguales: 0, descartadas }
  for (const item of entrantes) {
    const local = mapa.get(clave(item))
    if (!local) resumen.nuevas += 1
    else if (version(item) > version(local)) resumen.actualizadas += 1
    else resumen.iguales += 1
  }
  return resumen
}

const porId = (item: { id: string }) => item.id
const porFecha = (item: { actualizadoEn?: string | null }) => item.actualizadoEn ?? ""

/** Resumen de lo que haría la importación, sin aplicar nada. */
export function resumirImportacion(mesa: MesaLocal, validacion: Extract<ResultadoValidacion, { ok: true }>): ResumenImportacion {
  const { copia, descartadas } = validacion
  return {
    version: copia.version,
    generadoEn: copia.generadoEn ?? null,
    avisos: validacion.avisos,
    colecciones: {
      fichas: contar(mesa.fichas, copia.fichas, porId, porFecha, descartadas.fichas),
      calendario: contar(mesa.calendario, copia.calendario, porId, () => "", descartadas.calendario),
      metricas: contar(mesa.metricas, copia.metricas, (item) => item.mes, porFecha, descartadas.metricas),
      personajesSerie: contar(mesa.personajesSerie, copia.personajesSerie, porId, porFecha, descartadas.personajesSerie),
      episodiosSerie: contar(mesa.episodiosSerie, copia.episodiosSerie, porId, porFecha, descartadas.episodiosSerie),
      documentosSerie: contar(mesa.documentosSerie, copia.documentosSerie, porId, porFecha, descartadas.documentosSerie),
      publicacionesSerie: contar(mesa.publicacionesSerie, copia.publicacionesSerie, porId, porFecha, descartadas.publicacionesSerie),
      biblioteca: contar(mesa.biblioteca, copia.biblioteca, porId, porFecha, descartadas.biblioteca),
    },
  }
}

/**
 * Fusiona la copia con lo que hay en el dispositivo. Nunca borra: lo que solo existe
 * aquí se queda, el historial de cada ficha se une y gana la versión más reciente.
 */
export function fusionarCopia(mesa: MesaLocal, copia: CopiaJson): MesaLocal {
  const fichasMapa = new Map(mesa.fichas.map((ficha) => [ficha.id, ficha]))
  for (const ficha of copia.fichas) fichasMapa.set(ficha.id, fusionarFicha(fichasMapa.get(ficha.id), ficha).ficha)
  const huecos = new Map(mesa.calendario.map((hueco) => [hueco.id, hueco]))
  for (const hueco of copia.calendario) huecos.set(hueco.id, { ...huecos.get(hueco.id), ...hueco })
  const meses = new Map(mesa.metricas.map((item) => [item.mes, item]))
  for (const metrica of copia.metricas) {
    const local = meses.get(metrica.mes)
    if (!local || (metrica.actualizadoEn ?? "") >= (local.actualizadoEn ?? "")) meses.set(metrica.mes, metrica)
  }
  const episodios = new Map(mesa.episodiosSerie.map((item) => [item.id, item]))
  for (const episodio of copia.episodiosSerie) episodios.set(episodio.id, fusionarEpisodio(episodios.get(episodio.id), episodio).episodio)
  return migrarMesa({
    ...mesa,
    fichas: [...fichasMapa.values()],
    calendario: [...huecos.values()].sort((a, b) => a.fecha.localeCompare(b.fecha)),
    metricas: [...meses.values()],
    personajesSerie: fusionarPorId(mesa.personajesSerie, copia.personajesSerie),
    episodiosSerie: [...episodios.values()],
    documentosSerie: fusionarPorId(mesa.documentosSerie, copia.documentosSerie),
    publicacionesSerie: fusionarPorId(mesa.publicacionesSerie, copia.publicacionesSerie),
    biblioteca: fusionarPorId(mesa.biblioteca, copia.biblioteca),
  }) as MesaLocal
}

export function textoResumen(resumen: ResumenImportacion): string {
  const partes = (Object.keys(resumen.colecciones) as Array<keyof ResumenImportacion["colecciones"]>)
    .map((clave) => ({ clave, valor: resumen.colecciones[clave] }))
    .filter(({ valor }) => valor.nuevas + valor.actualizadas > 0)
    .map(({ clave, valor }) => `${NOMBRES_COLECCION[clave]}: ${valor.nuevas} nuevas, ${valor.actualizadas} actualizadas`)
  return partes.length ? partes.join(" · ") : "No había nada nuevo: todo coincidía con este dispositivo."
}

export function entradaRegistro(tipo: EntradaRegistroCopia["tipo"], detalle: string, porNombre: string | null, ahora = new Date().toISOString()): EntradaRegistroCopia {
  return { id: `${tipo}-${ahora}-${Math.random().toString(36).slice(2, 8)}`, tipo, en: ahora, detalle, porNombre }
}

export { anotarRegistro }
