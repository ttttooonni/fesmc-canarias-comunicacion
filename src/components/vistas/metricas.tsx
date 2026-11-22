"use client"

import { AvisoHuecos } from "@/components/aviso-huecos"
import { Campo, controlClass } from "@/components/campo"
import { useApp } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { puedeEditarMetricas } from "@/lib/circuito"
import {
  CANALES,
  desplazarMes,
  etiquetaMes,
  mesDe,
  mesVisiblePorDefecto,
  metricaVacia,
  type CanalId,
  type CifrasCanal,
  type MetricaMes,
} from "@/lib/dominio"
import { useState, useSyncExternalStore } from "react"
import { toast } from "sonner"

const CAMPOS: Array<{ clave: keyof CifrasCanal; etiqueta: string }> = [
  { clave: "publicaciones", etiqueta: "Publicaciones" },
  { clave: "alcance", etiqueta: "Alcance" },
  { clave: "interacciones", etiqueta: "Interacciones" },
  { clave: "seguidores", etiqueta: "Seguidores al cierre" },
  { clave: "variacionSeguidores", etiqueta: "Variación de seguidores" },
]

function suscribirNada() {
  return () => {}
}

export function Metricas() {
  const { usuario, fichas, metricas, guardarMetrica } = useApp()
  const sugerido = useSyncExternalStore(suscribirNada, mesVisiblePorDefecto, () => "2026-11")
  const [manual, setManual] = useState<string | null>(null)
  const mes = manual ?? sugerido
  const guardada = metricas.find((item) => item.mes === mes) ?? metricaVacia(mes)

  if (!usuario) return null
  const puede = puedeEditarMetricas(usuario.rol)
  const veMapa = usuario.rol === "coordinacion" || usuario.rol === "gestor" || usuario.rol === "juridico"
  const delMes = fichas.filter((ficha) => mesDe(ficha.creadoEn) === mes)
  const publicadas = fichas.filter((ficha) => ficha.publicadoEn && mesDe(ficha.publicadoEn) === mes).length
  const difundidas = fichas.filter((ficha) => ficha.difundidoEn && mesDe(ficha.difundidoEn) === mes).length
  const compartidas = fichas.reduce((total, ficha) => total + ficha.compartidos.filter((item) => mesDe(item.en) === mes).length, 0)
  const sensibles = delMes.filter((ficha) => ficha.sensible).length

  return (
    <main id="contenido" className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Métricas del mes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Los números de cada red se vuelcan a mano. El registro del equipo se calcula solo. Esta lectura busca equilibrio, no ordenar islas ni sectores por resultados.
        </p>
      </header>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" className="h-11 px-3" onClick={() => setManual(desplazarMes(mes, -1))} aria-label="Mes anterior">
          Anterior
        </Button>
        <p className="min-w-40 text-center font-heading text-lg font-semibold">{etiquetaMes(mes)}</p>
        <Button type="button" variant="outline" className="h-11 px-3" onClick={() => setManual(desplazarMes(mes, 1))} aria-label="Mes siguiente">
          Siguiente
        </Button>
      </div>
      {guardada.ejemplo ? (
        <p className="rounded-lg bg-[#F8E8E6] px-3 py-2 text-sm leading-relaxed">
          Cifras de demostración. No proceden de las cuentas oficiales. Sustitúyelas cuando vuelques las estadísticas reales.
        </p>
      ) : null}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Actividad del equipo">
        {[
          ["Fichas recibidas", delMes.length],
          ["Publicadas", publicadas],
          ["Difundidas", difundidas],
          ["Compartidos de isla", compartidas],
        ].map(([etiqueta, valor]) => (
          <div key={String(etiqueta)} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <p className="text-sm text-muted-foreground">{etiqueta}</p>
            <p className="mt-1 font-heading text-3xl font-semibold">{valor}</p>
          </div>
        ))}
      </section>
      <p className="text-sm text-muted-foreground">
        Piezas sensibles recibidas este mes: {sensibles}. Sale del registro, no hace falta teclearlo.
      </p>
      {veMapa ? <AvisoHuecos fichas={delMes} mes={mes} /> : null}
      <EditorMetricas
        key={`${mes}:${guardada.actualizadoEn ?? "vacio"}:${guardada.ejemplo}`}
        inicial={guardada}
        puede={puede}
        onGuardar={(entrada) => guardarMetrica(mes, entrada)}
      />
    </main>
  )
}

