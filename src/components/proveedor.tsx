"use client"

import { construirHueco, leerDatosHueco } from "@/lib/calendario-logica"
import { guardarMesa, leerMesa, type MesaLocal } from "@/lib/cliente/idb"
import type { Ficha, Hueco, IslaId, MetricaMes, RolId, SectorId, UsuarioPublico } from "@/lib/dominio"
import { calendarioDeEjemplo, fichasDeEjemplo, metricaDeEjemplo } from "@/lib/ejemplo"
import { actualizarDatos, actualizarTextos, aclararFicha, aplicarTransicion, construirFicha, registrarCompartido } from "@/lib/fichas"
import { construirMetrica } from "@/lib/metricas-logica"
import { decodificarPaquete, fichaDesdePaquete, fusionarFicha } from "@/lib/whatsapp"
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"

type Resultado = { ok: true; ficha?: Ficha } | { ok: false; error: string; errores?: Record<string, string> }

type PerfilNuevo = {
  nombre: string
  rol: RolId
  isla: IslaId | null
  sector: SectorId | null
}

type Estado = {
  listo: boolean
  usuario: UsuarioPublico | null
  fichas: Ficha[]
  calendario: Hueco[]
  metricas: MetricaMes[]
  offline: boolean
  pendientes: number
  aviso: string | null
  tutorialVisto: boolean
  tutorialAbierto: boolean
  importadaId: string | null
}

type Valor = Estado & {
  guardarPerfil: (perfil: PerfilNuevo) => void
  salir: () => void
  crearFicha: (datos: unknown) => Promise<Resultado & { id?: string }>
  cambiarFicha: (id: string, cuerpo: Record<string, unknown>) => Promise<Resultado>
  guardarHueco: (datos: unknown, idExistente?: string) => Promise<Resultado>
  guardarMetrica: (mes: string, entrada: unknown) => Promise<Resultado>
  cargarEjemplo: () => void
  exportarCopia: () => void
  importarCopia: (texto: string) => { ok: true } | { ok: false; error: string }
  abrirTutorial: () => void
  cerrarTutorial: () => void
  limpiarAviso: () => void
  limpiarImportada: () => void
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
  tutorialVisto: false,
  tutorialAbierto: false,
  importadaId: null,
}

