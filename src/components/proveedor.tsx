"use client"

import { anotarRegistro, mesaVacia, type EntradaRegistroCopia } from "@/lib/almacen"
import { leerRecurso, type RecursoBiblioteca } from "@/lib/biblioteca"
import { construirHueco, leerDatosHueco } from "@/lib/calendario-logica"
import { guardarAntesDeImportar, guardarMesa, leerAntesDeImportar, leerMesa, type MesaLocal } from "@/lib/cliente/idb"
import {
  construirCopia,
  entradaRegistro,
  fusionarCopia,
  nombreArchivoCopia,
  resumirImportacion,
  textoResumen,
  validarCopia,
  type ResultadoValidacion,
  type ResumenImportacion,
} from "@/lib/copias"
import { cargarDemostracion as conDemostracion, quitarDemostracion as sinDemostracion } from "@/lib/demostracion"
import type { Ficha, Hueco, IslaId, MetricaMes, RolId, SectorId, UsuarioPublico } from "@/lib/dominio"
import { actualizarDatos, actualizarTextos, aclararFicha, aplicarTransicion, construirFicha, programarFicha, registrarCompartido } from "@/lib/fichas"
import { construirMetrica } from "@/lib/metricas-logica"
import {
  abrirWhatsappEpisodio,
  asegurarPersonajes,
  checklistCompleto,
  decodificarPaqueteEpisodio,
  episodioDesdePaquete,
  fusionarEpisodio,
  leerDocumento,
  leerEpisodio,
  leerPersonaje,
  leerPublicacion,
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

export type ValidacionOk = Extract<ResultadoValidacion, { ok: true }>

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
  biblioteca: RecursoBiblioteca[]
  registroCopias: EntradaRegistroCopia[]
  esquema: number
  offline: boolean
  pendientes: number
  aviso: string | null
  tutorialVisto: boolean
  tutorialAbierto: boolean
  importadaId: string | null
  /** Si la lectura inicial falla, no se escribe nada para no pisar los datos guardados. */
  cargaFallida: boolean
  idbBloqueada: boolean
  deshacerDisponible: string | null
}

type Valor = Estado & {
  guardarPerfil: (perfil: PerfilNuevo) => void
  cambiarRol: (rol: RolId, isla?: IslaId | null, sector?: SectorId | null) => void
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
  guardarRecurso: (datos: unknown, idExistente?: string) => Resultado
  borrarRecurso: (id: string) => Resultado
  cargarEjemplo: () => void
  cargarDemostracion: () => void
  quitarDemostracion: () => number
  exportarCopia: () => void
  previsualizarCopia: (texto: string) => { ok: true; validacion: ValidacionOk; resumen: ResumenImportacion } | { ok: false; error: string }
  confirmarImportacion: (validacion: ValidacionOk) => Promise<{ ok: true; mensaje: string } | { ok: false; error: string }>
  importarCopia: (texto: string) => { ok: true } | { ok: false; error: string }
  deshacerImportacion: () => Promise<{ ok: true } | { ok: false; error: string }>
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
  biblioteca: [],
  registroCopias: [],
  esquema: 2,
  offline: false,
  pendientes: 0,
  aviso: null,
  tutorialVisto: false,
  tutorialAbierto: false,
  importadaId: null,
  cargaFallida: false,
  idbBloqueada: false,
  deshacerDisponible: null,
}

function mesaDeEstado(estado: Estado): MesaLocal {
  return {
    ...mesaVacia(),
    esquema: estado.esquema,
    perfil: estado.usuario,
    fichas: estado.fichas,
    calendario: estado.calendario,
    metricas: estado.metricas,
    personajesSerie: estado.personajesSerie,
    episodiosSerie: estado.episodiosSerie,
    documentosSerie: estado.documentosSerie,
    publicacionesSerie: estado.publicacionesSerie,
    biblioteca: estado.biblioteca,
    registroCopias: estado.registroCopias,
    tutorialVisto: estado.tutorialVisto,
    guardadoEn: new Date().toISOString(),
  }
}

function estadoDeMesa(mesa: MesaLocal): Partial<Estado> {
  return {
    usuario: mesa.perfil,
    fichas: mesa.fichas,
    calendario: mesa.calendario,
    metricas: mesa.metricas,
    personajesSerie: mesa.personajesSerie,
    episodiosSerie: mesa.episodiosSerie,
    documentosSerie: mesa.documentosSerie,
    publicacionesSerie: mesa.publicacionesSerie,
    biblioteca: mesa.biblioteca,
    registroCopias: mesa.registroCopias,
    tutorialVisto: mesa.tutorialVisto,
    esquema: mesa.esquema,
  }
}

