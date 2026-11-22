import { franjaDeFecha, type CanalId, type Hueco, type PilarId } from "@/lib/dominio"
import { canalesDe } from "@/lib/fichas"

export type DatosHueco = {
  fecha: string
  pilar: PilarId
  titulo: string
  angulo: string
  canales: CanalId[]
  fichaId: string | null
  confirmarExcepcional: boolean
}

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
      ejemplo: input.ejemplo ?? false,
    },
  }
}
