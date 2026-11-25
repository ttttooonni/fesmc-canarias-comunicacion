const CACHE = "ugt-com-v8"

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      const scope = self.registration.scope
      const recursos = new Set()
      const rutas = [
        "",
        "guia/",
        "guia/seguridad/",
        "sindi-cato/",
        "fichas/",
        "calendario/",
        "circuito/",
        "registro/",
        "metricas/",
        "biblioteca/",
        "copias/",
        "fichas/nueva/",
        "fichas/ver/",
        "offline.html",
        "manifest.webmanifest",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-maskable-512.png",
        "icons/apple-touch-icon.png",
        "imagenes/sindi-y-cato.webp",
        "imagenes/sindi-y-cato.jpg",
      ]
      await Promise.all(
        rutas.map(async (ruta) => {
          try {
            const url = new URL(ruta, scope)
            const respuesta = await fetch(url, { cache: "reload" })
            if (!respuesta.ok) return
            if ((respuesta.headers.get("content-type") || "").includes("text/html")) {
              const html = await respuesta.clone().text()
              for (const coincidencia of html.matchAll(/["'(]([^"'()\s]*\/_next\/static\/[^"'()\s]+)/g)) {
                recursos.add(new URL(coincidencia[1].replace(/\\/g, ""), url).href)
              }
            }
            await cache.put(url, respuesta)
          } catch {
            // Una ruta caída no tumba el resto.
          }
        }),
      )
      // JS y CSS de todas las pantallas, para que cada ruta funcione sin conexión aunque no se haya visitado.
      await Promise.all(
        [...recursos].map(async (href) => {
          try {
            if (await cache.match(href)) return
            const respuesta = await fetch(href)
            if (respuesta.ok) await cache.put(href, respuesta)
          } catch {
            // Seguimos con el resto.
          }
        }),
      )
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const claves = await caches.keys()
      await Promise.all(claves.filter((clave) => clave !== CACHE).map((clave) => caches.delete(clave)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener("fetch", (event) => {
  const peticion = event.request
  if (peticion.method !== "GET") return
  const url = new URL(peticion.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.includes("/_next/static/") || url.pathname.includes("/icons/") || url.pathname.includes("/imagenes/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const guardado = await cache.match(peticion)
        if (guardado) return guardado
        const respuesta = await fetch(peticion)
        if (respuesta.ok) await cache.put(peticion, respuesta.clone())
        return respuesta
      }),
    )
    return
  }

  const esNavegacion = peticion.mode === "navigate" || (peticion.headers.get("accept") || "").includes("text/html")
  if (!esNavegacion) return

  event.respondWith(
    fetch(peticion)
      .then((respuesta) => {
        const copia = respuesta.clone()
        caches.open(CACHE).then((cache) => cache.put(peticion, copia))
        return respuesta
      })
      .catch(async () => {
        const cache = await caches.open(CACHE)
        const scope = self.registration.scope
        return (
          (await cache.match(peticion)) ||
          (await cache.match(new URL("offline.html", scope))) ||
          (await cache.match(new URL("", scope)))
        )
      }),
  )
})
