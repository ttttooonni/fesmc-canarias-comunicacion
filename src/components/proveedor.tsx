"use client"

import { construirHueco, leerDatosHueco } from "@/lib/calendario-logica"
import { guardarMesa, leerMesa, type MesaLocal } from "@/lib/cliente/idb"
import type { Ficha, Hueco, IslaId, MetricaMes, RolId, SectorId, UsuarioPublico } from "@/lib/dominio"
import { calendarioDeEjemplo, fichasDeEjemplo, metricaDeEjemplo } from "@/lib/ejemplo"
import { actualizarDatos, actualizarTextos, aclararFicha, aplicarTransicion, construirFicha, registrarCompartido } from "@/lib/fichas"
import { construirMetrica } from "@/lib/metricas-logica"
import {
  abrirWhatsappEpisodio,
  asegurarPersonajes,
  checklistCompleto,
  decodificarPaqueteEpisodio,
  episodioDeEjemplo,
  episodioDesdePaquete,
  fusionarEpisodio,
  fusionarPorId,
  leerDocumento,
  leerEpisodio,
  leerPersonaje,
  leerPublicacion,
  reponerPersonajesOficiales,
  type DocumentoSerie,
  type EpisodioSerie,
  type PersonajeSerie,
  type PublicacionSerie,
} from "@/lib/sindi-cato"
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
  personajesSerie: PersonajeSerie[]
  episodiosSerie: EpisodioSerie[]
  documentosSerie: DocumentoSerie[]
  publicacionesSerie: PublicacionSerie[]
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
  guardarPersonaje: (datos: unknown, idExistente?: string) => Resultado
  borrarPersonaje: (id: string) => Resultado
  guardarEpisodio: (datos: unknown, idExistente?: string) => Resultado
  borrarEpisodio: (id: string) => Resultado
  guardarDocumento: (datos: unknown, idExistente?: string) => Resultado
  borrarDocumento: (id: string) => Resultado
  guardarPublicacion: (datos: unknown, idExistente?: string) => Resultado
  borrarPublicacion: (id: string) => Resultado
  comentarEpisodio: (id: string, texto: string) => Resultado
  aprobarEpisodio: (id: string, nota?: string) => Resultado
  devolverEpisodio: (id: string, nota?: string) => Resultado
  compartirEpisodio: (id: string) => Resultado
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
  personajesSerie: [],
  episodiosSerie: [],
  documentosSerie: [],
  publicacionesSerie: [],
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
        personajesSerie: mesa?.personajesSerie ?? siguiente.personajesSerie,
        episodiosSerie: mesa?.episodiosSerie ?? siguiente.episodiosSerie,
        documentosSerie: mesa?.documentosSerie ?? siguiente.documentosSerie,
        publicacionesSerie: mesa?.publicacionesSerie ?? siguiente.publicacionesSerie,
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
        const personajesSerie = asegurarPersonajes(mesa?.personajesSerie)
        const episodiosBase = mesa?.episodiosSerie ?? []
        const documentosSerie = mesa?.documentosSerie ?? []
        const publicacionesSerie = mesa?.publicacionesSerie ?? []
        const traida = leerImportacion(fichasBase, episodiosBase)
        const fichas = traida?.fichas ?? fichasBase
        const episodiosSerie = traida?.episodiosSerie ?? episodiosBase
        const siguiente: Estado = {
          ...VACIO,
          listo: true,
          usuario: mesa?.perfil ?? null,
          fichas,
          calendario: mesa?.calendario ?? [],
          metricas: mesa?.metricas ?? [],
          personajesSerie,
          episodiosSerie,
          documentosSerie,
          publicacionesSerie,
          tutorialVisto: mesa?.tutorialVisto ?? false,
          offline: typeof navigator !== "undefined" ? !navigator.onLine : false,
          importadaId: traida?.id ?? null,
          aviso: traida?.aviso ?? null,
        }
        ref.current = siguiente
        setEstado(siguiente)
        if (traida || !mesa?.personajesSerie || mesa.personajesSerie.length === 0) {
          void guardarMesa({
            perfil: siguiente.usuario,
            fichas,
            calendario: siguiente.calendario,
            metricas: siguiente.metricas,
            personajesSerie,
            episodiosSerie,
            documentosSerie,
            publicacionesSerie,
            tutorialVisto: siguiente.tutorialVisto,
            guardadoEn: new Date().toISOString(),
          })
        }
        if (traida) {
          history.replaceState(null, "", `${window.location.pathname}${window.location.search}`)
        }
      })
      .catch(() => {
        if (vivo) setEstado((prev) => ({ ...prev, listo: true, personajesSerie: asegurarPersonajes([]) }))
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
      const traida = leerImportacion(ref.current.fichas, ref.current.episodiosSerie)
      if (!traida) return
      publicar(
        {
          fichas: traida.fichas ?? ref.current.fichas,
          episodiosSerie: traida.episodiosSerie ?? ref.current.episodiosSerie,
          importadaId: traida.id,
          aviso: traida.aviso,
        },
        {
          fichas: traida.fichas ?? ref.current.fichas,
          episodiosSerie: traida.episodiosSerie ?? ref.current.episodiosSerie,
        },
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
      guardarPersonaje: (datos, idExistente) => {
        const id = idExistente || crypto.randomUUID()
        const anterior = ref.current.personajesSerie.find((item) => item.id === id)
        const local = leerPersonaje(datos, id, anterior)
        if (!local.ok) return local
        const personajesSerie = anterior
          ? ref.current.personajesSerie.map((item) => (item.id === id ? local.personaje : item))
          : [...ref.current.personajesSerie, local.personaje]
        publicar({ personajesSerie }, { personajesSerie })
        return { ok: true }
      },
      borrarPersonaje: (id) => {
        if (!ref.current.personajesSerie.some((item) => item.id === id)) return { ok: false, error: "Esa ficha no está en este dispositivo." }
        const personajesSerie = ref.current.personajesSerie.filter((item) => item.id !== id)
        publicar({ personajesSerie }, { personajesSerie })
        return { ok: true }
      },
      guardarEpisodio: (datos, idExistente) => {
        const id = idExistente || crypto.randomUUID()
        const anterior = ref.current.episodiosSerie.find((item) => item.id === id)
        const local = leerEpisodio(datos, id, anterior)
        if (!local.ok) return local
        const episodiosSerie = anterior
          ? ref.current.episodiosSerie.map((item) => (item.id === id ? local.episodio : item))
          : [local.episodio, ...ref.current.episodiosSerie]
        publicar({ episodiosSerie }, { episodiosSerie })
        return { ok: true }
      },
      borrarEpisodio: (id) => {
        if (!ref.current.episodiosSerie.some((item) => item.id === id)) return { ok: false, error: "Ese episodio no está en este dispositivo." }
        const episodiosSerie = ref.current.episodiosSerie.filter((item) => item.id !== id)
        const documentosSerie = ref.current.documentosSerie.map((item) => ({
          ...item,
          episodioIds: item.episodioIds.filter((otro) => otro !== id),
        }))
        const publicacionesSerie = ref.current.publicacionesSerie.map((item) => ({
          ...item,
          episodioId: item.episodioId === id ? null : item.episodioId,
        }))
        publicar({ episodiosSerie, documentosSerie, publicacionesSerie }, { episodiosSerie, documentosSerie, publicacionesSerie })
        return { ok: true }
      },
      guardarDocumento: (datos, idExistente) => {
        const id = idExistente || crypto.randomUUID()
        const anterior = ref.current.documentosSerie.find((item) => item.id === id)
        const local = leerDocumento(datos, id, anterior)
        if (!local.ok) return local
        const documentosSerie = anterior
          ? ref.current.documentosSerie.map((item) => (item.id === id ? local.documento : item))
          : [local.documento, ...ref.current.documentosSerie]
        publicar({ documentosSerie }, { documentosSerie })
        return { ok: true }
      },
      borrarDocumento: (id) => {
        if (!ref.current.documentosSerie.some((item) => item.id === id)) return { ok: false, error: "Esa entrada no está en este dispositivo." }
        const documentosSerie = ref.current.documentosSerie.filter((item) => item.id !== id)
        publicar({ documentosSerie }, { documentosSerie })
        return { ok: true }
      },
      guardarPublicacion: (datos, idExistente) => {
        const id = idExistente || crypto.randomUUID()
        const anterior = ref.current.publicacionesSerie.find((item) => item.id === id)
        const local = leerPublicacion(datos, id, anterior)
        if (!local.ok) return local
        const publicacionesSerie = anterior
          ? ref.current.publicacionesSerie.map((item) => (item.id === id ? local.publicacion : item))
          : [local.publicacion, ...ref.current.publicacionesSerie]
        publicar({ publicacionesSerie }, { publicacionesSerie })
        return { ok: true }
      },
      borrarPublicacion: (id) => {
        if (!ref.current.publicacionesSerie.some((item) => item.id === id)) return { ok: false, error: "Esa publicación no está en este dispositivo." }
        const publicacionesSerie = ref.current.publicacionesSerie.filter((item) => item.id !== id)
        publicar({ publicacionesSerie }, { publicacionesSerie })
        return { ok: true }
      },
      comentarEpisodio: (id, texto) => {
        const usuario = ref.current.usuario
        const episodio = ref.current.episodiosSerie.find((item) => item.id === id)
        if (!usuario || !episodio) return { ok: false, error: "Ese episodio no está en este dispositivo." }
        const nota = texto.trim()
        if (!nota) return { ok: false, error: "Escribe un comentario." }
        const ahora = new Date().toISOString()
        const episodiosSerie = ref.current.episodiosSerie.map((item) =>
          item.id === id
            ? {
                ...item,
                actualizadoEn: ahora,
                comentarios: [
                  ...item.comentarios,
                  { id: crypto.randomUUID(), texto: nota, porNombre: usuario.nombre, en: ahora },
                ],
              }
            : item,
        )
        publicar({ episodiosSerie }, { episodiosSerie })
        return { ok: true }
      },
      aprobarEpisodio: (id, nota) => {
        const usuario = ref.current.usuario
        const episodio = ref.current.episodiosSerie.find((item) => item.id === id)
        if (!usuario || !episodio) return { ok: false, error: "Ese episodio no está en este dispositivo." }
        if (!checklistCompleto(episodio.checklist)) {
          return { ok: false, error: "Completa el checklist antes de aprobar." }
        }
        const ahora = new Date().toISOString()
        const comentario = nota?.trim()
        const episodiosSerie = ref.current.episodiosSerie.map((item) =>
          item.id === id
            ? {
                ...item,
                estado: "aprobado" as const,
                actualizadoEn: ahora,
                comentarios: comentario
                  ? [...item.comentarios, { id: crypto.randomUUID(), texto: comentario, porNombre: usuario.nombre, en: ahora }]
                  : item.comentarios,
              }
            : item,
        )
        publicar({ episodiosSerie }, { episodiosSerie })
        return { ok: true }
      },
      devolverEpisodio: (id, nota) => {
        const usuario = ref.current.usuario
        const episodio = ref.current.episodiosSerie.find((item) => item.id === id)
        if (!usuario || !episodio) return { ok: false, error: "Ese episodio no está en este dispositivo." }
        const comentario = nota?.trim()
        if (!comentario) return { ok: false, error: "Indica qué hay que cambiar al devolver el episodio." }
        const ahora = new Date().toISOString()
        const episodiosSerie = ref.current.episodiosSerie.map((item) =>
          item.id === id
            ? {
                ...item,
                estado: "guion" as const,
                actualizadoEn: ahora,
                comentarios: [...item.comentarios, { id: crypto.randomUUID(), texto: comentario, porNombre: usuario.nombre, en: ahora }],
              }
            : item,
        )
        publicar({ episodiosSerie }, { episodiosSerie })
        return { ok: true }
      },
      compartirEpisodio: (id) => {
        const usuario = ref.current.usuario
        const episodio = ref.current.episodiosSerie.find((item) => item.id === id)
        if (!usuario || !episodio) return { ok: false, error: "Ese episodio no está en este dispositivo." }
        const ok = abrirWhatsappEpisodio(episodio, usuario.nombre)
        if (!ok) return { ok: false, error: "No se pudo abrir WhatsApp." }
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
        const personajesSerie = reponerPersonajesOficiales(ref.current.personajesSerie)
        const ejemplo = episodioDeEjemplo()
        const episodiosSerie = ref.current.episodiosSerie.some((item) => item.id === ejemplo.id)
          ? ref.current.episodiosSerie
          : [ejemplo, ...ref.current.episodiosSerie]
        publicar(
          {
            fichas,
            calendario,
            metricas,
            personajesSerie,
            episodiosSerie,
            aviso: "Ejemplo cargado. Son datos ficticios, no de las cuentas oficiales.",
          },
          { fichas, calendario, metricas, personajesSerie, episodiosSerie },
        )
      },
      exportarCopia: () => {
        const copia = {
          tipo: "ugt-fesmc-copia",
          version: 2,
          perfil: ref.current.usuario,
          fichas: ref.current.fichas,
          calendario: ref.current.calendario,
          metricas: ref.current.metricas,
          personajesSerie: ref.current.personajesSerie,
          episodiosSerie: ref.current.episodiosSerie,
          documentosSerie: ref.current.documentosSerie,
          publicacionesSerie: ref.current.publicacionesSerie,
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
            personajesSerie?: PersonajeSerie[]
            episodiosSerie?: EpisodioSerie[]
            documentosSerie?: DocumentoSerie[]
            publicacionesSerie?: PublicacionSerie[]
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
          const personajesSerie = fusionarPorId(ref.current.personajesSerie, copia.personajesSerie)
          const episodiosMapa = new Map(ref.current.episodiosSerie.map((item) => [item.id, item]))
          for (const episodio of copia.episodiosSerie ?? []) {
            const fusion = fusionarEpisodio(episodiosMapa.get(episodio.id), episodio)
            episodiosMapa.set(episodio.id, fusion.episodio)
          }
          const episodiosSerie = [...episodiosMapa.values()]
          const documentosSerie = fusionarPorId(ref.current.documentosSerie, copia.documentosSerie)
          const publicacionesSerie = fusionarPorId(ref.current.publicacionesSerie, copia.publicacionesSerie)
          publicar(
            { fichas, calendario, metricas, personajesSerie, episodiosSerie, documentosSerie, publicacionesSerie, aviso: "Copia importada en este dispositivo." },
            { fichas, calendario, metricas, personajesSerie, episodiosSerie, documentosSerie, publicacionesSerie },
          )
          return { ok: true }
        } catch {
          return { ok: false, error: "No se pudo leer el archivo." }
        }
      },
    }
  }, [estado])

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

function leerImportacion(
  fichas: Ficha[],
  episodios: EpisodioSerie[],
): { fichas?: Ficha[]; episodiosSerie?: EpisodioSerie[]; id: string; aviso: string } | null {
  if (typeof window === "undefined") return null
  const hash = window.location.hash
  if (hash.startsWith("#/importar-sindi")) {
    const consulta = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : ""
    const dato = new URLSearchParams(consulta).get("d")
    if (!dato) return null
    const paquete = decodificarPaqueteEpisodio(dato)
    if (!paquete) return { episodiosSerie: episodios, id: "", aviso: "El enlace de WhatsApp no se pudo leer." }
    const entrante = episodioDesdePaquete(paquete)
    const local = episodios.find((item) => item.id === entrante.id)
    const fusion = fusionarEpisodio(local, entrante)
    const siguientes = local
      ? episodios.map((item) => (item.id === fusion.episodio.id ? fusion.episodio : item))
      : [fusion.episodio, ...episodios]
    return {
      episodiosSerie: siguientes,
      id: fusion.episodio.id,
      aviso: fusion.nuevo ? `Episodio importado: ${fusion.episodio.titulo}` : `Episodio actualizado: ${fusion.episodio.titulo}`,
    }
  }
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
