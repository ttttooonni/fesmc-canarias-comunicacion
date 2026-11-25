import { rutaPublica, RUTA_RETRATO_SINDI_CATO } from "@/lib/rutas"

export const SECTORES_SERIE = [
  { id: "hosteleria", nombre: "Hostelería" },
  { id: "comercio", nombre: "Comercio" },
  { id: "alimentacion", nombre: "Alimentación" },
  { id: "transporte", nombre: "Transporte" },
  { id: "servicios", nombre: "Servicios" },
  { id: "otros", nombre: "Otros" },
] as const

export const ESTADOS_PRODUCCION = [
  { id: "idea", nombre: "Idea" },
  { id: "guion", nombre: "Guion" },
  { id: "produccion", nombre: "Producción" },
  { id: "revision", nombre: "Revisión" },
  { id: "aprobado", nombre: "Aprobado" },
  { id: "publicado", nombre: "Publicado" },
] as const

export const FORMATOS_AV = [
  { id: "9:16", nombre: "9:16" },
  { id: "1:1", nombre: "1:1" },
  { id: "16:9", nombre: "16:9" },
] as const

export const TIPOS_DOCUMENTO = [
  { id: "convenio", nombre: "Convenio" },
  { id: "legislacion", nombre: "Legislación" },
  { id: "sentencia", nombre: "Sentencia" },
  { id: "fuente_oficial", nombre: "Fuente oficial" },
  { id: "documentacion_sindical", nombre: "Documentación sindical" },
] as const

export const PLATAFORMAS_PUB = [
  { id: "tiktok", nombre: "TikTok" },
  { id: "instagram", nombre: "Instagram" },
  { id: "facebook", nombre: "Facebook" },
  { id: "otros", nombre: "Otros" },
] as const

export const MODULOS_SERIE = [
  { id: "personajes", etiqueta: "Personajes" },
  { id: "episodios", etiqueta: "Episodios" },
  { id: "produccion", etiqueta: "Producción" },
  { id: "documentacion", etiqueta: "Documentación" },
  { id: "revision", etiqueta: "Revisión" },
  { id: "publicaciones", etiqueta: "Publicaciones" },
  { id: "archivo", etiqueta: "Archivo histórico" },
] as const

export type SectorSerieId = (typeof SECTORES_SERIE)[number]["id"]
export type EstadoProduccionId = (typeof ESTADOS_PRODUCCION)[number]["id"]
export type FormatoAvId = (typeof FORMATOS_AV)[number]["id"]
export type TipoDocumentoId = (typeof TIPOS_DOCUMENTO)[number]["id"]
export type PlataformaPubId = (typeof PLATAFORMAS_PUB)[number]["id"]
export type ModuloSerieId = (typeof MODULOS_SERIE)[number]["id"]

export type ChecklistRevision = {
  datosVerificados: boolean
  identidadProtegida: boolean
  hechosVsRecreacion: boolean
  revisionLegal: boolean
}

export type ComentarioRevision = {
  id: string
  texto: string
  porNombre: string
  en: string
}

export type PersonajeSerie = {
  id: string
  nombre: string
  descripcion: string
  apariencia: string
  vestuario: string
  personalidad: string
  voz: string
  referenciasVisuales: string
  imagenRef: string
  actualizadoEn: string
  ejemplo: boolean
}

export type EpisodioSerie = {
  id: string
  titulo: string
  tematica: string
  sector: SectorSerieId
  sinopsis: string
  guion: string
  estado: EstadoProduccionId
  promptImagen: string
  promptVideo: string
  escenas: string
  duracion: string
  formato: FormatoAvId
  materialesRef: string
  checklist: ChecklistRevision
  comentarios: ComentarioRevision[]
  creadoEn: string
  actualizadoEn: string
  ejemplo: boolean
}

export type DocumentoSerie = {
  id: string
  tipo: TipoDocumentoId
  titulo: string
  enlace: string
  notas: string
  episodioIds: string[]
  creadoEn: string
  actualizadoEn: string
  ejemplo: boolean
}

export type PublicacionSerie = {
  id: string
  episodioId: string | null
  descripcion: string
  titular: string
  etiquetas: string
  plataformas: PlataformaPubId[]
  fecha: string
  enlaceVideo: string
  archivada: boolean
  creadoEn: string
  actualizadoEn: string
  ejemplo: boolean
}

export const CHECKLIST_VACIO: ChecklistRevision = {
  datosVerificados: false,
  identidadProtegida: false,
  hechosVsRecreacion: false,
  revisionLegal: false,
}

