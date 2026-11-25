"use client"

import { Campo, controlClass } from "@/components/campo"
import { EtiquetaDemo } from "@/components/etiqueta-demo"
import { useApp } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TIPOS_RECURSO, enlaceSeguro, nombreTipoRecurso, type RecursoBiblioteca, type TipoRecursoId } from "@/lib/biblioteca"
import { ISLAS, ISLA_FEDERACION, SECTORES, nombreIsla, nombreSector, type IslaId, type SectorId } from "@/lib/dominio"
import { rutaPublica } from "@/lib/rutas"
import { cn } from "@/lib/utils"
import { BookMarked, Copy, ExternalLink, FileText, Image as ImagenIcono, LayoutTemplate, Megaphone, Plus, ScrollText, Search, Video } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

const ICONOS: Record<TipoRecursoId, typeof FileText> = {
  guion: ScrollText,
  comunicado: Megaphone,
  imagen: ImagenIcono,
  video: Video,
  plantilla: LayoutTemplate,
  documentacion: BookMarked,
}

type Borrador = {
  tipo: TipoRecursoId
  titulo: string
  descripcion: string
  contenido: string
  referencia: string
  etiquetas: string
  isla: IslaId | ""
  sector: SectorId | ""
  autorizado: boolean
}

function borradorDe(recurso: RecursoBiblioteca | null, tipo: TipoRecursoId): Borrador {
  return {
    tipo: recurso?.tipo ?? tipo,
    titulo: recurso?.titulo ?? "",
    descripcion: recurso?.descripcion ?? "",
    contenido: recurso?.contenido ?? "",
    referencia: recurso?.referencia ?? "",
    etiquetas: recurso?.etiquetas.join(", ") ?? "",
    isla: recurso?.isla ?? "",
    sector: recurso?.sector ?? "",
    autorizado: recurso?.autorizado ?? false,
  }
}

