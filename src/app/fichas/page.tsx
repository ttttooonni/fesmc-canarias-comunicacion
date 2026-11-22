import { Fichas } from "@/components/vistas/fichas"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Fichas" }

export default function Page() {
  return <Fichas />
}
