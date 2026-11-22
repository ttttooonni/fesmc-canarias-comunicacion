import { EstadoPill } from "@/components/estado-pill"
import { formatoCorto, nombreIsla, nombreSector, type Ficha } from "@/lib/dominio"
import Link from "next/link"

export function TarjetaFicha({ ficha }: { ficha: Ficha }) {
  return (
    <Link
      href={`/fichas/${ficha.id}`}
      className="block rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition hover:ring-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="flex flex-wrap items-center gap-2">
        <EstadoPill estado={ficha.estado} />
        {ficha.sensible ? (
          <span className="inline-flex rounded-full bg-[#7A1020] px-2.5 py-1 text-xs font-semibold text-white">Sensible</span>
        ) : null}
        {ficha.ejemplo ? (
          <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">Ejemplo</span>
        ) : null}
      </span>
      <span className="mt-3 block font-heading text-base font-semibold leading-snug text-foreground">{ficha.titulo}</span>
      <span className="mt-1 block text-sm text-muted-foreground">
        {nombreIsla(ficha.isla)} · {nombreSector(ficha.sector)} · {formatoCorto(ficha.cuando)}
      </span>
    </Link>
  )
}
