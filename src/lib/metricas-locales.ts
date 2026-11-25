import { CANALES, ESTADOS, ISLAS, ISLA_FEDERACION, SECTORES, mesDe, type CanalId, type EstadoId, type Ficha, type Hueco } from "@/lib/dominio"
import { ESTADOS_PRODUCCION, type EpisodioSerie, type EstadoProduccionId, type PublicacionSerie } from "@/lib/sindi-cato"

export type Barra = { id: string; nombre: string; valor: number }

export type MetricasLocales = {
  mes: string
  previstas: number
  realizadas: number
  pendientesDelMes: number
  cumplimiento: number | null
  porSector: Barra[]
  porIsla: Barra[]
  porCanal: Barra[]
  porEstado: Barra[]
  produccionSerie: Barra[]
  publicacionesSerie: number
  totalFichas: number
  demo: number
  actividad: Barra[]
}

/** Fecha en la que una ficha se considera «prevista»: la programada; si no hay, la del hecho. */
export function fechaPrevista(ficha: Ficha): string {
  return ficha.programadoPara ?? ficha.cuando
}

/**
 * Métricas calculadas solo con los datos guardados en este dispositivo.
 * No hay alcance, seguidores ni interacciones: eso no se inventa.
 */
export function calcularMetricasLocales(input: {
  mes: string
  fichas: Ficha[]
  calendario: Hueco[]
  episodios: EpisodioSerie[]
  publicacionesSerie: PublicacionSerie[]
}): MetricasLocales {
  const { mes, fichas, calendario, episodios } = input
  const huecosMes = calendario.filter((hueco) => mesDe(hueco.fecha) === mes)
  const fichasEnHuecos = new Set(huecosMes.map((hueco) => hueco.fichaId).filter(Boolean))
  const programadasSinHueco = fichas.filter(
    (ficha) => ficha.programadoPara && mesDe(ficha.programadoPara) === mes && !fichasEnHuecos.has(ficha.id),
  )
  const previstas = huecosMes.length + programadasSinHueco.length
  const publicadasMes = fichas.filter((ficha) => ficha.estado === "publicada" && ficha.publicadoEn && mesDe(ficha.publicadoEn) === mes)
  const realizadas = publicadasMes.length
  // Contenidos del mes: fichas creadas, previstas o publicadas en ese mes (sin duplicar).
  const delMes = fichas.filter(
    (ficha) =>
      mesDe(ficha.creadoEn) === mes ||
      mesDe(fechaPrevista(ficha)) === mes ||
      (ficha.publicadoEn ? mesDe(ficha.publicadoEn) === mes : false),
  )
  const pendientesDelMes = delMes.filter((ficha) => ficha.estado !== "publicada").length

  const contar = <T extends string>(ids: readonly { id: T; nombre: string }[], valor: (id: T) => number): Barra[] =>
    ids.map((item) => ({ id: item.id, nombre: item.nombre, valor: valor(item.id) }))

  const porSector = contar(SECTORES, (id) => delMes.filter((ficha) => ficha.sector === id).length)
  const porIsla = contar([...ISLAS, ISLA_FEDERACION], (id) => delMes.filter((ficha) => ficha.isla === id).length)
  const canalesFicha = (ficha: Ficha) => ficha.canales
  const porCanal = contar(CANALES, (id: CanalId) =>
    delMes.filter((ficha) => canalesFicha(ficha).includes(id)).length +
    huecosMes.filter((hueco) => !hueco.fichaId && hueco.canales.includes(id)).length,
  )
  const porEstado = contar(ESTADOS, (id: EstadoId) => fichas.filter((ficha) => ficha.estado === id).length)
  const produccionSerie = contar(ESTADOS_PRODUCCION, (id: EstadoProduccionId) => episodios.filter((ep) => ep.estado === id).length)
  const publicacionesSerie = input.publicacionesSerie.filter((pub) => pub.fecha && mesDe(pub.fecha) === mes).length

  // Actividad de producción: pasos del circuito registrados en el mes, por tipo de paso.
  const actividad = contar(ESTADOS, (id: EstadoId) =>
    fichas.reduce((total, ficha) => total + ficha.historial.filter((paso) => paso.estado === id && mesDe(paso.en) === mes).length, 0),
  )

  return {
    mes,
    previstas,
    realizadas,
    pendientesDelMes,
    cumplimiento: previstas > 0 ? Math.round((realizadas / previstas) * 100) : null,
    porSector,
    porIsla,
    porCanal,
    porEstado,
    produccionSerie,
    publicacionesSerie,
    totalFichas: fichas.length,
    demo: fichas.filter((ficha) => ficha.ejemplo).length,
    actividad,
  }
}

/** Últimos movimientos del circuito, de todas las fichas, para el panel de actividad de Inicio. */
export function actividadReciente(fichas: Ficha[], limite = 6) {
  return fichas
    .flatMap((ficha) => ficha.historial.map((paso) => ({ ...paso, fichaId: ficha.id, titulo: ficha.titulo, ejemplo: ficha.ejemplo })))
    .sort((a, b) => b.en.localeCompare(a.en))
    .slice(0, limite)
}
