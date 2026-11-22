"use client"

import { AvisoHuecos } from "@/components/aviso-huecos"
import { useApp } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { contarPorIsla, contarPorSector } from "@/lib/cobertura"
import {
  ISLAS,
  SECTORES,
  desplazarMes,
  etiquetaMes,
  mesDe,
  mesVisiblePorDefecto,
  nombreIsla,
  nombreSector,
  type Ficha,
} from "@/lib/dominio"
import { useState, useSyncExternalStore } from "react"

function suscribirNada() {
  return () => {}
}

type Vista = "recibidas" | "publicadas" | "compartidas"

export function Registro() {
  const { usuario, fichas } = useApp()
  const sugerido = useSyncExternalStore(suscribirNada, mesVisiblePorDefecto, () => "2026-11")
  const [manual, setManual] = useState<string | null>(null)
  const mes = manual ?? sugerido
  const [vista, setVista] = useState<Vista>("recibidas")
  if (!usuario) return null
  const veMapa = usuario.rol === "coordinacion" || usuario.rol === "gestor" || usuario.rol === "juridico"
  const base = seleccionar(fichas, vista, mes)
  const porIsla = vista === "compartidas" ? cuentasCompartidas(fichas, mes) : contarPorIsla(base)
  const porSector = contarPorSector(base)

  return (
    <main id="contenido" className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Registro</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Lo recibido, lo publicado y lo compartido, por isla y por sector. El orden es fijo, de este a oeste. No hay ranking.
        </p>
      </header>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" className="h-11 px-3" onClick={() => setManual(desplazarMes(mes, -1))} aria-label="Mes anterior">
          Anterior
        </Button>
        <p className="min-w-40 text-center font-heading text-lg font-semibold">{etiquetaMes(mes)}</p>
        <Button type="button" variant="outline" className="h-11 px-3" onClick={() => setManual(desplazarMes(mes, 1))} aria-label="Mes siguiente">
          Siguiente
        </Button>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tipo de registro">
        {(
          [
            ["recibidas", "Recibidas"],
            ["publicadas", "Publicadas"],
            ["compartidas", "Compartidas"],
          ] as const
        ).map(([id, etiqueta]) => (
          <button key={id} type="button" role="tab" aria-selected={vista === id} className={`min-h-11 rounded-full px-4 text-sm font-medium ring-1 ${vista === id ? "bg-primary text-white ring-primary" : "bg-card ring-border"}`} onClick={() => setVista(id)}>
            {etiqueta}
          </button>
        ))}
      </div>
      {veMapa ? <AvisoHuecos fichas={fichas.filter((ficha) => mesDe(ficha.creadoEn) === mes)} mes={mes} /> : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          El mapa de huecos lo miran coordinación, gestión y el referente jurídico, para pedir fichas donde falten. Aquí ves el recuento de lo que está en tu mesa.
        </p>
      )}
      <section>
        <h2 className="font-heading text-xl font-semibold">Por isla</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ISLAS.map((isla) => (
            <li key={isla.id} className={`rounded-xl p-3 ring-1 ${porIsla[isla.id] ? "bg-card ring-foreground/10" : "border border-dashed border-[#E4C48A] bg-[#FFF6E8] ring-0"}`}>
              <p className="text-sm font-medium">{nombreIsla(isla.id)}</p>
              <p className="mt-1 font-heading text-2xl font-semibold">{porIsla[isla.id] ?? 0}</p>
              {porIsla[isla.id] ? null : <p className="text-xs text-muted-foreground">Sin presencia</p>}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-heading text-xl font-semibold">Por sector</h2>
        <ul className="mt-3 grid gap-2">
          {SECTORES.map((sector) => (
            <li key={sector.id} className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2 ring-1 ring-foreground/10">
              <span className="text-sm">{nombreSector(sector.id)}</span>
              <span className="font-heading text-lg font-semibold">
                {porSector[sector.id] ?? 0}
                {porSector[sector.id] ? "" : <span className="ml-2 text-xs font-medium text-muted-foreground">sin presencia</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-sm text-muted-foreground">{base.length} {base.length === 1 ? "pieza" : "piezas"} en esta lectura.</p>
    </main>
  )
}

function cuentasCompartidas(fichas: Ficha[], mes: string): Record<string, number> {
  const cuentas: Record<string, number> = {}
  for (const isla of ISLAS) cuentas[isla.id] = 0
  for (const ficha of fichas) {
    for (const item of ficha.compartidos) {
      if (mesDe(item.en) !== mes || item.isla === "regional") continue
      cuentas[item.isla] = (cuentas[item.isla] ?? 0) + 1
    }
  }
  return cuentas
}

function seleccionar(fichas: Ficha[], vista: Vista, mes: string): Ficha[] {
  if (vista === "recibidas") return fichas.filter((ficha) => mesDe(ficha.creadoEn) === mes)
  if (vista === "publicadas") {
    return fichas.filter((ficha) => ficha.publicadoEn && mesDe(ficha.publicadoEn) === mes)
  }
  return fichas.filter((ficha) => ficha.compartidos.some((item) => mesDe(item.en) === mes))
}
