import type { Ficha, UsuarioPublico } from "@/lib/dominio"
import { aplicarTransicion, construirFicha } from "@/lib/fichas"
import { codificarPaquete, decodificarPaquete, empaquetar, fichaDesdePaquete, fusionarFicha, mensajeWhatsapp } from "@/lib/whatsapp"
import { describe, expect, it } from "vitest"

const insular: UsuarioPublico = { id: "i", nombre: "Yaiza", email: "", rol: "insular", isla: "lanzarote", sector: null, ejemplo: false }
const gestor: UsuarioPublico = { ...insular, id: "g", nombre: "Iago", rol: "gestor", isla: null }

function base(): Ficha {
  const r = construirFicha({
    id: "f1",
    usuario: insular,
    ahora: "2026-11-25T08:00:00.000Z",
    datos: {
      titulo: "Noticia ficticia para la demostración",
      queOcurrio: "Texto suficientemente largo para que la ficha breve pase la validación sin problemas.",
      isla: "lanzarote",
      cuando: "2026-11-25",
      sector: "hosteleria",
      fuentes: "Ficticia",
      materialAutorizado: true,
      descripcionMaterial: "Sin fotos de personas",
      referenciaMaterial: "Carpeta › cartel.png",
      contactoNombre: "Equipo",
      contactoMedio: "Canal interno",
      sensible: false,
      motivoSensible: "",
      pilar: "derechos",
      canales: ["instagram"],
      demostracion: true,
    },
  })
  if (!r.ok) throw new Error("ficha")
  return r.ficha
}

describe("enlaces de WhatsApp", () => {
  it("un enlace antiguo (sin campos nuevos) se sigue importando", () => {
    const antiguo = {
      v: 1, id: "viejo", titulo: "Ficha de un enlace antiguo", queOcurrio: "Texto", isla: "tenerife", cuando: "2026-11-01",
      sector: "comercio", fuentes: "", materialAutorizado: true, descripcionMaterial: "", contactoNombre: "", contactoMedio: "",
      sensible: false, motivoSensible: "", pilar: "derechos", canales: ["instagram"], estado: "propuesta",
      actualizadoEn: "2026-11-01T10:00:00.000Z", creadoPorNombre: "Ana", ejemplo: false,
    }
    const dato = Buffer.from(JSON.stringify(antiguo)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
    const paquete = decodificarPaquete(dato)
    expect(paquete?.id).toBe("viejo")
    const ficha = fusionarFicha(undefined, fichaDesdePaquete(paquete!)).ficha
    expect(ficha.textoPublicacion).toContain("Ficha de un enlace antiguo")
    expect(ficha.referenciaMaterial).toBe("")
  })

  it("la ficha de DEMOSTRACIÓN viaja marcada y con su referencia de material", () => {
    const ficha = base()
    expect(ficha.ejemplo).toBe(true)
    const paquete = decodificarPaquete(codificarPaquete(empaquetar(ficha)))!
    expect(paquete.ejemplo).toBe(true)
    expect(paquete.rm).toBe("Carpeta › cartel.png")
    expect(mensajeWhatsapp(ficha, "https://x/")).toContain("DEMOSTRACIÓN")
  })

  it("el recorrido completo entre dos dispositivos conserva historial y texto", () => {
    const original = base()
    const enviada = aplicarTransicion({ ficha: original, destino: "propuesta", eventoId: "e1", usuario: insular, ahora: "2026-11-25T08:05:00.000Z" })
    if (!enviada.ok) throw new Error(enviada.error)
    // Dispositivo B recibe la propuesta
    const enB = fusionarFicha(undefined, fichaDesdePaquete(decodificarPaquete(codificarPaquete(empaquetar(enviada.ficha)))!)).ficha
    const revisada = aplicarTransicion({ ficha: enB, destino: "en_revision", eventoId: "e2", usuario: gestor, ahora: "2026-11-25T08:10:00.000Z" })
    if (!revisada.ok) throw new Error(revisada.error)
    // Vuelve a A
    const enA = fusionarFicha(enviada.ficha, fichaDesdePaquete(decodificarPaquete(codificarPaquete(empaquetar(revisada.ficha)))!)).ficha
    expect(enA.estado).toBe("en_revision")
    expect(enA.textoPublicacion).toBe(original.textoPublicacion)
    expect(enA.historial.length).toBeGreaterThanOrEqual(3)
    // Una segunda importación de otro paso no borra la anterior
    const enA2 = fusionarFicha(enA, { ...fichaDesdePaquete(decodificarPaquete(codificarPaquete(empaquetar({ ...revisada.ficha, estado: "revision_legal", actualizadoEn: "2026-11-25T08:20:00.000Z" })))!) }).ficha
    const importados = enA2.historial.filter((p) => p.id.includes("-import-"))
    expect(importados.length).toBe(2)
  })
})
