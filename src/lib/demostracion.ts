import { anotarRegistro, migrarMesa, type MesaLocal } from "@/lib/almacen"
import { recursosDeDemostracion } from "@/lib/biblioteca"
import { entradaRegistro } from "@/lib/copias"
import type { EstadoId, Ficha, HistorialItem } from "@/lib/dominio"
import { calendarioDeEjemplo, fichasDeEjemplo } from "@/lib/ejemplo"
import {
  CHECKLIST_VACIO,
  episodioDeEjemplo,
  reponerPersonajesOficiales,
  type DocumentoSerie,
  type EpisodioSerie,
  type PublicacionSerie,
} from "@/lib/sindi-cato"
import { borradorPublicacion, textoParaCuentaInsular } from "@/lib/textos"

function paso(id: string, estado: EstadoId, en: string, nota: string): HistorialItem {
  return { id, estado, porId: "demo", porNombre: "Equipo DEMOSTRACIÓN", en, nota }
}

function fichaDemo(parcial: Omit<Ficha, "textoPublicacion" | "textoCompartir" | "creadoPorId" | "creadoPorNombre" | "difundidoEn" | "checklist" | "compartidos" | "ejemplo" | "contactoMedio" | "materialAutorizado"> & Partial<Ficha>): Ficha {
  const ficha: Ficha = {
    textoPublicacion: "",
    textoCompartir: "",
    creadoPorId: "demo",
    creadoPorNombre: "Equipo DEMOSTRACIÓN",
    difundidoEn: null,
    checklist: null,
    compartidos: [],
    contactoMedio: "Canal interno del equipo",
    materialAutorizado: true,
    ...parcial,
    ejemplo: true,
  }
  ficha.textoPublicacion = ficha.textoPublicacion || borradorPublicacion(ficha)
  ficha.textoCompartir = ficha.textoCompartir || textoParaCuentaInsular(ficha, ficha.isla)
  return ficha
}

