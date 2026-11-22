import type { Ficha, Hueco, MetricaMes, UsuarioPublico } from "@/lib/dominio"

const NOMBRE = "ugt-fesmc-com"
const VERSION = 1
const TIENDA = "kv"
const CLAVE = "estado"

export type TareaPendiente = {
  id: string
  path: string
  method: "POST" | "PATCH" | "PUT"
  body: unknown
}

export type CacheLocal = {
  usuario: UsuarioPublico
  fichas: Ficha[]
  calendario: Hueco[]
  metricas: MetricaMes[]
  bandeja: TareaPendiente[]
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

export async function leerCache(): Promise<CacheLocal | null> {
  if (typeof indexedDB === "undefined") return null
  const db = await abrir()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TIENDA, "readonly")
    const peticion = tx.objectStore(TIENDA).get(CLAVE)
    peticion.onsuccess = () => resolve((peticion.result as CacheLocal) ?? null)
    peticion.onerror = () => reject(peticion.error)
  })
}

export async function guardarCache(cache: CacheLocal): Promise<void> {
  if (typeof indexedDB === "undefined") return
  const db = await abrir()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(TIENDA, "readwrite")
    tx.objectStore(TIENDA).put(cache, CLAVE)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function borrarCache(): Promise<void> {
  if (typeof indexedDB === "undefined") return
  const db = await abrir()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(TIENDA, "readwrite")
    tx.objectStore(TIENDA).delete(CLAVE)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
