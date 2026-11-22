"use client"

import { AvisoHuecos } from "@/components/aviso-huecos"
import { useApp } from "@/components/proveedor"
import { TarjetaFicha } from "@/components/tarjeta-ficha"
import { accionesDisponibles, puedeRegistrarCompartido } from "@/lib/circuito"
import {
  etiquetaMes,
  formatoCorto,
  mesDe,
  mesVisiblePorDefecto,
  nombreCanal,
  nombreFranja,
  nombreRol,
  type Ficha,
} from "@/lib/dominio"
import Link from "next/link"
import { useSyncExternalStore } from "react"

function enMesa(ficha: Ficha, rol: Ficha extends never ? never : Parameters<typeof accionesDisponibles>[1]) {
  return accionesDisponibles(ficha, rol).some((accion) => accion.estilo === "avanzar" && !accion.bloqueo)
}

function saludoDeAhora() {
  const hora = new Date().getHours()
  if (hora < 14) return "Buenos días"
  if (hora < 21) return "Buenas tardes"
  return "Buenas noches"
}

function suscribirNada() {
  return () => {}
}

export function Inicio() {
  const { usuario, fichas, calendario } = useApp()
  const saludo = useSyncExternalStore(suscribirNada, saludoDeAhora, () => "Hola")
  const hoy = useSyncExternalStore(suscribirNada, () => new Date().toISOString().slice(0, 10), () => "2026-11-22")
  if (!usuario) return null
  const cola = fichas.filter((ficha) => enMesa(ficha, usuario.rol))
  const porCompartir =
    usuario.rol === "insular" && usuario.isla
      ? fichas.filter(
          (ficha) =>
            (ficha.estado === "publicado" || ficha.estado === "difundido") &&
            !ficha.compartidos.some((item) => item.isla === usuario.isla),
        )
      : []
  const proximas = [...calendario].filter((hueco) => hueco.fecha >= hoy).slice(0, 3)
  const mes = mesVisiblePorDefecto()
  const veMapa = usuario.rol === "coordinacion" || usuario.rol === "gestor" || usuario.rol === "juridico"
  const delMes = fichas.filter((ficha) => mesDe(ficha.creadoEn) === mes)
  const publicadas = fichas.filter((ficha) => ficha.estado === "publicado" || ficha.estado === "difundido").length

  let tarea = "Revisa la mesa y el calendario de diciembre."
  if (usuario.rol === "coordinacion") {
    const sensibles = fichas.filter((ficha) => ficha.estado === "pendiente_autorizacion").length
    tarea = sensibles
      ? `Hay ${sensibles} ${sensibles === 1 ? "pieza sensible esperando" : "piezas sensibles esperando"} tu autorización.`
      : "No hay piezas sensibles paradas en supervisión."
  } else if (usuario.rol === "gestor") {
    tarea = cola.length
      ? `Tienes ${cola.length} ${cola.length === 1 ? "pieza en la mesa" : "piezas en la mesa"}.`
      : "La mesa de gestión está al día."
  } else if (usuario.rol === "juridico") {
    tarea = cola.length
      ? `Hay ${cola.length} ${cola.length === 1 ? "pieza en revisión" : "piezas en revisión"}.`
      : "No hay piezas esperando revisión."
  } else if (usuario.rol === "insular") {
    tarea = porCompartir.length
      ? `Hay ${porCompartir.length} ${porCompartir.length === 1 ? "pieza publicada que tu isla aún no ha marcado como compartida" : "piezas publicadas que tu isla aún no ha marcado como compartidas"}.`
      : "Puedes enviar una ficha de tu isla cuando haya un hecho que contar."
  } else {
    tarea = "Puedes enviar la ficha breve de tu sector cuando haya un hecho que contar."
  }

  return (
    <main id="contenido" className="space-y-8">
      <header>
        <p className="text-sm font-medium text-primary">{nombreRol(usuario.rol)}</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
          {saludo}, {usuario.nombre.split(" ")[0]}.
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">{tarea}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Resumen">
        {[
          ["En el mes", String(delMes.length)],
          ["En tu mesa", String(cola.length + porCompartir.length)],
          ["Publicadas", String(publicadas)],
          ["En calendario", String(calendario.length)],
        ].map(([etiqueta, valor]) => (
          <div key={etiqueta} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <p className="text-sm text-muted-foreground">{etiqueta}</p>
            <p className="mt-1 font-heading text-3xl font-semibold">{valor}</p>
          </div>
        ))}
      </section>

      {veMapa ? <AvisoHuecos fichas={fichas} mes={mes} /> : null}

      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">Próximas piezas</h2>
          <Link href="/calendario" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Ver diciembre
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          El calendario del plan arranca en diciembre de 2026: lunes de derechos, miércoles de actividad, viernes de actualidad.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {proximas.length === 0 ? (
            <li className="text-sm text-muted-foreground">No hay huecos por delante.</li>
          ) : (
            proximas.map((hueco) => (
              <li key={hueco.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">{nombreFranja(hueco.franja)}</p>
                <p className="mt-2 font-heading text-lg font-semibold leading-snug">{hueco.titulo}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatoCorto(hueco.fecha)} · {hueco.canales.map(nombreCanal).join(", ")}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="font-heading text-xl font-semibold">Tu cola</h2>
        <ul className="mt-4 grid gap-3">
          {cola.length === 0 && porCompartir.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              Nada esperando tu mano ahora mismo.
              {puedeRegistrarCompartido(usuario.rol) ? "" : " Cuando entre una ficha de tu ámbito, aparecerá aquí."}
            </li>
          ) : (
            [...cola, ...porCompartir.filter((ficha) => !cola.includes(ficha))].map((ficha) => (
              <li key={ficha.id}>
                <TarjetaFicha ficha={ficha} />
              </li>
            ))
          )}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Lectura de {etiquetaMes(mes)}. Las islas no se ordenan por volumen.</p>
      </section>
    </main>
  )
}