export const ETIQUETAS_CHECKLIST: { id: keyof ChecklistRevision; etiqueta: string }[] = [
  { id: "datosVerificados", etiqueta: "Datos verificados" },
  { id: "identidadProtegida", etiqueta: "Identidad protegida" },
  { id: "hechosVsRecreacion", etiqueta: "Hechos y recreación diferenciados" },
  { id: "revisionLegal", etiqueta: "Revisión legal" },
]

export function nombreSectorSerie(id: SectorSerieId): string {
  return SECTORES_SERIE.find((item) => item.id === id)?.nombre ?? id
}

export function nombreEstadoProduccion(id: EstadoProduccionId): string {
  return ESTADOS_PRODUCCION.find((item) => item.id === id)?.nombre ?? id
}

export function nombreTipoDocumento(id: TipoDocumentoId): string {
  return TIPOS_DOCUMENTO.find((item) => item.id === id)?.nombre ?? id
}

export function nombrePlataformaPub(id: PlataformaPubId): string {
  return PLATAFORMAS_PUB.find((item) => item.id === id)?.nombre ?? id
}

export function checklistCompleto(lista: ChecklistRevision): boolean {
  return ETIQUETAS_CHECKLIST.every((item) => lista[item.id])
}

function ahoraIso() {
  return new Date().toISOString()
}

export function personajesOficiales(en = ahoraIso()): PersonajeSerie[] {
  return [
    {
      id: "sindi",
      nombre: "Sindi",
      descripcion: "Sindi es una trabajadora comprometida y delegada sindical.",
      apariencia:
        "Mujer joven, de gesto cercano y firme. En la ilustración oficial aparece en un salón de Santa Lucía de Tirajana (Gran Canaria), con una taza roja de UGT y un cuaderno de Delegada Sindical. Vive en Gran Canaria.",
      vestuario:
        "Estilo cotidiano y reconocible, coherente con una delegada sindical en un entorno doméstico canario. Hay que mantener la continuidad con la ilustración oficial de la federación.",
      personalidad:
        "Cercana, inteligente y firme, ayuda a comprender los derechos laborales y explica cómo actuar ante situaciones injustas.",
      voz: "Clara, adulta y cercana. Explica el derecho en corto y dice dónde se mira: convenio, estatuto o delegada y delegado. No infantiliza a la afiliación ni bromea con una sanción, un despido o una baja.",
      referenciasVisuales: "Ilustración oficial de Sindi y Cato, UGT FeSMC Canarias.",
      imagenRef: RUTA_RETRATO_SINDI_CATO,
      actualizadoEn: en,
      ejemplo: false,
    },
    {
      id: "cato",
      nombre: "Cato",
      descripcion: "Cato es un trabajador del sector de la hostelería.",
      personalidad:
        "Simpático, espontáneo y con sentido del humor, representa las inquietudes y experiencias de miles de trabajadores.",
      apariencia:
        "Hombre con gorra, de gesto espontáneo. En la ilustración oficial aparece en el mismo salón de Santa Lucía de Tirajana, con un portátil de UGT FeSMC Canarias. Vive en Gran Canaria.",
      vestuario:
        "Estilo informal de un trabajador de hostelería, con gorra. Hay que mantener la continuidad con la ilustración oficial de la federación.",
      voz: "Oral, espontánea y con humor, sin perder el respeto. Formula la duda de una persona trabajadora con una situación reconocible y sin nombre propio.",
      referenciasVisuales: "Ilustración oficial de Sindi y Cato, UGT FeSMC Canarias.",
      imagenRef: RUTA_RETRATO_SINDI_CATO,
      actualizadoEn: en,
      ejemplo: false,
    },
  ]
}

/** En un dispositivo nuevo (lista ausente o vacía) carga las fichas oficiales. No reescribe las que ya están. */
export function asegurarPersonajes(lista: PersonajeSerie[] | undefined): PersonajeSerie[] {
  if (!lista || lista.length === 0) return personajesOficiales()
  return lista
}

export function reponerPersonajesOficiales(lista: PersonajeSerie[]): PersonajeSerie[] {
  const mapa = new Map(lista.map((item) => [item.id, item]))
  for (const oficial of personajesOficiales()) {
    if (!mapa.has(oficial.id)) mapa.set(oficial.id, oficial)
  }
  const orden = ["sindi", "cato"]
  const resto = [...mapa.values()].filter((item) => !orden.includes(item.id))
  return [...orden.map((id) => mapa.get(id)!).filter(Boolean), ...resto]
}

