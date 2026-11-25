import { Biblioteca } from "@/components/vistas/biblioteca"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Biblioteca" }

export default function Page() {
  return <Biblioteca />
}