export function Proveedor({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<Estado>(VACIO)
  const ref = useRef(estado)
  useEffect(() => {
    ref.current = estado
  })

  function publicar(parcial: Partial<Estado>, mesa?: Partial<MesaLocal>) {
    setEstado((prev) => {
      const siguiente = { ...prev, ...parcial, listo: true }
      ref.current = siguiente
      const guardar: MesaLocal = {
        perfil: mesa?.perfil !== undefined ? mesa.perfil : siguiente.usuario,
        fichas: mesa?.fichas ?? siguiente.fichas,
        calendario: mesa?.calendario ?? siguiente.calendario,
        metricas: mesa?.metricas ?? siguiente.metricas,
        tutorialVisto: mesa?.tutorialVisto ?? siguiente.tutorialVisto,
        guardadoEn: new Date().toISOString(),
      }
      void guardarMesa(guardar)
      return siguiente
    })
  }

  useEffect(() => {
    let vivo = true
    void leerMesa()
      .then((mesa) => {
        if (!vivo) return
        const fichasBase = mesa?.fichas ?? []
        const traida = leerHash(fichasBase)
        const fichas = traida?.fichas ?? fichasBase
        const siguiente: Estado = {
          ...VACIO,
          listo: true,
          usuario: mesa?.perfil ?? null,
          fichas,
          calendario: mesa?.calendario ?? [],
          metricas: mesa?.metricas ?? [],
          tutorialVisto: mesa?.tutorialVisto ?? false,
          offline: typeof navigator !== "undefined" ? !navigator.onLine : false,
          importadaId: traida?.id ?? null,
          aviso: traida?.aviso ?? null,
        }
        ref.current = siguiente
        setEstado(siguiente)
        if (traida) {
          void guardarMesa({
            perfil: siguiente.usuario,
            fichas,
            calendario: siguiente.calendario,
            metricas: siguiente.metricas,
            tutorialVisto: siguiente.tutorialVisto,
            guardadoEn: new Date().toISOString(),
          })
          history.replaceState(null, "", `${window.location.pathname}${window.location.search}`)
        }
      })
      .catch(() => {
        if (vivo) setEstado((prev) => ({ ...prev, listo: true }))
      })
    function red() {
      setEstado((prev) => ({ ...prev, offline: !navigator.onLine }))
    }
    window.addEventListener("online", red)
    window.addEventListener("offline", red)
    return () => {
      vivo = false
      window.removeEventListener("online", red)
      window.removeEventListener("offline", red)
    }
  }, [])

  useEffect(() => {
    function alHash() {
      const traida = leerHash(ref.current.fichas)
      if (!traida) return
      const fichas = traida.fichas
      publicar(
        { fichas, importadaId: traida.id, aviso: traida.aviso },
        { fichas },
      )
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}`)
    }
    window.addEventListener("hashchange", alHash)
    return () => window.removeEventListener("hashchange", alHash)
  }, [])

  const valor = useMemo<Valor>(() => {
    return {
      ...estado,
      limpiarAviso: () => setEstado((prev) => ({ ...prev, aviso: null })),
      limpiarImportada: () => setEstado((prev) => ({ ...prev, importadaId: null })),
      abrirTutorial: () => setEstado((prev) => ({ ...prev, tutorialAbierto: true })),
      cerrarTutorial: () => {
        publicar({ tutorialAbierto: false, tutorialVisto: true }, { tutorialVisto: true })
      },
      guardarPerfil: (perfil) => {
        const usuario: UsuarioPublico = {
          id: estado.usuario?.id || crypto.randomUUID(),
          nombre: perfil.nombre.trim(),
          email: "",
          rol: perfil.rol,
          isla: perfil.isla,
          sector: perfil.sector,
          ejemplo: false,
        }
        const abrir = !estado.tutorialVisto
        publicar({ usuario, tutorialAbierto: abrir }, { perfil: usuario })
      },
      salir: () => publicar({ usuario: null }, { perfil: null }),
      crearFicha: async (datos) => {
        const usuario = ref.current.usuario
        if (!usuario) return { ok: false, error: "Elige primero tu perfil en este dispositivo." }
        const id = crypto.randomUUID()
        const creada = construirFicha({ id, datos, usuario, ahora: new Date().toISOString() })
        if (!creada.ok) return creada
        const fichas = [creada.ficha, ...ref.current.fichas]
        publicar({ fichas }, { fichas })
        return { ok: true, id, ficha: creada.ficha }
      },
      cambiarFicha: async (id, cuerpo) => {
        const usuario = ref.current.usuario
        const ficha = ref.current.fichas.find((item) => item.id === id)
        if (!usuario || !ficha) return { ok: false, error: "Esa ficha no está en este dispositivo." }
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
        if (!local.ok) return local
        const fichas = ref.current.fichas.map((item) => (item.id === id ? local.ficha : item))
        publicar({ fichas }, { fichas })
        return { ok: true, ficha: local.ficha }
      },
      guardarHueco: async (datos, idExistente) => {
        const leido = leerDatosHueco(datos)
        if (!leido.ok) return { ok: false, error: leido.error }
        const id = idExistente || crypto.randomUUID()
        const local = construirHueco({ id, datos: leido.datos, ejemplo: false })
        if (!local.ok) return local
        const calendario = idExistente
          ? ref.current.calendario.map((hueco) => (hueco.id === id ? local.hueco : hueco))
          : [...ref.current.calendario, local.hueco].sort((a, b) => a.fecha.localeCompare(b.fecha))
        publicar({ calendario }, { calendario })
        return { ok: true }
      },
      guardarMetrica: async (mes, entrada) => {
        const usuario = ref.current.usuario
        if (!usuario) return { ok: false, error: "Elige primero tu perfil." }
        const local = construirMetrica({ mes, entrada, usuario, ahora: new Date().toISOString() })
        if (!local.ok) return local
        const metricas = ref.current.metricas.some((item) => item.mes === mes)
          ? ref.current.metricas.map((item) => (item.mes === mes ? local.metrica : item))
          : [...ref.current.metricas, local.metrica]
        publicar({ metricas }, { metricas })
        return { ok: true }
      },
      cargarEjemplo: () => {
        const actuales = new Set(ref.current.fichas.map((ficha) => ficha.id))
        const fichas = [...fichasDeEjemplo().filter((ficha) => !actuales.has(ficha.id)), ...ref.current.fichas]
        const huecos = new Set(ref.current.calendario.map((hueco) => hueco.id))
        const calendario = [...ref.current.calendario, ...calendarioDeEjemplo().filter((hueco) => !huecos.has(hueco.id))].sort(
          (a, b) => a.fecha.localeCompare(b.fecha),
        )
        const metricas = ref.current.metricas.some((item) => item.mes === "2026-11")
          ? ref.current.metricas
          : [...ref.current.metricas, metricaDeEjemplo()]
        publicar(
          { fichas, calendario, metricas, aviso: "Ejemplo cargado. Son datos ficticios, no de las cuentas oficiales." },
          { fichas, calendario, metricas },
        )
      },
      exportarCopia: () => {
        const copia = {
          tipo: "ugt-fesmc-copia",
          version: 1,
          perfil: ref.current.usuario,
          fichas: ref.current.fichas,
          calendario: ref.current.calendario,
          metricas: ref.current.metricas,
        }
        const blob = new Blob([JSON.stringify(copia, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const enlace = document.createElement("a")
        enlace.href = url
        enlace.download = "ugt-fesmc-copia.json"
        enlace.click()
        URL.revokeObjectURL(url)
      },
      importarCopia: (texto) => {
        try {
          const copia = JSON.parse(texto) as {
            tipo?: string
            fichas?: Ficha[]
            calendario?: Hueco[]
            metricas?: MetricaMes[]
          }
          if (copia.tipo !== "ugt-fesmc-copia" || !Array.isArray(copia.fichas)) {
            return { ok: false, error: "Ese archivo no es una copia de esta aplicación." }
          }
          const mapa = new Map(ref.current.fichas.map((ficha) => [ficha.id, ficha]))
          for (const ficha of copia.fichas) {
            const fusion = fusionarFicha(mapa.get(ficha.id), ficha)
            mapa.set(ficha.id, fusion.ficha)
          }
          const fichas = [...mapa.values()]
          const huecos = new Map(ref.current.calendario.map((hueco) => [hueco.id, hueco]))
          for (const hueco of copia.calendario ?? []) huecos.set(hueco.id, hueco)
          const calendario = [...huecos.values()].sort((a, b) => a.fecha.localeCompare(b.fecha))
          const meses = new Map(ref.current.metricas.map((item) => [item.mes, item]))
          for (const metrica of copia.metricas ?? []) meses.set(metrica.mes, metrica)
          const metricas = [...meses.values()]
          publicar({ fichas, calendario, metricas, aviso: "Copia importada en este dispositivo." }, { fichas, calendario, metricas })
          return { ok: true }
        } catch {
          return { ok: false, error: "No se pudo leer el archivo." }
        }
      },
    }
  }, [estado])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

function leerHash(fichas: Ficha[]): { fichas: Ficha[]; id: string; aviso: string } | null {
  if (typeof window === "undefined") return null
  const hash = window.location.hash
  if (!hash.startsWith("#/importar")) return null
  const consulta = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : ""
  const dato = new URLSearchParams(consulta).get("d")
  if (!dato) return null
  const paquete = decodificarPaquete(dato)
  if (!paquete) return { fichas, id: "", aviso: "El enlace de WhatsApp no se pudo leer." }
  const entrante = fichaDesdePaquete(paquete)
  const local = fichas.find((ficha) => ficha.id === entrante.id)
  const fusion = fusionarFicha(local, entrante)
  const siguientes = local
    ? fichas.map((ficha) => (ficha.id === fusion.ficha.id ? fusion.ficha : ficha))
    : [fusion.ficha, ...fichas]
  return {
    fichas: siguientes,
    id: fusion.ficha.id,
    aviso: fusion.nueva ? `Ficha importada: ${fusion.ficha.titulo}` : `Ficha actualizada: ${fusion.ficha.titulo}`,
  }
}

export function useApp() {
  const valor = useContext(Contexto)
  if (!valor) throw new Error("useApp fuera del proveedor")
  return valor
}
