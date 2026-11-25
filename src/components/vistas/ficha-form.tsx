"use client"

import { Campo, controlClass } from "@/components/campo"
import { useApp } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  CANALES,
  ISLAS,
  ISLA_FEDERACION,
  PILARES,
  SECTORES,
  hoyIso,
  type CanalId,
  type Ficha,
  type IslaId,
  type PilarId,
  type SectorId,
} from "@/lib/dominio"
import { validarDatosFicha, type DatosFicha } from "@/lib/validar"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type Props = {
  ficha?: Ficha
  onClose?: () => void
}

function inicial(usuarioIsla: IslaId | null, usuarioSector: SectorId | null, ficha?: Ficha): DatosFicha {
  if (ficha) {
    return {
      titulo: ficha.titulo,
      queOcurrio: ficha.queOcurrio,
      isla: ficha.isla,
      cuando: ficha.cuando,
      sector: ficha.sector,
      fuentes: ficha.fuentes,
      materialAutorizado: ficha.materialAutorizado,
      descripcionMaterial: ficha.descripcionMaterial,
      contactoNombre: ficha.contactoNombre,
      contactoMedio: ficha.contactoMedio,
      sensible: ficha.sensible,
      motivoSensible: ficha.motivoSensible,
      pilar: ficha.pilar,
      canales: ficha.canales,
      referenciaMaterial: ficha.referenciaMaterial ?? "",
    }
  }
  const cuando = hoyIso()
  return {
    titulo: "",
    queOcurrio: "",
    isla: usuarioIsla && usuarioIsla !== "regional" ? usuarioIsla : "tenerife",
    cuando,
    sector: usuarioSector ?? "comercio",
    fuentes: "",
    materialAutorizado: false,
    descripcionMaterial: "",
    contactoNombre: "",
    contactoMedio: "Canal interno del equipo",
    sensible: false,
    motivoSensible: "",
    pilar: "derechos",
    canales: ["instagram"],
    referenciaMaterial: "",
  }
}

