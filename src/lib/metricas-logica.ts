import { cifrasVacias, type CanalId, type CifrasCanal, type MetricaMes, type UsuarioPublico } from "@/lib/dominio"

const CANALES: CanalId[] = ["instagram", "facebook", "tiktok"]

function leerNumero(valor: unknown, permitirNegativo: boolean): number | null | "mal" {
  if (valor === null || valor === undefined || valor === "") return null
  const numero = typeof valor === "number" ? valor : Number(valor)
  if (!Number.isFinite(numero)) return "mal"
  if (!permitirNegativo && numero < 0) return "mal"
  return Math.round(numero)
}

function leerCanal(valor: unknown): { ok: true; cifras: CifrasCanal } | { ok: false; error: string } {
  const bruto = (valor && typeof valor === "object" ? valor : {}) as Record<string, unknown>
  const publicaciones = leerNumero(bruto.publicaciones, false)
  const alcance = leerNumero(bruto.alcance, false)
  const interacciones = leerNumero(bruto.interacciones, false)
  const seguidores = leerNumero(bruto.seguidores, false)
  const variacionSeguidores = leerNumero(bruto.variacionSeguidores, true)
  if (
    publicaciones === "mal" ||
    alcance === "mal" ||
    interacciones === "mal" ||
    seguidores === "mal" ||
    variacionSeguidores === "mal"
  ) {
    return { ok: false, error: "Las cifras tienen que ser números. La variación de seguidores puede ser negativa." }
  }
  return {
    ok: true,
    cifras: {
      publicaciones,
      alcance,
      interacciones,
      seguidores,
      variacionSeguidores,
    },
  }
}

export function construirMetrica(input: {
  mes: string
  entrada: unknown
  usuario: UsuarioPublico
  ahora: string
}): { ok: true; metrica: MetricaMes } | { ok: false; error: string } {
  if (!/^\d{4}-\d{2}$/.test(input.mes)) return { ok: false, error: "El mes no es válido." }
  const bruto = (input.entrada && typeof input.entrada === "object" ? input.entrada : {}) as Record<string, unknown>
  const canalesBrutos = (bruto.canales && typeof bruto.canales === "object" ? bruto.canales : {}) as Record<string, unknown>
  const canales = {
    instagram: cifrasVacias(),
    facebook: cifrasVacias(),
    tiktok: cifrasVacias(),
  }
  for (const canal of CANALES) {
    const leido = leerCanal(canalesBrutos[canal])
    if (!leido.ok) return leido
    canales[canal] = leido.cifras
  }
  const notas = typeof bruto.notas === "string" ? bruto.notas.trim() : ""
  if (notas.length > 4000) return { ok: false, error: "Las notas del mes son demasiado largas." }
  const incidencias = leerNumero(bruto.incidenciasSeguridad, false)
  if (incidencias === "mal") return { ok: false, error: "Las incidencias de seguridad tienen que ser un número." }
  return {
    ok: true,
    metrica: {
      mes: input.mes,
      canales,
      notas,
      incidenciasSeguridad: incidencias,
      actualizadoPorId: input.usuario.id,
      actualizadoPorNombre: input.usuario.nombre,
      actualizadoEn: input.ahora,
      ejemplo: false,
    },
  }
}
