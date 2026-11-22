import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function Campo({
  id,
  etiqueta,
  ayuda,
  error,
  children,
}: {
  id: string
  etiqueta: string
  ayuda?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="text-sm text-muted-foreground">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}

export function controlClass(className?: string) {
  return cn(
    "h-11 w-full rounded-lg border border-input bg-card px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60",
    className,
  )
}
