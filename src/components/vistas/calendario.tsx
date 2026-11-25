"use client"

import { Campo, controlClass } from "@/components/campo"
import { EstadoPill } from "@/components/estado-pill"
import { EtiquetaDemo } from "@/components/etiqueta-demo"
import { useApp } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { construirAgenda, diasDeSemana, entradasDelMes, lunesDe, sumarDias, type EntradaAgenda } from "@/lib/agenda"
import { puedeEditarCalendario } from "@/lib/circuito"
import {
  CANALES,
  ESTADOS,
  ISLAS,
  ISLA_FEDERACION,
  MES_INICIO_PLAN,
  PILARES,
  SECTORES,
  desplazarMes,
  etiquetaMes,
  formatoCorto,
  formatoFecha,
  franjaDeFecha,
  hoyIso,
  mesDe,
  nombreCanal,
  nombreFranja,
  nombreIsla,
  nombrePilar,
  nombreSector,
  type CanalId,
  type Hueco,
  type PilarId,
} from "@/lib/dominio"
import { hrefFicha } from "@/lib/rutas"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

function mesInicial(): string {
  const actual = mesDe(hoyIso())
  return actual < MES_INICIO_PLAN ? MES_INICIO_PLAN : actual
}

function semanaInicial(): string {
  const hoy = hoyIso()
  return hoy < `${MES_INICIO_PLAN}-01` ? lunesDe(`${MES_INICIO_PLAN}-01`) : lunesDe(hoy)
}

function EstadoEntrada({ entrada }: { entrada: EntradaAgenda }) {
  if (entrada.estado === "planificado") {
    return <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Planificado, sin ficha</span>
  }
  return <EstadoPill estado={entrada.estado} />
}

