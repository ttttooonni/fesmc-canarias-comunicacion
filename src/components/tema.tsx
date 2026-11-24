"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

function suscribir() {
  return () => {}
}

export function Tema() {
  const { resolvedTheme, setTheme } = useTheme()
  const montado = useSyncExternalStore(suscribir, () => true, () => false)
  const oscuro = montado && resolvedTheme === "dark"
  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 px-3"
      aria-label={oscuro ? "Usar tema claro" : "Usar tema oscuro"}
      onClick={() => setTheme(oscuro ? "light" : "dark")}
    >
      {oscuro ? <Sun aria-hidden /> : <Moon aria-hidden />}
      <span className="sr-only">{oscuro ? "Claro" : "Oscuro"}</span>
    </Button>
  )
}
