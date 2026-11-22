"use client"

import { construirHueco, leerDatosHueco } from "@/lib/calendario-logica"
import { borrarCache, guardarCache, leerCache, type CacheLocal, type TareaPendiente } from "@/lib/cliente/idb"
import type { Ficha, Hueco, MetricaMes, UsuarioPublico } from "@/lib/dominio"
import { actualizarDatos, actualizarTextos, aclararFicha, aplicarTransicion, construirFicha, registrarCompartido } from "@/lib/fichas"
import { construirMetrica } from "@/lib/metricas-logica"
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"

type Foto = {
  usuario: UsuarioPublico | null
  fichas: Ficha[]
  calendario: Hueco[]
  metricas: MetricaMes[]
}

type Estado = Foto & {
  listo: boolean
  offline: boolean
  pendientes: number
  aviso: string | null
}

type Resultado = { ok: true } | { ok: false; error: string; errores?: Record<string, string> }

type Valor = Estado & {
  entrar: (email: string, password: string) => Promise<string | null>
  salir: () => Promise<void>
  crearFicha: (datos: unknown) => Promise<Resultado & { id?: string }>
  cambiarFicha: (id: string, cuerpo: Record<string, unknown>) => Promise<Resultado>
  guardarHueco: (datos: unknown, idExistente?: string) => Promise<Resultado>
  guardarMetrica: (mes: string, entrada: unknown) => Promise<Resultado>
  limpiarAviso: () => void
}

const Contexto = createContext<Valor | null>(null)

const VACIO: Estado = {
  listo: false,
  usuario: null,
  fichas: [],
  calendario: [],
  metricas: [],
  offline: false,
  pendientes: 0,
  aviso: null,
}

function empaquetar(foto: Foto, bandeja: TareaPendiente[]): CacheLocal | null {
  if (!foto.usuario) return null
  return {
    usuario: foto.usuario,
    fichas: foto.fichas,
    calendario: foto.calendario,
    metricas: foto.metricas,
    bandeja,
    guardadoEn: new Date().toISOString(),
  }
}

async function leerJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>
}

