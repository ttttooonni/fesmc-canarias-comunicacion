"use client"

import { useApp } from "@/components/proveedor"
import { TarjetaFicha } from "@/components/tarjeta-ficha"
import { accionesDisponibles } from "@/lib/circuito"
import { ESTADOS, nombreRol, type EstadoId } from "@/lib/dominio"
import { cn } from "@/lib/utils"
import { useState } from "react"

/** Orden del tablero de coordinación: de la entrada a la publicación. */
const COLUMNAS: EstadoId[] = ["propuesta", "en_revision", "revision_legal", "aprobada", "cambios", "publicada", "borrador"]

export function Circuito() {
  const { fichas, usuario } = useApp()
  const [solo, setSolo] = useState<string>("")
  const [miTurno, setMiTurno] = useState(false)
  if (!usuario) return null
  const meToca = (id: string) => {
    const ficha = fichas.find((f) => f.id === id)
    return ficha ? accionesDisponibles(ficha, usuario.rol).some((a) => !a.bloqueo) : false
  }
  const base = miTurno ? fichas.filter((f) => meToca(f.id)) : fichas
  const columnas = COLUMNAS.filter((id) => !solo || id === solo).map((id) => ESTADOS.find((e) => e.id === id)!)

  return (
    <main id="contenido" className="aparecer space-y-6">
      <header>
        <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">Coordinación</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Circuito de revisión</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Propuesta recibida → pendiente de revisión → revisión jurídica → aprobada → publicada. Si algo falla, se devuelve para modificaciones. Cada paso se envía por WhatsApp con un enlace que mete la ficha en el otro teléfono.
        </p>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Trabajas como <strong>{nombreRol(usuario.rol)}</strong>. El rol solo decide qué botones ves para ordenar el trabajo; no es un control de seguridad ni un permiso.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-h-11 items-center gap-2 rounded-full bg-card px-4 text-sm font-medium ring-1 ring-border">
          <input type="checkbox" className="size-4 accent-[#E30613]" checked={miTurno} onChange={(e) => setMiTurno(e.target.checked)} />
          Solo lo que me toca
        </label>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filtrar por estado">
        <button type="button" role="tab" aria-selected={solo === ""} className={chip(solo === "")} onClick={() => setSolo("")}>
          Todos ({base.length})
        </button>
        {COLUMNAS.map((id) => {
          const estado = ESTADOS.find((e) => e.id === id)!
          const cuenta = base.filter((ficha) => ficha.estado === id).length
          return (
            <button key={id} type="button" role="tab" aria-selected={solo === id} className={chip(solo === id)} onClick={() => setSolo(id)}>
              {estado.nombre} ({cuenta})
            </button>
          )
        })}
      </div>
      <div className={cn("gap-4", solo ? "grid" : "grid lg:-mx-2 lg:flex lg:snap-x lg:overflow-x-auto lg:px-2 lg:pb-3")}>
        {columnas.map((estado) => {
          const lista = base.filter((ficha) => ficha.estado === estado.id).sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn))
          return (
            <section key={estado.id} aria-labelledby={`estado-${estado.id}`} className={cn("rounded-2xl bg-muted/40 p-3", !solo && "lg:w-80 lg:shrink-0 lg:snap-start")}>
              <h2 id={`estado-${estado.id}`} className="flex items-center justify-between gap-2 font-heading text-lg font-semibold">
                {estado.nombre}
                <span className="rounded-full bg-card px-2.5 py-0.5 text-sm tabular-nums ring-1 ring-border">{lista.length}</span>
              </h2>
              <p className="text-xs text-muted-foreground">{estado.detalle}</p>
              <ul className="mt-3 grid gap-3">
                {lista.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">Ninguna pieza en este paso.</li>
                ) : (
                  lista.map((ficha) => (
                    <li key={ficha.id} className="relative">
                      {meToca(ficha.id) ? (
                        <span className="absolute -top-2 right-3 z-10 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white shadow">Te toca</span>
                      ) : null}
                      <TarjetaFicha ficha={ficha} />
                    </li>
                  ))
                )}
              </ul>
            </section>
          )
        })}
      </div>
    </main>
  )
}

function chip(activo: boolean) {
  return `min-h-11 shrink-0 rounded-full px-4 text-sm font-medium ring-1 ${activo ? "bg-primary text-white ring-primary" : "bg-card text-foreground ring-border"}`
}