export function Calendario() {
  const { usuario, calendario, fichas, guardarHueco } = useApp()
  const [vista, setVista] = useState<"semana" | "mes">("mes")
  const [mes, setMes] = useState(mesInicial)
  const [lunes, setLunes] = useState(semanaInicial)
  const [abierta, setAbierta] = useState<EntradaAgenda | null>(null)
  const [editando, setEditando] = useState<Hueco | "nuevo" | null>(null)
  const [canal, setCanal] = useState("")
  const [isla, setIsla] = useState("")
  const [sector, setSector] = useState("")
  const [estado, setEstado] = useState("")

  const agenda = useMemo(
    () =>
      construirAgenda(calendario, fichas).filter(
        (entrada) =>
          (!canal || entrada.canales.includes(canal as CanalId)) &&
          (!isla || entrada.isla === isla) &&
          (!sector || entrada.sector === sector) &&
          (!estado || entrada.estado === estado),
      ),
    [calendario, fichas, canal, isla, sector, estado],
  )

  const [ano, numero] = mes.split("-").map(Number)
  const celdas = useMemo(() => {
    const primero = new Date(ano, numero - 1, 1)
    const offset = (primero.getDay() + 6) % 7
    const dias = new Date(ano, numero, 0).getDate()
    const lista: Array<number | null> = Array.from({ length: offset }, () => null)
    for (let dia = 1; dia <= dias; dia += 1) lista.push(dia)
    return lista
  }, [ano, numero])

  if (!usuario) return null
  const puede = puedeEditarCalendario(usuario.rol)
  const delMes = entradasDelMes(agenda, mes)
  const semana = diasDeSemana(lunes)
  const hoy = hoyIso()
  const filtros = [canal, isla, sector, estado].filter(Boolean).length

  return (
    <main id="contenido" className="aparecer space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">Calendario editorial</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Organización de publicaciones</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Huecos del plan (lunes de derechos, miércoles de actividad, viernes de actualidad) y fichas con fecha programada o publicada. Cada pieza muestra canal, isla, sector y estado.
          </p>
        </div>
        {puede ? (
          <Button type="button" className="h-12 gap-2 px-4" onClick={() => setEditando("nuevo")}>
            <Plus aria-hidden className="size-4" /> Añadir hueco
          </Button>
        ) : null}
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-muted p-1" role="tablist" aria-label="Vista del calendario">
          {(["semana", "mes"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={vista === id}
              className={cn("min-h-10 rounded-full px-5 text-sm font-semibold", vista === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
              onClick={() => setVista(id)}
            >
              {id === "semana" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="size-11 p-0"
            aria-label={vista === "mes" ? "Mes anterior" : "Semana anterior"}
            onClick={() => (vista === "mes" ? setMes(desplazarMes(mes, -1)) : setLunes(sumarDias(lunes, -7)))}
          >
            <ChevronLeft aria-hidden className="size-5" />
          </Button>
          <p className="min-w-44 text-center font-heading text-lg font-semibold" aria-live="polite">
            {vista === "mes" ? etiquetaMes(mes) : `${formatoCorto(semana[0])} – ${formatoCorto(semana[6])}`}
          </p>
          <Button
            type="button"
            variant="outline"
            className="size-11 p-0"
            aria-label={vista === "mes" ? "Mes siguiente" : "Semana siguiente"}
            onClick={() => (vista === "mes" ? setMes(desplazarMes(mes, 1)) : setLunes(sumarDias(lunes, 7)))}
          >
            <ChevronRight aria-hidden className="size-5" />
          </Button>
        </div>
      </div>

      <details className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <summary className="cursor-pointer text-sm font-semibold">Filtrar{filtros ? ` (${filtros})` : ""}</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Filtro etiqueta="Canal" valor={canal} onCambio={setCanal} opciones={CANALES.map((c) => [c.id, c.nombre])} />
          <Filtro etiqueta="Isla" valor={isla} onCambio={setIsla} opciones={[...ISLAS.map((c) => [c.id, c.nombre] as [string, string]), [ISLA_FEDERACION.id, ISLA_FEDERACION.nombre]]} />
          <Filtro etiqueta="Sector" valor={sector} onCambio={setSector} opciones={SECTORES.map((c) => [c.id, c.nombre])} />
          <Filtro etiqueta="Estado" valor={estado} onCambio={setEstado} opciones={[["planificado", "Planificado, sin ficha"], ...ESTADOS.map((c) => [c.id, c.nombre] as [string, string])]} />
        </div>
      </details>

      {vista === "semana" ? (
        <ol className="grid gap-3 lg:grid-cols-7">
          {semana.map((dia, i) => {
            const piezas = agenda.filter((entrada) => entrada.fecha === dia)
            const franja = franjaDeFecha(dia)
            return (
              <li key={dia} className={cn("rounded-2xl p-3 ring-1", dia === hoy ? "bg-primary/5 ring-primary/50" : franja ? "bg-card ring-foreground/10" : "bg-muted/50 ring-border")}>
                <p className="flex items-baseline justify-between gap-2">
                  <span className="font-heading text-sm font-semibold">{DIAS[i]} {Number(dia.slice(8))}</span>
                  {franja ? <span className="text-[11px] font-medium text-primary">{nombreFranja(franja).split(" · ")[1]}</span> : null}
                </p>
                <ul className="mt-2 space-y-2">
                  {piezas.length === 0 ? (
                    <li className="text-xs text-muted-foreground">—</li>
                  ) : (
                    piezas.map((entrada) => (
                      <li key={entrada.clave}>
                        <button type="button" className="w-full rounded-xl bg-background p-2 text-left text-sm ring-1 ring-border hover:ring-primary/50" onClick={() => setAbierta(entrada)}>
                          <span className="block leading-snug font-semibold">{entrada.titulo}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-1">
                            <EstadoEntrada entrada={entrada} />
                            {entrada.ejemplo ? <EtiquetaDemo /> : null}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {entrada.canales.map(nombreCanal).join(", ")}
                            {entrada.isla ? ` · ${nombreIsla(entrada.isla)}` : ""}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </li>
            )
          })}
        </ol>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground" aria-hidden>
            {DIAS.map((dia) => (
              <div key={dia}>{dia}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {celdas.map((dia, indice) => {
              if (!dia) return <div key={`vacio-${indice}`} className="min-h-16 rounded-lg bg-transparent" />
              const iso = `${mes}-${String(dia).padStart(2, "0")}`
              const piezas = delMes.filter((entrada) => entrada.fecha === iso)
              const franja = franjaDeFecha(iso)
              return (
                <div key={iso} className={cn("min-h-16 rounded-lg p-1 text-left ring-1 ring-border", iso === hoy ? "ring-2 ring-primary" : "", franja ? "bg-card" : "bg-muted/50")}>
                  <span className="block text-xs font-semibold">{dia}</span>
                  {piezas.map((entrada) => (
                    <button
                      key={entrada.clave}
                      type="button"
                      className={cn(
                        "mt-1 w-full truncate rounded px-1 py-0.5 text-left text-[11px] font-medium",
                        entrada.estado === "publicada" ? "bg-[#1C1C1C] text-white" : entrada.estado === "planificado" ? "bg-muted text-foreground" : "bg-primary/10 text-[#8E0B16] dark:text-[#ffb3b8]",
                      )}
                      onClick={() => setAbierta(entrada)}
                      title={entrada.titulo}
                    >
                      {entrada.titulo}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
          <section>
            <h2 className="font-heading text-xl font-semibold">Lista del mes</h2>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {delMes.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground md:col-span-2">
                  No hay piezas este mes{filtros ? " con estos filtros" : ""}. Añade un hueco o programa una ficha aprobada.
                </li>
              ) : (
                delMes.map((entrada) => (
                  <li key={entrada.clave}>
                    <button type="button" className="w-full rounded-2xl bg-card p-4 text-left ring-1 ring-foreground/10 hover:ring-primary/40" onClick={() => setAbierta(entrada)}>
                      <span className="flex flex-wrap items-center gap-2">
                        <EstadoEntrada entrada={entrada} />
                        {entrada.ejemplo ? <EtiquetaDemo /> : null}
                        {entrada.hueco ? <span className="text-xs font-semibold tracking-wide text-primary uppercase">{nombreFranja(entrada.hueco.franja)}</span> : null}
                      </span>
                      <span className="mt-2 block font-heading text-lg leading-snug font-semibold">{entrada.titulo}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {formatoFecha(entrada.fecha)} · {entrada.canales.map(nombreCanal).join(", ")}
                        {entrada.isla ? ` · ${nombreIsla(entrada.isla)}` : ""}
                        {entrada.sector ? ` · ${nombreSector(entrada.sector)}` : ""}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      )}

      <Sheet open={Boolean(abierta)} onOpenChange={(valor) => !valor && setAbierta(null)}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
          {abierta ? (
            <>
              <SheetHeader>
                <SheetTitle>{abierta.titulo}</SheetTitle>
              </SheetHeader>
              <div className="space-y-3 px-4 pb-6 text-sm leading-relaxed">
                <p className="flex flex-wrap items-center gap-2">
                  <EstadoEntrada entrada={abierta} />
                  {abierta.ejemplo ? <EtiquetaDemo /> : null}
                </p>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <dt className="text-muted-foreground">Fecha</dt>
                  <dd>{formatoFecha(abierta.fecha)}{abierta.hueco ? ` · ${nombreFranja(abierta.hueco.franja)}` : ""}</dd>
                  <dt className="text-muted-foreground">Canal</dt>
                  <dd>{abierta.canales.map(nombreCanal).join(", ") || "Sin indicar"}</dd>
                  <dt className="text-muted-foreground">Isla</dt>
                  <dd>{abierta.isla ? nombreIsla(abierta.isla) : "Sin indicar"}</dd>
                  <dt className="text-muted-foreground">Sector</dt>
                  <dd>{abierta.sector ? nombreSector(abierta.sector) : "Sin indicar"}</dd>
                  {abierta.hueco ? (
                    <>
                      <dt className="text-muted-foreground">Pilar</dt>
                      <dd>{nombrePilar(abierta.hueco.pilar)}</dd>
                    </>
                  ) : null}
                </dl>
                {abierta.hueco ? <p>{abierta.hueco.angulo}</p> : <p className="text-muted-foreground">Ficha con fecha {abierta.estado === "publicada" ? "de publicación" : "programada"}, sin hueco del plan.</p>}
                <div className="flex flex-wrap gap-2 pt-1">
                  {abierta.ficha ? (
                    <Button className="h-11" render={<Link href={hrefFicha(abierta.ficha.id)} />}>
                      Abrir la ficha
                    </Button>
                  ) : (
                    <p className="text-muted-foreground">Todavía no hay una ficha vinculada.</p>
                  )}
                  {abierta.hueco && puede ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11"
                      onClick={() => {
                        setEditando(abierta.hueco)
                        setAbierta(null)
                      }}
                    >
                      Editar hueco
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      <Dialog open={Boolean(editando)} onOpenChange={(valor) => !valor && setEditando(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando === "nuevo" ? "Nuevo hueco" : "Editar hueco"}</DialogTitle>
          </DialogHeader>
          {editando ? (
            <FormularioHueco
              fichas={fichas.map((ficha) => ({ id: ficha.id, titulo: `${ficha.ejemplo ? "[DEMOSTRACIÓN] " : ""}${ficha.titulo}` }))}
              inicial={editando === "nuevo" ? null : editando}
              fechaSugerida={vista === "semana" ? lunes : `${mes}-01`}
              onCancelar={() => setEditando(null)}
              onGuardar={async (datos) => {
                const resultado = await guardarHueco(datos, editando === "nuevo" ? undefined : editando.id)
                if (!resultado.ok) {
                  toast.error(resultado.error)
                  return
                }
                toast.success(editando === "nuevo" ? "Hueco añadido" : "Hueco actualizado")
                setEditando(null)
                if (typeof datos.fecha === "string") {
                  setMes(mesDe(datos.fecha))
                  setLunes(lunesDe(datos.fecha))
                }
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  )
}

function Filtro({ etiqueta, valor, onCambio, opciones }: { etiqueta: string; valor: string; onCambio: (v: string) => void; opciones: Array<[string, string]> | string[][] }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {etiqueta}
      <select className={controlClass()} value={valor} onChange={(e) => onCambio(e.target.value)}>
        <option value="">Todos</option>
        {opciones.map(([id, nombre]) => (
          <option key={id} value={id}>
            {nombre}
          </option>
        ))}
      </select>
    </label>
  )
}

function FormularioHueco({
  fichas,
  inicial,
  fechaSugerida,
  onGuardar,
  onCancelar,
}: {
  fichas: { id: string; titulo: string }[]
  inicial?: Hueco | null
  fechaSugerida?: string
  onGuardar: (datos: Record<string, unknown>) => Promise<void>
  onCancelar: () => void
}) {
  const [fecha, setFecha] = useState(inicial?.fecha ?? fechaSugerida ?? "2026-12-02")
  const [titulo, setTitulo] = useState(inicial?.titulo ?? "")
  const [angulo, setAngulo] = useState(inicial?.angulo ?? "")
  const [pilar, setPilar] = useState<PilarId>(inicial?.pilar ?? "derechos")
  const [canales, setCanales] = useState<CanalId[]>(inicial?.canales ?? ["instagram"])
  const [fichaId, setFichaId] = useState(inicial?.fichaId ?? "")
  const [isla, setIsla] = useState<string>(inicial?.isla ?? "")
  const [sector, setSector] = useState<string>(inicial?.sector ?? "")
  const [confirmar, setConfirmar] = useState(inicial?.excepcional ?? false)
  const franja = franjaDeFecha(fecha)
  return (
    <form
      className="space-y-3"
      onSubmit={(evento) => {
        evento.preventDefault()
        void onGuardar({ fecha, titulo, angulo, pilar, canales, fichaId, isla, sector, confirmarExcepcional: confirmar })
      }}
    >
      <Campo id="fecha-hueco" etiqueta="Fecha" ayuda={franja ? nombreFranja(franja) : "Ese día queda fuera del ritmo. Márcalo si es urgente."}>
        <Input id="fecha-hueco" className="h-11 text-base md:text-base" type="date" value={fecha} onChange={(evento) => setFecha(evento.target.value)} />
      </Campo>
      {!franja ? (
        <label className="flex items-start gap-3 text-sm">
          <Checkbox className="mt-0.5 size-5" checked={confirmar} onCheckedChange={setConfirmar} />
          Confirmo que es una pieza fuera de ritmo.
        </label>
      ) : null}
      <Campo id="titulo-hueco" etiqueta="Título">
        <Input id="titulo-hueco" className="h-11 text-base md:text-base" value={titulo} onChange={(evento) => setTitulo(evento.target.value)} />
      </Campo>
      <Campo id="angulo-hueco" etiqueta="Ángulo">
        <Textarea id="angulo-hueco" className="min-h-20 text-base" value={angulo} onChange={(evento) => setAngulo(evento.target.value)} />
      </Campo>
      <Campo id="pilar-hueco" etiqueta="Pilar">
        <select id="pilar-hueco" className={controlClass()} value={pilar} onChange={(evento) => setPilar(evento.target.value as PilarId)}>
          {PILARES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <div className="flex flex-wrap gap-2">
        {CANALES.map((item) => (
          <label key={item.id} className="flex min-h-11 items-center gap-2 rounded-lg px-2 ring-1 ring-border">
            <Checkbox
              className="size-5"
              checked={canales.includes(item.id)}
              onCheckedChange={(valor) => setCanales((prev) => (valor ? [...prev, item.id] : prev.filter((canal) => canal !== item.id)))}
            />
            {item.nombre}
          </label>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo id="isla-hueco" etiqueta="Isla">
          <select id="isla-hueco" className={controlClass()} value={isla} onChange={(evento) => setIsla(evento.target.value)}>
            <option value="">Sin indicar</option>
            {ISLAS.map((item) => (
              <option key={item.id} value={item.id}>{item.nombre}</option>
            ))}
            <option value={ISLA_FEDERACION.id}>{ISLA_FEDERACION.nombre}</option>
          </select>
        </Campo>
        <Campo id="sector-hueco" etiqueta="Sector">
          <select id="sector-hueco" className={controlClass()} value={sector} onChange={(evento) => setSector(evento.target.value)}>
            <option value="">Sin indicar</option>
            {SECTORES.map((item) => (
              <option key={item.id} value={item.id}>{item.nombre}</option>
            ))}
          </select>
        </Campo>
      </div>
      <Campo id="ficha-hueco" etiqueta="Ficha vinculada" ayuda="Opcional. Si hay ficha, el estado, la isla y el sector salen de ella.">
        <select id="ficha-hueco" className={controlClass()} value={fichaId} onChange={(evento) => setFichaId(evento.target.value)}>
          <option value="">Sin ficha</option>
          {fichas.map((ficha) => (
            <option key={ficha.id} value={ficha.id}>
              {ficha.titulo}
            </option>
          ))}
        </select>
      </Campo>
      <div className="flex gap-2">
        <Button type="submit" className="h-11 px-4">
          Guardar
        </Button>
        <Button type="button" variant="outline" className="h-11 px-4" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
