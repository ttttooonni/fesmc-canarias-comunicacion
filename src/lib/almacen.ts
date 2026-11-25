import type { RecursoBiblioteca } from "@/lib/biblioteca"
import type { Ficha, Hueco, MetricaMes, UsuarioPublico } from "@/lib/dominio"
import type { DocumentoSerie, EpisodioSerie, PersonajeSerie, PublicacionSerie } from "@/lib/sindi-cato"

/**
 * Versión de la estructura de datos guardada en este dispositivo.
 * 1: versión inicial (sin campo `esquema`).
 * 2: añade `biblioteca`, `registroCopias` y `esquema`; fichas con `referenciaMaterial`; huecos con isla y sector.
 */
export const ESQUEMA_ACTUAL = 2

export type EntradaRegistroCopia = {
  id: string
  tipo: "exportacion" | "importacion" | "deshacer" | "migracion" | "demo-cargada" | "demo-quitada"
  en: string
  detalle: string
  porNombre: string | null
}

export type MesaLocal = {
  esquema: number
  perfil: UsuarioPublico | null
  fichas: Ficha[]
  calendario: Hueco[]
  metricas: MetricaMes[]
  personajesSerie: PersonajeSerie[]
  episodiosSerie: EpisodioSerie[]
  documentosSerie: DocumentoSerie[]
  publicacionesSerie: PublicacionSerie[]
  biblioteca: RecursoBiblioteca[]
  registroCopias: EntradaRegistroCopia[]
  tutorialVisto: boolean
  guardadoEn: string
}

function lista<T>(valor: unknown): T[] {
  return Array.isArray(valor) ? (valor as T[]) : []
}

function migrarFicha(ficha: Ficha): Ficha {
  return {
    ...ficha,
    historial: Array.isArray(ficha.historial) ? ficha.historial : [],
    compartidos: Array.isArray(ficha.compartidos) ? ficha.compartidos : [],
    canales: Array.isArray(ficha.canales) ? ficha.canales : [],
    referenciaMaterial: typeof ficha.referenciaMaterial === "string" ? ficha.referenciaMaterial : "",
    ejemplo: ficha.ejemplo === true,
  }
}

function migrarHueco(hueco: Hueco): Hueco {
  return {
    ...hueco,
    canales: Array.isArray(hueco.canales) ? hueco.canales : [],
    isla: hueco.isla ?? null,
    sector: hueco.sector ?? null,
    ejemplo: hueco.ejemplo === true,
  }
}

/**
 * Lleva cualquier mesa guardada (esquema 1 o 2, o incompleta) al esquema actual
 * sin perder nada: solo añade campos que faltan y conserva todo lo demás, incluso
 * propiedades que esta versión no conozca.
 */
export function migrarMesa(bruto: unknown): MesaLocal | null {
  if (!bruto || typeof bruto !== "object") return null
  const mesa = bruto as Record<string, unknown>
  const registro = lista<EntradaRegistroCopia>(mesa.registroCopias)
  const esquemaPrevio = typeof mesa.esquema === "number" ? mesa.esquema : 1
  const migrada: MesaLocal = {
    ...(mesa as object),
    esquema: Math.max(ESQUEMA_ACTUAL, esquemaPrevio),
    perfil: (mesa.perfil as UsuarioPublico | null | undefined) ?? null,
    fichas: lista<Ficha>(mesa.fichas).filter((item) => item && typeof item.id === "string").map(migrarFicha),
    calendario: lista<Hueco>(mesa.calendario).filter((item) => item && typeof item.id === "string").map(migrarHueco),
    metricas: lista<MetricaMes>(mesa.metricas),
    personajesSerie: lista<PersonajeSerie>(mesa.personajesSerie),
    episodiosSerie: lista<EpisodioSerie>(mesa.episodiosSerie),
    documentosSerie: lista<DocumentoSerie>(mesa.documentosSerie),
    publicacionesSerie: lista<PublicacionSerie>(mesa.publicacionesSerie),
    biblioteca: lista<RecursoBiblioteca>(mesa.biblioteca),
    registroCopias: registro,
    tutorialVisto: mesa.tutorialVisto === true,
    guardadoEn: typeof mesa.guardadoEn === "string" ? mesa.guardadoEn : new Date().toISOString(),
  }
  if (esquemaPrevio < 2) {
    migrada.registroCopias = [
      ...registro,
      {
        id: `migracion-1-a-2-${migrada.guardadoEn}`,
        tipo: "migracion",
        en: new Date().toISOString(),
        detalle: "Datos actualizados del esquema 1 al 2. Se guardó una copia previa en este dispositivo.",
        porNombre: null,
      },
    ]
  }
  return migrada
}

export function mesaVacia(): MesaLocal {
  return migrarMesa({ esquema: ESQUEMA_ACTUAL }) as MesaLocal
}

export const MAX_REGISTRO_COPIAS = 200

export function anotarRegistro(registro: EntradaRegistroCopia[], entrada: EntradaRegistroCopia): EntradaRegistroCopia[] {
  return [entrada, ...registro].slice(0, MAX_REGISTRO_COPIAS)
}
