"use client"

import { useApp, type ValidacionOk } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { NOMBRES_COLECCION, type ResumenImportacion } from "@/lib/copias"
import { formatoMomento } from "@/lib/dominio"
import { CircleCheck, DatabaseBackup, Download, History, TriangleAlert, Undo2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

const ETIQUETAS_REGISTRO: Record<string, string> = {
  exportacion: "Copia descargada",
  importacion: "Copia importada",
  deshacer: "Importación deshecha",
  migracion: "Datos actualizados",
  "demo-cargada": "DEMOSTRACIÓN cargada",
  "demo-quitada": "DEMOSTRACIÓN quitada",
}

type Mensaje = { tipo: "ok" | "error"; texto: string } | null

export function Copias() {
  const app = useApp()
  const entrada = useRef<HTMLInputElement>(null)
  const [preparada, setPreparada] = useState<{ nombre: string; validacion: ValidacionOk; resumen: ResumenImportacion } | null>(null)
  const [mensaje, setMensaje] = useState<Mensaje>(null)
  const [ocupado, setOcupado] = useState(false)

  const totales = [
    ["Fichas", app.fichas.length],
    ["Huecos de calendario", app.calendario.length],
    ["Episodios", app.episodiosSerie.length],
    ["Recursos de biblioteca", app.biblioteca.length],
  ] as const
  const demo =
    app.fichas.filter((f) => f.ejemplo).length +
    app.calendario.filter((h) => h.ejemplo).length +
    app.episodiosSerie.filter((e) => e.ejemplo).length +
    app.biblioteca.filter((r) => r.ejemplo).length

  async function leerArchivo(archivo: File) {
    setMensaje(null)
    setPreparada(null)
    if (!archivo.name.toLowerCase().endsWith(".json") && archivo.type !== "application/json") {
      setMensaje({ tipo: "error", texto: "Elige el archivo .json que descargaste desde Copias." })
      return
    }
    const texto = await archivo.text().catch(() => "")
    const resultado = app.previsualizarCopia(texto)
    if (!resultado.ok) {
      setMensaje({ tipo: "error", texto: resultado.error })
      toast.error(resultado.error)
      return
    }
    setPreparada({ nombre: archivo.name, validacion: resultado.validacion, resumen: resultado.resumen })
  }

  async function confirmar() {
    if (!preparada) return
    setOcupado(true)
    const resultado = await app.confirmarImportacion(preparada.validacion)
    setOcupado(false)
    if (resultado.ok) {
      setMensaje({ tipo: "ok", texto: resultado.mensaje })
      toast.success("Copia importada")
      setPreparada(null)
    } else {
      setMensaje({ tipo: "error", texto: resultado.error })
      toast.error(resultado.error)
    }
  }

  return (
    <main id="contenido" className="aparecer space-y-8">
      <header>
        <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">Copias</p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Copias de seguridad</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Los datos viven solo en este dispositivo. Una copia es un archivo JSON que puedes guardar o pasar a otro teléfono. Importar <strong>suma y actualiza</strong>: nunca borra lo que ya hay aquí.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Qué hay en este dispositivo">
        {totales.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
            <p className="text-sm text-muted-foreground">{etiqueta}</p>
            <p className="mt-1 font-heading text-3xl font-semibold">{valor}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <span className="grid size-12 place-items-center rounded-xl bg-primary text-white" aria-hidden><Download className="size-6" /></span>
          <h2 className="mt-3 font-heading text-xl font-semibold">Exportar copia</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Descarga todo: fichas con su historial, calendario, métricas, Sindi y Cato y biblioteca. Guárdala fuera del teléfono.</p>
          <Button
            type="button"
            className="mt-auto h-12 gap-2 self-start px-5"
            onClick={() => {
              app.exportarCopia()
              setMensaje({ tipo: "ok", texto: "Copia descargada. Búscala en la carpeta de descargas." })
              toast.success("Copia descargada")
            }}
          >
            <Download aria-hidden className="size-4" /> Descargar JSON
          </Button>
        </div>
        <div className="flex flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <span className="grid size-12 place-items-center rounded-xl bg-[#1C1C1C] text-white" aria-hidden><Upload className="size-6" /></span>
          <h2 className="mt-3 font-heading text-xl font-semibold">Importar copia</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Se comprueba el archivo y verás un resumen antes de aplicar nada. Admite copias de versiones anteriores.</p>
          <input
            ref={entrada}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Elegir archivo de copia"
            onChange={(e) => {
              const archivo = e.target.files?.[0]
              if (archivo) void leerArchivo(archivo)
              e.target.value = ""
            }}
          />
          <Button type="button" variant="outline" className="mt-auto h-12 gap-2 self-start px-5" onClick={() => entrada.current?.click()}>
            <Upload aria-hidden className="size-4" /> Elegir archivo
          </Button>
        </div>
      </section>

      {mensaje ? (
        <p
          role={mensaje.tipo === "error" ? "alert" : "status"}
          className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-medium ${mensaje.tipo === "error" ? "bg-destructive/10 text-destructive" : "bg-[#D9EFE4] text-[#0D5A40]"}`}
        >
          {mensaje.tipo === "error" ? <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" /> : <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0" />}
          {mensaje.texto}
        </p>
      ) : null}

      {preparada ? (
        <section className="rounded-2xl border-2 border-primary/40 bg-card p-5" aria-labelledby="resumen-importacion">
          <h2 id="resumen-importacion" className="font-heading text-xl font-semibold">Revisa antes de importar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {preparada.nombre} · copia v{preparada.resumen.version}
            {preparada.resumen.generadoEn ? ` · creada el ${formatoMomento(preparada.resumen.generadoEn)}` : ""}
          </p>
          {preparada.resumen.avisos.map((aviso) => (
            <p key={aviso} className="mt-2 rounded-lg bg-[#FFF6E8] px-3 py-2 text-sm text-[#1C1C1C]">{aviso}</p>
          ))}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="py-2 pr-3 font-semibold">Contenido</th>
                  <th className="py-2 pr-3 font-semibold">En el archivo</th>
                  <th className="py-2 pr-3 font-semibold">Nuevos</th>
                  <th className="py-2 pr-3 font-semibold">Actualizan</th>
                  <th className="py-2 font-semibold">Dañados</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(preparada.resumen.colecciones) as Array<keyof ResumenImportacion["colecciones"]>).map((clave) => {
                  const fila = preparada.resumen.colecciones[clave]
                  if (fila.total === 0 && fila.descartadas === 0) return null
                  return (
                    <tr key={clave} className="border-t border-border">
                      <td className="py-2 pr-3 font-medium">{NOMBRES_COLECCION[clave]}</td>
                      <td className="py-2 pr-3">{fila.total}</td>
                      <td className="py-2 pr-3">{fila.nuevas}</td>
                      <td className="py-2 pr-3">{fila.actualizadas}</td>
                      <td className="py-2">{fila.descartadas}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Antes de importar se guarda una instantánea para poder deshacer.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" className="h-12 px-5" disabled={ocupado} onClick={() => void confirmar()}>
              {ocupado ? "Importando…" : "Importar y fusionar"}
            </Button>
            <Button type="button" variant="outline" className="h-12" onClick={() => setPreparada(null)}>
              Cancelar
            </Button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><Undo2 aria-hidden className="size-5" /> Deshacer la última importación</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {app.deshacerDisponible ? `Hay una instantánea de antes de importar (${formatoMomento(app.deshacerDisponible)}).` : "No hay ninguna importación reciente que deshacer."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-11"
            disabled={!app.deshacerDisponible}
            onClick={() => {
              if (!window.confirm("¿Volver al estado de antes de la última importación? Los cambios hechos después de importar se perderán.")) return
              void app.deshacerImportacion().then((r) => {
                if (r.ok) {
                  setMensaje({ tipo: "ok", texto: "Importación deshecha." })
                  toast.success("Importación deshecha")
                } else setMensaje({ tipo: "error", texto: r.error })
              })
            }}
          >
            Deshacer
          </Button>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><DatabaseBackup aria-hidden className="size-5" /> Datos de DEMOSTRACIÓN</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {demo ? `Hay ${demo} elementos marcados como DEMOSTRACIÓN.` : "No hay datos de DEMOSTRACIÓN en este dispositivo."} Quitarlos no toca nada más.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => app.cargarDemostracion()}>
              Cargar DEMOSTRACIÓN
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={!demo}
              onClick={() => {
                if (!window.confirm("¿Quitar solo los datos marcados como DEMOSTRACIÓN?")) return
                const n = app.quitarDemostracion()
                toast.success(`${n} elementos de DEMOSTRACIÓN quitados`)
              }}
            >
              Quitar DEMOSTRACIÓN
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="registro-copias">
        <h2 id="registro-copias" className="flex items-center gap-2 font-heading text-xl font-semibold"><History aria-hidden className="size-5" /> Registro de copias</h2>
        <p className="mt-1 text-sm text-muted-foreground">Historial de exportaciones, importaciones y cambios de datos hechos en este dispositivo.</p>
        <ul className="mt-3 grid gap-2">
          {app.registroCopias.length === 0 ? (
            <li className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">Todavía no hay movimientos registrados.</li>
          ) : (
            app.registroCopias.slice(0, 30).map((item) => (
              <li key={item.id} className="rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-foreground/10">
                <p className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{ETIQUETAS_REGISTRO[item.tipo] ?? item.tipo}</span>
                  <span className="text-xs text-muted-foreground">{formatoMomento(item.en)}{item.porNombre ? ` · ${item.porNombre}` : ""}</span>
                </p>
                <p className="mt-1 text-muted-foreground">{item.detalle}</p>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  )
}
