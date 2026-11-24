import {
  checklistCompleto,
  CHECKLIST_VACIO,
  codificarPaqueteEpisodio,
  decodificarPaqueteEpisodio,
  empaquetarEpisodio,
  episodioDeEjemplo,
  episodioDesdePaquete,
  fusionarEpisodio,
  leerEpisodio,
  leerPersonaje,
  personajesOficiales,
  reponerPersonajesOficiales,
} from "@/lib/sindi-cato"
import { describe, expect, it } from "vitest"

describe("Sindi y Cato", () => {
  it("prellena las fichas oficiales de Sindi y Cato", () => {
    const [sindi, cato] = personajesOficiales()
    expect(sindi.id).toBe("sindi")
    expect(sindi.nombre).toBe("Sindi")
    expect(sindi.personalidad).toContain("Cercana, inteligente y firme")
    expect(cato.id).toBe("cato")
    expect(cato.descripcion).toContain("hostelería")
    expect(sindi.ejemplo).toBe(false)
  })

  it("reponer no pisa una ficha ya editada", () => {
    const oficiales = personajesOficiales()
    const editada = { ...oficiales[0], personalidad: "Versión editada en este dispositivo.", actualizadoEn: "2026-11-24T20:00:00.000Z" }
    const lista = reponerPersonajesOficiales([editada])
    expect(lista.find((item) => item.id === "sindi")?.personalidad).toBe("Versión editada en este dispositivo.")
    expect(lista.find((item) => item.id === "cato")?.nombre).toBe("Cato")
  })

  it("el episodio de ejemplo va marcado como ejemplo", () => {
    const episodio = episodioDeEjemplo()
    expect(episodio.ejemplo).toBe(true)
    expect(episodio.titulo).toContain("turno por mensaje")
    expect(episodio.sector).toBe("hosteleria")
  })

  it("rechaza un episodio sin título o sector", () => {
    expect(leerEpisodio({ titulo: "", sector: "hosteleria" }, "x").ok).toBe(false)
    expect(leerEpisodio({ titulo: "Uno", sector: "inventado" }, "x").ok).toBe(false)
  })

  it("guarda un personaje con nombre", () => {
    const local = leerPersonaje({ nombre: "Sindi", personalidad: "Firme" }, "sindi")
    expect(local.ok).toBe(true)
    if (local.ok) expect(local.personaje.personalidad).toBe("Firme")
  })

  it("el checklist completo es requisito lógico de aprobación", () => {
    expect(checklistCompleto(CHECKLIST_VACIO)).toBe(false)
    expect(
      checklistCompleto({
        datosVerificados: true,
        identidadProtegida: true,
        hechosVsRecreacion: true,
        revisionLegal: true,
      }),
    ).toBe(true)
  })

  it("empaqueta y recupera un episodio por el enlace de WhatsApp", () => {
    const original = episodioDeEjemplo()
    const paquete = empaquetarEpisodio(original, "Nuria Campos")
    const texto = JSON.stringify(paquete)
    // Round-trip via the same encoder used in the link
    const dato = codificarPaqueteEpisodio(paquete)
    const leido = decodificarPaqueteEpisodio(dato)
    expect(leido).not.toBeNull()
    expect(leido?.titulo).toBe(original.titulo)
    expect(leido?.tipo).toBe("sindi-episodio")
    const recuperado = episodioDesdePaquete(leido!)
    const fusion = fusionarEpisodio(undefined, recuperado)
    expect(fusion.nuevo).toBe(true)
    expect(fusion.episodio.id).toBe(original.id)
    expect(texto.length).toBeGreaterThan(100)
  })
})
