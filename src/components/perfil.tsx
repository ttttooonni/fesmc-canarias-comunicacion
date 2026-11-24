"use client"

import { Campo, controlClass } from "@/components/campo"
import { PanelInstalar } from "@/components/instalar"
import { Marca } from "@/components/marca"
import { useApp } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ISLAS, ROLES, SECTORES, type IslaId, type RolId, type SectorId } from "@/lib/dominio"
import { useState } from "react"

export function Perfil() {
  const { guardarPerfil } = useApp()
  const [nombre, setNombre] = useState("")
  const [rol, setRol] = useState<RolId>("gestor")
  const [isla, setIsla] = useState<IslaId>("tenerife")
  const [sector, setSector] = useState<SectorId>("hosteleria")
  const [error, setError] = useState<string | null>(null)

  function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    if (nombre.trim().length < 2) {
      setError("Escribe cómo te llamas en el equipo.")
      return
    }
    guardarPerfil({
      nombre: nombre.trim(),
      rol,
      isla: rol === "insular" ? isla : null,
      sector: rol === "sectorial" ? sector : null,
    })
  }

  return (
    <main id="contenido" className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-10">
      <Marca />
      <p className="mt-8 font-heading text-xs font-semibold tracking-[0.16em] text-primary uppercase">En este dispositivo</p>
      <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">¿Quién trabaja hoy?</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        No hay cuentas ni servidor. El nombre y el rol se quedan en el teléfono y sirven para saber qué pasos del circuito te tocan.
      </p>
      <form className="mt-8 space-y-5" onSubmit={enviar}>
        <Campo id="nombre" etiqueta="Tu nombre">
          <Input id="nombre" className="h-12 text-base md:text-base" value={nombre} onChange={(evento) => setNombre(evento.target.value)} autoComplete="name" />
        </Campo>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Rol</legend>
          <div className="grid gap-2">
            {ROLES.map((item) => (
              <label key={item.id} className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 ring-1 ${rol === item.id ? "bg-primary text-white ring-primary" : "bg-card ring-border"}`}>
                <input className="size-4 accent-white" type="radio" name="rol" value={item.id} checked={rol === item.id} onChange={() => setRol(item.id)} />
                {item.nombre}
              </label>
            ))}
          </div>
        </fieldset>
        {rol === "insular" ? (
          <Campo id="isla" etiqueta="Isla">
            <select id="isla" className={controlClass("h-12")} value={isla} onChange={(evento) => setIsla(evento.target.value as IslaId)}>
              {ISLAS.map((item) => (
                <option key={item.id} value={item.id}>{item.nombre}</option>
              ))}
            </select>
          </Campo>
        ) : null}
        {rol === "sectorial" ? (
          <Campo id="sector" etiqueta="Sector">
            <select id="sector" className={controlClass("h-12")} value={sector} onChange={(evento) => setSector(evento.target.value as SectorId)}>
              {SECTORES.map((item) => (
                <option key={item.id} value={item.id}>{item.nombre}</option>
              ))}
            </select>
          </Campo>
        ) : null}
        {error ? <p role="alert" className="text-sm font-medium text-destructive">{error}</p> : null}
        <Button type="submit" className="h-12 w-full text-base">Empezar</Button>
      </form>
      <div className="mt-8">
        <PanelInstalar />
      </div>
    </main>
  )
}
