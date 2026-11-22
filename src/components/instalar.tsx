"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState, useSyncExternalStore } from "react"

function suscribirNada() {
  return () => {}
}

type PromptInstalacion = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function esIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function estaInstalada() {
  return window.matchMedia("(display-mode: standalone)").matches
}

export function Instalar() {
  const [prompt, setPrompt] = useState<PromptInstalacion | null>(null)
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

  if (instalada) return <p className="text-sm text-muted-foreground">La aplicación ya está instalada en este dispositivo.</p>

  return (
    <div className="space-y-3">
      {prompt ? (
        <Button
          type="button"
          className="h-11 px-4"
          onClick={() => {
            void prompt.prompt()
          }}
        >
          Instalar la aplicación
        </Button>
      ) : null}
      {ios ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          En iPhone o iPad: pulsa Compartir y luego «Añadir a pantalla de inicio».
        </p>
      ) : prompt ? null : (
        <p className="text-sm leading-relaxed text-muted-foreground">
          En Chrome o Edge, abre el menú del navegador y elige «Instalar aplicación» o «Añadir a la pantalla de inicio». Hace falta HTTPS, o localhost si la estás probando.
        </p>
      )}
    </div>
  )
}
