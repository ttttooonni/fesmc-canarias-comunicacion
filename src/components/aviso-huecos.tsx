import { huecosDelMes } from "@/lib/cobertura"
import type { Ficha } from "@/lib/dominio"

export function AvisoHuecos({ fichas, mes }: { fichas: Ficha[]; mes: string }) {
  const huecos = huecosDelMes(fichas, mes)
  if (huecos.vacio || (huecos.islas.length === 0 && huecos.sectores.length === 0)) {
    return <p className="text-sm leading-relaxed text-muted-foreground">{huecos.texto}</p>
  }
  return (
    <section className="rounded-xl border border-[#E4C48A] bg-[#FFF6E8] p-4" aria-label="Huecos de presencia">
      <h2 className="font-heading text-base font-semibold">Hueco de presencia</h2>
      <p className="mt-1 text-sm leading-relaxed">{huecos.texto}</p>
    </section>
  )
}