export function Proveedor({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<Estado>(VACIO)
  const foto = useRef<Foto>(VACIO)
  const bandeja = useRef<TareaPendiente[]>([])
  const serie = useRef(Promise.resolve())

  function publicar(siguiente: Foto, extra: Partial<Estado> = {}) {
    foto.current = siguiente
    setEstado((prev) => ({
      ...prev,
      ...siguiente,
      ...extra,
      pendientes: bandeja.current.length,
      listo: true,
    }))
  }

  async function persistir(siguiente: Foto) {
    const cache = empaquetar(siguiente, bandeja.current)
    if (cache) await guardarCache(cache)
  }

  async function refrescar() {
    const res = await fetch("/api/bootstrap")
    if (res.status === 401) {
      bandeja.current = []
      await borrarCache()
      publicar({ usuario: null, fichas: [], calendario: [], metricas: [] }, { offline: false, aviso: null })
      return
    }
    if (!res.ok) throw new Error("bootstrap")
    const datos = await leerJson(res)
    const siguiente: Foto = {
      usuario: datos.usuario as UsuarioPublico,
      fichas: (datos.fichas as Ficha[]) ?? [],
      calendario: (datos.calendario as Hueco[]) ?? [],
      metricas: (datos.metricas as MetricaMes[]) ?? [],
    }
    await persistir(siguiente)
    publicar(siguiente, { offline: false })
  }

  async function vaciarBandeja() {
    if (!bandeja.current.length) return
    const queda: TareaPendiente[] = []
    let cortar = false
    for (const tarea of bandeja.current) {
      if (cortar) {
        queda.push(tarea)
        continue
      }
      try {
        const res = await fetch(tarea.path, {
          method: tarea.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tarea.body),
        })
        if (res.status >= 500 || res.status === 401) {
          queda.push(tarea)
          cortar = true
        }
      } catch {
        queda.push(tarea)
        cortar = true
      }
    }
    bandeja.current = queda
    if (!cortar) await refrescar()
    else await persistir(foto.current)
    setEstado((prev) => ({ ...prev, pendientes: bandeja.current.length, offline: cortar }))
  }

  useEffect(() => {
    let vivo = true
    async function arrancar() {
      const cache = await leerCache().catch(() => null)
      if (!vivo) return
      if (cache?.usuario) {
        bandeja.current = cache.bandeja ?? []
        publicar(
          {
            usuario: cache.usuario,
            fichas: cache.fichas,
            calendario: cache.calendario,
            metricas: cache.metricas,
          },
          { offline: typeof navigator !== "undefined" ? !navigator.onLine : false },
        )
      } else if (vivo) {
        setEstado((prev) => ({ ...prev, listo: true }))
      }
      try {
        await refrescar()
        await vaciarBandeja()
      } catch {
        if (!vivo) return
        if (cache?.usuario) {
          setEstado((prev) => ({
            ...prev,
            listo: true,
            offline: true,
            aviso: "Sin conexión. Estás viendo la copia de este dispositivo. La guía y el checklist siguen disponibles.",
          }))
        } else {
          setEstado((prev) => ({ ...prev, listo: true }))
        }
      }
    }
    void arrancar()
    function alVolver() {
      if (navigator.onLine) void vaciarBandeja().catch(() => undefined)
      else setEstado((prev) => ({ ...prev, offline: true }))
    }
    window.addEventListener("online", alVolver)
    window.addEventListener("offline", alVolver)
    return () => {
      vivo = false
      window.removeEventListener("online", alVolver)
      window.removeEventListener("offline", alVolver)
    }
    // Arranque único.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function enSerie<T>(tarea: () => Promise<T>): Promise<T> {
    const corre = serie.current.then(tarea, tarea)
    serie.current = corre.then(
      () => undefined,
      () => undefined,
    )
    return corre
  }

  async function enviar(opciones: {
    path: string
    method: "POST" | "PATCH" | "PUT"
    body: unknown
    siguiente: Foto
  }): Promise<Resultado> {
    return enSerie(async () => {
      const previo = foto.current
      publicar(opciones.siguiente, { aviso: null })
      await persistir(opciones.siguiente)
      const encolar = async () => {
        bandeja.current = [
          ...bandeja.current,
          { id: crypto.randomUUID(), path: opciones.path, method: opciones.method, body: opciones.body },
        ]
        await persistir(foto.current)
        setEstado((prev) => ({
          ...prev,
          offline: true,
          pendientes: bandeja.current.length,
          aviso: "Sin red. El cambio queda en este dispositivo y se enviará al volver la conexión.",
        }))
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await encolar()
        return { ok: true }
      }
      try {
        const res = await fetch(opciones.path, {
          method: opciones.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opciones.body),
        })
        const datos = await leerJson(res)
        if (!res.ok) {
          publicar(previo, { aviso: null })
          await persistir(previo)
          return {
            ok: false,
            error: typeof datos.error === "string" ? datos.error : "No se pudo guardar.",
            errores: datos.errores as Record<string, string> | undefined,
          }
        }
        const fusion = fusionar(foto.current, datos)
        publicar(fusion, { offline: false })
        await persistir(fusion)
        return { ok: true }
      } catch {
        await encolar()
        return { ok: true }
      }
    })
  }

  const valor = useMemo<Valor>(() => {
    return {
      ...estado,
      limpiarAviso: () => setEstado((prev) => ({ ...prev, aviso: null })),
      entrar: async (email, password) => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })
          const datos = await leerJson(res)
          if (!res.ok) return typeof datos.error === "string" ? datos.error : "No se pudo entrar."
          await refrescar()
          return null
        } catch {
          return "Sin conexión. La primera entrada en este dispositivo necesita red."
        }
      },
      salir: async () => {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined)
        bandeja.current = []
        await borrarCache()
        publicar({ usuario: null, fichas: [], calendario: [], metricas: [] }, { offline: false, aviso: null })
      },
      crearFicha: async (datos) => {
        const usuario = foto.current.usuario
        if (!usuario) return { ok: false, error: "Tienes que entrar." }
        const id = crypto.randomUUID()
        const local = construirFicha({ id, datos, usuario, ahora: new Date().toISOString() })
        if (!local.ok) return { ok: false, error: local.error, errores: local.errores }
        const resultado = await enviar({
          path: "/api/fichas",
          method: "POST",
          body: { id, ...(datos as object) },
          siguiente: { ...foto.current, fichas: [local.ficha, ...foto.current.fichas] },
        })
        return resultado.ok ? { ok: true, id } : resultado
      },
      cambiarFicha: async (id, cuerpo) => {
        const usuario = foto.current.usuario
        const ficha = foto.current.fichas.find((item) => item.id === id)
        if (!usuario || !ficha) return { ok: false, error: "No está en este dispositivo." }
        const eventoId = typeof cuerpo.eventoId === "string" ? cuerpo.eventoId : crypto.randomUUID()
        const ahora = new Date().toISOString()
        const tipo = cuerpo.tipo
        let local: { ok: true; ficha: Ficha } | { ok: false; error: string; errores?: Record<string, string> }
        if (tipo === "datos") local = actualizarDatos({ ficha, datos: cuerpo, usuario, ahora, eventoId })
        else if (tipo === "textos") {
          local = actualizarTextos({
            ficha,
            textoPublicacion: String(cuerpo.textoPublicacion ?? ""),
            textoCompartir: String(cuerpo.textoCompartir ?? ""),
            usuario,
            ahora,
          })
        } else if (tipo === "transicion") {
          local = aplicarTransicion({
            ficha,
            destino: cuerpo.destino as Ficha["estado"],
            eventoId,
            usuario,
            ahora,
            nota: typeof cuerpo.nota === "string" ? cuerpo.nota : undefined,
            programadoPara: typeof cuerpo.programadoPara === "string" ? cuerpo.programadoPara : undefined,
            checklist: Array.isArray(cuerpo.checklist) ? (cuerpo.checklist as string[]) : undefined,
          })
        } else if (tipo === "aclaracion") {
          local = aclararFicha({ ficha, nota: String(cuerpo.nota ?? ""), eventoId, usuario, ahora })
        } else if (tipo === "compartir") {
          local = registrarCompartido({ ficha, isla: cuerpo.isla as Ficha["isla"], eventoId, usuario, ahora })
        } else local = { ok: false, error: "No reconozco ese cambio." }
        if (!local.ok) return { ok: false, error: local.error, errores: local.errores }
        return enviar({
          path: `/api/fichas/${id}`,
          method: "PATCH",
          body: { ...cuerpo, eventoId },
          siguiente: {
            ...foto.current,
            fichas: foto.current.fichas.map((item) => (item.id === id ? local.ficha : item)),
          },
        })
      },
      guardarHueco: async (datos, idExistente) => {
        const leido = leerDatosHueco(datos)
        if (!leido.ok) return { ok: false, error: leido.error }
        const id = idExistente || crypto.randomUUID()
        const local = construirHueco({ id, datos: leido.datos, ejemplo: false })
        if (!local.ok) return { ok: false, error: local.error }
        const calendario = idExistente
          ? foto.current.calendario.map((hueco) => (hueco.id === id ? local.hueco : hueco))
          : [...foto.current.calendario, local.hueco].sort((a, b) => a.fecha.localeCompare(b.fecha))
        return enviar({
          path: idExistente ? `/api/calendario/${id}` : "/api/calendario",
          method: idExistente ? "PATCH" : "POST",
          body: { id, ...leido.datos },
          siguiente: { ...foto.current, calendario },
        })
      },
      guardarMetrica: async (mes, entrada) => {
        const usuario = foto.current.usuario
        if (!usuario) return { ok: false, error: "Tienes que entrar." }
        const local = construirMetrica({ mes, entrada, usuario, ahora: new Date().toISOString() })
        if (!local.ok) return { ok: false, error: local.error }
        const metricas = foto.current.metricas.some((item) => item.mes === mes)
          ? foto.current.metricas.map((item) => (item.mes === mes ? local.metrica : item))
          : [...foto.current.metricas, local.metrica]
        return enviar({
          path: `/api/metricas/${mes}`,
          method: "PUT",
          body: entrada,
          siguiente: { ...foto.current, metricas },
        })
      },
    }
    // El valor se rehace con el estado visible. Las funciones leen los refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

