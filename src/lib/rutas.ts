export function hrefFicha(id: string): string {
  return `/fichas/ver?id=${encodeURIComponent(id)}`
}
