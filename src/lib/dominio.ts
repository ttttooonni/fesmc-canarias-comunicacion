export const ISLAS = [
  { id: "lanzarote", nombre: "Lanzarote" },
  { id: "fuerteventura", nombre: "Fuerteventura" },
  { id: "gran_canaria", nombre: "Gran Canaria" },
  { id: "tenerife", nombre: "Tenerife" },
  { id: "la_gomera", nombre: "La Gomera" },
  { id: "la_palma", nombre: "La Palma" },
  { id: "el_hierro", nombre: "El Hierro" },
] as const

export const ISLA_FEDERACION = {
  id: "regional",
  nombre: "Toda la federación",
} as const

export const SECTORES = [
  { id: "comercio", nombre: "Comercio" },
  { id: "hosteleria", nombre: "Hostelería y turismo" },
  { id: "carretera", nombre: "Transporte por carretera" },
  { id: "aereo", nombre: "Transporte aéreo" },
  { id: "maritimo", nombre: "Transporte marítimo" },
  { id: "telecomunicaciones", nombre: "Telecomunicaciones" },
  { id: "financiero", nombre: "Financiero y seguros" },
  { id: "oficinas", nombre: "Oficinas y despachos" },
  { id: "limpieza", nombre: "Limpieza" },
  { id: "seguridad", nombre: "Seguridad" },
  { id: "contact_center", nombre: "Contact center" },
  { id: "juego", nombre: "Juego" },
] as const

export const PILARES = [
  { id: "derechos", nombre: "Derechos laborales" },
  { id: "actividad", nombre: "Actividad sindical" },
  { id: "actualidad", nombre: "Actualidad" },
  { id: "participacion", nombre: "Participación" },
  { id: "sindi_cato", nombre: "Sindi y Cato te lo cuentan" },
  { id: "igualdad", nombre: "Igualdad" },
  { id: "salud", nombre: "Salud laboral" },
  { id: "negociacion", nombre: "Negociación colectiva" },
  { id: "servicios", nombre: "Servicios a la afiliación" },
] as const

export const CANALES = [
  { id: "instagram", nombre: "Instagram" },
  { id: "facebook", nombre: "Facebook" },
  { id: "tiktok", nombre: "TikTok" },
] as const

export const ESTADOS = [
  { id: "borrador", nombre: "Borrador", detalle: "Está en este dispositivo. Todavía no se ha enviado." },
  { id: "propuesta", nombre: "Propuesta recibida", detalle: "Se compartió por WhatsApp y espera que coordinación la recoja." },
  { id: "en_revision", nombre: "Pendiente de revisión", detalle: "Se pidió revisión de redacción, fuentes e imagen." },
  { id: "revision_legal", nombre: "Revisión jurídica", detalle: "La está mirando el referente jurídico." },
  { id: "aprobada", nombre: "Aprobada", detalle: "Ya se puede publicar." },
  { id: "cambios", nombre: "Devuelta para modificaciones", detalle: "Hay que corregirla y volver a enviarla." },
  { id: "publicada", nombre: "Publicada", detalle: "Ya está en las cuentas de la federación." },
] as const

export const ROLES = [
  { id: "coordinacion", nombre: "Coordinación y supervisión" },
  { id: "gestor", nombre: "Compañero gestor" },
  { id: "insular", nombre: "Responsable insular" },
  { id: "sectorial", nombre: "Responsable sectorial" },
  { id: "juridico", nombre: "Referente jurídico" },
] as const

export const FRANJAS = [
  { id: "lunes_derechos", nombre: "Lunes · derechos", dia: 1 },
  { id: "miercoles_actividad", nombre: "Miércoles · actividad", dia: 3 },
  { id: "viernes_actualidad", nombre: "Viernes · actualidad y participación", dia: 5 },
  { id: "fuera_de_ritmo", nombre: "Fuera de ritmo", dia: -1 },
] as const

export type IslaId = (typeof ISLAS)[number]["id"] | typeof ISLA_FEDERACION.id
export type SectorId = (typeof SECTORES)[number]["id"]
export type PilarId = (typeof PILARES)[number]["id"]
export type CanalId = (typeof CANALES)[number]["id"]
export type EstadoId = (typeof ESTADOS)[number]["id"]
export type RolId = (typeof ROLES)[number]["id"]
export type FranjaId = (typeof FRANJAS)[number]["id"]

export type HistorialItem = {
  id: string
  estado: EstadoId
  porId: string
  porNombre: string
  en: string
  nota?: string
}

export type Compartido = {
  id: string
  isla: IslaId
  porId: string
  porNombre: string
  en: string
}

export type ChecklistPublicacion = {
  porId: string
  porNombre: string
  en: string
}

