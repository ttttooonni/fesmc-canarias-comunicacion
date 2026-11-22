import { accionesDisponibles } from "@/lib/circuito"
import { huecosDelMes } from "@/lib/cobertura"
import type { Ficha, UsuarioPublico } from "@/lib/dominio"
import { aplicarTransicion, construirFicha } from "@/lib/fichas"
import { describe, expect, it } from "vitest"

const gestor: UsuarioPublico = {
  id: "gestor",
  nombre: "Iago Martín",
  email: "gestion@demo.ugt-fesmc.local",
  rol: "gestor",
  isla: null,
  sector: null,
  ejemplo: true,
}

const coordinacion: UsuarioPublico = { ...gestor, id: "coord", rol: "coordinacion", nombre: "Nuria Campos" }
const juridico: UsuarioPublico = { ...gestor, id: "jur", rol: "juridico", nombre: "Héctor Déniz" }
const insular: UsuarioPublico = { ...gestor, id: "isla", rol: "insular", isla: "lanzarote", nombre: "Yaiza León" }

function datosValidos(extra: Record<string, unknown> = {}) {
  return {
    titulo: "Turno cambiado sin constancia",
    queOcurrio: "En un centro de ejemplo cambian el turno la noche anterior y no queda nada por escrito para la plantilla.",
    isla: "lanzarote",
    cuando: "2026-12-11",
    sector: "hosteleria",
    fuentes: "Ficha interna de ejemplo, sin expediente.",
    materialAutorizado: true,
    descripcionMaterial: "Sin fotos de personas. Solo gráfica de la federación.",
    contactoNombre: "Yaiza León (ejemplo)",
    contactoMedio: "Canal interno del equipo",
    sensible: false,
    motivoSensible: "",
    pilar: "derechos",
    canales: ["instagram"],
    ...extra,
  }
}

function fichaDe(extra: Record<string, unknown> = {}) {
  const creada = construirFicha({
    id: "ficha-test-0001",
    datos: datosValidos(extra),
    usuario: insular,
    ahora: "2026-11-22T10:00:00.000Z",
  })
  if (!creada.ok) throw new Error(creada.error)
  return creada.ficha
}

describe("circuito", () => {
  it("un perfil insular no mueve estados", () => {
    expect(accionesDisponibles(fichaDe(), "insular")).toEqual([])
  })

  it("no pasa a redacción sin material autorizado", () => {
    const ficha = { ...fichaDe(), estado: "comprobado" as const, materialAutorizado: false }
    const accion = accionesDisponibles(ficha, "gestor").find((item) => item.destino === "redaccion")
    expect(accion?.bloqueo).toBeTruthy()
    const resultado = aplicarTransicion({
      ficha,
      destino: "redaccion",
      eventoId: "evt-test-bloqueo",
      usuario: gestor,
      ahora: "2026-11-22T11:00:00.000Z",
    })
    expect(resultado.ok).toBe(false)
  })

  it("lo sensible no se programa sin supervisión", () => {
    const ficha: Ficha = { ...fichaDe({ sensible: true, motivoSensible: "Conflicto abierto en un centro pequeño." }), estado: "revision" }
    const destinos = accionesDisponibles(ficha, "juridico").map((item) => item.destino)
    expect(destinos).toContain("pendiente_autorizacion")
    expect(destinos).not.toContain("programado")
    const salto = aplicarTransicion({
      ficha,
      destino: "programado",
      eventoId: "evt-test-salto",
      usuario: coordinacion,
      ahora: "2026-11-22T12:00:00.000Z",
      programadoPara: "2026-12-11",
    })
    expect(salto.ok).toBe(false)
    const elevado = aplicarTransicion({
      ficha,
      destino: "pendiente_autorizacion",
      eventoId: "evt-test-eleva",
      usuario: juridico,
      ahora: "2026-11-22T12:00:00.000Z",
    })
    expect(elevado.ok).toBe(true)
    if (!elevado.ok) return
    const gestorNoAutoriza = aplicarTransicion({
      ficha: elevado.ficha,
      destino: "programado",
      eventoId: "evt-test-gestor",
      usuario: gestor,
      ahora: "2026-11-22T13:00:00.000Z",
      programadoPara: "2026-12-11",
    })
    expect(gestorNoAutoriza.ok).toBe(false)
    const autoriza = aplicarTransicion({
      ficha: elevado.ficha,
      destino: "programado",
      eventoId: "evt-test-autoriza",
      usuario: coordinacion,
      ahora: "2026-11-22T13:00:00.000Z",
      programadoPara: "2026-12-11",
    })
    expect(autoriza.ok).toBe(true)
  })

  it("la isla de una responsable insular no se puede cambiar en la ficha", () => {
    const creada = construirFicha({
      id: "ficha-test-0002",
      datos: datosValidos({ isla: "tenerife" }),
      usuario: insular,
      ahora: "2026-11-22T10:00:00.000Z",
    })
    expect(creada.ok && creada.ficha.isla).toBe("lanzarote")
  })
})

describe("presencia", () => {
  it("avisa del hueco y mantiene el orden geográfico", () => {
    const fichas = [fichaDe(), { ...fichaDe(), id: "otra", isla: "tenerife" as const, sector: "comercio" as const }]
    const huecos = huecosDelMes(fichas, "2026-11")
    expect(huecos.islas).not.toContain("lanzarote")
    expect(huecos.islas).not.toContain("tenerife")
    expect(huecos.islas).toContain("el_hierro")
    expect(huecos.islas.indexOf("fuerteventura")).toBeLessThan(huecos.islas.indexOf("el_hierro"))
    expect(huecos.texto).toMatch(/hueco de presencia/i)
  })
})
