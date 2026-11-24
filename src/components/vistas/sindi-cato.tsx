"use client"

import { Campo, controlClass } from "@/components/campo"
import { useApp } from "@/components/proveedor"
import { RetratoSindiYCato } from "@/components/retrato-sindi-cato"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ETIQUETAS_CHECKLIST,
  ESTADOS_PRODUCCION,
  FORMATOS_AV,
  MODULOS_SERIE,
  PLATAFORMAS_PUB,
  SECTORES_SERIE,
  TIPOS_DOCUMENTO,
  checklistCompleto,
  nombreEstadoProduccion,
  nombrePlataformaPub,
  nombreSectorSerie,
  nombreTipoDocumento,
  resolverImagenRef,
  type ChecklistRevision,
  type DocumentoSerie,
  type EpisodioSerie,
  type EstadoProduccionId,
  type FormatoAvId,
  type ModuloSerieId,
  type PersonajeSerie,
  type PlataformaPubId,
  type PublicacionSerie,
  type SectorSerieId,
  type TipoDocumentoId,
} from "@/lib/sindi-cato"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

const TEXTO = {
  kicker: "🎬 SINDI Y CATO",
  subtitulo: "Área de creación y administración de contenidos",
  intro: [
    "Sindi y Cato es una serie audiovisual de divulgación laboral creada para acercar el mundo del trabajo, los derechos laborales y la acción sindical a las personas trabajadoras de Canarias.",
    "A través de dos personajes animados, cercanos y reconocibles, la serie presenta situaciones cotidianas de diferentes sectores profesionales: hostelería, comercio, alimentación, transporte, servicios y otros ámbitos laborales.",
  ],
  sindi:
    "Sindi es una trabajadora comprometida y delegada sindical. Cercana, inteligente y firme, ayuda a comprender los derechos laborales y explica cómo actuar ante situaciones injustas.",
  cato:
    "Cato es un trabajador del sector de la hostelería. Simpático, espontáneo y con sentido del humor, representa las inquietudes y experiencias de miles de trabajadores.",
  ambos:
    "Ambos viven en Gran Canaria y protagonizan historias que combinan información, entretenimiento, pedagogía y compromiso social.",
  objetivosTitulo: "Objetivos de la sección",
  objetivos: [
    "Crear y organizar episodios de la serie.",
    "Desarrollar guiones, diálogos y situaciones laborales.",
    "Generar imágenes y vídeos mediante herramientas de inteligencia artificial.",
    "Mantener la continuidad visual y narrativa de los personajes.",
    "Revisar la precisión de la información laboral y sindical.",
    "Preparar publicaciones para TikTok, Instagram, Facebook y otros canales.",
    "Coordinar la revisión y aprobación de contenidos antes de su publicación.",
    "Mantener un archivo histórico de episodios y materiales.",
  ],
  panelTitulo: "Panel de creadores y administración",
  panelIntro: "Espacio de trabajo para gestionar todo el proceso creativo:",
  identidadTitulo: "Identidad editorial",
  identidad: [
    "La serie debe mantener un lenguaje sencillo, humano y comprensible. Los personajes no sustituyen el asesoramiento sindical ni jurídico: ayudan a explicar situaciones reales y a orientar a las personas trabajadoras.",
    "Los casos reales deben documentarse, proteger la identidad de las personas implicadas y diferenciar claramente los hechos acreditados de las recreaciones dramatizadas.",
  ],
  lema: "Sindi y Cato: historias de trabajadores, derechos que importan.",
  cierre: "Una iniciativa de comunicación y divulgación de UGT FeSMC Canarias.",
}

const CLASES_ESTADO: Record<EstadoProduccionId, string> = {
  idea: "bg-[#F3EFEA] text-[#1C1C1C] dark:bg-[#2a2a2a] dark:text-white",
  guion: "bg-[#F8E0E2] text-[#8E0B16]",
  produccion: "bg-[#F3E4C4] text-[#1C1C1C]",
  revision: "bg-[#E4E7F2] text-[#1C1C1C]",
  aprobado: "bg-[#D9EFE4] text-[#0D5A40]",
  publicado: "bg-[#1C1C1C] text-white",
}

function PillEstado({ estado }: { estado: EstadoProduccionId }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", CLASES_ESTADO[estado])}>
      {nombreEstadoProduccion(estado)}
    </span>
  )
}

function esModulo(valor: string): valor is ModuloSerieId {
  return MODULOS_SERIE.some((item) => item.id === valor)
}