/** Fichas añadidas para que el tablero de coordinación tenga una pieza en cada paso. */
export function fichasExtraDemostracion(): Ficha[] {
  return [
    fichaDemo({
      id: "demo-revision-gc",
      titulo: "Calor en las cocinas: qué dice la prevención de riesgos",
      queOcurrio: "Pieza de DEMOSTRACIÓN. Varias cocinas de hostelería en Gran Canaria (ficticias) superan temperaturas razonables en verano. Se quiere explicar qué medidas exige la prevención de riesgos.",
      isla: "gran_canaria",
      cuando: "2026-11-24",
      sector: "hosteleria",
      fuentes: "DEMOSTRACIÓN. Guía pública de prevención y consulta a la sección.",
      descripcionMaterial: "Ilustración propia, sin personas reconocibles.",
      referenciaMaterial: "Carpeta del equipo › Imágenes › cocina-ilustracion.png (DEMOSTRACIÓN)",
      contactoNombre: "Sección de hostelería (DEMOSTRACIÓN)",
      sensible: false,
      motivoSensible: "",
      pilar: "salud",
      canales: ["instagram", "facebook"],
      estado: "en_revision",
      creadoEn: "2026-11-23T09:00:00.000Z",
      actualizadoEn: "2026-11-24T12:00:00.000Z",
      programadoPara: "2026-12-14",
      publicadoEn: null,
      historial: [
        paso("demo-revision-gc-1", "borrador", "2026-11-23T09:00:00.000Z", "Borrador de DEMOSTRACIÓN."),
        paso("demo-revision-gc-2", "propuesta", "2026-11-23T18:00:00.000Z", "Enviada por WhatsApp a coordinación."),
        paso("demo-revision-gc-3", "en_revision", "2026-11-24T12:00:00.000Z", "Revisar fuentes y tono."),
      ],
    }),
    fichaDemo({
      id: "demo-aprobada-lp",
      titulo: "Nuevo horario de atención de UGT en La Palma",
      queOcurrio: "Pieza de DEMOSTRACIÓN. La sede ficticia de La Palma amplía el horario de atención a la afiliación los martes por la tarde para las personas con turno de mañana.",
      isla: "la_palma",
      cuando: "2026-11-25",
      sector: "comercio",
      fuentes: "DEMOSTRACIÓN. Nota interna de la sede insular.",
      descripcionMaterial: "Cartel con la gráfica de la federación, sin fotos de personas.",
      referenciaMaterial: "Plantilla «Aviso de horario» de la Biblioteca",
      contactoNombre: "Responsable de La Palma (DEMOSTRACIÓN)",
      sensible: false,
      motivoSensible: "",
      pilar: "servicios",
      canales: ["instagram", "facebook"],
      estado: "aprobada",
      creadoEn: "2026-11-20T10:00:00.000Z",
      actualizadoEn: "2026-11-25T08:30:00.000Z",
      programadoPara: "2026-12-02",
      publicadoEn: null,
      historial: [
        paso("demo-aprobada-lp-1", "propuesta", "2026-11-21T10:00:00.000Z", "Propuesta de la isla."),
        paso("demo-aprobada-lp-2", "en_revision", "2026-11-22T10:00:00.000Z", "Sin datos personales."),
        paso("demo-aprobada-lp-3", "revision_legal", "2026-11-24T10:00:00.000Z", "Revisión jurídica breve."),
        paso("demo-aprobada-lp-4", "aprobada", "2026-11-25T08:30:00.000Z", "Lista para publicar el 2 de diciembre."),
      ],
    }),
    fichaDemo({
      id: "demo-cambios-eh",
      titulo: "Limpieza en centros de salud: refuerzo de plantilla",
      queOcurrio: "Pieza de DEMOSTRACIÓN. La plantilla ficticia de limpieza de los centros de salud de El Hierro pide refuerzo en invierno. La ficha necesita una fuente más sólida antes de publicarse.",
      isla: "el_hierro",
      cuando: "2026-11-22",
      sector: "limpieza",
      fuentes: "DEMOSTRACIÓN. Comentario de la sección, pendiente de documento.",
      descripcionMaterial: "Sin imagen de personas.",
      contactoNombre: "Sección de limpieza (DEMOSTRACIÓN)",
      sensible: false,
      motivoSensible: "",
      pilar: "actividad",
      canales: ["facebook"],
      estado: "cambios",
      creadoEn: "2026-11-22T09:00:00.000Z",
      actualizadoEn: "2026-11-24T17:00:00.000Z",
      programadoPara: null,
      publicadoEn: null,
      historial: [
        paso("demo-cambios-eh-1", "propuesta", "2026-11-22T11:00:00.000Z", "Propuesta de la sección."),
        paso("demo-cambios-eh-2", "en_revision", "2026-11-23T11:00:00.000Z", "Revisión de redacción."),
        paso("demo-cambios-eh-3", "cambios", "2026-11-24T17:00:00.000Z", "Falta la fuente escrita. Añadidla y volved a enviar."),
      ],
    }),
    fichaDemo({
      id: "demo-borrador-lg",
      titulo: "Transporte marítimo: horarios de invierno en La Gomera",
      queOcurrio: "Borrador de DEMOSTRACIÓN. Se prepara una pieza sobre cómo afectan los horarios de invierno de las navieras (ficticias) a los turnos del personal de tierra.",
      isla: "la_gomera",
      cuando: "2026-11-25",
      sector: "maritimo",
      fuentes: "DEMOSTRACIÓN. Conversación con delegados, pendiente de nota.",
      descripcionMaterial: "Sin fotos todavía.",
      contactoNombre: "Responsable de La Gomera (DEMOSTRACIÓN)",
      materialAutorizado: false,
      sensible: false,
      motivoSensible: "",
      pilar: "actualidad",
      canales: ["instagram"],
      estado: "borrador",
      creadoEn: "2026-11-25T07:30:00.000Z",
      actualizadoEn: "2026-11-25T07:30:00.000Z",
      programadoPara: null,
      publicadoEn: null,
      historial: [paso("demo-borrador-lg-1", "borrador", "2026-11-25T07:30:00.000Z", "Borrador en este dispositivo.")],
    }),
  ]
}

