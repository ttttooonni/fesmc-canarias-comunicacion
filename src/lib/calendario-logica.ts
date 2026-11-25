import { ISLAS, SECTORES, franjaDeFecha, type CanalId, type Hueco, type IslaId, type PilarId, type SectorId } from "@/lib/dominio"
import { canalesDe } from "@/lib/fichas"

export type DatosHueco = {
  fecha: string
  pilar: PilarId
  titulo: string
  angulo: string
  canales: CanalId[]
  fichaId: string | null
  confirmarExcepcional: boolean
  isla: IslaId | null
  sector: SectorId | null
}

const IDS_ISLA = new Set<string>([...ISLAS.map((item) => item.id), "regional"])
const IDS_SECTOR = new Set<string>(SECTORES.map((item) => item.id))

const PILARES = new Set([
  "derechos",
  "actividad",
  "actualidad",
  "participacion",
  "sindi_cato",
  "igualdad",
  "salud",
  "negociacion",
  "servicios",
])

export function leerDatosHueco(entrada: unknown): { ok: true; datos: DatosHueco } | { ok: false; error: string } {
  const bruto = (entrada && typeof entrada === "object" ? entrada : {}) as Record<string, unknown>
  const fecha = typeof bruto.fecha === "string" ? bruto.fecha.trim() : ""
  const pilar = typeof bruto.pilar === "string" ? bruto.pilar.trim() : ""
  const titulo = typeof bruto.titulo === "string" ? bruto.titulo.trim() : ""
  const angulo = typeof bruto.angulo === "string" ? bruto.angulo.trim() : ""
  const fichaId = typeof bruto.fichaId === "string" && bruto.fichaId.trim() ? bruto.fichaId.trim() : null
  const canales = canalesDe(bruto.canales)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { ok: false, error: "Indica la fecha." }
  if (!PILARES.has(pilar)) return { ok: false, error: "Elige el pilar." }
  if (titulo.length < 8) return { ok: false, error: "El hueco necesita un título." }
  if (angulo.length < 8) return { ok: false, error: "Anota el ángulo de la pieza." }
  if (canales.length === 0) return { ok: false, error: "Marca al menos un canal." }
  return {
    ok: true,
    datos: {
      fecha,
      pilar: pilar as PilarId,
      titulo,
      angulo,
      canales,
      fichaId,
      confirmarExcepcional: bruto.confirmarExcepcional === true,
      isla: typeof bruto.isla === "string" && IDS_ISLA.has(bruto.isla) ? (bruto.isla as IslaId) : null,
      sector: typeof bruto.sector === "string" && IDS_SECTOR.has(bruto.sector) ? (bruto.sector as SectorId) : null,
    },
  }
}

export function construirHueco(input: {
  id: string
  datos: DatosHueco
  ejemplo?: boolean
}): { ok: true; hueco: Hueco } | { ok: false; error: string } {
  const franja = franjaDeFecha(input.datos.fecha)
  if (!franja && !input.datos.confirmarExcepcional) {
    return {
      ok: false,
      error: "El plan reserva lunes, miércoles y viernes. Si es una pieza urgente de otro día, confírmalo.",
    }
  }
  return {
    ok: true,
    hueco: {
      id: input.id,
      fecha: input.datos.fecha,
      franja: franja ?? "fuera_de_ritmo",
      pilar: input.datos.pilar,
      titulo: input.datos.titulo,
      angulo: input.datos.angulo,
      canales: input.datos.canales,
      fichaId: input.datos.fichaId,
      excepcional: !franja,
      isla: input.datos.isla ?? null,
      sector: input.datos.sector ?? null,
      ejemplo: input.ejemplo ?? false,
    },
  }
}
