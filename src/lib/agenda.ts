import { mesDe, type CanalId, type EstadoId, type Ficha, type Hueco, type IslaId, type SectorId } from "@/lib/dominio"

/** Una entrada del calendario editorial: un hueco del plan o una ficha con fecha (programada o publicada). */
export type EntradaAgenda = {
  clave: string
  fecha: string
  titulo: string
  canales: CanalId[]
  isla: IslaId | null
  sector: SectorId | null
  estado: EstadoId | "planificado"
  hueco: Hueco | null
  ficha: Ficha | null
  ejemplo: boolean
}

export function construirAgenda(calendario: Hueco[], fichas: Ficha[]): EntradaAgenda[] {
  const porId = new Map(fichas.map((ficha) => [ficha.id, ficha]))
  const vinculadas = new Set(calendario.map((hueco) => hueco.fichaId).filter((id): id is string => Boolean(id)))
  const desdeHuecos: EntradaAgenda[] = calendario.map((hueco) => {
    const ficha = hueco.fichaId ? (porId.get(hueco.fichaId) ?? null) : null
    return {
      clave: `h-${hueco.id}`,
      fecha: hueco.fecha,
      titulo: hueco.titulo,
      canales: ficha?.canales.length ? ficha.canales : hueco.canales,
      isla: ficha?.isla ?? hueco.isla ?? null,
      sector: ficha?.sector ?? hueco.sector ?? null,
      estado: ficha?.estado ?? "planificado",
      hueco,
      ficha,
      ejemplo: hueco.ejemplo || Boolean(ficha?.ejemplo),
    }
  })
  const desdeFichas: EntradaAgenda[] = fichas
    .filter((ficha) => !vinculadas.has(ficha.id))
    .map((ficha): EntradaAgenda | null => {
      const fecha = ficha.estado === "publicada" && ficha.publicadoEn ? ficha.publicadoEn.slice(0, 10) : ficha.programadoPara
      if (!fecha) return null
      return {
        clave: `f-${ficha.id}`,
        fecha,
        titulo: ficha.titulo,
        canales: ficha.canales,
        isla: ficha.isla,
        sector: ficha.sector,
        estado: ficha.estado,
        hueco: null,
        ficha,
        ejemplo: ficha.ejemplo,
      }
    })
    .filter((item): item is EntradaAgenda => item !== null)
  return [...desdeHuecos, ...desdeFichas].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.titulo.localeCompare(b.titulo))
}

export function lunesDe(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number)
  const fecha = new Date(ano, mes - 1, dia)
  const desfase = (fecha.getDay() + 6) % 7
  fecha.setDate(fecha.getDate() - desfase)
  return isoDe(fecha)
}

export function sumarDias(iso: string, dias: number): string {
  const [ano, mes, dia] = iso.split("-").map(Number)
  return isoDe(new Date(ano, mes - 1, dia + dias))
}

function isoDe(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`
}

export function diasDeSemana(lunes: string): string[] {
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
}

export function entradasDelMes(agenda: EntradaAgenda[], mes: string): EntradaAgenda[] {
  return agenda.filter((entrada) => mesDe(entrada.fecha) === mes)
}
