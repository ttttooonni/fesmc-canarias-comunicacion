"use client"

import { AvisoHuecos } from "@/components/aviso-huecos"
import { AvisoLocal } from "@/components/aviso-local"
import { EstadoPill } from "@/components/estado-pill"
import { EtiquetaDemo } from "@/components/etiqueta-demo"
import { PanelInstalar } from "@/components/instalar"
import { useApp } from "@/components/proveedor"
import { RetratoSindiYCato } from "@/components/retrato-sindi-cato"
import { TarjetaFicha } from "@/components/tarjeta-ficha"
import { Button } from "@/components/ui/button"
import { accionesDisponibles, puedeCrear } from "@/lib/circuito"
import {
  ESTADOS,
  formatoCorto,
  formatoMomento,
  hoyIso,
  mesDe,
  mesVisiblePorDefecto,
  nombreCanal,
  nombreEstado,
  nombreFranja,
  nombreRol,
  type Ficha,
  type RolId,
} from "@/lib/dominio"
import { actividadReciente, calcularMetricasLocales } from "@/lib/metricas-locales"
import { hrefFicha } from "@/lib/rutas"
import { CalendarDays, ChartColumn, Clapperboard, DatabaseBackup, Library, PenLine, Sparkles, Workflow } from "lucide-react"
import Link from "next/link"
import { useSyncExternalStore } from "react"
import { toast } from "sonner"

function enMesa(ficha: Ficha, rol: RolId) {
  return accionesDisponibles(ficha, rol).some((accion) => accion.estilo === "avanzar" && !accion.bloqueo)
}

function saludoDeAhora() {
  const hora = new Date().getHours()
  if (hora < 14) return "Buenos días"
  if (hora < 21) return "Buenas tardes"
  return "Buenas noches"
}

function suscribirNada() {
  return () => {}
}

const ACCESOS = [
  { href: "/fichas/nueva", etiqueta: "Nueva ficha", detalle: "Redactar un hecho", icono: PenLine, destacado: true },
  { href: "/circuito", etiqueta: "Coordinación", detalle: "Revisar y aprobar", icono: Workflow },
  { href: "/calendario", etiqueta: "Calendario", detalle: "Semana y mes", icono: CalendarDays },
  { href: "/biblioteca", etiqueta: "Biblioteca", detalle: "Guiones y plantillas", icono: Library },
  { href: "/sindi-cato", etiqueta: "Sindi y Cato", detalle: "Episodios", icono: Clapperboard },
  { href: "/metricas", etiqueta: "Métricas", detalle: "Datos locales", icono: ChartColumn },
  { href: "/copias", etiqueta: "Copias", detalle: "Exportar e importar", icono: DatabaseBackup },
]