export function episodioDeEjemplo(en = "2026-11-22T10:00:00.000Z"): EpisodioSerie {
  return {
    id: "ejemplo-episodio-turno",
    titulo: "Sindi y Cato: el turno por mensaje",
    tematica: "Derecho a conocer el cuadrante con tiempo",
    sector: "hosteleria",
    sinopsis:
      "Cato recibe un cambio de turno por mensaje la noche anterior. Sindi explica, en corto, qué dice el derecho y dónde preguntar, sin nombres ni capturas.",
    guion: [
      "Cato: Oye, Sindi, anoche a las once me llegó un mensaje: mañana no entras a las ocho, entras a las tres. ¿Eso se puede hacer así?",
      "Sindi: La duda es clara, Cato. El cuadrante no puede ir dando bandazos de un día para otro sin una razón y sin dejar constancia.",
      "Cato: Es que si me lo dicen de noche, yo ya tenía el resto del día a medio encajar.",
      "Sindi: Exacto. El derecho a saber tu jornada con antelación está en el convenio y en el Estatuto. Mira el convenio de tu empresa o pregunta en tu sección o a tu delegado o delegada.",
      "Cato: Entonces, ¿no lo dejo pasar?",
      "Sindi: No. Pregunta. Esta serie te orienta, pero no sustituye el asesoramiento sindical.",
    ].join("\n\n"),
    estado: "guion",
    promptImagen:
      "Ilustración de Sindi y Cato en un salón de Santa Lucía de Tirajana, Gran Canaria. Sindi con taza roja de UGT y cuaderno de Delegada Sindical. Cato con gorra y portátil de UGT FeSMC Canarias. Estilo de la ilustración oficial, tono cercano y adulto, sin caricaturizar a personas reales.",
    promptVideo:
      "Vídeo vertical 9:16, 35 segundos. Cato lee un mensaje de cambio de turno por la noche. Corte a Sindi, que explica en corto el derecho al cuadrante y remite al convenio o a la sección sindical. Cierre: «Sindi y Cato: historias de trabajadores, derechos que importan.» Sin nombres reales ni capturas de pantalla.",
    escenas:
      "1. Cato en el salón, mira el teléfono.\n2. Detalle del mensaje (texto inventado, sin datos reales).\n3. Sindi responde con calma, taza roja de UGT.\n4. Cierre con el lema de la serie.",
    duracion: "35 s",
    formato: "9:16",
    materialesRef: RUTA_RETRATO_SINDI_CATO,
    checklist: { ...CHECKLIST_VACIO },
    comentarios: [],
    creadoEn: en,
    actualizadoEn: en,
    ejemplo: true,
  }
}

function texto(valor: unknown) {
  return typeof valor === "string" ? valor.trim() : ""
}

export function leerPersonaje(datos: unknown, id: string, anterior?: PersonajeSerie): { ok: true; personaje: PersonajeSerie } | { ok: false; error: string } {
  const cuerpo = (datos ?? {}) as Record<string, unknown>
  const nombre = texto(cuerpo.nombre)
  if (!nombre) return { ok: false, error: "El personaje necesita un nombre." }
  const ahora = ahoraIso()
  return {
    ok: true,
    personaje: {
      id,
      nombre,
      descripcion: texto(cuerpo.descripcion),
      apariencia: texto(cuerpo.apariencia),
      vestuario: texto(cuerpo.vestuario),
      personalidad: texto(cuerpo.personalidad),
      voz: texto(cuerpo.voz),
      referenciasVisuales: texto(cuerpo.referenciasVisuales),
      imagenRef: texto(cuerpo.imagenRef) || RUTA_RETRATO_SINDI_CATO,
      actualizadoEn: ahora,
      ejemplo: anterior?.ejemplo ?? false,
    },
  }
}

const SECTORES_OK = new Set<string>(SECTORES_SERIE.map((item) => item.id))
const ESTADOS_OK = new Set<string>(ESTADOS_PRODUCCION.map((item) => item.id))
const FORMATOS_OK = new Set<string>(FORMATOS_AV.map((item) => item.id))
const TIPOS_OK = new Set<string>(TIPOS_DOCUMENTO.map((item) => item.id))
const PLATAFORMAS_OK = new Set<string>(PLATAFORMAS_PUB.map((item) => item.id))