function EditorMetricas({
  inicial,
  puede,
  onGuardar,
}: {
  inicial: MetricaMes
  puede: boolean
  onGuardar: (entrada: unknown) => Promise<{ ok: true } | { ok: false; error: string }>
}) {
  const [borrador, setBorrador] = useState(inicial)
  const [ocupado, setOcupado] = useState(false)

  function poner(canal: CanalId, clave: keyof CifrasCanal, valor: string) {
    setBorrador((prev) => ({
      ...prev,
      canales: {
        ...prev.canales,
        [canal]: { ...prev.canales[canal], [clave]: valor === "" ? null : Number(valor) },
      },
    }))
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault()
    setOcupado(true)
    const resultado = await onGuardar({
      canales: borrador.canales,
      notas: borrador.notas,
      incidenciasSeguridad: borrador.incidenciasSeguridad,
    })
    setOcupado(false)
    if (!resultado.ok) toast.error(resultado.error)
    else toast.success("Métricas guardadas")
  }

  return (
      <form className="space-y-6" onSubmit={(evento) => void guardar(evento)}>
        {CANALES.map((canal) => (
          <fieldset key={canal.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10" disabled={!puede}>
            <legend className="px-1 font-heading text-lg font-semibold">{canal.nombre}</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {CAMPOS.map((campo) => (
                <Campo key={campo.clave} id={`${canal.id}-${campo.clave}`} etiqueta={campo.etiqueta}>
                  <Input
                    id={`${canal.id}-${campo.clave}`}
                    className={`${controlClass()} h-11`}
                    inputMode="numeric"
                    value={borrador.canales[canal.id][campo.clave] ?? ""}
                    onChange={(evento) => poner(canal.id, campo.clave, evento.target.value)}
                  />
                </Campo>
              ))}
            </div>
          </fieldset>
        ))}
        <Campo id="incidencias" etiqueta="Incidencias de seguridad detenidas" ayuda="Piezas que no salieron por datos, imagen o conflicto. Número, no un relato con nombres.">
          <Input
            id="incidencias"
            className="h-11 max-w-xs text-base md:text-base"
            inputMode="numeric"
            disabled={!puede}
            value={borrador.incidenciasSeguridad ?? ""}
            onChange={(evento) =>
              setBorrador((prev) => ({
                ...prev,
                incidenciasSeguridad: evento.target.value === "" ? null : Number(evento.target.value),
              }))
            }
          />
        </Campo>
        <Campo id="notas" etiqueta="Notas del mes" ayuda="Qué se quiso contar y qué hueco queda. Sin comparar islas.">
          <Textarea
            id="notas"
            className="min-h-28 text-base"
            disabled={!puede}
            value={borrador.notas}
            onChange={(evento) => setBorrador((prev) => ({ ...prev, notas: evento.target.value }))}
          />
        </Campo>
        {puede ? (
          <Button type="submit" className="h-11 px-4" disabled={ocupado}>
            {ocupado ? "Guardando…" : "Guardar el mes"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Puedes consultar las cifras. Las vuelcan gestión y coordinación.</p>
        )}
        {borrador.actualizadoEn ? (
          <p className="text-xs text-muted-foreground">
            Última actualización: {borrador.actualizadoPorNombre}.{" "}
            {new Date(borrador.actualizadoEn).toLocaleString("es-ES", { timeZone: "Atlantic/Canary" })}
          </p>
        ) : null}
      </form>
  )
}
