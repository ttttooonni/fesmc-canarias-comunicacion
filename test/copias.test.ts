import { mesaVacia, type MesaLocal } from "@/lib/almacen"
import { construirCopia, fusionarCopia, resumirImportacion, validarCopia } from "@/lib/copias"
import { cargarDemostracion, contarDemostracion, quitarDemostracion } from "@/lib/demostracion"
import type { Ficha, UsuarioPublico } from "@/lib/dominio"
import { construirFicha } from "@/lib/fichas"
import { describe, expect, it } from "vitest"

const gestor: UsuarioPublico = { id: "g", nombre: "Iago", email: "", rol: "gestor", isla: null, sector: null, ejemplo: false }

function ficha(id: string, extra: Partial<Ficha> = {}): Ficha {
  const creada = construirFicha({
    id,
    usuario: gestor,
    ahora: "2026-11-20T10:00:00.000Z",
    datos: {
      titulo: "Ficha real del equipo regional",
      queOcurrio: "Un hecho contado con suficiente detalle para pasar la validación de la ficha breve.",
      isla: "tenerife",
      cuando: "2026-11-20",
      sector: "comercio",
      fuentes: "Sección sindical",
      materialAutorizado: true,
      descripcionMaterial: "Sin fotos de personas",
      contactoNombre: "Equipo",
      contactoMedio: "Canal interno",
      sensible: false,
      motivoSensible: "",
      pilar: "derechos",
      canales: ["instagram"],
    },
  })
  if (!creada.ok) throw new Error("ficha no válida")
  return { ...creada.ficha, ...extra }
}

function mesaCon(fichas: Ficha[]): MesaLocal {
  return { ...mesaVacia(), fichas }
}

describe("validación de copias", () => {
  it("rechaza con mensajes claros lo que no es una copia", () => {
    expect(validarCopia("")).toEqual({ ok: false, error: "El archivo está vacío." })
    expect(validarCopia("{no json").ok).toBe(false)
    const otro = validarCopia(JSON.stringify({ tipo: "otra-app", fichas: [] }))
    expect(otro.ok).toBe(false)
    if (!otro.ok) expect(otro.error).toContain("no es una copia")
    const futura = validarCopia(JSON.stringify({ tipo: "ugt-fesmc-copia", version: 99, fichas: [] }))
    expect(futura.ok).toBe(false)
    if (!futura.ok) expect(futura.error).toContain("más nueva")
  })

  it("acepta copias antiguas v2 (sin biblioteca) y descarta elementos dañados", () => {
    const v2 = { tipo: "ugt-fesmc-copia", version: 2, fichas: [ficha("a"), { id: 5 }, { id: "x", titulo: "sin estado" }], calendario: [], metricas: [] }
    const resultado = validarCopia(JSON.stringify(v2))
    expect(resultado.ok).toBe(true)
    if (!resultado.ok) return
    expect(resultado.copia.fichas).toHaveLength(1)
    expect(resultado.copia.biblioteca).toEqual([])
    expect(resultado.descartadas.fichas).toBe(2)
    expect(resultado.avisos.join(" ")).toContain("versión anterior")
  })

  it("ida y vuelta: exportar e importar deja los mismos datos", () => {
    const mesa = cargarDemostracion(mesaCon([ficha("real-1")]), "Iago")
    const texto = JSON.stringify(construirCopia(mesa))
    const validacion = validarCopia(texto)
    expect(validacion.ok).toBe(true)
    if (!validacion.ok) return
    const destino = fusionarCopia(mesaVacia(), validacion.copia)
    expect(destino.fichas.map((f) => f.id).sort()).toEqual(mesa.fichas.map((f) => f.id).sort())
    expect(destino.biblioteca).toHaveLength(mesa.biblioteca.length)
    expect(destino.episodiosSerie).toHaveLength(mesa.episodiosSerie.length)
  })
})

