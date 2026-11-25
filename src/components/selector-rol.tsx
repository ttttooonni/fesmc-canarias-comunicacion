"use client"

import { useApp } from "@/components/proveedor"
import { ROLES, type RolId } from "@/lib/dominio"
import { cn } from "@/lib/utils"

/**
 * Cambio rápido de rol para la demostración en un solo dispositivo.
 * Los roles ordenan el trabajo; no son un control de seguridad.
 */
export function SelectorRolDemo({ oscuro = false }: { oscuro?: boolean }) {
  const { usuario, cambiarRol } = useApp()
  if (!usuario) return null
  return (
    <label className={cn("mt-3 flex flex-col gap-1 text-xs font-medium", oscuro ? "text-white/70" : "text-muted-foreground")}>
      Trabajar como (rol local)
      <select
        className={cn(
          "h-11 w-full rounded-lg border px-2 text-sm",
          oscuro ? "border-white/20 bg-[#2a2a2a] text-white" : "border-input bg-card text-foreground",
        )}
        value={usuario.rol}
        onChange={(evento) => cambiarRol(evento.target.value as RolId)}
      >
        {ROLES.map((rol) => (
          <option key={rol.id} value={rol.id}>
            {rol.nombre}
          </option>
        ))}
      </select>
      <span className={cn("font-normal leading-snug", oscuro ? "text-white/60" : "")}>Organiza qué pasos ves. No es una contraseña ni un permiso.</span>
    </label>
  )
}
