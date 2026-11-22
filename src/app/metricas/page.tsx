import { Metricas } from "@/components/vistas/metricas"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Métricas" }

export default function Page() {
  return <Metricas />
}
