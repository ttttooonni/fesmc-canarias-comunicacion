"use client"

import { useApp } from "@/components/proveedor"
import { TarjetaFicha } from "@/components/tarjeta-ficha"
import { ESTADOS } from "@/lib/dominio"
import { useState } from "react"

export function Circuito() {
  const { fichas } = useApp()
  const [solo, setSolo] = useState<string>("")
  const grupos = ESTADOS.filter((estado) => !solo || estado.id === solo)

  return (
    <main id="contenido" className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Circuito</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Borrador, propuesta, revisión, revisión legal, aprobada o devuelta, y publicada. Cada paso se puede mandar por WhatsApp.
        </p>
      </header>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Filtrar por estado">
        <button type="button" role="tab" aria-selected={solo === ""} className={chip(solo === "")} onClick={() => setSolo("")}>
          Todos
        </button>
        {ESTADOS.map((estado) => {
          const cuenta = fichas.filter((ficha) => ficha.estado === estado.id).length
          return (
            <button key={estado.id} type="button" role="tab" aria-selected={solo === estado.id} className={chip(solo === estado.id)} onClick={() => setSolo(estado.id)}>
              {estado.nombre} ({cuenta})
            </button>
          )
        })}
      </div>
      <div className="space-y-8">
        {grupos.map((estado) => {
          const lista = fichas.filter((ficha) => ficha.estado === estado.id)
          return (
            <section key={estado.id} aria-labelledby={`estado-${estado.id}`}>
              <h2 id={`estado-${estado.id}`} className="font-heading text-xl font-semibold">
                {estado.nombre}
              </h2>
              <p className="text-sm text-muted-foreground">{estado.detalle}</p>
              <ul className="mt-3 grid gap-3">
                {lista.length === 0 ? (
                  <li className="text-sm text-muted-foreground">Ninguna pieza en este paso.</li>
                ) : (
                  lista.map((ficha) => (
                    <li key={ficha.id}>
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
  return `min-h-11 shrink-0 rounded-full px-3 text-sm font-medium ring-1 ${activo ? "bg-primary text-white ring-primary" : "bg-card text-foreground ring-border"}`
}
