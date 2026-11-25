import { ETIQUETA_DEMO } from "@/lib/dominio"
import { cn } from "@/lib/utils"

/** Etiqueta común para todo dato ficticio. */
export function EtiquetaDemo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-[#B7791F] bg-[#FFF6E8] px-2.5 py-0.5 text-[11px] font-bold tracking-[0.08em] text-[#7A4A00] uppercase",
        className,
      )}
      title="Contenido ficticio para enseñar la app"
    >
      {ETIQUETA_DEMO}
    </span>
  )
}
