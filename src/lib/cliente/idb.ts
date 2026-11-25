import { ESQUEMA_ACTUAL, migrarMesa, type MesaLocal } from "@/lib/almacen"

export type { MesaLocal } from "@/lib/almacen"

const NOMBRE = "ugt-fesmc-local"
/**
 * Versión de la base IndexedDB.
 * 1 → tienda `kv` con la clave `mesa`.
 * 2 → misma tienda; los datos pasan al esquema 2 y antes se guarda `mesa-respaldo-v1`.
 */
export const VERSION_IDB = 2
const TIENDA = "kv"
const CLAVE = "mesa"
export const CLAVE_RESPALDO_V1 = "mesa-respaldo-v1"
export const CLAVE_ANTES_DE_IMPORTAR = "mesa-antes-de-importar"

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const peticion = indexedDB.open(NOMBRE, VERSION_IDB)
    peticion.onupgradeneeded = (evento) => {
      const db = peticion.result
      if (!db.objectStoreNames.contains(TIENDA)) db.createObjectStore(TIENDA)
      const anterior = evento.oldVersion
      if (anterior >= 1 && anterior < 2) {
        // Migración compatible: se copia la mesa tal cual estaba y luego se completa.
        const tienda = peticion.transaction!.objectStore(TIENDA)
        const lectura = tienda.get(CLAVE)
        lectura.onsuccess = () => {
          const previa = lectura.result
          if (!previa) return
          tienda.put(previa, CLAVE_RESPALDO_V1)
          const migrada = migrarMesa(previa)
          if (migrada) tienda.put(migrada, CLAVE)
        }
      }
    }
    // Si otra pestaña antigua tiene la base abierta, se espera a que se cierre: nunca se escribe a medias.
    peticion.onblocked = () => {
      if (typeof window !== "undefined") window.dispatchEvent(new Event("ugt-idb-bloqueada"))
    }
    peticion.onsuccess = () => {
      const db = peticion.result
      db.onversionchange = () => db.close()
      resolve(db)
    }
    peticion.onerror = () => reject(peticion.error)
  })
}

async function leerClave(clave: string): Promise<unknown> {
  const db = await abrir()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TIENDA, "readonly")
    const peticion = tx.objectStore(TIENDA).get(clave)
    peticion.onsuccess = () => resolve(peticion.result ?? null)
    peticion.onerror = () => reject(peticion.error)
  })
}

async function escribirClave(clave: string, valor: unknown): Promise<void> {
  const db = await abrir()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(TIENDA, "readwrite")
    tx.objectStore(TIENDA).put(valor, clave)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function leerMesa(): Promise<MesaLocal | null> {
  if (typeof indexedDB === "undefined") return null
  return migrarMesa(await leerClave(CLAVE))
}

export async function guardarMesa(mesa: MesaLocal): Promise<void> {
  if (typeof indexedDB === "undefined") return
  const lista = migrarMesa(mesa)
  if (!lista) return
  await escribirClave(CLAVE, { ...lista, esquema: ESQUEMA_ACTUAL, guardadoEn: new Date().toISOString() })
}

/** Instantánea completa antes de importar una copia, para poder deshacer. */
export async function guardarAntesDeImportar(mesa: MesaLocal): Promise<void> {
  if (typeof indexedDB === "undefined") return
  await escribirClave(CLAVE_ANTES_DE_IMPORTAR, { mesa, en: new Date().toISOString() })
}

export async function leerAntesDeImportar(): Promise<{ mesa: MesaLocal; en: string } | null> {
  if (typeof indexedDB === "undefined") return null
  const valor = (await leerClave(CLAVE_ANTES_DE_IMPORTAR)) as { mesa?: unknown; en?: string } | null
  if (!valor?.mesa) return null
  const mesa = migrarMesa(valor.mesa)
  return mesa ? { mesa, en: valor.en ?? "" } : null
}

export async function leerRespaldoV1(): Promise<unknown> {
  if (typeof indexedDB === "undefined") return null
  return leerClave(CLAVE_RESPALDO_V1)
}
