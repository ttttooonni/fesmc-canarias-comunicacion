import { Calendario } from "@/components/vistas/calendario"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Calendario" }

export default function Page() {
  return <Calendario />
}
