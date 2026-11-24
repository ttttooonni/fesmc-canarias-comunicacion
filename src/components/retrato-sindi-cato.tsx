import { rutaPublica, RUTA_RETRATO_SINDI_CATO, RUTA_RETRATO_SINDI_CATO_JPG } from "@/lib/rutas"
import { cn } from "@/lib/utils"

export function RetratoSindiYCato({
  className,
  variante = "completo",
  pie = true,
}: {
  className?: string
  variante?: "completo" | "compacto" | "hero"
  pie?: boolean
}) {
  const webp = rutaPublica(RUTA_RETRATO_SINDI_CATO)
  const jpg = rutaPublica(RUTA_RETRATO_SINDI_CATO_JPG)
  const recorte =
    variante === "compacto"
      ? "h-44 w-full object-cover object-center sm:h-52"
      : variante === "hero"
        ? "h-auto max-h-[70dvh] w-full object-contain"
        : "h-auto w-full"
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-3xl bg-[#F8E8E6] shadow-[0_28px_60px_-28px_rgba(227,6,19,0.45)] ring-1 ring-foreground/10 dark:bg-[#2a1718]",
        className,
      )}
    >
      <picture>
        <source srcSet={webp} type="image/webp" />
        <img
          src={jpg}
          alt="Sindi, con una taza roja de UGT y un cuaderno de Delegada Sindical, y Cato, con gorra y un portátil de UGT FeSMC Canarias, en un salón de Santa Lucía de Tirajana."
          width={608}
          height={1080}
          className={recorte}
        />
      </picture>
      {pie ? (
        <figcaption className="bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          Sindi y Cato, nuestros personajes
        </figcaption>
      ) : null}
    </figure>
  )
}