function checklistDe(valor: unknown, anterior?: ChecklistRevision): ChecklistRevision {
  const cuerpo = (valor ?? {}) as Record<string, unknown>
  const base = anterior ?? CHECKLIST_VACIO
  return {
    datosVerificados: typeof cuerpo.datosVerificados === "boolean" ? cuerpo.datosVerificados : base.datosVerificados,
    identidadProtegida: typeof cuerpo.identidadProtegida === "boolean" ? cuerpo.identidadProtegida : base.identidadProtegida,
    hechosVsRecreacion: typeof cuerpo.hechosVsRecreacion === "boolean" ? cuerpo.hechosVsRecreacion : base.hechosVsRecreacion,
    revisionLegal: typeof cuerpo.revisionLegal === "boolean" ? cuerpo.revisionLegal : base.revisionLegal,
  }
}

export function leerEpisodio(datos: unknown, id: string, anterior?: EpisodioSerie): { ok: true; episodio: EpisodioSerie } | { ok: false; error: string } {
  const cuerpo = (datos ?? {}) as Record<string, unknown>
  const titulo = texto(cuerpo.titulo)
  if (!titulo) return { ok: false, error: "El episodio necesita un título." }
  const sector = texto(cuerpo.sector)
  if (!SECTORES_OK.has(sector)) return { ok: false, error: "Elige un sector laboral." }
  const estado = texto(cuerpo.estado) || anterior?.estado || "idea"
  if (!ESTADOS_OK.has(estado)) return { ok: false, error: "Ese estado de producción no es válido." }
  const formato = texto(cuerpo.formato) || anterior?.formato || "9:16"
  if (!FORMATOS_OK.has(formato)) return { ok: false, error: "Elige un formato: 9:16, 1:1 o 16:9." }
  const ahora = ahoraIso()
  return {
    ok: true,
    episodio: {
      id,
      titulo,
      tematica: texto(cuerpo.tematica),
      sector: sector as SectorSerieId,
      sinopsis: texto(cuerpo.sinopsis),
      guion: typeof cuerpo.guion === "string" ? cuerpo.guion : (anterior?.guion ?? ""),
      estado: estado as EstadoProduccionId,
      promptImagen: typeof cuerpo.promptImagen === "string" ? cuerpo.promptImagen : (anterior?.promptImagen ?? ""),
      promptVideo: typeof cuerpo.promptVideo === "string" ? cuerpo.promptVideo : (anterior?.promptVideo ?? ""),
      escenas: typeof cuerpo.escenas === "string" ? cuerpo.escenas : (anterior?.escenas ?? ""),
      duracion: texto(cuerpo.duracion) || anterior?.duracion || "",
      formato: formato as FormatoAvId,
      materialesRef: typeof cuerpo.materialesRef === "string" ? cuerpo.materialesRef : (anterior?.materialesRef ?? ""),
      checklist: checklistDe(cuerpo.checklist, anterior?.checklist),
      comentarios: anterior?.comentarios ?? [],
      creadoEn: anterior?.creadoEn ?? ahora,
      actualizadoEn: ahora,
      ejemplo: anterior?.ejemplo ?? false,
    },
  }
}

export function leerDocumento(datos: unknown, id: string, anterior?: DocumentoSerie): { ok: true; documento: DocumentoSerie } | { ok: false; error: string } {
  const cuerpo = (datos ?? {}) as Record<string, unknown>
  const titulo = texto(cuerpo.titulo)
  if (!titulo) return { ok: false, error: "El documento necesita un título." }
  const tipo = texto(cuerpo.tipo)
  if (!TIPOS_OK.has(tipo)) return { ok: false, error: "Elige el tipo de documento." }
  const episodioIds = Array.isArray(cuerpo.episodioIds)
    ? cuerpo.episodioIds.filter((item): item is string => typeof item === "string" && item.length > 0)
    : (anterior?.episodioIds ?? [])
  const ahora = ahoraIso()
  return {
    ok: true,
    documento: {
      id,
      tipo: tipo as TipoDocumentoId,
      titulo,
      enlace: texto(cuerpo.enlace),
      notas: typeof cuerpo.notas === "string" ? cuerpo.notas : (anterior?.notas ?? ""),
      episodioIds,
      creadoEn: anterior?.creadoEn ?? ahora,
      actualizadoEn: ahora,
      ejemplo: anterior?.ejemplo ?? false,
    },
  }
}