export function FichaForm({ ficha, onClose }: Props) {
  const { usuario, crearFicha, cambiarFicha } = useApp()
  const router = useRouter()
  const [datos, setDatos] = useState<DatosFicha>(() => inicial(usuario?.isla ?? null, usuario?.sector ?? null, ficha))
  const [demostracion, setDemostracion] = useState<boolean>(ficha?.ejemplo ?? false)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [ocupado, setOcupado] = useState(false)
  if (!usuario) return null

  const islaFija = usuario.rol === "insular" && usuario.isla && usuario.isla !== "regional"
  const sectorFijo = usuario.rol === "sectorial" && usuario.sector

  function poner<K extends keyof DatosFicha>(clave: K, valor: DatosFicha[K]) {
    setDatos((prev) => ({ ...prev, [clave]: valor }))
  }

  function alternarCanal(canal: CanalId, activo: boolean) {
    setDatos((prev) => ({
      ...prev,
      canales: activo ? [...new Set([...prev.canales, canal])] : prev.canales.filter((item) => item !== canal),
    }))
  }

  async function guardar(evento: React.FormEvent) {
    evento.preventDefault()
    const validado = validarDatosFicha(datos)
    if (!validado.ok) {
      setErrores(validado.errores)
      toast.error("Revisa los campos marcados.")
      return
    }
    setErrores({})
    setOcupado(true)
    const resultado = ficha
      ? await cambiarFicha(ficha.id, { tipo: "datos", ...validado.datos, demostracion })
      : await crearFicha({ ...validado.datos, demostracion })
    setOcupado(false)
    if (!resultado.ok) {
      if (resultado.errores) setErrores(resultado.errores)
      toast.error(resultado.error)
      return
    }
    toast.success(ficha ? "Borrador actualizado" : "Borrador guardado en este dispositivo. Ahora puedes enviarlo como propuesta.")
    if (ficha) onClose?.()
    else if ("id" in resultado && resultado.id) router.push(`/fichas/ver?id=${resultado.id}`)
  }

  return (
    <form className="space-y-5" onSubmit={(evento) => void guardar(evento)} noValidate>
      <p className="rounded-lg bg-[#F8E8E6] px-3 py-2 text-sm leading-relaxed text-[#1C1C1C]">
        No escribas nombres y apellidos, teléfonos, DNI, nóminas, expedientes ni datos de salud. El contacto es alguien del equipo, con un canal interno.
      </p>
      <label className="flex min-h-12 items-start gap-3 rounded-xl border-2 border-dashed border-[#E4C48A] bg-[#FFF6E8] p-3 text-sm leading-relaxed text-[#1C1C1C]">
        <Checkbox className="mt-0.5 size-5" checked={demostracion} onCheckedChange={(valor) => setDemostracion(valor)} />
        <span>
          <span className="font-semibold">Ficha de DEMOSTRACIÓN.</span> Márcala si es una noticia ficticia para enseñar la app. Llevará la etiqueta DEMOSTRACIÓN y se podrá quitar de golpe.
        </span>
      </label>
      <Campo id="titulo" etiqueta="Título" error={errores.titulo} ayuda="Una línea que el equipo entienda sin abrir el resto.">
        <Input id="titulo" className="h-11 text-base md:text-base" value={datos.titulo} onChange={(evento) => poner("titulo", evento.target.value)} aria-invalid={Boolean(errores.titulo)} />
      </Campo>
      <Campo id="que" etiqueta="Qué ocurrió" error={errores.queOcurrio} ayuda="El hecho, sin adornos y sin datos de personas identificables.">
        <Textarea id="que" className="min-h-32 text-base" value={datos.queOcurrio} onChange={(evento) => poner("queOcurrio", evento.target.value)} aria-invalid={Boolean(errores.queOcurrio)} />
      </Campo>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="isla" etiqueta="Dónde / isla" error={errores.isla}>
          <select id="isla" className={controlClass()} value={datos.isla} disabled={Boolean(islaFija)} onChange={(evento) => poner("isla", evento.target.value as IslaId)}>
            {ISLAS.map((isla) => (
              <option key={isla.id} value={isla.id}>
                {isla.nombre}
              </option>
            ))}
            <option value={ISLA_FEDERACION.id}>{ISLA_FEDERACION.nombre}</option>
          </select>
        </Campo>
        <Campo id="cuando" etiqueta="Cuándo" error={errores.cuando}>
          <Input id="cuando" className="h-11 text-base md:text-base" type="date" value={datos.cuando} onChange={(evento) => poner("cuando", evento.target.value)} />
        </Campo>
        <Campo id="sector" etiqueta="Sector" error={errores.sector}>
          <select id="sector" className={controlClass()} value={datos.sector} disabled={Boolean(sectorFijo)} onChange={(evento) => poner("sector", evento.target.value as SectorId)}>
            {SECTORES.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="pilar" etiqueta="Pilar o sección" error={errores.pilar}>
          <select id="pilar" className={controlClass()} value={datos.pilar} onChange={(evento) => poner("pilar", evento.target.value as PilarId)}>
            {PILARES.map((pilar) => (
              <option key={pilar.id} value={pilar.id}>
                {pilar.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>
      <Campo id="fuentes" etiqueta="Fuentes" error={errores.fuentes} ayuda="De dónde sale el hecho. Sin pegar expedientes.">
        <Textarea id="fuentes" className="min-h-20 text-base" value={datos.fuentes} onChange={(evento) => poner("fuentes", evento.target.value)} />
      </Campo>
      <fieldset className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <legend className="px-1 text-sm font-medium">Material autorizado</legend>
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <Checkbox className="mt-0.5 size-5" checked={datos.materialAutorizado} onCheckedChange={(valor) => poner("materialAutorizado", valor)} />
          <span>El material que se usará está autorizado, o la pieza irá sin fotos de personas.</span>
        </label>
        <Campo id="material" etiqueta="Qué material hay" error={errores.descripcionMaterial}>
          <Textarea id="material" className="min-h-20 text-base" value={datos.descripcionMaterial} onChange={(evento) => poner("descripcionMaterial", evento.target.value)} />
        </Campo>
        <Campo
          id="referencia-material"
          etiqueta="Referencia del material (opcional)"
          error={errores.referenciaMaterial}
          ayuda="Dónde está: carpeta compartida, nombre del archivo o enlace. La app no sube archivos."
        >
          <Input id="referencia-material" className="h-11 text-base md:text-base" value={datos.referenciaMaterial} onChange={(evento) => poner("referenciaMaterial", evento.target.value)} placeholder="Carpeta del equipo › Imágenes › cartel.png" />
        </Campo>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="contacto" etiqueta="Persona de contacto del equipo" error={errores.contactoNombre}>
          <Input id="contacto" className="h-11 text-base md:text-base" value={datos.contactoNombre} onChange={(evento) => poner("contactoNombre", evento.target.value)} />
        </Campo>
        <Campo id="medio" etiqueta="Cómo localizarla" error={errores.contactoMedio} ayuda="Un canal interno. No un teléfono particular.">
          <Input id="medio" className="h-11 text-base md:text-base" value={datos.contactoMedio} onChange={(evento) => poner("contactoMedio", evento.target.value)} />
        </Campo>
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Canales previstos</legend>
        {errores.canales ? <p className="text-sm font-medium text-destructive">{errores.canales}</p> : null}
        <div className="flex flex-wrap gap-3">
          {CANALES.map((canal) => (
            <label key={canal.id} className="flex min-h-11 items-center gap-2 rounded-lg bg-card px-3 ring-1 ring-border">
              <Checkbox className="size-5" checked={datos.canales.includes(canal.id)} onCheckedChange={(valor) => alternarCanal(canal.id, valor)} />
              {canal.nombre}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-3 rounded-xl border border-[#E7B4BA] bg-[#FDF6F6] p-4">
        <legend className="px-1 text-sm font-medium">Contenido sensible</legend>
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <Checkbox className="mt-0.5 size-5" checked={datos.sensible} onCheckedChange={(valor) => poner("sensible", valor)} />
          <span>Marcar si hay conflicto abierto, salud, menores, sanción o un centro tan pequeño que la pieza identificaría a alguien.</span>
        </label>
        {datos.sensible ? (
          <Campo id="motivo" etiqueta="Por qué es sensible" error={errores.motivoSensible}>
            <Textarea id="motivo" className="min-h-20 text-base" value={datos.motivoSensible} onChange={(evento) => poner("motivoSensible", evento.target.value)} />
          </Campo>
        ) : null}
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" className="h-11 px-4" disabled={ocupado}>
          {ocupado ? "Guardando…" : ficha ? "Guardar cambios" : "Guardar borrador"}
        </Button>
        {onClose ? (
          <Button type="button" variant="outline" className="h-11 px-4" onClick={onClose}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  )
}