export function Inicio() {
  const app = useApp()
  const { usuario, fichas, calendario } = app
  const saludo = useSyncExternalStore(suscribirNada, saludoDeAhora, () => "Hola")
  const hoy = useSyncExternalStore(suscribirNada, () => hoyIso(), () => "2026-11-25")
  const mes = useSyncExternalStore(suscribirNada, () => mesDe(hoyIso()), () => "2026-11")
  if (!usuario) return null

  const cola = fichas.filter((ficha) => enMesa(ficha, usuario.rol))
  const porCompartir =
    usuario.rol === "insular" && usuario.isla
      ? fichas.filter((ficha) => ficha.estado === "publicada" && !ficha.compartidos.some((item) => item.isla === usuario.isla))
      : []
  const devueltas = fichas.filter((ficha) => ficha.estado === "cambios")
  const borradores = fichas.filter((ficha) => ficha.estado === "borrador")
  const pendientes = [...new Map([...cola, ...devueltas, ...borradores, ...porCompartir].map((f) => [f.id, f])).values()]
    .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn))
    .slice(0, 5)
  const publicadasRecientes = fichas
    .filter((ficha) => ficha.estado === "publicada")
    .sort((a, b) => (b.publicadoEn ?? b.actualizadoEn).localeCompare(a.publicadoEn ?? a.actualizadoEn))
    .slice(0, 4)
  const proximas = [...calendario].filter((hueco) => hueco.fecha >= hoy).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 3)
  const metricas = calcularMetricasLocales({ mes, fichas, calendario, episodios: app.episodiosSerie, publicacionesSerie: app.publicacionesSerie })
  const actividad = actividadReciente(fichas, 6)
  const veMapa = usuario.rol === "coordinacion" || usuario.rol === "gestor" || usuario.rol === "juridico"
  const sinNada = fichas.length === 0 && calendario.length === 0
  const demo = fichas.filter((f) => f.ejemplo).length + calendario.filter((h) => h.ejemplo).length + app.biblioteca.filter((r) => r.ejemplo).length + app.episodiosSerie.filter((e) => e.ejemplo).length

  let tarea = "Revisa la mesa y el calendario."
  if (usuario.rol === "coordinacion") {
    const sensibles = fichas.filter((ficha) => ficha.sensible && ficha.estado === "revision_legal").length
    tarea = sensibles
      ? `Hay ${sensibles} ${sensibles === 1 ? "pieza sensible en revisión jurídica" : "piezas sensibles en revisión jurídica"}.`
      : cola.length
        ? `Tienes ${cola.length} ${cola.length === 1 ? "pieza esperando tu paso" : "piezas esperando tu paso"}.`
        : "No hay piezas sensibles paradas en revisión jurídica."
  } else if (usuario.rol === "gestor") {
    tarea = cola.length ? `Tienes ${cola.length} ${cola.length === 1 ? "pieza en la mesa" : "piezas en la mesa"}.` : "La mesa de gestión está al día."
  } else if (usuario.rol === "juridico") {
    tarea = cola.length ? `Hay ${cola.length} ${cola.length === 1 ? "pieza en revisión" : "piezas en revisión"}.` : "No hay piezas esperando revisión."
  } else if (usuario.rol === "insular") {
    tarea = porCompartir.length
      ? `Hay ${porCompartir.length} ${porCompartir.length === 1 ? "pieza publicada que tu isla aún no ha compartido" : "piezas publicadas que tu isla aún no ha compartido"}.`
      : "Puedes enviar una ficha de tu isla cuando haya un hecho que contar."
  } else {
    tarea = "Puedes enviar la ficha breve de tu sector cuando haya un hecho que contar."
  }

  const totalEstados = Math.max(1, fichas.length)

  return (
    <main id="contenido" className="aparecer space-y-8">
      <PanelInstalar />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">{nombreRol(usuario.rol)}</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {saludo}, {usuario.nombre.split(" ")[0]}.
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">{tarea}</p>
        </div>
        {puedeCrear(usuario.rol) ? (
          <Button className="h-12 gap-2 px-5 text-base" render={<Link href="/fichas/nueva" />}>
            <PenLine aria-hidden className="size-5" /> Nueva ficha
          </Button>
        ) : null}
      </header>

      {sinNada ? (
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#E30613] to-[#8E0B16] p-6 text-white">
          <p className="flex items-center gap-2 text-sm font-semibold tracking-[0.14em] uppercase"><Sparkles aria-hidden className="size-4" /> Preparar la demostración</p>
          <h2 className="mt-2 font-heading text-2xl font-semibold">La mesa está vacía</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
            Puedes empezar con una ficha real o cargar datos de DEMOSTRACIÓN: siete fichas ficticias en todos los pasos del circuito, el calendario de diciembre, recursos de biblioteca y dos episodios de Sindi y Cato. Todo va marcado y se quita con un botón.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" className="h-12 bg-white px-5 text-[#8E0B16] hover:bg-white/90" onClick={() => app.cargarDemostracion()}>
              Cargar DEMOSTRACIÓN
            </Button>
            <Button variant="outline" className="h-12 border-white/40 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white" render={<Link href="/fichas/nueva" />}>
              Empezar con una ficha real
            </Button>
          </div>
        </section>
      ) : demo > 0 ? (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-[#E4C48A] bg-[#FFF6E8] px-4 py-3 text-sm text-[#1C1C1C]">
          <p className="flex flex-wrap items-center gap-2">
            <EtiquetaDemo /> Hay {demo} elementos ficticios de demostración mezclados con tus datos.
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-11 bg-white"
            onClick={() => {
              if (!window.confirm("¿Quitar solo los datos marcados como DEMOSTRACIÓN? Tus datos no se tocan.")) return
              const n = app.quitarDemostracion()
              toast.success(`${n} elementos de DEMOSTRACIÓN quitados`)
            }}
          >
            Quitar DEMOSTRACIÓN
          </Button>
        </section>
      ) : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Indicadores de trabajo">
        {[
          ["Esperan tu paso", cola.length + porCompartir.length, "/circuito"],
          ["Pendientes de publicar", fichas.filter((f) => f.estado !== "publicada").length, "/circuito"],
          ["Previstas este mes", metricas.previstas, "/calendario"],
          ["Publicadas este mes", metricas.realizadas, "/metricas"],
        ].map(([etiqueta, valor, href]) => (
          <Link key={etiqueta as string} href={href as string} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 transition hover:ring-primary/40">
            <p className="text-sm text-muted-foreground">{etiqueta}</p>
            <p className="mt-1 font-heading text-4xl font-semibold tabular-nums">{valor}</p>
          </Link>
        ))}
      </section>

      <section aria-labelledby="accesos">
        <h2 id="accesos" className="font-heading text-xl font-semibold">Accesos rápidos</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {ACCESOS.map((item) => {
            const Icono = item.icono
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex h-full min-h-24 flex-col justify-between rounded-2xl p-3 ring-1 transition ${item.destacado ? "bg-primary text-white ring-primary hover:bg-primary/90" : "bg-card ring-foreground/10 hover:ring-primary/40"}`}
                >
                  <Icono aria-hidden className={`size-6 ${item.destacado ? "" : "text-primary"}`} />
                  <span>
                    <span className="block font-heading text-sm font-semibold">{item.etiqueta}</span>
                    <span className={`block text-xs ${item.destacado ? "text-white/80" : "text-muted-foreground"}`}>{item.detalle}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="resumen-fichas" className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <h2 id="resumen-fichas" className="font-heading text-xl font-semibold">Resumen de fichas</h2>
          <Link href="/circuito" className="text-sm font-medium text-primary underline-offset-4 hover:underline">Ver tablero</Link>
        </div>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
          {ESTADOS.map((estado) => {
            const n = fichas.filter((f) => f.estado === estado.id).length
            if (!n) return null
            return <span key={estado.id} className={COLOR_BARRA[estado.id]} style={{ width: `${(n / totalEstados) * 100}%` }} />
          })}
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {ESTADOS.map((estado) => (
            <li key={estado.id} className="rounded-xl bg-background px-3 py-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className={`size-2.5 rounded-full ${COLOR_BARRA[estado.id]}`} aria-hidden />{nombreEstado(estado.id)}</p>
              <p className="font-heading text-2xl font-semibold tabular-nums">{fichas.filter((f) => f.estado === estado.id).length}</p>
            </li>
          ))}
        </ul>
      </section>

      <AvisoLocal />

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="pendientes">
          <h2 id="pendientes" className="font-heading text-xl font-semibold">Contenidos pendientes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Lo que espera tu paso, lo devuelto y los borradores.</p>
          <ul className="mt-3 grid gap-3">
            {pendientes.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">Nada pendiente ahora mismo.</li>
            ) : (
              pendientes.map((ficha) => (
                <li key={ficha.id}>
                  <TarjetaFicha ficha={ficha} />
                </li>
              ))
            )}
          </ul>
        </section>

        <section aria-labelledby="actividad">
          <h2 id="actividad" className="font-heading text-xl font-semibold">Panel de actividad</h2>
          <p className="mt-1 text-sm text-muted-foreground">Últimos pasos del circuito registrados en este dispositivo.</p>
          <ol className="mt-3 space-y-0 rounded-2xl bg-card p-2 ring-1 ring-foreground/10">
            {actividad.length === 0 ? (
              <li className="px-3 py-5 text-sm text-muted-foreground">Sin movimientos todavía.</li>
            ) : (
              actividad.map((paso) => (
                <li key={`${paso.fichaId}-${paso.id}`}>
                  <Link href={hrefFicha(paso.fichaId)} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-muted">
                    <EstadoPill estado={paso.estado} className="mt-0.5 shrink-0" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{paso.titulo}</span>
                      <span className="block text-xs text-muted-foreground">
                        {paso.porNombre} · {formatoMomento(paso.en)}
                        {paso.ejemplo ? " · DEMOSTRACIÓN" : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ol>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="recientes">
          <h2 id="recientes" className="font-heading text-xl font-semibold">Publicaciones recientes</h2>
          <ul className="mt-3 grid gap-3">
            {publicadasRecientes.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">Aún no hay piezas marcadas como publicadas.</li>
            ) : (
              publicadasRecientes.map((ficha) => (
                <li key={ficha.id}>
                  <TarjetaFicha ficha={ficha} />
                </li>
              ))
            )}
          </ul>
        </section>
        <section aria-labelledby="proximas">
          <div className="flex items-end justify-between gap-3">
            <h2 id="proximas" className="font-heading text-xl font-semibold">Próximas piezas</h2>
            <Link href="/calendario" className="text-sm font-medium text-primary underline-offset-4 hover:underline">Ver calendario</Link>
          </div>
          <ul className="mt-3 grid gap-3">
            {proximas.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">No hay huecos por delante en el calendario.</li>
            ) : (
              proximas.map((hueco) => (
                <li key={hueco.id} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                  <p className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-primary uppercase">
                    {nombreFranja(hueco.franja)} {hueco.ejemplo ? <EtiquetaDemo /> : null}
                  </p>
                  <p className="mt-2 font-heading text-lg leading-snug font-semibold">{hueco.titulo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatoCorto(hueco.fecha)} · {hueco.canales.map(nombreCanal).join(", ")}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <section>
        <Link href="/sindi-cato" className="block overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/40">
          <div className="grid gap-0 sm:grid-cols-[14rem_1fr] sm:items-center">
            <RetratoSindiYCato variante="compacto" pie={false} className="rounded-none shadow-none ring-0 sm:rounded-none" />
            <div className="p-4 sm:p-5">
              <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">Sindi y Cato</p>
              <h2 className="mt-1 font-heading text-xl font-semibold">Área de creación y administración</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {app.episodiosSerie.length} episodio{app.episodiosSerie.length === 1 ? "" : "s"} · personajes, guiones, prompts, revisión, publicación y archivo histórico.
              </p>
            </div>
          </div>
        </Link>
      </section>

      {veMapa ? <AvisoHuecos fichas={fichas} mes={mesVisiblePorDefecto()} /> : null}
    </main>
  )
}

const COLOR_BARRA: Record<string, string> = {
  borrador: "bg-[#BDB5AA]",
  propuesta: "bg-[#F08A93]",
  en_revision: "bg-[#E2B04A]",
  revision_legal: "bg-[#7C8DC9]",
  aprobada: "bg-[#3BA272]",
  cambios: "bg-[#B4232F]",
  publicada: "bg-[#1C1C1C] dark:bg-white",
}