export function leerPublicacion(datos: unknown, id: string, anterior?: PublicacionSerie): { ok: true; publicacion: PublicacionSerie } | { ok: false; error: string } {
  const cuerpo = (datos ?? {}) as Record<string, unknown>
  const titular = texto(cuerpo.titular)
  if (!titular) return { ok: false, error: "La publicación necesita un titular." }
  const plataformas = Array.isArray(cuerpo.plataformas)
    ? cuerpo.plataformas.filter((item): item is PlataformaPubId => typeof item === "string" && PLATAFORMAS_OK.has(item))
    : (anterior?.plataformas ?? [])
  if (plataformas.length === 0) return { ok: false, error: "Elige al menos una plataforma." }
  const fecha = texto(cuerpo.fecha)
  if (!fecha) return { ok: false, error: "Indica la fecha de publicación." }
  const ahora = ahoraIso()
  const episodioId = texto(cuerpo.episodioId) || null
  return {
    ok: true,
    publicacion: {
      id,
      episodioId,
      descripcion: typeof cuerpo.descripcion === "string" ? cuerpo.descripcion : (anterior?.descripcion ?? ""),
      titular,
      etiquetas: texto(cuerpo.etiquetas),
      plataformas,
      fecha,
      enlaceVideo: texto(cuerpo.enlaceVideo),
      archivada: typeof cuerpo.archivada === "boolean" ? cuerpo.archivada : (anterior?.archivada ?? false),
      creadoEn: anterior?.creadoEn ?? ahora,
      actualizadoEn: ahora,
      ejemplo: anterior?.ejemplo ?? false,
    },
  }
}

export function fusionarPorId<T extends { id: string; actualizadoEn?: string }>(locales: T[], entrantes: T[] | undefined): T[] {
  const mapa = new Map(locales.map((item) => [item.id, item]))
  for (const item of entrantes ?? []) {
    const actual = mapa.get(item.id)
    if (!actual || !actual.actualizadoEn || !item.actualizadoEn || item.actualizadoEn >= actual.actualizadoEn) {
      mapa.set(item.id, item)
    }
  }
  return [...mapa.values()]
}

export type PaqueteEpisodio = {
  v: 1
  tipo: "sindi-episodio"
  id: string
  titulo: string
  tematica: string
  sector: SectorSerieId
  sinopsis: string
  guion: string
  estado: EstadoProduccionId
  promptImagen: string
  promptVideo: string
  escenas: string
  duracion: string
  formato: FormatoAvId
  materialesRef: string
  checklist: ChecklistRevision
  comentarios: ComentarioRevision[]
  actualizadoEn: string
  porNombre: string
  ejemplo: boolean
}

function recortar(valor: string, max: number) {
  const limpio = valor.replace(/\s+/g, " ").trim()
  if (limpio.length <= max) return limpio
  return `${limpio.slice(0, max - 1).trimEnd()}…`
}

export function empaquetarEpisodio(episodio: EpisodioSerie, porNombre: string): PaqueteEpisodio {
  return {
    v: 1,
    tipo: "sindi-episodio",
    id: episodio.id,
    titulo: episodio.titulo,
    tematica: recortar(episodio.tematica, 180),
    sector: episodio.sector,
    sinopsis: recortar(episodio.sinopsis, 400),
    guion: recortar(episodio.guion, 800),
    estado: episodio.estado,
    promptImagen: recortar(episodio.promptImagen, 400),
    promptVideo: recortar(episodio.promptVideo, 400),
    escenas: recortar(episodio.escenas, 400),
    duracion: episodio.duracion,
    formato: episodio.formato,
    materialesRef: recortar(episodio.materialesRef, 280),
    checklist: episodio.checklist,
    comentarios: episodio.comentarios.slice(-3).map((item) => ({ ...item, texto: recortar(item.texto, 200) })),
    actualizadoEn: episodio.actualizadoEn,
    porNombre,
    ejemplo: episodio.ejemplo,
  }
}

export function codificarPaqueteEpisodio(paquete: PaqueteEpisodio): string {
  const bytes = new TextEncoder().encode(JSON.stringify(paquete))
  let binario = ""
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte)
  })
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

export function decodificarPaqueteEpisodio(dato: string): PaqueteEpisodio | null {
  try {
    const base = dato.replace(/-/g, "+").replace(/_/g, "/")
    const relleno = base + "=".repeat((4 - (base.length % 4)) % 4)
    const binario = atob(relleno)
    const bytes = Uint8Array.from(binario, (letra) => letra.charCodeAt(0))
    const json = JSON.parse(new TextDecoder().decode(bytes)) as Partial<PaqueteEpisodio>
    if (json.v !== 1 || json.tipo !== "sindi-episodio" || typeof json.id !== "string" || typeof json.titulo !== "string") return null
    if (typeof json.sector !== "string" || !SECTORES_OK.has(json.sector)) return null
    if (typeof json.estado !== "string" || !ESTADOS_OK.has(json.estado)) return null
    return json as PaqueteEpisodio
  } catch {
    return null
  }
}

