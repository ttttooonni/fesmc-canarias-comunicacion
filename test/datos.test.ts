import "fake-indexeddb/auto"
import { ESQUEMA_ACTUAL, migrarMesa } from "@/lib/almacen"
import { CLAVE_RESPALDO_V1, guardarMesa, leerMesa, leerRespaldoV1 } from "@/lib/cliente/idb"
import { describe, expect, it } from "vitest"

const fichaV1 = {
  id: "f-1",
  titulo: "Ficha real guardada en la versión 1",
  queOcurrio: "Texto que no se puede perder bajo ningún concepto al actualizar la app.",
  isla: "tenerife",
  cuando: "2026-11-10",
  sector: "comercio",
  fuentes: "Sección",
  materialAutorizado: true,
  descripcionMaterial: "Sin fotos",
  contactoNombre: "Equipo",
  contactoMedio: "Canal interno",
  sensible: false,
  motivoSensible: "",
  pilar: "derechos",
  canales: ["instagram"],
  estado: "aprobada",
  creadoPorId: "u1",
  creadoPorNombre: "Ana",
  creadoEn: "2026-11-10T10:00:00.000Z",
  actualizadoEn: "2026-11-11T10:00:00.000Z",
  historial: [{ id: "h1", estado: "borrador", porId: "u1", porNombre: "Ana", en: "2026-11-10T10:00:00.000Z" }],
  textoPublicacion: "Texto final revisado",
  textoCompartir: "Para islas",
  programadoPara: "2026-12-02",
  publicadoEn: null,
  difundidoEn: null,
  checklist: null,
  compartidos: [],
  ejemplo: false,
}

const mesaV1 = {
  perfil: { id: "u1", nombre: "Ana", email: "", rol: "gestor", isla: null, sector: null, ejemplo: false },
  fichas: [fichaV1],
  calendario: [{ id: "c1", fecha: "2026-12-02", franja: "miercoles_actividad", pilar: "actividad", titulo: "Hueco real", angulo: "Ángulo real", canales: ["instagram"], fichaId: "f-1", excepcional: false, ejemplo: false }],
  metricas: [],
  personajesSerie: [],
  episodiosSerie: [{ id: "e1", titulo: "Episodio real" }],
  documentosSerie: [],
  publicacionesSerie: [],
  tutorialVisto: true,
  guardadoEn: "2026-11-20T10:00:00.000Z",
  campoFuturo: "se conserva",
}

describe("migración del esquema local", () => {
  it("lleva una mesa v1 al esquema 2 sin perder nada", () => {
    const migrada = migrarMesa(structuredClone(mesaV1))!
    expect(migrada.esquema).toBe(ESQUEMA_ACTUAL)
    expect(migrada.fichas).toHaveLength(1)
    expect(migrada.fichas[0].textoPublicacion).toBe("Texto final revisado")
    expect(migrada.fichas[0].historial).toHaveLength(1)
    expect(migrada.fichas[0].referenciaMaterial).toBe("")
    expect(migrada.calendario[0].fichaId).toBe("f-1")
    expect(migrada.calendario[0].isla).toBeNull()
    expect(migrada.episodiosSerie[0].titulo).toBe("Episodio real")
    expect(migrada.biblioteca).toEqual([])
    expect(migrada.perfil?.nombre).toBe("Ana")
    expect(migrada.tutorialVisto).toBe(true)
    expect((migrada as unknown as Record<string, unknown>).campoFuturo).toBe("se conserva")
    expect(migrada.registroCopias.some((item) => item.tipo === "migracion")).toBe(true)
  })

  it("es idempotente: migrar dos veces no duplica ni cambia datos", () => {
    const una = migrarMesa(structuredClone(mesaV1))!
    const dos = migrarMesa(structuredClone(una))!
    expect(dos.fichas).toEqual(una.fichas)
    expect(dos.registroCopias).toHaveLength(una.registroCopias.length)
  })

  it("devuelve null con datos que no son una mesa", () => {
    expect(migrarMesa(null)).toBeNull()
    expect(migrarMesa("texto")).toBeNull()
  })
})

describe("IndexedDB v1 → v2", () => {
  it("migra la base existente, guarda respaldo v1 y conserva los datos", async () => {
    await new Promise<void>((resolve, reject) => {
      const peticion = indexedDB.open("ugt-fesmc-local", 1)
      peticion.onupgradeneeded = () => peticion.result.createObjectStore("kv")
      peticion.onsuccess = () => {
        const db = peticion.result
        const tx = db.transaction("kv", "readwrite")
        tx.objectStore("kv").put(structuredClone(mesaV1), "mesa")
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => reject(tx.error)
      }
      peticion.onerror = () => reject(peticion.error)
    })

    const mesa = await leerMesa()
    expect(mesa?.esquema).toBe(2)
    expect(mesa?.fichas[0].id).toBe("f-1")
    expect(mesa?.fichas[0].textoPublicacion).toBe("Texto final revisado")
    expect(mesa?.biblioteca).toEqual([])

    const respaldo = (await leerRespaldoV1()) as typeof mesaV1
    expect(CLAVE_RESPALDO_V1).toBe("mesa-respaldo-v1")
    expect(respaldo.fichas[0].titulo).toBe(fichaV1.titulo)
    expect((respaldo as Record<string, unknown>).esquema).toBeUndefined()

    await guardarMesa({ ...mesa!, fichas: [...mesa!.fichas, { ...mesa!.fichas[0], id: "f-2" }] })
    const otra = await leerMesa()
    expect(otra?.fichas.map((f) => f.id)).toEqual(["f-1", "f-2"])
  })
})
