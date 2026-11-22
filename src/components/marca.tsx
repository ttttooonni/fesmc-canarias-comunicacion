import { cn } from "@/lib/utils"

export function Marca({
  compacta = false,
  clara = false,
  className,
}: {
  compacta?: boolean
  clara?: boolean
  className?: string
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className="grid size-10 shrink-0 place-items-center rounded-md bg-primary font-heading text-[13px] font-bold tracking-wide text-white"
        aria-hidden
      >
        UGT
      </span>
      {compacta ? null : (
        <span className="min-w-0 leading-tight">
          <span className={cn("block truncate font-heading text-sm font-semibold", clara && "text-white")}>
            FeSMC Canarias
          </span>
          <span className={cn("block truncate text-xs", clara ? "text-white/75" : "text-muted-foreground")}>
            Comunicación digital
          </span>
        </span>
      )}
    </span>
  )
}