export function episodioDesdePaquete(paquete: PaqueteEpisodio): EpisodioSerie {
  const ahora = paquete.actualizadoEn || ahoraIso()
  return {
    id: paquete.id,
    titulo: paquete.titulo,
    tematica: paquete.tematica ?? "",
    sector: paquete.sector,
    sinopsis: paquete.sinopsis ?? "",
    guion: paquete.guion ?? "",
    estado: paquete.estado,
    promptImagen: paquete.promptImagen ?? "",
    promptVideo: paquete.promptVideo ?? "",
    escenas: paquete.escenas ?? "",
    duracion: paquete.duracion ?? "",
    formato: FORMATOS_OK.has(paquete.formato) ? paquete.formato : "9:16",
    materialesRef: paquete.materialesRef ?? "",
    checklist: checklistDe(paquete.checklist),
    comentarios: Array.isArray(paquete.comentarios) ? paquete.comentarios : [],
    creadoEn: ahora,
    actualizadoEn: ahora,
    ejemplo: Boolean(paquete.ejemplo),
  }
}

export function fusionarEpisodio(local: EpisodioSerie | undefined, entrante: EpisodioSerie): { episodio: EpisodioSerie; nuevo: boolean } {
  if (!local) return { episodio: entrante, nuevo: true }
  if (entrante.actualizadoEn < local.actualizadoEn) return { episodio: local, nuevo: false }
  const ids = new Set(entrante.comentarios.map((item) => item.id))
  const comentarios = [...entrante.comentarios, ...local.comentarios.filter((item) => !ids.has(item.id))]
  return {
    nuevo: false,
    episodio: {
      ...local,
      ...entrante,
      comentarios,
      guion: entrante.guion || local.guion,
      promptImagen: entrante.promptImagen || local.promptImagen,
      promptVideo: entrante.promptVideo || local.promptVideo,
    },
  }
}

export function enlaceImportacionEpisodio(episodio: EpisodioSerie, porNombre: string, origen?: string): string {
  const raiz =
    origen ??
    (typeof window === "undefined"
      ? ""
      : `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`)
  const paquete = empaquetarEpisodio(episodio, porNombre)
  return `${raiz}sindi-cato/#/importar-sindi?d=${codificarPaqueteEpisodio(paquete)}`
}

export function mensajeWhatsappEpisodio(episodio: EpisodioSerie, porNombre: string, origen?: string): string {
  const ultimo = [...episodio.comentarios].reverse()[0]
  const lineas = [
    "UGT FeSMC Canarias · Sindi y Cato",
    "",
    `🎬 ${episodio.titulo}`,
    `${nombreSectorSerie(episodio.sector)} · ${nombreEstadoProduccion(episodio.estado)}`,
    episodio.tematica ? `Temática: ${episodio.tematica}` : "",
    "",
    recortar(episodio.sinopsis, 320),
    "",
    `Revisión: ${checklistCompleto(episodio.checklist) ? "checklist completo" : "checklist pendiente"}`,
    ultimo ? `Último comentario (${ultimo.porNombre}): ${recortar(ultimo.texto, 200)}` : "",
    "",
    "Ábrelo en la app para seguir la revisión. El enlace no pasa por ningún servidor:",
    enlaceImportacionEpisodio(episodio, porNombre, origen),
  ]
  return lineas.filter((linea) => linea !== "").join("\n")
}

export function abrirWhatsappEpisodio(episodio: EpisodioSerie, porNombre: string): boolean {
  const textoMensaje = mensajeWhatsappEpisodio(episodio, porNombre)
  const url = `https://wa.me/?text=${encodeURIComponent(textoMensaje)}`
  if (typeof navigator !== "undefined" && navigator.share) {
    void navigator.share({ title: episodio.titulo, text: textoMensaje }).catch(() => {
      window.open(url, "_blank", "noopener,noreferrer")
    })
    return true
  }
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer")
    return true
  }
  return false
}

export function resolverImagenRef(ruta: string): string {
  if (!ruta) return rutaPublica(RUTA_RETRATO_SINDI_CATO)
  if (/^https?:\/\//i.test(ruta)) return ruta
  return rutaPublica(ruta)
}
