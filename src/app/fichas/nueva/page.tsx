import { FichaForm } from "@/components/vistas/ficha-form"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Nueva ficha" }

export default function Page() {
  return (
    <main id="contenido" className="space-y-4">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Nueva ficha breve</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Qué ocurrió, dónde, cuándo, sector, fuentes, material autorizado, persona de contacto y si el contenido es sensible.
      </p>
      <FichaForm />
    </main>
  )
}
