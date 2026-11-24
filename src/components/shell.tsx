"use client"

import { Instalar } from "@/components/instalar"
import { Perfil } from "@/components/perfil"
import { Marca } from "@/components/marca"
import { useApp } from "@/components/proveedor"
import { Tema } from "@/components/tema"
import { Tutorial } from "@/components/tutorial"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { nombreRol } from "@/lib/dominio"
import { cn } from "@/lib/utils"
import { BookOpen, CalendarDays, ChartColumn, House, Inbox, Menu, Route, Shield, SquareLibrary } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

const PRINCIPALES = [
  { href: "/", etiqueta: "Inicio", icono: House },
  { href: "/fichas", etiqueta: "Fichas", icono: Inbox },
  { href: "/circuito", etiqueta: "Circuito", icono: Route },
  { href: "/calendario", etiqueta: "Calendario", icono: CalendarDays },
]

const MAS = [
  { href: "/registro", etiqueta: "Registro", icono: SquareLibrary },
  { href: "/metricas", etiqueta: "Métricas", icono: ChartColumn },
  { href: "/guia", etiqueta: "Guía y tono", icono: BookOpen },
  { href: "/guia/seguridad", etiqueta: "Seguridad y datos", icono: Shield },
]

function activo(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  if (href === "/guia") return pathname === "/guia"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Shell({ children }: { children: React.ReactNode }) {
  const app = useApp()
  const pathname = usePathname()
  const router = useRouter()
  const [mas, setMas] = useState(false)
  const publica = pathname === "/guia" || pathname === "/guia/seguridad"

  if (!app.listo) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#1C1C1C] px-6 text-white">
        <div className="aparecer text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary font-heading text-lg font-bold" aria-hidden>UGT</span>
          <p className="mt-6 font-heading text-2xl font-semibold">FeSMC Canarias</p>
          <p className="mt-2 text-sm text-white/70" role="status">Abriendo la redacción…</p>
        </div>
      </div>
    )
  }

  if (!app.usuario && !publica) return <><Perfil /><Tutorial /></>

  if (!app.usuario && publica) {
    return (
      <div className="min-h-dvh">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
          Saltar al contenido
        </a>
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
          <Link href="/guia" aria-label="Guía de UGT FeSMC Canarias">
            <Marca />
          </Link>
          <Button
            variant="outline"
            className="h-11 px-4"
            onClick={() => router.push("/")}
          >
            Elegir perfil
          </Button>
        </header>
        <div className="mx-auto w-full max-w-3xl px-4 py-6">{children}</div>
      </div>
    )
  }

  const usuario = app.usuario
  if (!usuario) return null

  const enlaces = [...PRINCIPALES, ...MAS]

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <aside className="sticky top-0 hidden h-dvh flex-col bg-[#1C1C1C] text-white md:flex">
        <div className="border-b border-white/10 px-4 py-4">
          <Link href="/" aria-label="Inicio, UGT FeSMC Canarias">
            <Marca clara />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Secciones">
          {enlaces.map((item) => {
            const Icono = item.icono
            const esActivo = activo(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={esActivo ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white",
                  esActivo && "bg-white/10 text-white shadow-[inset_3px_0_0_#E30613]",
                )}
              >
                <Icono aria-hidden className="size-4" />
                {item.etiqueta}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="text-sm font-semibold">{usuario.nombre}</p>
          <p className="text-xs text-white/70">{nombreRol(usuario.rol)} · en este dispositivo</p>
          <Button type="button" variant="outline" className="mt-3 h-11 w-full border-white/20 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white" onClick={() => app.abrirTutorial()}>
            Cómo funciona
          </Button>
          <Button
            variant="outline"
            className="mt-2 h-11 w-full border-white/20 bg-transparent px-4 text-white hover:bg-white/10 hover:text-white"
            onClick={() => app.salir()}
          >
            Cambiar perfil
          </Button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/" aria-label="Inicio">
            <Marca />
          </Link>
          <div className="flex items-center gap-2">
            <Tema />
            <p className="truncate text-right text-xs text-muted-foreground">
              <span className="block font-medium text-foreground">{usuario.nombre.split(" ")[0]}</span>
              {nombreRol(usuario.rol)}
            </p>
          </div>
        </header>
        {app.offline || app.aviso || app.pendientes > 0 ? (
          <div className="border-b border-[#E7C7A1] bg-[#FFF6E8] px-4 py-2 text-sm text-[#1C1C1C]" role="status">
            {app.aviso
              ? app.aviso
              : app.offline
                ? "Sin conexión. La guía, el checklist y la última copia siguen en este dispositivo."
                : null}
            {app.pendientes > 0 ? ` ${app.pendientes} cambio${app.pendientes === 1 ? "" : "s"} pendiente${app.pendientes === 1 ? "" : "s"} de enviar.` : ""}
          </div>
        ) : null}
        <div className="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 md:px-8 md:pt-8 md:pb-12">{children}</div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Secciones">
        <ul className="grid grid-cols-5">
          {PRINCIPALES.map((item) => {
            const Icono = item.icono
            const esActivo = activo(pathname, item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={esActivo ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground",
                    esActivo && "text-primary",
                  )}
                >
                  <Icono aria-hidden className="size-5" />
                  {item.etiqueta}
                </Link>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground"
              aria-expanded={mas}
              onClick={() => setMas(true)}
            >
              <Menu aria-hidden className="size-5" />
              Más
            </button>
          </li>
        </ul>
      </nav>
      <Sheet open={mas} onOpenChange={setMas}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Más secciones</SheetTitle>
          </SheetHeader>
          <div className="grid gap-2 px-4 pb-6">
            {MAS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-lg px-3 font-medium ring-1 ring-border"
                onClick={() => setMas(false)}
              >
                {item.etiqueta}
              </Link>
            ))}
            <div className="mt-2 rounded-xl bg-[#F3EFEA] p-3 dark:bg-[#242424]">
              <p className="text-sm font-semibold">{usuario.nombre}</p>
              <p className="text-sm text-muted-foreground">{nombreRol(usuario.rol)}. En este dispositivo.</p>
            </div>
            <Instalar />
            <Button type="button" variant="outline" className="h-11" onClick={() => { setMas(false); app.abrirTutorial() }}>
              Cómo funciona
            </Button>
            <Button variant="outline" className="h-11" onClick={() => app.salir()}>
              Cambiar perfil
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <Tutorial />
    </div>
  )
}
