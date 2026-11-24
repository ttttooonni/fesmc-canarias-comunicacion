import { FichaDetalle } from "@/components/vistas/ficha-detalle"
import type { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = { title: "Ficha" }

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Abriendo la ficha…</p>}>
      <FichaDetalle />
    </Suspense>
  )
}