export function Biblioteca() {
  const app = useApp()
  const [tipo, setTipo] = useState<TipoRecursoId | "todos">("todos")
  const [consulta, setConsulta] = useState("")
  const [editando, setEditando] = useState<RecursoBiblioteca | "nuevo" | null>(null)
  const [viendo, setViendo] = useState<RecursoBiblioteca | null>(null)

  const lista = useMemo(() => {
    const q = consulta.trim().toLowerCase()
    return app.biblioteca
      .filter((item) => tipo === "todos" || item.tipo === tipo)
      .filter((item) => !q || `${item.titulo} ${item.descripcion} ${item.contenido} ${item.etiquetas.join(" ")}`.toLowerCase().includes(q))
      .sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn))
  }, [app.biblioteca, tipo, consulta])

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto)
      toast.success("Texto copiado")
    } catch {
      toast.error("No se pudo copiar. Selecciónalo y cópialo a mano.")
    }
  }

  return (
    <main id="contenido" className="aparecer space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">Biblioteca</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Materiales del equipo</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Guiones, comunicados, plantillas y referencias a imágenes, vídeos y documentación. La app guarda el texto y la referencia de dónde está cada archivo; no sube archivos a ningún sitio.
          </p>
        </div>
        <Button type="button" className="h-12 gap-2 px-4" onClick={() => setEditando("nuevo")}>
          <Plus aria-hidden className="size-4" /> Añadir recurso
        </Button>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Tipo de recurso">
        <Chip activo={tipo === "todos"} onClick={() => setTipo("todos")}>
          Todo ({app.biblioteca.length})
        </Chip>
        {TIPOS_RECURSO.map((item) => {
          const Icono = ICONOS[item.id]
          return (
            <Chip key={item.id} activo={tipo === item.id} onClick={() => setTipo(item.id)}>
              <Icono aria-hidden className="size-4" /> {item.nombre} ({app.biblioteca.filter((r) => r.tipo === item.id).length})
            </Chip>
          )
        })}
      </div>

      <label className="relative block">
        <span className="sr-only">Buscar en la biblioteca</span>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-12 pl-9 text-base md:text-base" value={consulta} onChange={(e) => setConsulta(e.target.value)} placeholder="Buscar por título, texto o etiqueta" />
      </label>

      {tipo !== "todos" ? <p className="text-sm text-muted-foreground">{TIPOS_RECURSO.find((item) => item.id === tipo)?.detalle}</p> : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {lista.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground sm:col-span-2">
            {app.biblioteca.length === 0
              ? "La biblioteca está vacía. Añade el primer recurso o carga la DEMOSTRACIÓN desde Inicio."
              : "Ningún recurso coincide con la búsqueda."}
          </li>
        ) : (
          lista.map((recurso) => {
            const Icono = ICONOS[recurso.tipo]
            return (
              <li key={recurso.id} className="flex flex-col rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                    <Icono className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {nombreTipoRecurso(recurso.tipo)}
                      {recurso.ejemplo ? <EtiquetaDemo /> : null}
                      {recurso.autorizado ? <span className="rounded-full bg-[#D9EFE4] px-2 py-0.5 text-[11px] text-[#0D5A40] normal-case">Uso autorizado</span> : null}
                    </p>
                    <h2 className="mt-1 font-heading text-lg leading-snug font-semibold">{recurso.titulo}</h2>
                  </div>
                </div>
                {recurso.descripcion ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{recurso.descripcion}</p> : null}
                {recurso.etiquetas.length ? (
                  <p className="mt-2 flex flex-wrap gap-1">
                    {recurso.etiquetas.map((etiqueta) => (
                      <span key={etiqueta} className="rounded-full bg-muted px-2 py-0.5 text-xs">#{etiqueta}</span>
                    ))}
                  </p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Button type="button" variant="outline" className="h-11" onClick={() => setViendo(recurso)}>
                    Abrir
                  </Button>
                  {recurso.contenido ? (
                    <Button type="button" variant="outline" className="h-11 gap-1" onClick={() => void copiar(recurso.contenido)}>
                      <Copy aria-hidden className="size-4" /> Copiar texto
                    </Button>
                  ) : null}
                  <Button type="button" variant="ghost" className="h-11" onClick={() => setEditando(recurso)}>
                    Editar
                  </Button>
                </div>
              </li>
            )
          })
        )}
      </ul>

      <Dialog open={Boolean(viendo)} onOpenChange={(abierto) => !abierto && setViendo(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          {viendo ? (
            <>
              <DialogHeader>
                <DialogTitle>{viendo.titulo}</DialogTitle>
                <DialogDescription>
                  {nombreTipoRecurso(viendo.tipo)}
                  {viendo.isla ? ` · ${nombreIsla(viendo.isla)}` : ""}
                  {viendo.sector ? ` · ${nombreSector(viendo.sector)}` : ""}
                  {viendo.ejemplo ? " · DEMOSTRACIÓN" : ""}
                </DialogDescription>
              </DialogHeader>
              {viendo.descripcion ? <p className="text-sm leading-relaxed">{viendo.descripcion}</p> : null}
              {viendo.tipo === "imagen" && viendo.referencia.startsWith("imagenes/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={rutaPublica(`/${viendo.referencia}`)} alt={viendo.titulo} className="w-full rounded-xl ring-1 ring-border" />
              ) : null}
              {viendo.contenido ? (
                <pre className="rounded-xl bg-muted p-3 font-sans text-sm leading-relaxed whitespace-pre-wrap">{viendo.contenido}</pre>
              ) : null}
              {viendo.referencia ? (
                <div className="rounded-xl bg-card p-3 text-sm ring-1 ring-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Dónde está</p>
                  {enlaceSeguro(viendo.referencia) ? (
                    <a href={enlaceSeguro(viendo.referencia)!} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 font-medium break-all text-primary underline underline-offset-4">
                      {viendo.referencia} <ExternalLink aria-hidden className="size-3.5" />
                    </a>
                  ) : (
                    <p className="mt-1 break-all">{viendo.referencia}</p>
                  )}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {viendo.contenido ? (
                  <Button type="button" className="h-11 gap-1" onClick={() => void copiar(viendo.contenido)}>
                    <Copy aria-hidden className="size-4" /> Copiar texto
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11"
                  onClick={() => {
                    if (!window.confirm("¿Borrar este recurso de la biblioteca de este dispositivo?")) return
                    const r = app.borrarRecurso(viendo.id)
                    if (r.ok) {
                      toast.success("Recurso borrado")
                      setViendo(null)
                    } else toast.error(r.error)
                  }}
                >
                  Borrar
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editando)} onOpenChange={(abierto) => !abierto && setEditando(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando === "nuevo" ? "Nuevo recurso" : "Editar recurso"}</DialogTitle>
            <DialogDescription>No subas datos personales, nóminas ni expedientes. Solo material que el equipo pueda reutilizar.</DialogDescription>
          </DialogHeader>
          {editando ? (
            <FormularioRecurso
              inicial={borradorDe(editando === "nuevo" ? null : editando, tipo === "todos" ? "guion" : tipo)}
              onCancelar={() => setEditando(null)}
              onGuardar={(datos) => {
                const r = app.guardarRecurso(datos, editando === "nuevo" ? undefined : editando.id)
                if (!r.ok) {
                  toast.error(r.error)
                  return
                }
                toast.success("Recurso guardado en la biblioteca")
                setEditando(null)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  )
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activo}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium ring-1",
        activo ? "bg-primary text-white ring-primary" : "bg-card text-foreground ring-border",
      )}
    >
      {children}
    </button>
  )
}

function FormularioRecurso({ inicial, onGuardar, onCancelar }: { inicial: Borrador; onGuardar: (datos: Borrador) => void; onCancelar: () => void }) {
  const [datos, setDatos] = useState(inicial)
  const poner = <K extends keyof Borrador>(clave: K, valor: Borrador[K]) => setDatos((prev) => ({ ...prev, [clave]: valor }))
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onGuardar(datos)
      }}
    >
      <Campo id="rec-tipo" etiqueta="Tipo">
        <select id="rec-tipo" className={controlClass()} value={datos.tipo} onChange={(e) => poner("tipo", e.target.value as TipoRecursoId)}>
          {TIPOS_RECURSO.map((item) => (
            <option key={item.id} value={item.id}>{item.singular}</option>
          ))}
        </select>
      </Campo>
      <Campo id="rec-titulo" etiqueta="Título">
        <Input id="rec-titulo" className="h-11 text-base md:text-base" value={datos.titulo} onChange={(e) => poner("titulo", e.target.value)} />
      </Campo>
      <Campo id="rec-desc" etiqueta="Descripción">
        <Textarea id="rec-desc" className="min-h-20 text-base" value={datos.descripcion} onChange={(e) => poner("descripcion", e.target.value)} />
      </Campo>
      <Campo id="rec-contenido" etiqueta="Texto reutilizable (opcional)" ayuda="Guion, comunicado o plantilla para copiar.">
        <Textarea id="rec-contenido" className="min-h-32 text-base" value={datos.contenido} onChange={(e) => poner("contenido", e.target.value)} />
      </Campo>
      <Campo id="rec-ref" etiqueta="Referencia del archivo (opcional)" ayuda="Enlace https, carpeta compartida o nombre del archivo.">
        <Input id="rec-ref" className="h-11 text-base md:text-base" value={datos.referencia} onChange={(e) => poner("referencia", e.target.value)} />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="rec-isla" etiqueta="Isla (opcional)">
          <select id="rec-isla" className={controlClass()} value={datos.isla} onChange={(e) => poner("isla", e.target.value as IslaId | "")}>
            <option value="">Sin isla</option>
            {ISLAS.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
            <option value={ISLA_FEDERACION.id}>{ISLA_FEDERACION.nombre}</option>
          </select>
        </Campo>
        <Campo id="rec-sector" etiqueta="Sector (opcional)">
          <select id="rec-sector" className={controlClass()} value={datos.sector} onChange={(e) => poner("sector", e.target.value as SectorId | "")}>
            <option value="">Sin sector</option>
            {SECTORES.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
          </select>
        </Campo>
      </div>
      <Campo id="rec-etiquetas" etiqueta="Etiquetas" ayuda="Separadas por comas.">
        <Input id="rec-etiquetas" className="h-11 text-base md:text-base" value={datos.etiquetas} onChange={(e) => poner("etiquetas", e.target.value)} />
      </Campo>
      <label className="flex items-start gap-3 text-sm">
        <Checkbox className="mt-0.5 size-5" checked={datos.autorizado} onCheckedChange={(v) => poner("autorizado", v)} />
        Material con uso autorizado por la federación.
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="h-11 px-5">Guardar</Button>
        <Button type="button" variant="outline" className="h-11" onClick={onCancelar}>Cancelar</Button>
      </div>
    </form>
  )
}
