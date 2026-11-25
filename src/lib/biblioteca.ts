import { ISLAS, SECTORES, type IslaId, type SectorId } from "@/lib/dominio"

export const TIPOS_RECURSO = [
  { id: "guion", nombre: "Guiones", singular: "Guion", detalle: "Guiones de vídeo, locuciones y piezas de Sindi y Cato." },
  { id: "comunicado", nombre: "Comunicados", singular: "Comunicado", detalle: "Comunicados y notas aprobadas para reutilizar." },
  { id: "imagen", nombre: "Imágenes", singular: "Imagen", detalle: "Referencias a imágenes autorizadas. La imagen no se guarda aquí." },
  { id: "video", nombre: "Vídeos", singular: "Vídeo", detalle: "Referencias a vídeos publicados o en bruto." },
  { id: "plantilla", nombre: "Plantillas", singular: "Plantilla", detalle: "Textos base para copiar: avisos, convocatorias, respuestas." },
  { id: "documentacion", nombre: "Documentación de consulta", singular: "Documento", detalle: "Convenios, normas y guías públicas para contrastar." },
] as const

export type TipoRecursoId = (typeof TIPOS_RECURSO)[number]["id"]

export type RecursoBiblioteca = {
  id: string
  tipo: TipoRecursoId
  titulo: string
  descripcion: string
  /** Texto reutilizable (guion, comunicado, plantilla). Opcional. */
  contenido: string
  /** Dónde está el archivo: enlace público, carpeta compartida o nombre de archivo. La app no sube archivos. */
  referencia: string
  etiquetas: string[]
  isla: IslaId | null
  sector: SectorId | null
  autorizado: boolean
  creadoEn: string
  actualizadoEn: string
  ejemplo: boolean
}

const IDS_TIPO = new Set<string>(TIPOS_RECURSO.map((item) => item.id))
const IDS_ISLA = new Set<string>([...ISLAS.map((item) => item.id), "regional"])
const IDS_SECTOR = new Set<string>(SECTORES.map((item) => item.id))

export function nombreTipoRecurso(id: TipoRecursoId): string {
  return TIPOS_RECURSO.find((item) => item.id === id)?.singular ?? id
}

function texto(valor: unknown, max: number): string {
  return typeof valor === "string" ? valor.trim().slice(0, max) : ""
}