export function episodiosDeDemostracion(): EpisodioSerie[] {
  const piloto = episodioDeEjemplo()
  const publicado: EpisodioSerie = {
    id: "demo-episodio-pausas",
    titulo: "Sindi y Cato: la pausa no es un favor",
    tematica: "Descansos durante la jornada",
    sector: "servicios",
    sinopsis: "Cato duda si puede tomarse la pausa en plena campaña. Sindi le explica que el descanso está en el convenio y no depende del humor del día. Episodio de DEMOSTRACIÓN ya publicado.",
    guion: "Cato: Hoy hay mucho lío, ¿me salto la pausa?\n\nSindi: La pausa no es un favor, Cato. Mira tu convenio: ahí dice cuánto dura y cuándo.\n\nCato: ¿Y si me dicen que ahora no?\n\nSindi: Pregunta en tu sección o a tu delegada. Esta serie orienta, no sustituye el asesoramiento.",
    estado: "publicado",
    promptImagen: "Sindi y Cato en una oficina luminosa de Gran Canaria, estilo de la ilustración oficial, Cato mira el reloj, Sindi señala un cuaderno. Sin personas reales.",
    promptVideo: "Vídeo vertical 9:16 de 30 segundos, dos planos y cierre con el lema de la serie. Sin marcas comerciales.",
    escenas: "1. Cato mira el reloj.\n2. Sindi responde.\n3. Cierre con el lema.",
    duracion: "30 s",
    formato: "9:16",
    materialesRef: "imagenes/sindi-y-cato.webp",
    checklist: { ...CHECKLIST_VACIO, datosVerificados: true, identidadProtegida: true, hechosVsRecreacion: true, revisionLegal: true },
    comentarios: [
      { id: "demo-com-1", texto: "Revisado con el convenio de referencia. DEMOSTRACIÓN.", porNombre: "Referente jurídico (DEMOSTRACIÓN)", en: "2026-11-12T10:00:00.000Z" },
    ],
    creadoEn: "2026-11-05T10:00:00.000Z",
    actualizadoEn: "2026-11-14T10:00:00.000Z",
    ejemplo: true,
  }
  return [piloto, publicado]
}

export function documentosDeDemostracion(): DocumentoSerie[] {
  return [
    {
      id: "demo-doc-estatuto",
      tipo: "legislacion",
      titulo: "Estatuto de los Trabajadores, art. 34 (jornada)",
      enlace: "https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430",
      notas: "Base para los episodios de jornada y descansos. DEMOSTRACIÓN.",
      episodioIds: ["ejemplo-episodio-turno", "demo-episodio-pausas"],
      creadoEn: "2026-11-05T10:00:00.000Z",
      actualizadoEn: "2026-11-05T10:00:00.000Z",
      ejemplo: true,
    },
  ]
}

export function publicacionesDeDemostracion(): PublicacionSerie[] {
  return [
    {
      id: "demo-pub-pausas",
      episodioId: "demo-episodio-pausas",
      descripcion: "La pausa no es un favor. Sindi y Cato te lo cuentan en 30 segundos. (DEMOSTRACIÓN)",
      titular: "La pausa no es un favor",
      etiquetas: "#SindiYCato #UGTFeSMCCanarias",
      plataformas: ["tiktok", "instagram"],
      fecha: "2026-11-14",
      enlaceVideo: "",
      archivada: true,
      creadoEn: "2026-11-14T10:00:00.000Z",
      actualizadoEn: "2026-11-14T10:00:00.000Z",
      ejemplo: true,
    },
  ]
}

