"use client"

import { useEffect } from "react"

const CACHE = "ugt-com-v6"
const base = process.env.NEXT_PUBLIC_BASE_PATH || ""
const PRECACHE = [
  `${base}/`,
  `${base}/guia/`,
  `${base}/guia/seguridad/`,
  `${base}/sindi-cato/`,
  `${base}/offline.html`,
  `${base}/manifest.webmanifest`,
  `${base}/icons/icon-192.png`,
  `${base}/icons/icon-512.png`,
  `${base}/icons/icon-maskable-512.png`,
  `${base}/icons/apple-touch-icon.png`,
  `${base}/imagenes/sindi-y-cato.webp`,
  `${base}/imagenes/sindi-y-cato.jpg`,
]

export function RegistroSw() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return
    let cancelado = false
    async function activar() {
      try {
        await navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/`, updateViaCache: "none" })
        const cache = await caches.open(CACHE)
        if (cancelado) return
        await Promise.all(
          PRECACHE.map(async (url) => {
            const respuesta = await fetch(url).catch(() => null)
            if (respuesta?.ok) await cache.put(url, respuesta)
          }),
        )
        const recursos = performance
          .getEntriesByType("resource")
          .map((entrada) => entrada.name)
          .filter((url) => url.startsWith(location.origin) && !url.includes("/api/"))
        await Promise.all(
          recursos.map(async (url) => {
            const respuesta = await fetch(url).catch(() => null)
            if (respuesta?.ok) await cache.put(url, respuesta)
          }),
        )
      } catch {
        // La app sigue en red si el service worker no entra.
      }
    }
    void activar()
    return () => {
      cancelado = true
    }
  }, [])
  return null
}