export function SindiYCato() {
  const app = useApp()
  const [modulo, setModulo] = useState<ModuloSerieId>(() => {
    if (typeof window === "undefined") return "personajes"
    const hash = window.location.hash.replace(/^#/, "")
    if (hash.startsWith("/importar-sindi")) return "revision"
    const id = hash.split("?")[0]
    return esModulo(id) ? id : "personajes"
  })

  useEffect(() => {
    function aplicar() {
      const hash = window.location.hash.replace(/^#/, "")
      if (hash.startsWith("/importar-sindi")) {
        setModulo("revision")
        return
      }
      const id = hash.split("?")[0]
      if (esModulo(id)) setModulo(id)
    }
    window.addEventListener("hashchange", aplicar)
    return () => window.removeEventListener("hashchange", aplicar)
  }, [])

  const moduloActivo: ModuloSerieId =
    app.importadaId && app.episodiosSerie.some((item) => item.id === app.importadaId) ? "revision" : modulo

  function ir(id: ModuloSerieId) {
    if (app.importadaId) app.limpiarImportada()
    setModulo(id)
    const base = `${window.location.pathname}${window.location.search}`
    history.replaceState(null, "", `${base}#${id}`)
  }

  return (
    <main id="contenido" className="aparecer space-y-10">
      <header className="space-y-5">
        <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">{TEXTO.kicker}</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{TEXTO.subtitulo}</h1>
        <RetratoSindiYCato variante="hero" className="mx-auto max-w-lg" />
        {TEXTO.intro.map((parrafo) => (
          <p key={parrafo} className="max-w-3xl text-base leading-relaxed">
            {parrafo}
          </p>
        ))}
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl bg-card p-5 shadow-[0_16px_40px_-24px_rgba(227,6,19,0.3)] ring-1 ring-foreground/10">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">Sindi</p>
          <p className="mt-2 text-base leading-relaxed">{TEXTO.sindi}</p>
        </article>
        <article className="rounded-3xl bg-card p-5 shadow-[0_16px_40px_-24px_rgba(28,28,28,0.2)] ring-1 ring-foreground/10">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">Cato</p>
          <p className="mt-2 text-base leading-relaxed">{TEXTO.cato}</p>
        </article>
      </section>
      <p className="max-w-3xl text-base leading-relaxed">{TEXTO.ambos}</p>

      <section className="space-y-3">
        <h2 className="font-heading text-2xl font-semibold">{TEXTO.objetivosTitulo}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {TEXTO.objetivos.map((item) => (
            <li key={item} className="rounded-2xl bg-card px-4 py-3 text-sm leading-relaxed ring-1 ring-foreground/10">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section id="panel" className="scroll-mt-24 space-y-5">
        <header className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold">{TEXTO.panelTitulo}</h2>
          <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">{TEXTO.panelIntro}</p>
        </header>
        {app.usuario ? (
          <Panel modulo={moduloActivo} onModulo={ir} />
        ) : (
          <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="text-base leading-relaxed">
              Elige un perfil en este dispositivo para abrir el panel de creadores: personajes, episodios, producción, documentación, revisión y publicaciones. Todo se queda en el teléfono.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Elegir perfil
            </Link>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-2xl font-semibold">{TEXTO.identidadTitulo}</h2>
        {TEXTO.identidad.map((parrafo) => (
          <p key={parrafo} className="max-w-3xl text-base leading-relaxed">
            {parrafo}
          </p>
        ))}
      </section>

      <footer className="rounded-3xl bg-[#1C1C1C] px-6 py-8 text-white shadow-[0_24px_50px_-24px_rgba(28,28,28,0.55)]">
        <p className="font-heading text-2xl font-semibold tracking-tight">{TEXTO.lema}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/75">{TEXTO.cierre}</p>
      </footer>
    </main>
  )
}

function Panel({ modulo, onModulo }: { modulo: ModuloSerieId; onModulo: (id: ModuloSerieId) => void }) {
  return (
    <div className="space-y-4">
      <nav className="-mx-1 overflow-x-auto px-1" aria-label="Módulos del panel">
        <ul className="flex min-w-max gap-2">
          {MODULOS_SERIE.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onModulo(item.id)}
                aria-current={modulo === item.id ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium ring-1 ring-border",
                  modulo === item.id ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-foreground hover:bg-muted",
                )}
              >
                {item.etiqueta}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="rounded-3xl bg-card p-4 ring-1 ring-foreground/10 sm:p-6">
        {modulo === "personajes" ? <ModuloPersonajes /> : null}
        {modulo === "episodios" ? <ModuloEpisodios /> : null}
        {modulo === "produccion" ? <ModuloProduccion /> : null}
        {modulo === "documentacion" ? <ModuloDocumentacion /> : null}
        {modulo === "revision" ? <ModuloRevision /> : null}
        {modulo === "publicaciones" ? <ModuloPublicaciones /> : null}
      </div>
    </div>
  )
}

function ModuloPersonajes() {
  const app = useApp()
  const [editando, setEditando] = useState<PersonajeSerie | "nuevo" | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold">Personajes</h3>
          <p className="mt-1 text-sm text-muted-foreground">Fichas de Sindi y Cato, apariencia, vestuario, personalidad, voces y referencias visuales.</p>
        </div>
        <Button type="button" className="h-11" onClick={() => setEditando("nuevo")}>
          Nueva ficha
        </Button>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {app.personajesSerie.map((personaje) => (
          <li key={personaje.id} className="overflow-hidden rounded-2xl ring-1 ring-foreground/10">
            {personaje.imagenRef ? (
              // Static export: the official portrait is already optimized in /public.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolverImagenRef(personaje.imagenRef)}
                alt={personaje.nombre}
                className="h-40 w-full object-cover object-center"
              />
            ) : null}
            <div className="space-y-2 p-4">
              <p className="font-heading text-lg font-semibold">{personaje.nombre}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{personaje.descripcion}</p>
              <p className="text-sm leading-relaxed">{personaje.personalidad}</p>
              <dl className="grid gap-2 text-sm">
                <Dato etiqueta="Apariencia" valor={personaje.apariencia} />
                <Dato etiqueta="Vestuario" valor={personaje.vestuario} />
                <Dato etiqueta="Voz" valor={personaje.voz} />
                <Dato etiqueta="Referencias visuales" valor={personaje.referenciasVisuales} />
              </dl>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="h-11 flex-1" onClick={() => setEditando(personaje)}>
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11"
                  onClick={() => {
                    if (!window.confirm(`¿Borrar la ficha de ${personaje.nombre}?`)) return
                    const resultado = app.borrarPersonaje(personaje.id)
                    if (!resultado.ok) toast.error(resultado.error)
                    else toast.success("Ficha borrada")
                  }}
                >
                  Borrar
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {app.personajesSerie.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay fichas. Puedes crearlas o cargar el ejemplo en Inicio para recuperar a Sindi y Cato.</p>
      ) : null}
      <Dialog open={Boolean(editando)} onOpenChange={(abierto) => !abierto && setEditando(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando === "nuevo" ? "Nueva ficha de personaje" : "Editar personaje"}</DialogTitle>
          </DialogHeader>
          {editando ? (
            <FormularioPersonaje
              inicial={editando === "nuevo" ? null : editando}
              onCancelar={() => setEditando(null)}
              onGuardar={(datos) => {
                const resultado = app.guardarPersonaje(datos, editando === "nuevo" ? undefined : editando.id)
                if (!resultado.ok) {
                  toast.error(resultado.error)
                  return
                }
                toast.success("Ficha guardada")
                setEditando(null)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  if (!valor) return null
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-primary uppercase">{etiqueta}</dt>
      <dd className="mt-0.5 leading-relaxed text-muted-foreground">{valor}</dd>
    </div>
  )
}

function FormularioPersonaje({
  inicial,
  onGuardar,
  onCancelar,
}: {
  inicial: PersonajeSerie | null
  onGuardar: (datos: Record<string, unknown>) => void
  onCancelar: () => void
}) {
  const [datos, setDatos] = useState({
    nombre: inicial?.nombre ?? "",
    descripcion: inicial?.descripcion ?? "",
    apariencia: inicial?.apariencia ?? "",
    vestuario: inicial?.vestuario ?? "",
    personalidad: inicial?.personalidad ?? "",
    voz: inicial?.voz ?? "",
    referenciasVisuales: inicial?.referenciasVisuales ?? "",
    imagenRef: inicial?.imagenRef ?? "",
  })
  function poner(clave: keyof typeof datos, valor: string) {
    setDatos((prev) => ({ ...prev, [clave]: valor }))
  }
  return (
    <form
      className="grid gap-3"
      onSubmit={(evento) => {
        evento.preventDefault()
        onGuardar(datos)
      }}
    >
      <Campo id="per-nombre" etiqueta="Nombre">
        <Input id="per-nombre" value={datos.nombre} onChange={(e) => poner("nombre", e.target.value)} required />
      </Campo>
      <Campo id="per-desc" etiqueta="Descripción">
        <Textarea id="per-desc" value={datos.descripcion} onChange={(e) => poner("descripcion", e.target.value)} />
      </Campo>
      <Campo id="per-apariencia" etiqueta="Apariencia">
        <Textarea id="per-apariencia" value={datos.apariencia} onChange={(e) => poner("apariencia", e.target.value)} />
      </Campo>
      <Campo id="per-vestuario" etiqueta="Vestuario">
        <Textarea id="per-vestuario" value={datos.vestuario} onChange={(e) => poner("vestuario", e.target.value)} />
      </Campo>
      <Campo id="per-personalidad" etiqueta="Personalidad">
        <Textarea id="per-personalidad" value={datos.personalidad} onChange={(e) => poner("personalidad", e.target.value)} />
      </Campo>
      <Campo id="per-voz" etiqueta="Voz">
        <Textarea id="per-voz" value={datos.voz} onChange={(e) => poner("voz", e.target.value)} />
      </Campo>
      <Campo id="per-ref" etiqueta="Referencias visuales">
        <Textarea id="per-ref" value={datos.referenciasVisuales} onChange={(e) => poner("referenciasVisuales", e.target.value)} />
      </Campo>
      <Campo id="per-img" etiqueta="Imagen de referencia" ayuda="Ruta de la app o un enlace.">
        <Input id="per-img" value={datos.imagenRef} onChange={(e) => poner("imagenRef", e.target.value)} />
      </Campo>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="h-11 flex-1" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" className="h-11 flex-1">
          Guardar
        </Button>
      </div>
    </form>
  )
}

function ModuloEpisodios() {
  const app = useApp()
  const [editando, setEditando] = useState<EpisodioSerie | "nuevo" | null>(null)
  const [filtro, setFiltro] = useState("todos")

  const lista = app.episodiosSerie.filter((item) => filtro === "todos" || item.estado === filtro)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold">Episodios</h3>
          <p className="mt-1 text-sm text-muted-foreground">Listado de capítulos, temática, sector laboral, sinopsis, guiones y estado de producción.</p>
        </div>
        <Button type="button" className="h-11" onClick={() => setEditando("nuevo")}>
          Nuevo episodio
        </Button>
      </div>
      <select className={controlClass("w-auto")} value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar por estado">
        <option value="todos">Todos los estados</option>
        {ESTADOS_PRODUCCION.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nombre}
          </option>
        ))}
      </select>
      <ul className="grid gap-3">
        {lista.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            Aún no hay episodios{filtro !== "todos" ? " en este estado" : ""}. Crea uno o carga el ejemplo en Inicio.
          </li>
        ) : (
          lista.map((episodio) => (
            <li key={episodio.id} className="rounded-2xl p-4 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-heading text-lg font-semibold">{episodio.titulo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {nombreSectorSerie(episodio.sector)}
                    {episodio.tematica ? ` · ${episodio.tematica}` : ""}
                    {episodio.ejemplo ? " · Ejemplo" : ""}
                  </p>
                </div>
                <PillEstado estado={episodio.estado} />
              </div>
              {episodio.sinopsis ? <p className="mt-2 text-sm leading-relaxed">{episodio.sinopsis}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="h-11" onClick={() => setEditando(episodio)}>
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11"
                  onClick={() => {
                    if (!window.confirm("¿Borrar este episodio y desvincularlo de documentos y publicaciones?")) return
                    const resultado = app.borrarEpisodio(episodio.id)
                    if (!resultado.ok) toast.error(resultado.error)
                    else toast.success("Episodio borrado")
                  }}
                >
                  Borrar
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>
      <Dialog open={Boolean(editando)} onOpenChange={(abierto) => !abierto && setEditando(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando === "nuevo" ? "Nuevo episodio" : "Editar episodio"}</DialogTitle>
          </DialogHeader>
          {editando ? (
            <FormularioEpisodio
              inicial={editando === "nuevo" ? null : editando}
              onCancelar={() => setEditando(null)}
              onGuardar={(datos) => {
                const resultado = app.guardarEpisodio(datos, editando === "nuevo" ? undefined : editando.id)
                if (!resultado.ok) {
                  toast.error(resultado.error)
                  return
                }
                toast.success("Episodio guardado")
                setEditando(null)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FormularioEpisodio({
  inicial,
  onGuardar,
  onCancelar,
}: {
  inicial: EpisodioSerie | null
  onGuardar: (datos: Record<string, unknown>) => void
  onCancelar: () => void
}) {
  const [datos, setDatos] = useState({
    titulo: inicial?.titulo ?? "",
    tematica: inicial?.tematica ?? "",
    sector: (inicial?.sector ?? "hosteleria") as SectorSerieId,
    sinopsis: inicial?.sinopsis ?? "",
    guion: inicial?.guion ?? "",
    estado: (inicial?.estado ?? "idea") as EstadoProduccionId,
  })
  return (
    <form
      className="grid gap-3"
      onSubmit={(evento) => {
        evento.preventDefault()
        onGuardar({ ...inicial, ...datos })
      }}
    >
      <Campo id="ep-titulo" etiqueta="Título">
        <Input id="ep-titulo" value={datos.titulo} onChange={(e) => setDatos({ ...datos, titulo: e.target.value })} required />
      </Campo>
      <Campo id="ep-tematica" etiqueta="Temática">
        <Input id="ep-tematica" value={datos.tematica} onChange={(e) => setDatos({ ...datos, tematica: e.target.value })} />
      </Campo>
      <Campo id="ep-sector" etiqueta="Sector laboral">
        <select id="ep-sector" className={controlClass()} value={datos.sector} onChange={(e) => setDatos({ ...datos, sector: e.target.value as SectorSerieId })}>
          {SECTORES_SERIE.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <Campo id="ep-estado" etiqueta="Estado de producción">
        <select id="ep-estado" className={controlClass()} value={datos.estado} onChange={(e) => setDatos({ ...datos, estado: e.target.value as EstadoProduccionId })}>
          {ESTADOS_PRODUCCION.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <Campo id="ep-sinopsis" etiqueta="Sinopsis">
        <Textarea id="ep-sinopsis" value={datos.sinopsis} onChange={(e) => setDatos({ ...datos, sinopsis: e.target.value })} />
      </Campo>
      <Campo id="ep-guion" etiqueta="Guion" ayuda="Diálogos y situaciones. Puede ser un texto largo.">
        <Textarea id="ep-guion" className="min-h-40" value={datos.guion} onChange={(e) => setDatos({ ...datos, guion: e.target.value })} />
      </Campo>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="h-11 flex-1" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" className="h-11 flex-1">
          Guardar
        </Button>
      </div>
    </form>
  )
}

function SelectorEpisodio({
  valor,
  onChange,
  etiqueta = "Episodio",
}: {
  valor: string
  onChange: (id: string) => void
  etiqueta?: string
}) {
  const { episodiosSerie } = useApp()
  return (
    <Campo id="sel-episodio" etiqueta={etiqueta}>
      <select id="sel-episodio" className={controlClass()} value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">Elige un episodio</option>
        {episodiosSerie.map((item) => (
          <option key={item.id} value={item.id}>
            {item.titulo}
            {item.ejemplo ? " (ejemplo)" : ""}
          </option>
        ))}
      </select>
    </Campo>
  )
}

function ModuloProduccion() {
  const app = useApp()
  const [idElegido, setId] = useState(app.episodiosSerie[0]?.id ?? "")
  const id = idElegido || app.episodiosSerie[0]?.id || ""
  const episodio = app.episodiosSerie.find((item) => item.id === id)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-xl font-semibold">Producción audiovisual</h3>
        <p className="mt-1 text-sm text-muted-foreground">Prompts para generación de imágenes y vídeos, escenas, duración, formato y materiales de referencia.</p>
      </div>
      {app.episodiosSerie.length === 0 ? (
        <p className="text-sm text-muted-foreground">Crea un episodio antes de rellenar la producción.</p>
      ) : (
        <>
          <SelectorEpisodio valor={id} onChange={setId} />
          {episodio ? <FormularioProduccion key={episodio.id} episodio={episodio} /> : null}
        </>
      )}
    </div>
  )
}


function FormularioProduccion({ episodio }: { episodio: EpisodioSerie }) {
  const app = useApp()
  const [datos, setDatos] = useState({
    promptImagen: episodio.promptImagen,
    promptVideo: episodio.promptVideo,
    escenas: episodio.escenas,
    duracion: episodio.duracion,
    formato: episodio.formato,
    materialesRef: episodio.materialesRef,
  })

  async function copiar(texto: string, que: string) {
    if (!texto.trim()) {
      toast.error(`No hay ${que} que copiar.`)
      return
    }
    try {
      await navigator.clipboard.writeText(texto)
      toast.success("Texto copiado")
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto a mano.")
    }
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(evento) => {
        evento.preventDefault()
        const resultado = app.guardarEpisodio({ ...episodio, ...datos }, episodio.id)
        if (!resultado.ok) toast.error(resultado.error)
        else toast.success("Producción guardada")
      }}
    >
      <Campo id="pr-img" etiqueta="Prompt de imagen">
        <Textarea id="pr-img" className="min-h-28" value={datos.promptImagen} onChange={(e) => setDatos({ ...datos, promptImagen: e.target.value })} />
      </Campo>
      <Button type="button" variant="outline" className="h-11 w-fit" onClick={() => void copiar(datos.promptImagen, "prompt de imagen")}>
        Copiar prompt de imagen
      </Button>
      <Campo id="pr-video" etiqueta="Prompt de vídeo">
        <Textarea id="pr-video" className="min-h-28" value={datos.promptVideo} onChange={(e) => setDatos({ ...datos, promptVideo: e.target.value })} />
      </Campo>
      <Button type="button" variant="outline" className="h-11 w-fit" onClick={() => void copiar(datos.promptVideo, "prompt de vídeo")}>
        Copiar prompt de vídeo
      </Button>
      <Campo id="pr-escenas" etiqueta="Escenas">
        <Textarea id="pr-escenas" value={datos.escenas} onChange={(e) => setDatos({ ...datos, escenas: e.target.value })} />
      </Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo id="pr-duracion" etiqueta="Duración">
          <Input id="pr-duracion" value={datos.duracion} onChange={(e) => setDatos({ ...datos, duracion: e.target.value })} placeholder="35 s" />
        </Campo>
        <Campo id="pr-formato" etiqueta="Formato">
          <select id="pr-formato" className={controlClass()} value={datos.formato} onChange={(e) => setDatos({ ...datos, formato: e.target.value as FormatoAvId })}>
            {FORMATOS_AV.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <Campo id="pr-mat" etiqueta="Materiales de referencia" ayuda="Enlaces, uno por línea.">
        <Textarea id="pr-mat" value={datos.materialesRef} onChange={(e) => setDatos({ ...datos, materialesRef: e.target.value })} />
      </Campo>
      <Button type="submit" className="h-11">
        Guardar producción
      </Button>
    </form>
  )
}

function ModuloDocumentacion() {
  const app = useApp()
  const [editando, setEditando] = useState<DocumentoSerie | "nuevo" | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold">Documentación</h3>
          <p className="mt-1 text-sm text-muted-foreground">Convenios colectivos, legislación, sentencias judiciales, fuentes oficiales y documentación sindical.</p>
        </div>
        <Button type="button" className="h-11" onClick={() => setEditando("nuevo")}>
          Nueva entrada
        </Button>
      </div>
      <ul className="grid gap-3">
        {app.documentosSerie.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">Todavía no hay documentación guardada en este dispositivo.</li>
        ) : (
          app.documentosSerie.map((doc) => (
            <li key={doc.id} className="rounded-2xl p-4 ring-1 ring-foreground/10">
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">{nombreTipoDocumento(doc.tipo)}</p>
              <p className="mt-1 font-heading text-lg font-semibold">{doc.titulo}</p>
              {doc.enlace ? (
                <a href={doc.enlace} className="mt-1 inline-block break-all text-sm font-medium text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                  {doc.enlace}
                </a>
              ) : null}
              {doc.notas ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{doc.notas}</p> : null}
              {doc.episodioIds.length > 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Vinculado a:{" "}
                  {doc.episodioIds
                    .map((id) => app.episodiosSerie.find((item) => item.id === id)?.titulo ?? "episodio")
                    .join(", ")}
                </p>
              ) : null}
              <div className="mt-3 flex gap-2">
                <Button type="button" variant="outline" className="h-11" onClick={() => setEditando(doc)}>
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11"
                  onClick={() => {
                    if (!window.confirm("¿Borrar esta entrada?")) return
                    const resultado = app.borrarDocumento(doc.id)
                    if (!resultado.ok) toast.error(resultado.error)
                    else toast.success("Entrada borrada")
                  }}
                >
                  Borrar
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>
      <Dialog open={Boolean(editando)} onOpenChange={(abierto) => !abierto && setEditando(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando === "nuevo" ? "Nueva documentación" : "Editar documentación"}</DialogTitle>
          </DialogHeader>
          {editando ? (
            <FormularioDocumento
              inicial={editando === "nuevo" ? null : editando}
              episodios={app.episodiosSerie}
              onCancelar={() => setEditando(null)}
              onGuardar={(datos) => {
                const resultado = app.guardarDocumento(datos, editando === "nuevo" ? undefined : editando.id)
                if (!resultado.ok) {
                  toast.error(resultado.error)
                  return
                }
                toast.success("Documentación guardada")
                setEditando(null)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FormularioDocumento({
  inicial,
  episodios,
  onGuardar,
  onCancelar,
}: {
  inicial: DocumentoSerie | null
  episodios: EpisodioSerie[]
  onGuardar: (datos: Record<string, unknown>) => void
  onCancelar: () => void
}) {
  const [datos, setDatos] = useState({
    tipo: (inicial?.tipo ?? "convenio") as TipoDocumentoId,
    titulo: inicial?.titulo ?? "",
    enlace: inicial?.enlace ?? "",
    notas: inicial?.notas ?? "",
    episodioIds: inicial?.episodioIds ?? ([] as string[]),
  })
  function toggle(id: string) {
    setDatos((prev) => ({
      ...prev,
      episodioIds: prev.episodioIds.includes(id) ? prev.episodioIds.filter((item) => item !== id) : [...prev.episodioIds, id],
    }))
  }
  return (
    <form
      className="grid gap-3"
      onSubmit={(evento) => {
        evento.preventDefault()
        onGuardar(datos)
      }}
    >
      <Campo id="doc-tipo" etiqueta="Tipo">
        <select id="doc-tipo" className={controlClass()} value={datos.tipo} onChange={(e) => setDatos({ ...datos, tipo: e.target.value as TipoDocumentoId })}>
          {TIPOS_DOCUMENTO.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <Campo id="doc-titulo" etiqueta="Título">
        <Input id="doc-titulo" value={datos.titulo} onChange={(e) => setDatos({ ...datos, titulo: e.target.value })} required />
      </Campo>
      <Campo id="doc-enlace" etiqueta="Enlace">
        <Input id="doc-enlace" type="url" value={datos.enlace} onChange={(e) => setDatos({ ...datos, enlace: e.target.value })} placeholder="https://" />
      </Campo>
      <Campo id="doc-notas" etiqueta="Notas">
        <Textarea id="doc-notas" value={datos.notas} onChange={(e) => setDatos({ ...datos, notas: e.target.value })} />
      </Campo>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Vincular a episodios</legend>
        {episodios.length === 0 ? <p className="text-sm text-muted-foreground">Todavía no hay episodios.</p> : null}
        {episodios.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={datos.episodioIds.includes(item.id)} onCheckedChange={() => toggle(item.id)} />
            {item.titulo}
          </label>
        ))}
      </fieldset>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="h-11 flex-1" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" className="h-11 flex-1">
          Guardar
        </Button>
      </div>
    </form>
  )
}

function ModuloRevision() {
  const app = useApp()
  const [idElegido, setIdManual] = useState("")
  const [comentario, setComentario] = useState("")
  const id =
    (app.importadaId && app.episodiosSerie.some((item) => item.id === app.importadaId) ? app.importadaId : "") ||
    idElegido ||
    app.episodiosSerie[0]?.id ||
    ""
  const episodio = app.episodiosSerie.find((item) => item.id === id)
  function setId(siguiente: string) {
    if (app.importadaId) app.limpiarImportada()
    setIdManual(siguiente)
  }

  function guardarChecklist(parcial: Partial<ChecklistRevision>) {
    if (!episodio) return
    const resultado = app.guardarEpisodio({ ...episodio, checklist: { ...episodio.checklist, ...parcial } }, episodio.id)
    if (!resultado.ok) toast.error(resultado.error)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-xl font-semibold">Revisión y aprobación</h3>
        <p className="mt-1 text-sm text-muted-foreground">Control editorial, verificación de datos, correcciones y autorización de publicación.</p>
      </div>
      {app.episodiosSerie.length === 0 ? (
        <p className="text-sm text-muted-foreground">Crea un episodio para revisarlo.</p>
      ) : (
        <>
          <SelectorEpisodio valor={id} onChange={setId} />
          {episodio ? (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <PillEstado estado={episodio.estado} />
                {checklistCompleto(episodio.checklist) ? (
                  <span className="text-sm text-muted-foreground">Checklist completo</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Checklist pendiente</span>
                )}
              </div>
              <fieldset className="grid gap-3">
                <legend className="font-medium">Checklist</legend>
                {ETIQUETAS_CHECKLIST.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={episodio.checklist[item.id]}
                      onCheckedChange={(valor) => guardarChecklist({ [item.id]: valor === true })}
                    />
                    {item.etiqueta}
                  </label>
                ))}
              </fieldset>
              <div>
                <h4 className="font-medium">Comentarios</h4>
                <ul className="mt-2 grid gap-2">
                  {episodio.comentarios.length === 0 ? (
                    <li className="text-sm text-muted-foreground">Todavía no hay comentarios.</li>
                  ) : (
                    [...episodio.comentarios]
                      .sort((a, b) => a.en.localeCompare(b.en))
                      .map((item) => (
                        <li key={item.id} className="rounded-xl bg-muted px-3 py-2 text-sm">
                          <p className="font-medium">{item.porNombre}</p>
                          <p className="mt-1 leading-relaxed">{item.texto}</p>
                        </li>
                      ))
                  )}
                </ul>
                <div className="mt-3 grid gap-2">
                  <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Una corrección o una nota de revisión" />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-fit"
                    onClick={() => {
                      const resultado = app.comentarEpisodio(episodio.id, comentario)
                      if (!resultado.ok) toast.error(resultado.error)
                      else {
                        toast.success("Comentario añadido")
                        setComentario("")
                      }
                    }}
                  >
                    Añadir comentario
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="h-11"
                  onClick={() => {
                    const resultado = app.aprobarEpisodio(episodio.id, comentario)
                    if (!resultado.ok) toast.error(resultado.error)
                    else {
                      toast.success("Episodio aprobado")
                      setComentario("")
                    }
                  }}
                >
                  Aprobar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => {
                    const resultado = app.devolverEpisodio(episodio.id, comentario)
                    if (!resultado.ok) toast.error(resultado.error)
                    else {
                      toast.success("Devuelto para cambios")
                      setComentario("")
                    }
                  }}
                >
                  Devolver
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11"
                  onClick={() => {
                    const resultado = app.compartirEpisodio(episodio.id)
                    if (!resultado.ok) toast.error(resultado.error)
                    else toast.success("Mensaje de WhatsApp listo")
                  }}
                >
                  Compartir por WhatsApp
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

function ModuloPublicaciones() {
  const app = useApp()
  const [editando, setEditando] = useState<PublicacionSerie | "nuevo" | null>(null)
  const [archivo, setArchivo] = useState(false)
  const visibles = useMemo(
    () => app.publicacionesSerie.filter((item) => (archivo ? item.archivada : !item.archivada)).sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [app.publicacionesSerie, archivo],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold">Publicaciones</h3>
          <p className="mt-1 text-sm text-muted-foreground">Descripciones, titulares, etiquetas, plataformas, fechas y enlaces a los vídeos publicados.</p>
        </div>
        <Button type="button" className="h-11" onClick={() => setEditando("nuevo")}>
          Nueva publicación
        </Button>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant={archivo ? "outline" : "default"} className="h-11" onClick={() => setArchivo(false)}>
          Actuales
        </Button>
        <Button type="button" variant={archivo ? "default" : "outline"} className="h-11" onClick={() => setArchivo(true)}>
          Histórico
        </Button>
      </div>
      <ul className="grid gap-3">
        {visibles.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
            {archivo ? "El archivo histórico está vacío." : "Todavía no hay publicaciones."}
          </li>
        ) : (
          visibles.map((pub) => (
            <li key={pub.id} className="rounded-2xl p-4 ring-1 ring-foreground/10">
              <p className="font-heading text-lg font-semibold">{pub.titular}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {pub.fecha} · {pub.plataformas.map(nombrePlataformaPub).join(", ")}
                {pub.ejemplo ? " · Ejemplo" : ""}
              </p>
              {pub.descripcion ? <p className="mt-2 text-sm leading-relaxed">{pub.descripcion}</p> : null}
              {pub.etiquetas ? <p className="mt-1 text-sm text-muted-foreground">{pub.etiquetas}</p> : null}
              {pub.enlaceVideo ? (
                <a href={pub.enlaceVideo} className="mt-2 inline-block break-all text-sm font-medium text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                  Enlace al vídeo publicado
                </a>
              ) : null}
              <p className="mt-2 text-sm text-muted-foreground">
                {pub.episodioId ? `Episodio: ${app.episodiosSerie.find((item) => item.id === pub.episodioId)?.titulo ?? "vinculado"}` : "Sin episodio vinculado"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="h-11" onClick={() => setEditando(pub)}>
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => {
                    const resultado = app.guardarPublicacion({ ...pub, archivada: !pub.archivada }, pub.id)
                    if (!resultado.ok) toast.error(resultado.error)
                    else toast.success(pub.archivada ? "Sacada del archivo" : "Archivada")
                  }}
                >
                  {pub.archivada ? "Sacar del archivo" : "Archivar"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11"
                  onClick={() => {
                    if (!window.confirm("¿Borrar esta publicación?")) return
                    const resultado = app.borrarPublicacion(pub.id)
                    if (!resultado.ok) toast.error(resultado.error)
                    else toast.success("Publicación borrada")
                  }}
                >
                  Borrar
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>
      <Dialog open={Boolean(editando)} onOpenChange={(abierto) => !abierto && setEditando(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando === "nuevo" ? "Nueva publicación" : "Editar publicación"}</DialogTitle>
          </DialogHeader>
          {editando ? (
            <FormularioPublicacion
              inicial={editando === "nuevo" ? null : editando}
              episodios={app.episodiosSerie}
              onCancelar={() => setEditando(null)}
              onGuardar={(datos) => {
                const resultado = app.guardarPublicacion(datos, editando === "nuevo" ? undefined : editando.id)
                if (!resultado.ok) {
                  toast.error(resultado.error)
                  return
                }
                toast.success("Publicación guardada")
                setEditando(null)
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FormularioPublicacion({
  inicial,
  episodios,
  onGuardar,
  onCancelar,
}: {
  inicial: PublicacionSerie | null
  episodios: EpisodioSerie[]
  onGuardar: (datos: Record<string, unknown>) => void
  onCancelar: () => void
}) {
  const [datos, setDatos] = useState({
    titular: inicial?.titular ?? "",
    descripcion: inicial?.descripcion ?? "",
    etiquetas: inicial?.etiquetas ?? "",
    plataformas: inicial?.plataformas ?? (["tiktok"] as PlataformaPubId[]),
    fecha: inicial?.fecha ?? new Date().toISOString().slice(0, 10),
    enlaceVideo: inicial?.enlaceVideo ?? "",
    episodioId: inicial?.episodioId ?? "",
    archivada: inicial?.archivada ?? false,
  })
  function toggle(id: PlataformaPubId) {
    setDatos((prev) => ({
      ...prev,
      plataformas: prev.plataformas.includes(id) ? prev.plataformas.filter((item) => item !== id) : [...prev.plataformas, id],
    }))
  }
  return (
    <form
      className="grid gap-3"
      onSubmit={(evento) => {
        evento.preventDefault()
        onGuardar(datos)
      }}
    >
      <Campo id="pub-titular" etiqueta="Titular">
        <Input id="pub-titular" value={datos.titular} onChange={(e) => setDatos({ ...datos, titular: e.target.value })} required />
      </Campo>
      <Campo id="pub-desc" etiqueta="Descripción">
        <Textarea id="pub-desc" value={datos.descripcion} onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })} />
      </Campo>
      <Campo id="pub-eti" etiqueta="Etiquetas">
        <Input id="pub-eti" value={datos.etiquetas} onChange={(e) => setDatos({ ...datos, etiquetas: e.target.value })} placeholder="#derechos #hostelería" />
      </Campo>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Plataformas</legend>
        {PLATAFORMAS_PUB.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={datos.plataformas.includes(item.id)} onCheckedChange={() => toggle(item.id)} />
            {item.nombre}
          </label>
        ))}
      </fieldset>
      <Campo id="pub-fecha" etiqueta="Fecha">
        <Input id="pub-fecha" type="date" value={datos.fecha} onChange={(e) => setDatos({ ...datos, fecha: e.target.value })} />
      </Campo>
      <Campo id="pub-video" etiqueta="Enlace al vídeo publicado">
        <Input id="pub-video" type="url" value={datos.enlaceVideo} onChange={(e) => setDatos({ ...datos, enlaceVideo: e.target.value })} placeholder="https://" />
      </Campo>
      <Campo id="pub-ep" etiqueta="Episodio vinculado">
        <select id="pub-ep" className={controlClass()} value={datos.episodioId} onChange={(e) => setDatos({ ...datos, episodioId: e.target.value })}>
          <option value="">Sin vincular</option>
          {episodios.map((item) => (
            <option key={item.id} value={item.id}>
              {item.titulo}
            </option>
          ))}
        </select>
      </Campo>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="h-11 flex-1" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" className="h-11 flex-1">
          Guardar
        </Button>
      </div>
    </form>
  )
}