function anadir<T extends { id: string }>(actuales: T[], nuevos: T[], alPrincipio = false): T[] {
  const ids = new Set(actuales.map((item) => item.id))
  const faltan = nuevos.filter((item) => !ids.has(item.id))
  return alPrincipio ? [...faltan, ...actuales] : [...actuales, ...faltan]
}

/** Añade los datos de DEMOSTRACIÓN sin tocar nada de lo que ya hay (si un id existe, se respeta el local). */
export function cargarDemostracion(mesa: MesaLocal, porNombre: string | null): MesaLocal {
  const siguiente: MesaLocal = {
    ...mesa,
    fichas: anadir(mesa.fichas, [...fichasExtraDemostracion(), ...fichasDeEjemplo()], true),
    calendario: anadir(mesa.calendario, calendarioDeEjemplo()).sort((a, b) => a.fecha.localeCompare(b.fecha)),
    personajesSerie: reponerPersonajesOficiales(mesa.personajesSerie),
    episodiosSerie: anadir(mesa.episodiosSerie, episodiosDeDemostracion(), true),
    documentosSerie: anadir(mesa.documentosSerie, documentosDeDemostracion(), true),
    publicacionesSerie: anadir(mesa.publicacionesSerie, publicacionesDeDemostracion(), true),
    biblioteca: anadir(mesa.biblioteca, recursosDeDemostracion(), true),
  }
  siguiente.registroCopias = anotarRegistro(mesa.registroCopias, entradaRegistro("demo-cargada", "Datos de DEMOSTRACIÓN añadidos. No se tocó nada existente.", porNombre))
  return migrarMesa(siguiente) as MesaLocal
}

export function contarDemostracion(mesa: MesaLocal): number {
  return (
    mesa.fichas.filter((item) => item.ejemplo).length +
    mesa.calendario.filter((item) => item.ejemplo).length +
    mesa.metricas.filter((item) => item.ejemplo).length +
    mesa.episodiosSerie.filter((item) => item.ejemplo).length +
    mesa.documentosSerie.filter((item) => item.ejemplo).length +
    mesa.publicacionesSerie.filter((item) => item.ejemplo).length +
    mesa.biblioteca.filter((item) => item.ejemplo).length
  )
}

/** Quita SOLO lo marcado como DEMOSTRACIÓN. Lo demás no se toca; los vínculos a lo quitado se sueltan. */
export function quitarDemostracion(mesa: MesaLocal, porNombre: string | null): { mesa: MesaLocal; quitados: number } {
  const quitados = contarDemostracion(mesa)
  const fichas = mesa.fichas.filter((item) => !item.ejemplo)
  const idsFichas = new Set(fichas.map((item) => item.id))
  const episodiosSerie = mesa.episodiosSerie.filter((item) => !item.ejemplo)
  const idsEpisodios = new Set(episodiosSerie.map((item) => item.id))
  const siguiente: MesaLocal = {
    ...mesa,
    fichas,
    calendario: mesa.calendario
      .filter((item) => !item.ejemplo)
      .map((item) => (item.fichaId && !idsFichas.has(item.fichaId) ? { ...item, fichaId: null } : item)),
    metricas: mesa.metricas.filter((item) => !item.ejemplo),
    episodiosSerie,
    documentosSerie: mesa.documentosSerie
      .filter((item) => !item.ejemplo)
      .map((item) => ({ ...item, episodioIds: item.episodioIds.filter((id) => idsEpisodios.has(id)) })),
    publicacionesSerie: mesa.publicacionesSerie
      .filter((item) => !item.ejemplo)
      .map((item) => (item.episodioId && !idsEpisodios.has(item.episodioId) ? { ...item, episodioId: null } : item)),
    biblioteca: mesa.biblioteca.filter((item) => !item.ejemplo),
  }
  siguiente.registroCopias = anotarRegistro(mesa.registroCopias, entradaRegistro("demo-quitada", `Quitados ${quitados} elementos de DEMOSTRACIÓN. El resto no se tocó.`, porNombre))
  return { mesa: migrarMesa(siguiente) as MesaLocal, quitados }
}