export type Ficha = {
  id: string
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
  estado: EstadoId
  creadoPorId: string
  creadoPorNombre: string
  creadoEn: string
  actualizadoEn: string
  historial: HistorialItem[]
  textoPublicacion: string
  textoCompartir: string
  programadoPara: string | null
  publicadoEn: string | null
  difundidoEn: string | null
  checklist: ChecklistPublicacion | null
  compartidos: Compartido[]
  /** Referencia al material autorizado (carpeta compartida, nombre de archivo, enlace). Añadido en el esquema 2. */
  referenciaMaterial?: string
  /** true = dato de DEMOSTRACIÓN (cargado de ejemplo o marcado así al crearlo). */
  ejemplo: boolean
}

export type Hueco = {
  id: string
  fecha: string
  franja: FranjaId
  pilar: PilarId
  titulo: string
  angulo: string
  canales: CanalId[]
  fichaId: string | null
  excepcional: boolean
  /** Isla y sector del hueco (opcionales, esquema 2). Si hay ficha vinculada, manda la ficha. */
  isla?: IslaId | null
  sector?: SectorId | null
  ejemplo: boolean
}

export type CifrasCanal = {
  publicaciones: number | null
  alcance: number | null
  interacciones: number | null
  seguidores: number | null
  variacionSeguidores: number | null
}

export type MetricaMes = {
  mes: string
  canales: Record<CanalId, CifrasCanal>
  notas: string
  incidenciasSeguridad: number | null
  actualizadoPorId: string | null
  actualizadoPorNombre: string | null
  actualizadoEn: string | null
  ejemplo: boolean
}

export type UsuarioPublico = {
  id: string
  nombre: string
  email: string
  rol: RolId
  isla: IslaId | null
  sector: SectorId | null
  ejemplo: boolean
}

export function nombreIsla(id: IslaId): string {
  if (id === "regional") return ISLA_FEDERACION.nombre
  return ISLAS.find((isla) => isla.id === id)?.nombre ?? id
}

export function nombreSector(id: SectorId): string {
  return SECTORES.find((sector) => sector.id === id)?.nombre ?? id
}

export function nombrePilar(id: PilarId): string {
  return PILARES.find((pilar) => pilar.id === id)?.nombre ?? id
}

export function nombreCanal(id: CanalId): string {
  return CANALES.find((canal) => canal.id === id)?.nombre ?? id
}

export function hoyIso(ahora = new Date()): string {
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`
}

export const ETIQUETA_DEMO = "DEMOSTRACIÓN"

export function nombreEstado(id: EstadoId): string {
  return ESTADOS.find((estado) => estado.id === id)?.nombre ?? id
}

export function nombreRol(id: RolId): string {
  return ROLES.find((rol) => rol.id === id)?.nombre ?? id
}

export function nombreFranja(id: FranjaId): string {
  return FRANJAS.find((franja) => franja.id === id)?.nombre ?? id
}

export function fechaLocal(iso: string): Date {
  const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number)
  return new Date(ano, (mes || 1) - 1, dia || 1)
}

export function mesDe(iso: string): string {
  return iso.slice(0, 7)
}

export function formatoFecha(iso: string): string {
  return fechaLocal(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatoCorto(iso: string): string {
  return fechaLocal(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  })
}

export function formatoMomento(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Atlantic/Canary",
  })
}

export function franjaDeFecha(iso: string): FranjaId | null {
  const dia = fechaLocal(iso).getDay()
  return FRANJAS.find((franja) => franja.dia === dia)?.id ?? null
}

export function esFranjaDePlan(id: FranjaId): boolean {
  return id !== "fuera_de_ritmo"
}

export function cifrasVacias(): CifrasCanal {
  return {
    publicaciones: null,
    alcance: null,
    interacciones: null,
    seguidores: null,
    variacionSeguidores: null,
  }
}

export function metricaVacia(mes: string): MetricaMes {
  return {
    mes,
    canales: {
      instagram: cifrasVacias(),
      facebook: cifrasVacias(),
      tiktok: cifrasVacias(),
    },
    notas: "",
    incidenciasSeguridad: null,
    actualizadoPorId: null,
    actualizadoPorNombre: null,
    actualizadoEn: null,
    ejemplo: false,
  }
}

export const MES_INICIO_PLAN = "2026-12"

export function mesVisiblePorDefecto(ahora = new Date()): string {
  const mes = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`
  if (mes < MES_INICIO_PLAN) return "2026-11"
  return mes
}

export function desplazarMes(mes: string, delta: number): string {
  const [ano, numero] = mes.split("-").map(Number)
  const fecha = new Date(ano, (numero || 1) - 1 + delta, 1)
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`
}

export function etiquetaMes(mes: string): string {
  const texto = fechaLocal(`${mes}-01`).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