export function Proveedor({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<Estado>(VACIO)
  const ref = useRef(estado)
  useEffect(() => {
    ref.current = estado
  })

  /**
   * Aplica un cambio y lo guarda. El segundo argumento se mantiene por compatibilidad:
   * lo que se guarda es siempre el estado completo resultante.
   */
  function publicar(parcial: Partial<Estado>, mesa?: Partial<MesaLocal>) {
    void mesa
    setEstado((prev) => {
      const siguiente = { ...prev, ...parcial, listo: true }
      ref.current = siguiente
      if (!siguiente.cargaFallida) void guardarMesa(mesaDeEstado(siguiente))
      return siguiente
    })
  }

  function registrar(tipo: EntradaRegistroCopia["tipo"], detalle: string): EntradaRegistroCopia[] {
    return anotarRegistro(ref.current.registroCopias, entradaRegistro(tipo, detalle, ref.current.usuario?.nombre ?? null))
  }

  useEffect(() => {
    let vivo = true
    function bloqueada() {
      setEstado((prev) => ({ ...prev, idbBloqueada: true }))
    }
    window.addEventListener("ugt-idb-bloqueada", bloqueada)
    void leerMesa()
      .then(async (leida) => {
        if (!vivo) return
        const mesa = leida ?? mesaVacia()
        const personajesSerie = asegurarPersonajes(mesa.personajesSerie)
        const traida = leerImportacion(mesa.fichas, mesa.episodiosSerie)
        const fichas = traida?.fichas ?? mesa.fichas
        const episodiosSerie = traida?.episodiosSerie ?? mesa.episodiosSerie
        const previa = await leerAntesDeImportar().catch(() => null)
        const siguiente: Estado = {
          ...VACIO,
          ...estadoDeMesa(mesa),
          listo: true,
          fichas,
          personajesSerie,
          episodiosSerie,
          offline: typeof navigator !== "undefined" ? !navigator.onLine : false,
          importadaId: traida?.id ?? null,
          aviso: traida?.aviso ?? null,
          deshacerDisponible: previa?.en || null,
        }
        ref.current = siguiente
        setEstado(siguiente)
        if (traida || !leida || mesa.personajesSerie.length === 0) {
          void guardarMesa(mesaDeEstado(siguiente))
        }
        if (traida) {
          history.replaceState(null, "", `${window.location.pathname}${window.location.search}`)
        }
      })
      .catch(() => {
        if (vivo) {
          setEstado((prev) => ({
            ...prev,
            listo: true,
            cargaFallida: true,
            personajesSerie: asegurarPersonajes([]),
            aviso: "No se pudieron leer los datos guardados. Para protegerlos, esta sesión no guardará cambios. Recarga la app.",
          }))
        }
      })
    function red() {
      setEstado((prev) => ({ ...prev, offline: !navigator.onLine }))
    }
    window.addEventListener("online", red)
    window.addEventListener("offline", red)
    return () => {
      vivo = false
      window.removeEventListener("ugt-idb-bloqueada", bloqueada)
      window.removeEventListener("online", red)
      window.removeEventListener("offline", red)
    }
  }, [])

  useEffect(() => {
    function alHash() {
      const traida = leerImportacion(ref.current.fichas, ref.current.episodiosSerie)
      if (!traida) return
      publicar({
        fichas: traida.fichas ?? ref.current.fichas,
        episodiosSerie: traida.episodiosSerie ?? ref.current.episodiosSerie,
        importadaId: traida.id,
        aviso: traida.aviso,
      })
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}`)
    }
    window.addEventListener("hashchange", alHash)
    return () => window.removeEventListener("hashchange", alHash)
  }, [])

  const valor = useMemo<Valor>(() => {
    function cargarDemo() {
      const mesa = conDemostracion(mesaDeEstado(ref.current), ref.current.usuario?.nombre ?? null)
      publicar({ ...estadoDeMesa(mesa), usuario: ref.current.usuario, aviso: "Datos de DEMOSTRACIÓN cargados. Son ficticios y se pueden quitar desde Inicio o Copias." })
    }
    return {
      ...estado,
      limpiarAviso: () => setEstado((prev) => ({ ...prev, aviso: null })),
      limpiarImportada: () => setEstado((prev) => ({ ...prev, importadaId: null })),
      abrirTutorial: () => setEstado((prev) => ({ ...prev, tutorialAbierto: true })),
      cerrarTutorial: () => {
        publicar({ tutorialAbierto: false, tutorialVisto: true })
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
        publicar({ usuario, tutorialAbierto: abrir })
      },
      cambiarRol: (rol, isla, sector) => {
        const actual = ref.current.usuario
        if (!actual) return
        const usuario: UsuarioPublico = {
          ...actual,
          rol,
          isla: rol === "insular" ? (isla ?? actual.isla ?? "tenerife") : null,
          sector: rol === "sectorial" ? (sector ?? actual.sector ?? "hosteleria") : null,
        }
        publicar({ usuario })
      },
      salir: () => publicar({ usuario: null }),
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
        } else if (tipo === "programar") {
          local = programarFicha({ ficha, fecha: typeof cuerpo.fecha === "string" ? cuerpo.fecha : null, usuario, ahora, eventoId })
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
        const previo = ref.current.calendario.find((hueco) => hueco.id === id)
        const local = construirHueco({ id, datos: leido.datos, ejemplo: previo?.ejemplo ?? false })
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
      guardarRecurso: (datos, idExistente) => {
        const id = idExistente || crypto.randomUUID()
        const anterior = ref.current.biblioteca.find((item) => item.id === id)
        const local = leerRecurso(datos, id, new Date().toISOString(), anterior)
        if (!local.ok) return local
        const biblioteca = anterior
          ? ref.current.biblioteca.map((item) => (item.id === id ? local.recurso : item))
          : [local.recurso, ...ref.current.biblioteca]
        publicar({ biblioteca })
        return { ok: true }
      },
      borrarRecurso: (id) => {
        if (!ref.current.biblioteca.some((item) => item.id === id)) return { ok: false, error: "Ese recurso no está en este dispositivo." }
        publicar({ biblioteca: ref.current.biblioteca.filter((item) => item.id !== id) })
        return { ok: true }
      },
      cargarEjemplo: cargarDemo,
      cargarDemostracion: cargarDemo,
      quitarDemostracion: () => {
        const { mesa, quitados } = sinDemostracion(mesaDeEstado(ref.current), ref.current.usuario?.nombre ?? null)
        publicar({
          ...estadoDeMesa(mesa),
          usuario: ref.current.usuario,
          aviso: quitados ? `Quitados ${quitados} elementos de DEMOSTRACIÓN. Tus datos no se han tocado.` : "No había datos de DEMOSTRACIÓN.",
        })
        return quitados
      },
      exportarCopia: () => {
        const registroCopias = registrar("exportacion", `Copia descargada con ${ref.current.fichas.length} fichas, ${ref.current.episodiosSerie.length} episodios y ${ref.current.biblioteca.length} recursos.`)
        const copia = construirCopia({ ...mesaDeEstado(ref.current), registroCopias })
        const blob = new Blob([JSON.stringify(copia, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const enlace = document.createElement("a")
        enlace.href = url
        enlace.download = nombreArchivoCopia()
        document.body.appendChild(enlace)
        enlace.click()
        enlace.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        publicar({ registroCopias })
      },
      previsualizarCopia: (texto) => {
        const validacion = validarCopia(texto)
        if (!validacion.ok) return validacion
        return { ok: true, validacion, resumen: resumirImportacion(mesaDeEstado(ref.current), validacion) }
      },
      confirmarImportacion: async (validacion) => {
        if (ref.current.cargaFallida) return { ok: false, error: "Esta sesión no puede guardar. Recarga la app antes de importar." }
        try {
          const antes = mesaDeEstado(ref.current)
          const resumen = resumirImportacion(antes, validacion)
          await guardarAntesDeImportar(antes)
          const fusion = fusionarCopia(antes, validacion.copia)
          const mensaje = `Copia importada. ${textoResumen(resumen)}`
          const registroCopias = anotarRegistro(fusion.registroCopias, entradaRegistro("importacion", mensaje, ref.current.usuario?.nombre ?? null))
          publicar({ ...estadoDeMesa(fusion), usuario: ref.current.usuario, registroCopias, aviso: mensaje, deshacerDisponible: new Date().toISOString() })
          return { ok: true, mensaje }
        } catch {
          return { ok: false, error: "No se pudo importar la copia. No se ha cambiado nada." }
        }
      },
      importarCopia: (texto) => {
        const validacion = validarCopia(texto)
        if (!validacion.ok) return validacion
        void valorActual.current?.confirmarImportacion(validacion)
        return { ok: true }
      },
      deshacerImportacion: async () => {
        const previa = await leerAntesDeImportar().catch(() => null)
        if (!previa) return { ok: false, error: "No hay ninguna importación que deshacer en este dispositivo." }
        const registroCopias = anotarRegistro(ref.current.registroCopias, entradaRegistro("deshacer", "Se volvió al estado anterior a la última importación.", ref.current.usuario?.nombre ?? null))
        publicar({ ...estadoDeMesa(previa.mesa), usuario: ref.current.usuario, registroCopias, deshacerDisponible: null, aviso: "Importación deshecha. Los datos vuelven a estar como antes de importar." })
        return { ok: true }
      },
    }
  }, [estado])

  const valorActual = useRef<Valor | null>(null)
  useEffect(() => {
    valorActual.current = valor
  })

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