describe("fusión de copias", () => {
  it("nunca borra lo local y une el historial", () => {
    const local = ficha("comun", { actualizadoEn: "2026-11-20T10:00:00.000Z" })
    const soloLocal = ficha("solo-local")
    const entrante: Ficha = {
      ...local,
      estado: "propuesta",
      actualizadoEn: "2026-11-21T10:00:00.000Z",
      historial: [...local.historial, { id: "paso-remoto", estado: "propuesta", porId: "x", porNombre: "Otra", en: "2026-11-21T10:00:00.000Z" }],
    }
    const validacion = validarCopia(JSON.stringify({ tipo: "ugt-fesmc-copia", version: 3, fichas: [entrante] }))
    if (!validacion.ok) throw new Error("copia")
    const mesa = mesaCon([local, soloLocal])
    const resumen = resumirImportacion(mesa, validacion)
    expect(resumen.colecciones.fichas.actualizadas).toBe(1)
    const fusion = fusionarCopia(mesa, validacion.copia)
    expect(fusion.fichas).toHaveLength(2)
    const comun = fusion.fichas.find((f) => f.id === "comun")!
    expect(comun.estado).toBe("propuesta")
    expect(comun.historial.map((p) => p.id)).toContain("paso-remoto")
  })

  it("una copia más antigua no pisa una ficha local más reciente", () => {
    const local = ficha("f", { estado: "aprobada", actualizadoEn: "2026-11-25T10:00:00.000Z" })
    const vieja = { ...local, estado: "borrador", actualizadoEn: "2026-11-01T10:00:00.000Z" }
    const validacion = validarCopia(JSON.stringify({ tipo: "ugt-fesmc-copia", version: 3, fichas: [vieja] }))
    if (!validacion.ok) throw new Error("copia")
    expect(fusionarCopia(mesaCon([local]), validacion.copia).fichas[0].estado).toBe("aprobada")
  })
})

describe("datos de DEMOSTRACIÓN", () => {
  it("son opcionales, van marcados y no pisan datos con el mismo id", () => {
    const propia = ficha("ejemplo-publicada-fv", { titulo: "Mi ficha con un id que coincide" })
    const mesa = cargarDemostracion(mesaCon([propia]), "Iago")
    expect(mesa.fichas.find((f) => f.id === "ejemplo-publicada-fv")?.titulo).toBe("Mi ficha con un id que coincide")
    const demo = mesa.fichas.filter((f) => f.id !== "ejemplo-publicada-fv")
    expect(demo.length).toBeGreaterThanOrEqual(6)
    expect(demo.every((f) => f.ejemplo)).toBe(true)
    expect(mesa.calendario.every((h) => h.ejemplo)).toBe(true)
    expect(mesa.biblioteca.every((r) => r.ejemplo)).toBe(true)
    expect(mesa.episodiosSerie.every((e) => e.ejemplo)).toBe(true)
    // No se inventan estadísticas de redes.
    expect(mesa.metricas).toEqual([])
    const estados = new Set(cargarDemostracion(mesaVacia(), null).fichas.map((f) => f.estado))
    for (const estado of ["borrador", "propuesta", "en_revision", "revision_legal", "aprobada", "cambios", "publicada"]) {
      expect(estados.has(estado as Ficha["estado"])).toBe(true)
    }
  })

  it("quitar la demostración solo quita lo marcado", () => {
    const real = ficha("real")
    const conDemo = cargarDemostracion(mesaCon([real]), "Iago")
    const recurso = { ...conDemo.biblioteca[0], id: "propio", ejemplo: false }
    const mezcla = { ...conDemo, biblioteca: [...conDemo.biblioteca, recurso], calendario: [...conDemo.calendario, { ...conDemo.calendario[0], id: "hueco-propio", ejemplo: false, fichaId: "ejemplo-legal-tf" }] }
    const { mesa, quitados } = quitarDemostracion(mezcla, "Iago")
    expect(quitados).toBe(contarDemostracion(mezcla))
    expect(mesa.fichas.map((f) => f.id)).toEqual(["real"])
    expect(mesa.biblioteca.map((r) => r.id)).toEqual(["propio"])
    expect(mesa.calendario).toHaveLength(1)
    expect(mesa.calendario[0].fichaId).toBeNull()
    expect(mesa.personajesSerie.map((p) => p.id)).toEqual(expect.arrayContaining(["sindi", "cato"]))
    expect(mesa.registroCopias[0].tipo).toBe("demo-quitada")
  })
})
