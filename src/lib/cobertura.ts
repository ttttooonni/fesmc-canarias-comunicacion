import {
  ISLAS,
  SECTORES,
  mesDe,
  nombreIsla,
  nombreSector,
  type Ficha,
  type IslaId,
  type SectorId,
} from "@/lib/dominio"

export type HuecosMes = {
  vacio: boolean
  islas: IslaId[]
  sectores: SectorId[]
  texto: string
}

export function huecosDelMes(fichas: Ficha[], mes: string): HuecosMes {
  const delMes = fichas.filter((ficha) => mesDe(ficha.creadoEn) === mes)
  if (delMes.length === 0) {
    return {
      vacio: true,
      islas: [],
      sectores: [],
      texto: "En este mes todavía no hay fichas. Cuando entren, aquí se verá qué islas y sectores faltan, sin ordenarlas por volumen.",
    }
  }

  const islasConPieza = new Set(
    delMes.map((ficha) => ficha.isla).filter((isla) => isla !== "regional"),
  )
  const sectoresConPieza = new Set(delMes.map((ficha) => ficha.sector))
  const islas = ISLAS.filter((isla) => !islasConPieza.has(isla.id)).map((isla) => isla.id)
  const sectores = SECTORES.filter((sector) => !sectoresConPieza.has(sector.id)).map(
    (sector) => sector.id,
  )

  if (islas.length === 0 && sectores.length === 0) {
    return {
      vacio: false,
      islas,
      sectores,
      texto: "Este mes hay al menos una pieza de cada isla y de cada sector de la federación.",
    }
  }

  const partes: string[] = []
  if (islas.length) partes.push(listaNatural(islas.map(nombreIsla)))
  if (sectores.length) partes.push(`los sectores ${listaNatural(sectores.map(nombreSector))}`)
  return {
    vacio: false,
    islas,
    sectores,
    texto: `Este mes no hay piezas de ${partes.join(" ni de ")}. Conviene pedir ficha antes de cerrar el mes. No es un ranking: es un hueco de presencia.`,
  }
}

function listaNatural(nombres: string[]): string {
  if (nombres.length <= 1) return nombres[0] ?? ""
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`
}

export function contarPorIsla(fichas: Ficha[]): Record<string, number> {
  const cuentas: Record<string, number> = {}
  for (const isla of ISLAS) cuentas[isla.id] = 0
  for (const ficha of fichas) {
    if (ficha.isla === "regional") continue
    cuentas[ficha.isla] = (cuentas[ficha.isla] ?? 0) + 1
  }
  return cuentas
}

export function contarPorSector(fichas: Ficha[]): Record<string, number> {
  const cuentas: Record<string, number> = {}
  for (const sector of SECTORES) cuentas[sector.id] = 0
  for (const ficha of fichas) {
    cuentas[ficha.sector] = (cuentas[ficha.sector] ?? 0) + 1
  }
  return cuentas
}
