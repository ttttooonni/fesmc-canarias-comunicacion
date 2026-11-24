import {
  formatoFecha,
  nombreEstado,
  nombreIsla,
  nombreSector,
  type CanalId,
  type EstadoId,
  type Ficha,
  type IslaId,
  type PilarId,
  type SectorId,
} from "@/lib/dominio"

export type PaqueteFicha = {
  v: 1
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
  nota?: string
  actualizadoEn: string
  creadoPorNombre: string
  ejemplo: boolean
}

const ESTADOS_OK = new Set<string>([
  "borrador",
  "propuesta",
  "en_revision",
  "revision_legal",
  "aprobada",
  "cambios",
  "publicada",
])

export function empaquetar(ficha: Ficha): PaqueteFicha {
  const nota = [...ficha.historial].reverse().find((paso) => paso.nota)?.nota
  return {
    v: 1,
    id: ficha.id,
    titulo: ficha.titulo,
    queOcurrio: recortar(ficha.queOcurrio, 700),
    isla: ficha.isla,
    cuando: ficha.cuando,
    sector: ficha.sector,
    fuentes: recortar(ficha.fuentes, 280),
    materialAutorizado: ficha.materialAutorizado,
    descripcionMaterial: recortar(ficha.descripcionMaterial, 280),
    contactoNombre: ficha.contactoNombre,
    contactoMedio: ficha.contactoMedio,
    sensible: ficha.sensible,
    motivoSensible: recortar(ficha.motivoSensible, 180),
    pilar: ficha.pilar,
    canales: ficha.canales,
    estado: ficha.estado,
    nota: nota ? recortar(nota, 240) : undefined,
    actualizadoEn: ficha.actualizadoEn,
    creadoPorNombre: ficha.creadoPorNombre,
    ejemplo: ficha.ejemplo,
  }
}

export function codificarPaquete(paquete: PaqueteFicha): string {
  const bytes = new TextEncoder().encode(JSON.stringify(paquete))
  let binario = ""
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte)
  })
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

export function decodificarPaquete(dato: string): PaqueteFicha | null {
  try {
    const base = dato.replace(/-/g, "+").replace(/_/g, "/")
    const relleno = base + "=".repeat((4 - (base.length % 4)) % 4)
    const binario = atob(relleno)
    const bytes = Uint8Array.from(binario, (letra) => letra.charCodeAt(0))
    const json = JSON.parse(new TextDecoder().decode(bytes)) as Partial<PaqueteFicha>
    if (json.v !== 1 || typeof json.id !== "string" || typeof json.titulo !== "string") return null
    if (typeof json.estado !== "string" || !ESTADOS_OK.has(json.estado)) return null
    if (typeof json.queOcurrio !== "string" || typeof json.isla !== "string" || typeof json.sector !== "string") return null
    return json as PaqueteFicha
  } catch {
    return null
  }
}

export function fichaDesdePaquete(paquete: PaqueteFicha): Ficha {
  const ahora = paquete.actualizadoEn || new Date().toISOString()
  return {
    id: paquete.id,
    titulo: paquete.titulo,
    queOcurrio: paquete.queOcurrio,
    isla: paquete.isla,
    cuando: paquete.cuando,
    sector: paquete.sector,
    fuentes: paquete.fuentes,
    materialAutorizado: paquete.materialAutorizado,
    descripcionMaterial: paquete.descripcionMaterial,
    contactoNombre: paquete.contactoNombre,
    contactoMedio: paquete.contactoMedio,
    sensible: paquete.sensible,
    motivoSensible: paquete.motivoSensible,
    pilar: paquete.pilar,
    canales: paquete.canales,
    estado: paquete.estado,
    creadoPorId: "importada",
    creadoPorNombre: paquete.creadoPorNombre || "Equipo",
    creadoEn: ahora,
    actualizadoEn: ahora,
    historial: [
      {
        id: `${paquete.id}-import`,
        estado: paquete.estado,
        porId: "importada",
        porNombre: paquete.creadoPorNombre || "Equipo",
        en: ahora,
        nota: paquete.nota || "Importada desde un enlace de WhatsApp.",
      },
    ],
    textoPublicacion: paquete.titulo,
    textoCompartir: "",
    programadoPara: null,
    publicadoEn: paquete.estado === "publicada" ? ahora : null,
    difundidoEn: null,
    checklist: null,
    compartidos: [],
    ejemplo: paquete.ejemplo,
  }
}

export function enlaceImportacion(ficha: Ficha, origen?: string): string {
  const raiz =
    origen ??
    (typeof window === "undefined"
      ? ""
      : `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`)
  return `${raiz}#/importar?d=${codificarPaquete(empaquetar(ficha))}`
}

export function mensajeWhatsapp(ficha: Ficha, origen?: string): string {
  const nota = [...ficha.historial].reverse().find((paso) => paso.nota)?.nota
  const lineas = [
    "UGT FeSMC Canarias · Comunicación digital",
    "",
    `📋 ${ficha.titulo}`,
    `${nombreIsla(ficha.isla)} · ${nombreSector(ficha.sector)}`,
    formatoFecha(ficha.cuando),
    "",
    `Estado: ${nombreEstado(ficha.estado)}`,
    ficha.sensible ? "Contenido sensible. No añadas nombres ni detalles de más." : "",
    "",
    recortar(ficha.queOcurrio, 420),
    nota ? "" : "",
    nota ? `Nota: ${nota}` : "",
    "",
    "Ábrelo en la app para seguir el circuito. El enlace no pasa por ningún servidor:",
    enlaceImportacion(ficha, origen),
  ]
  return lineas.filter((linea) => linea !== "").join("\n")
}

export function urlWhatsapp(ficha: Ficha, origen?: string): string {
  return `https://wa.me/?text=${encodeURIComponent(mensajeWhatsapp(ficha, origen))}`
}

export function abrirWhatsapp(ficha: Ficha): boolean {
  const texto = mensajeWhatsapp(ficha)
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
  if (typeof navigator !== "undefined" && navigator.share) {
    void navigator.share({ title: ficha.titulo, text: texto }).catch(() => {
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

export function fusionarFicha(local: Ficha | undefined, entrante: Ficha): { ficha: Ficha; nueva: boolean } {
  if (!local) return { ficha: entrante, nueva: true }
  if (entrante.actualizadoEn < local.actualizadoEn) return { ficha: local, nueva: false }
  const ids = new Set(entrante.historial.map((paso) => paso.id))
  const historial = [...entrante.historial, ...local.historial.filter((paso) => !ids.has(paso.id))]
  return {
    nueva: false,
    ficha: {
      ...local,
      ...entrante,
      historial,
      textoPublicacion: entrante.textoPublicacion || local.textoPublicacion,
      textoCompartir: local.textoCompartir || entrante.textoCompartir,
    },
  }
}

function recortar(texto: string, max: number): string {
  const limpio = texto.replace(/\s+/g, " ").trim()
  if (limpio.length <= max) return limpio
  return `${limpio.slice(0, max - 1).trimEnd()}…`
}
