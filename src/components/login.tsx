"use client"

import { Campo, controlClass } from "@/components/campo"
import { Instalar } from "@/components/instalar"
import { Marca } from "@/components/marca"
import { useApp } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CLAVE_DEMO, CUENTAS_DEMO } from "@/lib/demo"
import Link from "next/link"
import { useState } from "react"

export function Login() {
  const { entrar } = useApp()
  const [email, setEmail] = useState(CUENTAS_DEMO[1].email)
  const [password, setPassword] = useState(CLAVE_DEMO)
  const [error, setError] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault()
    setOcupado(true)
    setError(null)
    const mensaje = await entrar(email, password)
    setOcupado(false)
    if (mensaje) setError(mensaje)
  }

  return (
    <main id="contenido" className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-8">
      <Marca />
      <div className="mt-8 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-7">
        <p className="font-heading text-xs font-semibold tracking-[0.14em] text-primary uppercase">Redacción digital</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Entra en la mesa del equipo</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Fichas, circuito y calendario de UGT FeSMC Canarias. Las cuentas y los contenidos son de demostración.
        </p>
        <form className="mt-6 space-y-4" onSubmit={(evento) => void enviar(evento)}>
          <Campo id="email" etiqueta="Correo" error={error && !email ? "Escribe el correo." : undefined}>
            <Input
              id="email"
              className="h-11 text-base md:text-base"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              required
            />
          </Campo>
          <Campo id="password" etiqueta="Clave">
            <Input
              id="password"
              className="h-11 text-base md:text-base"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              required
            />
          </Campo>
          {error ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="h-11 w-full px-4" disabled={ocupado}>
            {ocupado ? "Entrando…" : "Entrar"}
          </Button>
        </form>
        <div className="mt-6">
          <p className="text-sm font-medium">Cuentas de demostración</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Clave de todas: <span className="font-semibold text-foreground">{CLAVE_DEMO}</span>
          </p>
          <ul className="mt-3 grid gap-2">
            {CUENTAS_DEMO.map((cuenta) => (
              <li key={cuenta.email}>
                <button
                  type="button"
                  className={controlClass("h-auto px-3 py-2 text-left")}
                  onClick={() => {
                    setEmail(cuenta.email)
                    setPassword(CLAVE_DEMO)
                    setError(null)
                  }}
                >
                  <span className="block font-medium">{cuenta.nombre}</span>
                  <span className="block text-sm text-muted-foreground">{cuenta.detalle}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 space-y-3 text-sm">
        <p className="rounded-lg bg-[#F8E8E6] px-3 py-2 leading-relaxed">
          No introduzcas datos personales reales. Los nombres del ejemplo no corresponden a personas del sindicato.
        </p>
        <p>
          <Link href="/guia" className="font-medium text-primary underline-offset-4 hover:underline">
            Consultar la guía de tono y el checklist sin entrar
          </Link>
        </p>
        <Instalar />
      </div>
    </main>
  )
}
