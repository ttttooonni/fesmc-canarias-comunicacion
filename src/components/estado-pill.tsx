import { nombreEstado, type EstadoId } from "@/lib/dominio"
import { cn } from "@/lib/utils"

const CLASES: Record<EstadoId, string> = {
  borrador: "bg-[#F3EFEA] text-[#1C1C1C] dark:bg-[#2a2a2a] dark:text-white",
  propuesta: "bg-[#F8E0E2] text-[#8E0B16]",
  en_revision: "bg-[#F3E4C4] text-[#1C1C1C]",
  revision_legal: "bg-[#E4E7F2] text-[#1C1C1C]",
  aprobada: "bg-[#D9EFE4] text-[#0D5A40]",
  cambios: "bg-[#F8D5D8] text-[#7A1020]",
  publicada: "bg-[#1C1C1C] text-white",
}

export function EstadoPill({ estado, className }: { estado: EstadoId; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", CLASES[estado], className)}>
      {nombreEstado(estado)}
    </span>
  )
}
