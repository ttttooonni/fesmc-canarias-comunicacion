"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState, useSyncExternalStore } from "react"

type PromptInstalacion = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function suscribirNada() {
  return () => {}
}

function esIos() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
}

function estaInstalada() {
  return window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone))
}

export function PanelInstalar({ compacto = false }: { compacto?: boolean }) {
  const [prompt, setPrompt] = useState<PromptInstalacion | null>(null)
  const [aceptada, setAceptada] = useState(false)
  const ios = useSyncExternalStore(suscribirNada, esIos, () => false)
  const instalada = useSyncExternalStore(suscribirNada, estaInstalada, () => false)

  useEffect(() => {
    function guardar(evento: Event) {
      evento.preventDefault()
      setPrompt(evento as PromptInstalacion)
    }
    window.addEventListener("beforeinstallprompt", guardar)
    return () => window.removeEventListener("beforeinstallprompt", guardar)
  }, [])

  if (instalada || aceptada) return null

  return (
    <section className="aparecer rounded-3xl bg-card p-5 ring-1 ring-foreground/10" aria-labelledby="instalar-titulo">
      <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">En el teléfono</p>
      <h2 id="instalar-titulo" className="mt-1 font-heading text-2xl font-semibold tracking-tight">Instalar / Descargar app</h2>
      {!compacto ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Queda como una aplicación, con icono propio, y la guía sigue disponible sin cobertura.
        </p>
      ) : null}
      {prompt ? (
        <Button
          type="button"
          className="mt-4 h-12 w-full text-base"
          onClick={() => {
            void prompt.prompt().then(async () => {
              const eleccion = await prompt.userChoice
              if (eleccion.outcome === "accepted") setAceptada(true)
            })
          }}
        >
          Instalar ahora
        </Button>
      ) : null}
      {ios ? <PasosIos /> : prompt ? null : (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          En Chrome o Edge, el botón de arriba aparece en cuanto el navegador permite la instalación. También puedes usar el menú del navegador y elegir «Instalar aplicación».
        </p>
      )}
    </section>
  )
}

function PasosIos() {
  const pasos = [
    { titulo: "Pulsa Compartir", detalle: "El cuadrado con la flecha, en la barra de Safari.", icono: <IconoCompartir /> },
    { titulo: "Añadir a pantalla de inicio", detalle: "Baja en el menú hasta esa opción.", icono: <IconoMas /> },
    { titulo: "Confirma Añadir", detalle: "La app queda con el icono de UGT.", icono: <IconoCasa /> },
  ]
  return (
    <ol className="mt-4 grid gap-3">
      {pasos.map((paso, indice) => (
        <li key={paso.titulo} className="flex items-center gap-3 rounded-2xl bg-[#F8E8E6] p-3 dark:bg-[#2a1718]">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-primary dark:bg-[#1c1c1c]" aria-hidden>
            {paso.icono}
          </span>
          <span>
            <span className="block text-xs font-semibold text-primary">Paso {indice + 1}</span>
            <span className="block font-medium">{paso.titulo}</span>
            <span className="block text-sm text-muted-foreground">{paso.detalle}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

function IconoCompartir() {
  return (
    <svg viewBox="0 0 48 48" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M18 20H14a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h20a6 6 0 0 0 6-6v-8a6 6 0 0 0-6-6h-4" />
      <path d="M24 28V8" />
      <path d="M17 15l7-7 7 7" />
    </svg>
  )
}

function IconoMas() {
  return (
    <svg viewBox="0 0 48 48" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.4">
      <rect x="8" y="8" width="32" height="32" rx="8" />
      <path d="M24 16v16M16 24h16" />
    </svg>
  )
}

function IconoCasa() {
  return (
    <svg viewBox="0 0 48 48" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M8 22 24 8l16 14v16a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4Z" />
      <path d="M20 42V28h8v14" />
    </svg>
  )
}

export function Instalar() {
  return <PanelInstalar compacto />
}