export function leerEtiquetas(valor: unknown): string[] {
  const lista = Array.isArray(valor) ? valor : typeof valor === "string" ? valor.split(",") : []
  return [...new Set(lista.map((item) => (typeof item === "string" ? item.trim().replace(/^#/, "") : "")).filter(Boolean))].slice(0, 12)
}

export function leerRecurso(
  datos: unknown,
  id: string,
  ahora: string,
  anterior?: RecursoBiblioteca,
): { ok: true; recurso: RecursoBiblioteca } | { ok: false; error: string } {
  const bruto = (datos && typeof datos === "object" ? datos : {}) as Record<string, unknown>
  const tipo = texto(bruto.tipo, 40)
  const titulo = texto(bruto.titulo, 160)
  const descripcion = texto(bruto.descripcion, 1000)
  const contenido = texto(bruto.contenido, 8000)
  const referencia = texto(bruto.referencia, 600)
  const isla = texto(bruto.isla, 40)
  const sector = texto(bruto.sector, 40)
  if (!IDS_TIPO.has(tipo)) return { ok: false, error: "Elige el tipo de recurso." }
  if (titulo.length < 4) return { ok: false, error: "Pon un título de al menos 4 caracteres." }
  if (!contenido && !referencia && !descripcion) {
    return { ok: false, error: "Añade una descripción, el texto o la referencia de dónde está el archivo." }
  }
  if (referencia && /^javascript:/i.test(referencia)) return { ok: false, error: "Esa referencia no es válida." }
  return {
    ok: true,
    recurso: {
      id,
      tipo: tipo as TipoRecursoId,
      titulo,
      descripcion,
      contenido,
      referencia,
      etiquetas: leerEtiquetas(bruto.etiquetas),
      isla: IDS_ISLA.has(isla) ? (isla as IslaId) : null,
      sector: IDS_SECTOR.has(sector) ? (sector as SectorId) : null,
      autorizado: bruto.autorizado === true,
      creadoEn: anterior?.creadoEn ?? ahora,
      actualizadoEn: ahora,
      ejemplo: anterior?.ejemplo ?? bruto.ejemplo === true,
    },
  }
}

/** Valida un recurso que llega de una copia; devuelve null si no se puede usar. */
export function recursoDesdeCopia(valor: unknown): RecursoBiblioteca | null {
  if (!valor || typeof valor !== "object") return null
  const bruto = valor as Record<string, unknown>
  if (typeof bruto.id !== "string" || !bruto.id) return null
  const ahora = typeof bruto.actualizadoEn === "string" ? bruto.actualizadoEn : new Date(0).toISOString()
  const leido = leerRecurso(bruto, bruto.id, ahora)
  if (!leido.ok) return null
  return {
    ...leido.recurso,
    creadoEn: typeof bruto.creadoEn === "string" ? bruto.creadoEn : ahora,
    actualizadoEn: ahora,
    ejemplo: bruto.ejemplo === true,
  }
}

export function enlaceSeguro(referencia: string): string | null {
  return /^https:\/\//i.test(referencia.trim()) ? referencia.trim() : null
}

export function recursosDeDemostracion(): RecursoBiblioteca[] {
  const en = "2026-11-20T09:00:00.000Z"
  const base = { isla: null, sector: null, autorizado: true, creadoEn: en, actualizadoEn: en, ejemplo: true }
  return [
    {
      ...base,
      id: "demo-bib-guion-turnos",
      tipo: "guion",
      titulo: "Guion de 30 s: el cuadrante no se cambia por mensaje",
      descripcion: "Guion corto para reel o TikTok. Pieza de DEMOSTRACIÓN.",
      contenido:
        "CATO: Me han cambiado el turno por WhatsApp a las once de la noche. ¿Eso vale?\nSINDI: El cuadrante se conoce con antelación y los cambios tienen que respetar el convenio. Guarda el mensaje y habla con tu delegada o delegado.\nCIERRE: Sindi y Cato: historias de trabajadores, derechos que importan.",
      referencia: "",
      etiquetas: ["sindi-cato", "jornada", "hostelería"],
      sector: "hosteleria",
    },
    {
      ...base,
      id: "demo-bib-comunicado",
      tipo: "comunicado",
      titulo: "Comunicado tipo: convocatoria de asamblea informativa",
      descripcion: "Estructura aprobada para convocar asambleas. DEMOSTRACIÓN, sin fecha ni centro reales.",
      contenido:
        "UGT FeSMC Canarias convoca asamblea informativa para la plantilla de [centro] el día [fecha] a las [hora] en [lugar].\nOrden del día: 1. Situación de la negociación. 2. Turno de preguntas.\nTe esperamos. Tu voz cuenta.",
      referencia: "",
      etiquetas: ["asamblea", "convocatoria"],
    },
    {
      ...base,
      id: "demo-bib-imagen",
      tipo: "imagen",
      titulo: "Ilustración oficial de Sindi y Cato",
      descripcion: "Imagen autorizada de la serie, incluida en la propia app.",
      contenido: "",
      referencia: "imagenes/sindi-y-cato.webp",
      etiquetas: ["sindi-cato", "identidad"],
    },
    {
      ...base,
      id: "demo-bib-video",
      tipo: "video",
      titulo: "Episodio piloto (bruto de producción)",
      descripcion: "Referencia ficticia de la carpeta compartida del equipo. DEMOSTRACIÓN.",
      contenido: "",
      referencia: "Carpeta del equipo › Sindi y Cato › Episodio 01 › bruto-v2.mp4",
      etiquetas: ["sindi-cato", "vídeo"],
    },
    {
      ...base,
      id: "demo-bib-plantilla",
      tipo: "plantilla",
      titulo: "Plantilla de pie de publicación",
      descripcion: "Cierre común para Instagram y Facebook.",
      contenido: "Si te pasa algo parecido, no estás sola ni solo. Habla con UGT FeSMC Canarias en tu isla.\n#UGTFeSMCCanarias #UGT",
      referencia: "",
      etiquetas: ["redes", "cierre"],
    },
    {
      ...base,
      id: "demo-bib-doc",
      tipo: "documentacion",
      titulo: "Estatuto de los Trabajadores (texto consolidado)",
      descripcion: "Referencia pública para contrastar derechos básicos antes de publicar.",
      contenido: "",
      referencia: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430",
      etiquetas: ["consulta", "legislación"],
    },
  ]
}
