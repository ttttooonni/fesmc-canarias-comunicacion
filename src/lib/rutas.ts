export function hrefFicha(id: string): string {
  return `/fichas/ver?id=${encodeURIComponent(id)}`
}

/** Prefijo de GitHub Pages u otro basePath; vacío en local y en Vercel en la raíz. */
export function rutaPublica(ruta: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ""
  const limpia = ruta.startsWith("/") ? ruta : `/${ruta}`
  return `${base}${limpia}`
}

export const RUTA_RETRATO_SINDI_CATO = "/imagenes/sindi-y-cato.webp"
export const RUTA_RETRATO_SINDI_CATO_JPG = "/imagenes/sindi-y-cato.jpg"
