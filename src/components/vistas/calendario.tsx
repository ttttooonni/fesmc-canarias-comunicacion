"use client"

import { Campo, controlClass } from "@/components/campo"
import { useApp } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { puedeEditarCalendario } from "@/lib/circuito"
import {
  CANALES,
  MES_INICIO_PLAN,
  PILARES,
  desplazarMes,
  etiquetaMes,
  formatoFecha,
  franjaDeFecha,
  mesDe,
  nombreCanal,
  nombreFranja,
  nombrePilar,
  type CanalId,
  type Hueco,
  type PilarId,
} from "@/lib/dominio"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export function Calendario() {
  const { usuario, calendario, fichas, guardarHueco } = useApp()
  const [mes, setMes] = useState(MES_INICIO_PLAN)
  const [abierto, setAbierto] = useState<Hueco | null>(null)
  const [creando, setCreando] = useState(false)
  const [canal, setCanal] = useState<string>("")

  const [ano, numero] = mes.split("-").map(Number)
  const celdas = useMemo(() => {
    const primero = new Date(ano, numero - 1, 1)
    const offset = (primero.getDay() + 6) % 7
    const dias = new Date(ano, numero, 0).getDate()
    const lista: Array<number | null> = Array.from({ length: offset }, () => null)
    for (let dia = 1; dia <= dias; dia += 1) lista.push(dia)
    return lista
  }, [ano, numero])

  const delMes = calendario
    .filter((hueco) => mesDe(hueco.fecha) === mes)
    .filter((hueco) => !canal || hueco.canales.includes(canal as CanalId))
    .sort((a, b) => a.fecha.localeCompare(b.fecha))

  function huecosDelDia(dia: number) {
    const iso = `${mes}-${String(dia).padStart(2, "0")}`
    return delMes.filter((hueco) => hueco.fecha === iso)
  }

  if (!usuario) return null
  const puede = puedeEditarCalendario(usuario.rol)

  return (
    <main id="contenido" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Calendario</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Diciembre de 2026 es el primer mes, precargado como ejemplo con el ritmo del plan. Tres piezas por semana.
          </p>
        </div>
        {puede ? (
          <Button type="button" className="h-11 px-4" onClick={() => setCreando(true)}>
            Añadir hueco
          </Button>
        ) : null}
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="h-11 px-3" onClick={() => setMes(desplazarMes(mes, -1))} aria-label="Mes anterior">
            Anterior
          </Button>
          <p className="min-w-36 text-center font-heading text-lg font-semibold">{etiquetaMes(mes)}</p>
          <Button type="button" variant="outline" className="h-11 px-3" onClick={() => setMes(desplazarMes(mes, 1))} aria-label="Mes siguiente">
            Siguiente
          </Button>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          Canal
          <select className={controlClass("w-auto")} value={canal} onChange={(evento) => setCanal(evento.target.value)}>
            <option value="">Todos</option>
            {CANALES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="flex flex-wrap gap-2 text-xs font-medium">
        <li className="rounded-full bg-[#F8E0E2] px-2.5 py-1">Lunes · derechos</li>
        <li className="rounded-full bg-[#F3E4C4] px-2.5 py-1">Miércoles · actividad</li>
        <li className="rounded-full bg-[#E4E7F2] px-2.5 py-1">Viernes · actualidad</li>
      </ul>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground">
        {DIAS.map((dia) => (
          <div key={dia}>{dia}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {celdas.map((dia, indice) => {
          if (!dia) return <div key={`vacio-${indice}`} className="min-h-16 rounded-lg bg-transparent" />
          const piezas = huecosDelDia(dia)
          const iso = `${mes}-${String(dia).padStart(2, "0")}`
          const franja = franjaDeFecha(iso)
          return (
            <div key={iso} className={`min-h-16 rounded-lg p-1 text-left ring-1 ring-border ${franja ? "bg-card" : "bg-[#F7F4F0]"}`}>
              <span className="block text-xs font-semibold">{dia}</span>
              {piezas.map((hueco) => (
                <button key={hueco.id} type="button" className="mt-1 w-full truncate rounded bg-primary/10 px-1 py-0.5 text-left text-[11px] font-medium text-[#8E0B16]" onClick={() => setAbierto(hueco)}>
                  {hueco.titulo}
                </button>
              ))}
            </div>
          )
        })}
      </div>
      <section>
        <h2 className="font-heading text-xl font-semibold">Lista del mes</h2>
        <ul className="mt-3 grid gap-3">
          {delMes.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              {mes === MES_INICIO_PLAN
                ? "Este mes todavía no tiene huecos visibles con el filtro."
                : "El plan deja precargado diciembre de 2026. Los meses siguientes se cubren desde el equipo."}
            </li>
          ) : (
            delMes.map((hueco) => (
              <li key={hueco.id}>
                <button type="button" className="w-full rounded-xl bg-card p-4 text-left ring-1 ring-foreground/10" onClick={() => setAbierto(hueco)}>
                  <span className="text-xs font-semibold tracking-wide text-primary uppercase">{nombreFranja(hueco.franja)}</span>
                  <span className="mt-1 block font-heading text-lg font-semibold">{hueco.titulo}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {formatoFecha(hueco.fecha)} · {nombrePilar(hueco.pilar)} · {hueco.canales.map(nombreCanal).join(", ")}
                    {hueco.ejemplo ? " · Ejemplo" : ""}
                    {hueco.excepcional ? " · Fuera de ritmo" : ""}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
      <Sheet open={Boolean(abierto)} onOpenChange={(valor) => !valor && setAbierto(null)}>
        <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-2xl">
          {abierto ? (
            <>
              <SheetHeader>
                <SheetTitle>{abierto.titulo}</SheetTitle>
              </SheetHeader>
              <div className="space-y-3 px-4 pb-6 text-sm leading-relaxed">
                <p>
                  {formatoFecha(abierto.fecha)} · {nombreFranja(abierto.franja)} · {nombrePilar(abierto.pilar)}
                </p>
                <p>{abierto.angulo}</p>
                <p>Canales: {abierto.canales.map(nombreCanal).join(", ")}</p>
                {abierto.fichaId ? (
                  <Link href={`/fichas/ver?id=${abierto.fichaId}`} className="inline-flex font-medium text-primary underline-offset-4 hover:underline">
                    Abrir la ficha vinculada
                  </Link>
                ) : (
                  <p className="text-muted-foreground">Todavía no hay una ficha vinculada.</p>
                )}
                {abierto.ejemplo ? <p className="text-muted-foreground">Pieza de ejemplo del primer mes. Se puede reescribir.</p> : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      <Dialog open={creando} onOpenChange={setCreando}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo hueco</DialogTitle>
          </DialogHeader>
          <FormularioHueco
            fichas={fichas.map((ficha) => ({ id: ficha.id, titulo: ficha.titulo }))}
            onCancelar={() => setCreando(false)}
            onGuardar={async (datos) => {
              const resultado = await guardarHueco(datos)
              if (!resultado.ok) {
                toast.error(resultado.error)
                return
              }
              toast.success("Hueco añadido")
              setCreando(false)
              if (typeof datos.fecha === "string") setMes(mesDe(datos.fecha))
            }}
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}

function FormularioHueco({
  fichas,
  onGuardar,
  onCancelar,
}: {
  fichas: { id: string; titulo: string }[]
  onGuardar: (datos: Record<string, unknown>) => Promise<void>
  onCancelar: () => void
}) {
  const [fecha, setFecha] = useState("2026-12-02")
  const [titulo, setTitulo] = useState("")
  const [angulo, setAngulo] = useState("")
  const [pilar, setPilar] = useState<PilarId>("derechos")
  const [canales, setCanales] = useState<CanalId[]>(["instagram"])
  const [fichaId, setFichaId] = useState("")
  const [confirmar, setConfirmar] = useState(false)
  const franja = franjaDeFecha(fecha)
  return (
    <form
      className="space-y-3"
      onSubmit={(evento) => {
        evento.preventDefault()
        void onGuardar({ fecha, titulo, angulo, pilar, canales, fichaId, confirmarExcepcional: confirmar })
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
      <Campo id="ficha-hueco" etiqueta="Ficha vinculada" ayuda="Opcional.">
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
