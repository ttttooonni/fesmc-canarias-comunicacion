"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { CHECKLIST_SEGURIDAD } from "@/lib/contenido"
import Link from "next/link"
import { useSyncExternalStore } from "react"

const CLAVE = "ugt-checklist-lectura"
const EVENTO = "ugt-checklist"

function leer() {
  return localStorage.getItem(CLAVE) ?? "[]"
}

function suscribir(alCambiar: () => void) {
  window.addEventListener(EVENTO, alCambiar)
  window.addEventListener("storage", alCambiar)
  return () => {
    window.removeEventListener(EVENTO, alCambiar)
    window.removeEventListener("storage", alCambiar)
  }
}

function listaDesde(crudo: string): string[] {
  try {
    const lista = JSON.parse(crudo) as unknown
    return Array.isArray(lista) ? lista.filter((item): item is string => typeof item === "string") : []
  } catch {
    return []
  }
}

export function Seguridad() {
  const crudo = useSyncExternalStore(suscribir, leer, () => "[]")
  const marcados = listaDesde(crudo)

  function alternar(id: string, activo: boolean) {
    const siguiente = activo ? [...new Set([...marcados, id])] : marcados.filter((item) => item !== id)
    localStorage.setItem(CLAVE, JSON.stringify(siguiente))
    window.dispatchEvent(new Event(EVENTO))
  }

  return (
    <main id="contenido" className="space-y-6">
      <header>
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Disponible sin conexión</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Seguridad y datos</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Checklist de consulta antes de dejar salir una pieza. Las marcas se quedan en este dispositivo: el registro que vale para el circuito es la ficha.
        </p>
      </header>
      <p className="text-sm text-muted-foreground">
        {marcados.length} de {CHECKLIST_SEGURIDAD.length} puntos revisados en este dispositivo.
      </p>
      <ul className="space-y-3">
        {CHECKLIST_SEGURIDAD.map((item) => (
          <li key={item.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <label className="flex items-start gap-3">
              <Checkbox className="mt-1 size-5" checked={marcados.includes(item.id)} onCheckedChange={(valor) => alternar(item.id, valor)} />
              <span>
                <span className="block font-semibold">{item.titulo}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{item.detalle}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p>
        <Link href="/guia" className="font-medium text-primary underline-offset-4 hover:underline">
          Volver a la guía de tono
        </Link>
      </p>
    </main>
  )
}
