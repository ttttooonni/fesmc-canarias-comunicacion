"use client"

import { Campo, controlClass } from "@/components/campo"
import { EstadoPill } from "@/components/estado-pill"
import { FichaForm } from "@/components/vistas/ficha-form"
import { useApp } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { accionesDisponibles, puedeEditarDatos, puedeEditarTextos, puedeRegistrarCompartido, type AccionCircuito } from "@/lib/circuito"
import { CHECKLIST_PUBLICAR } from "@/lib/contenido"
import {
  ESTADOS,
  ISLAS,
  formatoFecha,
  formatoMomento,
  nombreCanal,
  nombreEstado,
  nombreIsla,
  nombrePilar,
  nombreSector,
  type IslaId,
} from "@/lib/dominio"
import { abrirWhatsapp } from "@/lib/whatsapp"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function FichaDetalle() {
  const params = useSearchParams()
  const { usuario, fichas, cambiarFicha } = useApp()
  const ficha = fichas.find((item) => item.id === params.get("id"))
  const [editando, setEditando] = useState(false)
  const [accion, setAccion] = useState<AccionCircuito | null>(null)
  const [nota, setNota] = useState("")
  const [fecha, setFecha] = useState("")
  const [marcas, setMarcas] = useState<string[]>([])
  const [textos, setTextos] = useState(false)
  const [publicacion, setPublicacion] = useState("")
  const [compartirTexto, setCompartirTexto] = useState("")
  const [aclaracion, setAclaracion] = useState("")
  const [islaCompartir, setIslaCompartir] = useState<IslaId>("lanzarote")
  const [ocupado, setOcupado] = useState(false)

  if (!usuario) return null
  if (!ficha) {
    return (
      <main id="contenido">
        <h1 className="font-heading text-3xl font-semibold">Esta ficha no está en tu mesa</h1>
        <p className="mt-2 text-sm text-muted-foreground">Puede que no tengas permiso para verla o que todavía no se haya sincronizado.</p>
      </main>
    )
  }

  const acciones = accionesDisponibles(ficha, usuario.rol)
  const editaDatos = puedeEditarDatos(usuario.rol, ficha.creadoPorId, usuario.id, ficha.estado)
  const editaTextos = puedeEditarTextos(usuario.rol, ficha.estado)
  const muestraCompartir = true
  const puedeMarcar = puedeRegistrarCompartido(usuario.rol) && ficha.estado === "publicada"
  const hechos = new Set(ficha.historial.map((paso) => paso.estado))

  async function confirmar() {
    if (!accion || !ficha || !usuario) return
    setOcupado(true)
    const resultado = await cambiarFicha(ficha.id, {
      tipo: "transicion",
      destino: accion.destino,
      nota,
      programadoPara: fecha,
      checklist: marcas,
    })
    setOcupado(false)
    if (!resultado.ok) {
      toast.error(resultado.error)
      return
    }
    toast.success(accion.etiqueta)
    if (resultado.ficha) abrirWhatsapp(resultado.ficha)
    setAccion(null)
    setNota("")
    setMarcas([])
  }

  async function copiar() {
    if (!ficha) return
    try {
      await navigator.clipboard.writeText(ficha.textoCompartir)
      toast.success("Texto copiado")
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto a mano.")
    }
  }

  async function compartirSistema() {
    if (!ficha) return
    if (!navigator.share) {
      toast.message("Este navegador no abre la hoja de compartir. Usa copiar.")
      return
    }
    try {
      await navigator.share({ title: ficha.titulo, text: ficha.textoCompartir })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      toast.error("No se pudo abrir la hoja de compartir.")
    }
  }

  async function registrar() {
    if (!ficha || !usuario) return
    const isla = usuario.rol === "insular" && usuario.isla ? usuario.isla : islaCompartir
    setOcupado(true)
    const resultado = await cambiarFicha(ficha.id, { tipo: "compartir", isla })
    setOcupado(false)
    if (!resultado.ok) toast.error(resultado.error)
    else toast.success(`Compartido en ${nombreIsla(isla)}`)
  }

  async function enviarAclaracion() {
    if (!ficha) return
    setOcupado(true)
    const resultado = await cambiarFicha(ficha.id, { tipo: "aclaracion", nota: aclaracion })
    setOcupado(false)
    if (!resultado.ok) toast.error(resultado.error)
    else {
      toast.success("Aclaración añadida")
      setAclaracion("")
    }
  }

  async function guardarTextos() {
    if (!ficha) return
    setOcupado(true)
    const resultado = await cambiarFicha(ficha.id, {
      tipo: "textos",
      textoPublicacion: publicacion,
      textoCompartir: compartirTexto,
    })
    setOcupado(false)
    if (!resultado.ok) toast.error(resultado.error)
    else {
      toast.success("Textos guardados")
      setTextos(false)
    }
  }

  return (
    <main id="contenido" className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <EstadoPill estado={ficha.estado} />
          {ficha.sensible ? <span className="rounded-full bg-[#7A1020] px-2.5 py-1 text-xs font-semibold text-white">Sensible</span> : null}
          {ficha.ejemplo ? <span className="rounded-full px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-border">Ejemplo</span> : null}
        </div>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">{ficha.titulo}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {nombreIsla(ficha.isla)} · {nombreSector(ficha.sector)} · {formatoFecha(ficha.cuando)} · {nombrePilar(ficha.pilar)}
        </p>
      </header>

      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Circuito de la pieza">
        {ESTADOS.map((estado) => {
          const actual = ficha.estado === estado.id
          const hecho = hechos.has(estado.id)
          return (
            <li
              key={estado.id}
              aria-current={actual ? "step" : undefined}
              className={`rounded-lg px-3 py-2 text-sm ring-1 ${actual ? "bg-primary text-white ring-primary" : hecho ? "bg-card ring-foreground/15" : "bg-transparent text-muted-foreground ring-border"}`}
            >
              <span className="block font-semibold">{estado.nombre}</span>
              <span className={`mt-0.5 block text-xs ${actual ? "text-white/85" : "text-muted-foreground"}`}>
                {actual ? "Paso actual" : hecho ? "Hecho" : estado.detalle}
              </span>
            </li>
          )
        })}
      </ol>

      {acciones.length > 0 ? (
        <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <h2 className="font-heading text-lg font-semibold">Siguiente paso</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="h-11 px-4" onClick={() => abrirWhatsapp(ficha)}>
              Compartir por WhatsApp
            </Button>
            {acciones.map((item) => (
              <Button
                key={item.destino + item.estilo}
                type="button"
                variant={item.estilo === "devolver" ? "outline" : "default"}
                className="h-11 px-4"
                disabled={Boolean(item.bloqueo)}
                onClick={() => {
                  setAccion(item)
                  setFecha(ficha.programadoPara ?? "")
                  setNota("")
                  setMarcas([])
                }}
              >
                {item.etiqueta}
              </Button>
            ))}
          </div>
          {acciones.some((item) => item.bloqueo) ? (
            <p className="mt-3 text-sm text-[#7A1020]">{acciones.find((item) => item.bloqueo)?.bloqueo}</p>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-sm font-semibold">Qué ocurrió</h2>
          <p className="mt-1 whitespace-pre-wrap text-base leading-relaxed">{ficha.queOcurrio}</p>
        </div>
        <Dato etiqueta="Fuentes" valor={ficha.fuentes} />
        <Dato etiqueta="Material" valor={`${ficha.materialAutorizado ? "Autorizado. " : "Sin autorizar todavía. "}${ficha.descripcionMaterial}`} />
        <Dato etiqueta="Contacto del equipo" valor={`${ficha.contactoNombre}. ${ficha.contactoMedio}`} />
        <Dato etiqueta="Canales" valor={ficha.canales.map(nombreCanal).join(", ")} />
        {ficha.sensible ? <Dato etiqueta="Por qué es sensible" valor={ficha.motivoSensible} /> : null}
        {ficha.programadoPara ? <Dato etiqueta="Programada para" valor={formatoFecha(ficha.programadoPara)} /> : null}
        <Dato etiqueta="Envió la ficha" valor={`${ficha.creadoPorNombre} · ${formatoMomento(ficha.creadoEn)}`} />
      </section>

      {editaDatos ? (
        <section>
          {editando ? (
            <FichaForm ficha={ficha} onClose={() => setEditando(false)} />
          ) : (
            <Button type="button" variant="outline" className="h-11 px-4" onClick={() => setEditando(true)}>
              Corregir la ficha
            </Button>
          )}
        </section>
      ) : null}

      {editaDatos ? (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Añadir una aclaración</h2>
          <Textarea className="min-h-24 text-base" value={aclaracion} onChange={(evento) => setAclaracion(evento.target.value)} placeholder="Un dato que faltaba, sin información personal." />
          <Button type="button" variant="outline" className="h-11 px-4" disabled={ocupado} onClick={() => void enviarAclaracion()}>
            Guardar aclaración
          </Button>
        </section>
      ) : null}

      {editaTextos || muestraCompartir ? (
        <section className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-heading text-lg font-semibold">Texto para publicar y para las islas</h2>
            {editaTextos && !textos ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 px-4"
                onClick={() => {
                  setPublicacion(ficha.textoPublicacion)
                  setCompartirTexto(ficha.textoCompartir)
                  setTextos(true)
                }}
              >
                Editar textos
              </Button>
            ) : null}
          </div>
          {textos ? (
            <div className="space-y-3">
              <Campo id="texto-publicacion" etiqueta="Texto de la publicación">
                <Textarea id="texto-publicacion" className="min-h-36 text-base" value={publicacion} onChange={(evento) => setPublicacion(evento.target.value)} />
              </Campo>
              <Campo id="texto-compartir" etiqueta="Texto sugerido para las cuentas insulares">
                <Textarea id="texto-compartir" className="min-h-36 text-base" value={compartirTexto} onChange={(evento) => setCompartirTexto(evento.target.value)} />
              </Campo>
              <div className="flex gap-2">
                <Button type="button" className="h-11 px-4" disabled={ocupado} onClick={() => void guardarTextos()}>
                  Guardar textos
                </Button>
                <Button type="button" variant="outline" className="h-11 px-4" onClick={() => setTextos(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <BloqueTexto titulo="Publicación" texto={ficha.textoPublicacion} />
              <BloqueTexto titulo="Para compartir en la cuenta insular" texto={ficha.textoCompartir} />
              {muestraCompartir ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" className="h-11 px-4" onClick={() => void copiar()}>
                    Copiar texto
                  </Button>
                  <Button type="button" variant="outline" className="h-11 px-4" onClick={() => void compartirSistema()}>
                    Compartir
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">El texto se comparte cuando la pieza esté publicada.</p>
              )}
            </>
          )}
          {puedeMarcar ? (
            <div className="space-y-3 border-t border-border pt-4">
              <h3 className="text-sm font-semibold">Registrar que ya se compartió</h3>
              {usuario.rol === "insular" ? (
                <p className="text-sm text-muted-foreground">Se anotará en {usuario.isla ? nombreIsla(usuario.isla) : "tu isla"}.</p>
              ) : (
                <label className="flex max-w-sm flex-col gap-1.5 text-sm font-medium">
                  Isla
                  <select className={controlClass()} value={islaCompartir} onChange={(evento) => setIslaCompartir(evento.target.value as IslaId)}>
                    {ISLAS.map((isla) => (
                      <option key={isla.id} value={isla.id}>
                        {isla.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {ficha.compartidos.length > 0 ? (
                <ul className="text-sm text-muted-foreground">
                  {ficha.compartidos.map((item) => (
                    <li key={item.id}>
                      {nombreIsla(item.isla)} · {item.porNombre} · {formatoMomento(item.en)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Todavía no hay islas registradas.</p>
              )}
              <Button type="button" variant="outline" className="h-11 px-4" disabled={ocupado} onClick={() => void registrar()}>
                Ya está en la cuenta insular
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      <section>
        <h2 className="font-heading text-lg font-semibold">Recorrido</h2>
        <ol className="mt-3 space-y-3">
          {[...ficha.historial].reverse().map((paso) => (
            <li key={paso.id} className="rounded-lg bg-card px-3 py-2 ring-1 ring-foreground/10">
              <p className="text-sm font-semibold">{nombreEstado(paso.estado)}</p>
              <p className="text-sm text-muted-foreground">
                {paso.porNombre} · {formatoMomento(paso.en)}
              </p>
              {paso.nota ? <p className="mt-1 text-sm leading-relaxed">{paso.nota}</p> : null}
            </li>
          ))}
        </ol>
      </section>

      <Dialog open={Boolean(accion)} onOpenChange={(abierto) => !abierto && setAccion(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{accion?.etiqueta}</DialogTitle>
            <DialogDescription>
              {accion?.destino ? `La pieza pasará a «${nombreEstado(accion.destino)}».` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {accion?.exigeNota ? (
              <Campo id="nota-paso" etiqueta="Nota para quien sigue">
                <Textarea id="nota-paso" className="min-h-24 text-base" value={nota} onChange={(evento) => setNota(evento.target.value)} />
              </Campo>
            ) : (
              <Campo id="nota-paso" etiqueta="Nota, si hace falta" ayuda="Opcional.">
                <Textarea id="nota-paso" className="min-h-20 text-base" value={nota} onChange={(evento) => setNota(evento.target.value)} />
              </Campo>
            )}
            {accion?.exigeFecha ? (
              <Campo id="fecha-paso" etiqueta="Fecha de programación">
                <Input id="fecha-paso" className="h-11 text-base md:text-base" type="date" value={fecha} onChange={(evento) => setFecha(evento.target.value)} />
              </Campo>
            ) : null}
            {accion?.exigeChecklist ? (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Checklist antes de publicar</legend>
                {CHECKLIST_PUBLICAR.map((item) => (
                  <label key={item.id} className="flex items-start gap-3 text-sm leading-relaxed">
                    <Checkbox
                      className="mt-0.5 size-5"
                      checked={marcas.includes(item.id)}
                      onCheckedChange={(valor) =>
                        setMarcas((prev) => (valor ? [...prev, item.id] : prev.filter((id) => id !== item.id)))
                      }
                    />
                    <span>
                      <span className="font-medium">{item.titulo}</span>
                      <span className="mt-0.5 block text-muted-foreground">{item.detalle}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            ) : null}
            <Button type="button" className="h-11 w-full px-4" disabled={ocupado} onClick={() => void confirmar()}>
              {ocupado ? "Guardando…" : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{etiqueta}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{valor}</p>
    </div>
  )
}

function BloqueTexto({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{titulo}</h3>
      <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-[#F3EFEA] p-3 font-sans text-sm leading-relaxed">{texto || "Todavía no hay texto."}</pre>
    </div>
  )
}
