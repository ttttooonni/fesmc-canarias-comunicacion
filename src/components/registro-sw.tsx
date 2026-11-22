"use client"

import { useEffect } from "react"

const CACHE = "ugt-com-v3"
const PRECACHE = [
  "/",
  "/guia",
  "/guia/seguridad",
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
]

export function RegistroSw() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return
    let cancelado = false
    async function activar() {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
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
