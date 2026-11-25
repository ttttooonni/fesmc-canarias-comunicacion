import { mesaVacia } from "@/lib/almacen"
import { leerRecurso, enlaceSeguro } from "@/lib/biblioteca"
import { cargarDemostracion } from "@/lib/demostracion"
import { actividadReciente, calcularMetricasLocales } from "@/lib/metricas-locales"
import { describe, expect, it } from "vitest"

describe("métricas locales", () => {
  it("se calculan solo con los datos del dispositivo", () => {
    const vacia = calcularMetricasLocales({ mes: "2026-12", fichas: [], calendario: [], episodios: [], publicacionesSerie: [] })
    expect(vacia.previstas).toBe(0)
    expect(vacia.realizadas).toBe(0)
    expect(vacia.cumplimiento).toBeNull()
    expect(vacia.porSector.every((b) => b.valor === 0)).toBe(true)

    const mesa = cargarDemostracion(mesaVacia(), null)
    const dic = calcularMetricasLocales({ mes: "2026-12", fichas: mesa.fichas, calendario: mesa.calendario, episodios: mesa.episodiosSerie, publicacionesSerie: mesa.publicacionesSerie })
    expect(dic.previstas).toBeGreaterThanOrEqual(13)
    expect(dic.porCanal.find((c) => c.id === "instagram")!.valor).toBeGreaterThan(0)
    expect(dic.produccionSerie.find((p) => p.id === "publicado")!.valor).toBe(1)
    const nov = calcularMetricasLocales({ mes: "2026-11", fichas: mesa.fichas, calendario: mesa.calendario, episodios: mesa.episodiosSerie, publicacionesSerie: mesa.publicacionesSerie })
    expect(nov.realizadas).toBe(1)
    expect(nov.porIsla.find((i) => i.id === "fuerteventura")!.valor).toBe(1)
    expect(Object.keys(nov)).not.toContain("alcance")
    expect(Object.keys(nov)).not.toContain("seguidores")
  })

  it("el panel de actividad ordena los últimos pasos", () => {
    const mesa = cargarDemostracion(mesaVacia(), null)
    const pasos = actividadReciente(mesa.fichas, 3)
    expect(pasos).toHaveLength(3)
    expect(pasos[0].en >= pasos[1].en).toBe(true)
  })
})

describe("biblioteca", () => {
  it("valida tipo, título y contenido", () => {
    expect(leerRecurso({ tipo: "nada", titulo: "Algo" }, "1", "2026-11-25T00:00:00Z").ok).toBe(false)
    expect(leerRecurso({ tipo: "guion", titulo: "ab" }, "1", "2026-11-25T00:00:00Z").ok).toBe(false)
    expect(leerRecurso({ tipo: "guion", titulo: "Guion sin nada" }, "1", "2026-11-25T00:00:00Z").ok).toBe(false)
    expect(leerRecurso({ tipo: "video", titulo: "Vídeo malicioso", referencia: "javascript:alert(1)" }, "1", "2026-11-25T00:00:00Z").ok).toBe(false)
    const ok = leerRecurso({ tipo: "plantilla", titulo: "Pie de post", contenido: "Texto", etiquetas: "#redes, cierre, redes" }, "1", "2026-11-25T00:00:00Z")
    expect(ok.ok).toBe(true)
    if (ok.ok) expect(ok.recurso.etiquetas).toEqual(["redes", "cierre"])
  })

  it("solo enlaza referencias https", () => {
    expect(enlaceSeguro("https://www.boe.es")).toBe("https://www.boe.es")
    expect(enlaceSeguro("Carpeta › archivo.png")).toBeNull()
    expect(enlaceSeguro("http://inseguro.example")).toBeNull()
  })
})
