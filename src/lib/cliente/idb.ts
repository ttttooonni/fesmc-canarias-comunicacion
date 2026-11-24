import type { Ficha, Hueco, MetricaMes, UsuarioPublico } from "@/lib/dominio"
import type { DocumentoSerie, EpisodioSerie, PersonajeSerie, PublicacionSerie } from "@/lib/sindi-cato"

const NOMBRE = "ugt-fesmc-local"
const VERSION = 1
const TIENDA = "kv"
const CLAVE = "mesa"

export type MesaLocal = {
  perfil: UsuarioPublico | null
  fichas: Ficha[]
  calendario: Hueco[]
  metricas: MetricaMes[]
  personajesSerie: PersonajeSerie[]
  episodiosSerie: EpisodioSerie[]
  documentosSerie: DocumentoSerie[]
  publicacionesSerie: PublicacionSerie[]
  tutorialVisto: boolean
  guardadoEn: string
}

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const peticion = indexedDB.open(NOMBRE, VERSION)
    peticion.onupgradeneeded = () => {
      const db = peticion.result
      if (!db.objectStoreNames.contains(TIENDA)) db.createObjectStore(TIENDA)
    }
    peticion.onsuccess = () => resolve(peticion.result)
    peticion.onerror = () => reject(peticion.error)
  })
}

function normalizar(mesa: MesaLocal | (Partial<MesaLocal> & { perfil?: UsuarioPublico | null }) | null): MesaLocal | null {
  if (!mesa) return null
  return {
    perfil: mesa.perfil ?? null,
    fichas: mesa.fichas ?? [],
    calendario: mesa.calendario ?? [],
    metricas: mesa.metricas ?? [],
    personajesSerie: mesa.personajesSerie ?? [],
    episodiosSerie: mesa.episodiosSerie ?? [],
    documentosSerie: mesa.documentosSerie ?? [],
    publicacionesSerie: mesa.publicacionesSerie ?? [],
    tutorialVisto: mesa.tutorialVisto ?? false,
    guardadoEn: mesa.guardadoEn ?? new Date().toISOString(),
  }
}

export async function leerMesa(): Promise<MesaLocal | null> {
  if (typeof indexedDB === "undefined") return null
  const db = await abrir()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TIENDA, "readonly")
    const peticion = tx.objectStore(TIENDA).get(CLAVE)
    peticion.onsuccess = () => resolve(normalizar((peticion.result as MesaLocal) ?? null))
    peticion.onerror = () => reject(peticion.error)
  })
}

export async function guardarMesa(mesa: MesaLocal): Promise<void> {
  if (typeof indexedDB === "undefined") return
  const db = await abrir()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(TIENDA, "readwrite")
    tx.objectStore(TIENDA).put({ ...normalizar(mesa)!, guardadoEn: new Date().toISOString() }, CLAVE)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
