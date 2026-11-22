"use client"

import { useApp } from "@/components/proveedor"
import { TarjetaFicha } from "@/components/tarjeta-ficha"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { puedeCrear } from "@/lib/circuito"
import { ESTADOS, ISLAS, ISLA_FEDERACION } from "@/lib/dominio"
import { controlClass } from "@/components/campo"
import Link from "next/link"
import { useMemo, useState } from "react"

export function Fichas() {
  const { usuario, fichas } = useApp()
  const [texto, setTexto] = useState("")
  const [estado, setEstado] = useState<string>("")
  const [isla, setIsla] = useState<string>("")
  const [soloSensibles, setSoloSensibles] = useState(false)

  const visibles = useMemo(() => {
    const consulta = texto.trim().toLowerCase()
    return fichas.filter((ficha) => {
      if (estado && ficha.estado !== estado) return false
      if (isla && ficha.isla !== isla) return false
      if (soloSensibles && !ficha.sensible) return false
      if (!consulta) return true
      return `${ficha.titulo} ${ficha.queOcurrio} ${ficha.sector}`.toLowerCase().includes(consulta)
    })
  }, [fichas, texto, estado, isla, soloSensibles])

  if (!usuario) return null
  const puede = puedeCrear(usuario.rol)

  return (
    <main id="contenido">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Fichas</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            La ficha breve es la puerta de entrada: qué ocurrió, dónde, cuándo, sector, fuentes, material y si es sensible.
          </p>
        </div>
        {puede ? (
          <Button className="h-11 px-4" render={<Link href="/fichas/nueva" />}>
            Nueva ficha
          </Button>
        ) : null}
      </div>

      <details className="mt-5 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <summary className="cursor-pointer text-sm font-semibold">Filtrar</summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Buscar
            <Input className="h-11 text-base md:text-base" value={texto} onChange={(evento) => setTexto(evento.target.value)} placeholder="Título o hecho" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Estado
            <select className={controlClass()} value={estado} onChange={(evento) => setEstado(evento.target.value)}>
              <option value="">Todos</option>
              {ESTADOS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Isla
            <select className={controlClass()} value={isla} onChange={(evento) => setIsla(evento.target.value)}>
              <option value="">Todas</option>
              {ISLAS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
              <option value={ISLA_FEDERACION.id}>{ISLA_FEDERACION.nombre}</option>
            </select>
          </label>
          <label className="flex items-center gap-2 self-end text-sm font-medium">
            <input type="checkbox" className="size-4 accent-[#E30613]" checked={soloSensibles} onChange={(evento) => setSoloSensibles(evento.target.checked)} />
            Solo sensibles
          </label>
        </div>
      </details>

      <ul className="mt-4 grid gap-3">
        {visibles.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
            {fichas.length === 0
              ? "Todavía no hay fichas en tu mesa. Cuando un hecho llegue de una isla o un sector, empezará aquí."
              : "Ninguna ficha coincide con el filtro."}
          </li>
        ) : (
          visibles.map((ficha) => (
            <li key={ficha.id}>
              <TarjetaFicha ficha={ficha} />
            </li>
          ))
        )}
      </ul>
    </main>
  )
}
