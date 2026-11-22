import { FichaDetalle } from "@/components/vistas/ficha-detalle"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Ficha" }

export default function Page() {
  return <FichaDetalle />
}
