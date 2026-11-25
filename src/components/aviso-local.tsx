import { HardDrive, MessageCircle } from "lucide-react"
import Link from "next/link"

/** Recordatorio permanente de dónde viven los datos y cómo viajan. */
export function AvisoLocal({ compacto = false }: { compacto?: boolean }) {
  if (compacto) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <HardDrive aria-hidden className="size-3.5 shrink-0" />
        Datos solo en este dispositivo · se comparten por enlace y WhatsApp
      </p>
    )
  }
  return (
    <aside className="grid gap-3 rounded-2xl bg-[#1C1C1C] p-4 text-sm text-white sm:grid-cols-[auto_1fr] sm:items-center" aria-label="Cómo se guardan los datos">
      <div className="flex gap-2" aria-hidden>
        <span className="grid size-10 place-items-center rounded-xl bg-white/10"><HardDrive className="size-5" /></span>
        <span className="grid size-10 place-items-center rounded-xl bg-primary"><MessageCircle className="size-5" /></span>
      </div>
      <p className="leading-relaxed text-white/85">
        <strong className="text-white">Todo se guarda solo en este dispositivo.</strong> No hay servidor ni cuentas: el trabajo viaja por enlaces que se envían por WhatsApp. Haz una copia en{" "}
        <Link href="/copias" className="font-semibold text-white underline underline-offset-4">Copias</Link> de vez en cuando.
      </p>
    </aside>
  )
}
