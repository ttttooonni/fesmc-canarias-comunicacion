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
import { calcularMetricasLocales, type Barra } from "@/lib/metricas-locales"
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
  const { usuario, fichas, calendario, episodiosSerie, publicacionesSerie, metricas, guardarMetrica } = useApp()
  const sugerido = useSyncExternalStore(suscribirNada, mesVisiblePorDefecto, () => "2026-11")
  const [manual, setManual] = useState<string | null>(null)
  const mes = manual ?? sugerido
  const guardada = metricas.find((item) => item.mes === mes) ?? metricaVacia(mes)

  if (!usuario) return null
  const puede = puedeEditarMetricas(usuario.rol)
  const veMapa = usuario.rol === "coordinacion" || usuario.rol === "gestor" || usuario.rol === "juridico"
  const delMes = fichas.filter((ficha) => mesDe(ficha.creadoEn) === mes)
  const m = calcularMetricasLocales({ mes, fichas, calendario, episodios: episodiosSerie, publicacionesSerie })
  const compartidas = fichas.reduce((total, ficha) => total + ficha.compartidos.filter((item) => mesDe(item.en) === mes).length, 0)
  const pasos = m.actividad.reduce((total, barra) => total + barra.valor, 0)

  return (
    <main id="contenido" className="aparecer space-y-8">
      <header>
        <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">Métricas</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Actividad del equipo</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Todo se calcula con las fichas, el calendario y los episodios guardados en este dispositivo. No hay cifras de alcance ni de seguidores: la app no las inventa ni las consulta.
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
      {m.demo > 0 ? (
        <p className="rounded-xl border-2 border-dashed border-[#E4C48A] bg-[#FFF6E8] px-3 py-2 text-sm text-[#1C1C1C]">
          Incluye {m.demo} fichas de DEMOSTRACIÓN. Quítalas desde Copias para ver solo tus datos.
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Publicaciones previstas y realizadas">
        <div className="rounded-2xl bg-[#1C1C1C] p-5 text-white sm:col-span-1">
          <p className="text-sm text-white/70">Previstas vs. realizadas</p>
          <p className="mt-1 font-heading text-5xl font-semibold tabular-nums">
            {m.realizadas}
            <span className="text-2xl text-white/60"> / {m.previstas}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15" aria-hidden>
            <span className="block h-full bg-primary" style={{ width: `${Math.min(100, m.cumplimiento ?? 0)}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/70">{m.cumplimiento === null ? "No hay piezas previstas este mes." : `${m.cumplimiento} % de lo previsto ya está publicado.`}</p>
        </div>
        <Cifra etiqueta="Fichas recibidas en el mes" valor={delMes.length} />
        <Cifra etiqueta="Contenidos del mes sin publicar" valor={m.pendientesDelMes} />
        <Cifra etiqueta="Compartidos desde cuentas insulares" valor={compartidas} />
        <Cifra etiqueta="Pasos del circuito en el mes" valor={pasos} />
        <Cifra etiqueta="Publicaciones de Sindi y Cato" valor={m.publicacionesSerie} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Barras titulo="Contenidos por sector" barras={m.porSector} vacio="Sin contenidos este mes." ocultarCeros />
        <Barras titulo="Contenidos por isla" barras={m.porIsla} vacio="Sin contenidos este mes." nota="Orden fijo, de este a oeste. No es un ranking." />
        <Barras titulo="Distribución por canales" barras={m.porCanal} vacio="Sin canales previstos." />
        <Barras titulo="Actividad de producción · pasos del mes" barras={m.actividad} vacio="Sin pasos registrados este mes." />
        <Barras titulo="Estado actual de todas las fichas" barras={m.porEstado} vacio="Sin fichas." />
        <Barras titulo="Producción de Sindi y Cato" barras={m.produccionSerie} vacio="Sin episodios." />
      </div>

      {veMapa ? <AvisoHuecos fichas={delMes} mes={mes} /> : null}

      <details className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
        <summary className="cursor-pointer font-heading text-lg font-semibold">Registro manual de cifras de redes (opcional)</summary>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Solo si el equipo copia a mano las estadísticas oficiales de cada red. La app no se conecta a Instagram, Facebook ni TikTok y no calcula estas cifras. Si un campo no se conoce, déjalo vacío.
        </p>
        {guardada.ejemplo ? (
          <p className="mt-2 rounded-lg bg-[#F8E8E6] px-3 py-2 text-sm leading-relaxed text-[#1C1C1C]">
            Este mes tiene cifras de DEMOSTRACIÓN de una versión anterior. No proceden de las cuentas oficiales. Se quitan con «Quitar DEMOSTRACIÓN» en Copias.
          </p>
        ) : null}
        <div className="mt-4">
          <EditorMetricas
            key={`${mes}:${guardada.actualizadoEn ?? "vacio"}:${guardada.ejemplo}`}
            inicial={guardada}
            puede={puede}
            onGuardar={(entrada) => guardarMetrica(mes, entrada)}
          />
        </div>
      </details>
    </main>
  )
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <p className="text-sm text-muted-foreground">{etiqueta}</p>
      <p className="mt-1 font-heading text-4xl font-semibold tabular-nums">{valor}</p>
    </div>
  )
}

function Barras({ titulo, barras, vacio, nota, ocultarCeros = false }: { titulo: string; barras: Barra[]; vacio: string; nota?: string; ocultarCeros?: boolean }) {
  const max = Math.max(1, ...barras.map((b) => b.valor))
  const total = barras.reduce((t, b) => t + b.valor, 0)
  const visibles = ocultarCeros ? barras.filter((b) => b.valor > 0) : barras
  return (
    <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <h2 className="font-heading text-lg font-semibold">{titulo}</h2>
      {nota ? <p className="text-xs text-muted-foreground">{nota}</p> : null}
      {total === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{vacio}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {visibles.map((b) => (
            <li key={b.id} className="grid grid-cols-[minmax(0,9rem)_1fr_2rem] items-center gap-2 text-sm">
              <span className="truncate">{b.nombre}</span>
              <span className="h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
                <span className="block h-full rounded-full bg-primary" style={{ width: `${(b.valor / max) * 100}%` }} />
              </span>
              <span className="text-right font-semibold tabular-nums">{b.valor}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
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