function fusionar(actual: Foto, datos: Record<string, unknown>): Foto {
  const siguiente = { ...actual }
  if (datos.ficha && typeof datos.ficha === "object") {
    const ficha = datos.ficha as Ficha
    const existe = siguiente.fichas.some((item) => item.id === ficha.id)
    siguiente.fichas = existe
      ? siguiente.fichas.map((item) => (item.id === ficha.id ? ficha : item))
      : [ficha, ...siguiente.fichas]
  }
  if (datos.hueco && typeof datos.hueco === "object") {
    const hueco = datos.hueco as Hueco
    const existe = siguiente.calendario.some((item) => item.id === hueco.id)
    siguiente.calendario = (existe
      ? siguiente.calendario.map((item) => (item.id === hueco.id ? hueco : item))
      : [...siguiente.calendario, hueco]
    ).sort((a, b) => a.fecha.localeCompare(b.fecha))
  }
  if (datos.metrica && typeof datos.metrica === "object") {
    const metrica = datos.metrica as MetricaMes
    const existe = siguiente.metricas.some((item) => item.mes === metrica.mes)
    siguiente.metricas = existe
      ? siguiente.metricas.map((item) => (item.mes === metrica.mes ? metrica : item))
      : [...siguiente.metricas, metrica]
  }
  return siguiente
}

export function useApp() {
  const valor = useContext(Contexto)
  if (!valor) throw new Error("useApp fuera del proveedor")
  return valor
}
