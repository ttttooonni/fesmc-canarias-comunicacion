import type { Ficha, Hueco, MetricaMes } from "@/lib/dominio"
import { borradorPublicacion, textoParaCuentaInsular } from "@/lib/textos"

function pieza(parcial: Ficha): Ficha {
  const ficha = { ...parcial, ejemplo: true }
  ficha.textoPublicacion = ficha.textoPublicacion || borradorPublicacion(ficha)
  ficha.textoCompartir = ficha.textoCompartir || textoParaCuentaInsular(ficha, ficha.isla)
  return ficha
}

export function fichasDeEjemplo(): Ficha[] {
  return [
    pieza({
      id: "ejemplo-propuesta-lz",
      titulo: "Turno cambiado por mensaje en un hotel de Lanzarote",
      queOcurrio:
        "En un hotel de Lanzarote (ejemplo) cambian el turno por mensaje la noche anterior. La ficha pide contarlo como derecho al cuadrante, sin nombres ni capturas.",
      isla: "lanzarote",
      cuando: "2026-12-11",
      sector: "hosteleria",
      fuentes: "Ficha de ejemplo de la isla. Sin expediente.",
      materialAutorizado: true,
      descripcionMaterial: "Sin fotos de personas. Serie Sindi y Cato.",
      contactoNombre: "Responsable de Lanzarote (ejemplo)",
      contactoMedio: "Canal interno del equipo",
      sensible: true,
      motivoSensible: "Conflicto abierto en un centro pequeño.",
      pilar: "sindi_cato",
      canales: ["instagram", "tiktok", "facebook"],
      estado: "propuesta",
      creadoPorId: "ejemplo",
      creadoPorNombre: "Ejemplo",
      creadoEn: "2026-11-18T10:00:00.000Z",
      actualizadoEn: "2026-11-20T10:00:00.000Z",
      historial: [
        {
          id: "ejemplo-propuesta-lz-h",
          estado: "propuesta",
          porId: "ejemplo",
          porNombre: "Ejemplo",
          en: "2026-11-20T10:00:00.000Z",
          nota: "Propuesta de ejemplo para ver el circuito.",
        },
      ],
      textoPublicacion: "",
      textoCompartir: "",
      programadoPara: null,
      publicadoEn: null,
      difundidoEn: null,
      checklist: null,
      compartidos: [],
      ejemplo: true,
    }),
    pieza({
      id: "ejemplo-legal-tf",
      titulo: "Cuadrante de invierno en el aeropuerto",
      queOcurrio:
        "El comité de una empresa de handling en Tenerife (ejemplo) quiere recordar que el cuadrante de invierno no se improvisa por mensaje.",
      isla: "tenerife",
      cuando: "2026-12-07",
      sector: "aereo",
      fuentes: "Nota de ejemplo, sin el cuadrante real.",
      materialAutorizado: true,
      descripcionMaterial: "Gráfica genérica, sin marcas de aerolínea.",
      contactoNombre: "Responsable de Tenerife (ejemplo)",
      contactoMedio: "Canal interno del equipo",
      sensible: false,
      motivoSensible: "",
      pilar: "derechos",
      canales: ["instagram", "facebook"],
      estado: "revision_legal",
      creadoPorId: "ejemplo",
      creadoPorNombre: "Ejemplo",
      creadoEn: "2026-11-16T09:00:00.000Z",
      actualizadoEn: "2026-11-21T16:00:00.000Z",
      historial: [
        {
          id: "ejemplo-legal-tf-h",
          estado: "revision_legal",
          porId: "ejemplo",
          porNombre: "Ejemplo",
          en: "2026-11-21T16:00:00.000Z",
          nota: "Pasa a revisión legal. Dato de ejemplo.",
        },
      ],
      textoPublicacion: "",
      textoCompartir: "",
      programadoPara: null,
      publicadoEn: null,
      difundidoEn: null,
      checklist: null,
      compartidos: [],
      ejemplo: true,
    }),
    pieza({
      id: "ejemplo-publicada-fv",
      titulo: "Pausas en el contact center, por escrito",
      queOcurrio:
        "En un contact center de Fuerteventura (ejemplo) se recuerda que la pausa no es un favor y que se consulta el convenio. No se identifica a la plataforma.",
      isla: "fuerteventura",
      cuando: "2026-11-12",
      sector: "contact_center",
      fuentes: "Sección de ejemplo y convenio de referencia.",
      materialAutorizado: true,
      descripcionMaterial: "Ilustración propia, sin personas.",
      contactoNombre: "Sección de contact center (ejemplo)",
      contactoMedio: "Canal interno del equipo",
      sensible: false,
      motivoSensible: "",
      pilar: "derechos",
      canales: ["instagram", "facebook"],
      estado: "publicada",
      creadoPorId: "ejemplo",
      creadoPorNombre: "Ejemplo",
      creadoEn: "2026-11-10T09:00:00.000Z",
      actualizadoEn: "2026-11-19T11:00:00.000Z",
      historial: [
        {
          id: "ejemplo-publicada-fv-h",
          estado: "publicada",
          porId: "ejemplo",
          porNombre: "Ejemplo",
          en: "2026-11-19T11:00:00.000Z",
          nota: "Publicada en las cuentas de la federación. Dato de ejemplo.",
        },
      ],
      textoPublicacion: "",
      textoCompartir: "",
      programadoPara: null,
      publicadoEn: "2026-11-19T11:00:00.000Z",
      difundidoEn: null,
      checklist: null,
      compartidos: [],
      ejemplo: true,
    }),
  ]
}

export function calendarioDeEjemplo(): Hueco[] {
  const piezas: Array<Pick<Hueco, "id" | "fecha" | "franja" | "pilar" | "titulo" | "angulo" | "canales" | "fichaId">> = [
    { id: "cal-2026-12-02", fecha: "2026-12-02", franja: "miercoles_actividad", pilar: "actividad", titulo: "Arranca el ritmo de diciembre", angulo: "Contar el calendario semanal y pedir la ficha breve.", canales: ["instagram", "facebook"], fichaId: null },
    { id: "cal-2026-12-04", fecha: "2026-12-04", franja: "viernes_actualidad", pilar: "actualidad", titulo: "Temporada alta: dejarlo por escrito", angulo: "El cambio de turno se mira en el convenio.", canales: ["instagram", "facebook", "tiktok"], fichaId: null },
    { id: "cal-2026-12-07", fecha: "2026-12-07", franja: "lunes_derechos", pilar: "derechos", titulo: "Festivos de diciembre y descanso", angulo: "Qué pasa si se trabaja un festivo.", canales: ["instagram", "facebook"], fichaId: "ejemplo-legal-tf" },
    { id: "cal-2026-12-09", fecha: "2026-12-09", franja: "miercoles_actividad", pilar: "actividad", titulo: "Encuentro de delegadas y delegados", angulo: "Actividad insular de ejemplo, sin fotos no autorizadas.", canales: ["instagram", "facebook"], fichaId: null },
    { id: "cal-2026-12-11", fecha: "2026-12-11", franja: "viernes_actualidad", pilar: "sindi_cato", titulo: "Sindi y Cato: el turno por mensaje", angulo: "Una duda, una respuesta corta.", canales: ["instagram", "tiktok", "facebook"], fichaId: "ejemplo-propuesta-lz" },
    { id: "cal-2026-12-14", fecha: "2026-12-14", franja: "lunes_derechos", pilar: "derechos", titulo: "Horas extra en la campaña de Navidad", angulo: "Si la jornada se alarga, tiene que verse en la nómina.", canales: ["instagram", "facebook", "tiktok"], fichaId: null },
    { id: "cal-2026-12-16", fecha: "2026-12-16", franja: "miercoles_actividad", pilar: "negociacion", titulo: "Seguimiento de convenio en comercio", angulo: "El paso dado, no la estrategia.", canales: ["instagram", "facebook"], fichaId: null },
    { id: "cal-2026-12-18", fecha: "2026-12-18", franja: "viernes_actualidad", pilar: "igualdad", titulo: "El trabajo en Canarias también es de quien llega", angulo: "18 de diciembre, sin casos individuales.", canales: ["instagram", "facebook"], fichaId: null },
    { id: "cal-2026-12-21", fecha: "2026-12-21", franja: "lunes_derechos", pilar: "derechos", titulo: "La nómina de diciembre, concepto a concepto", angulo: "Revisar el recibo y preguntar a la delegada o al delegado.", canales: ["instagram", "facebook"], fichaId: null },
    { id: "cal-2026-12-23", fecha: "2026-12-23", franja: "miercoles_actividad", pilar: "actividad", titulo: "Cierre del año con las siete islas", angulo: "Presencia territorial, sin ranking.", canales: ["instagram", "facebook"], fichaId: null },
    { id: "cal-2026-12-25", fecha: "2026-12-25", franja: "viernes_actualidad", pilar: "derechos", titulo: "Si hoy trabajas, el derecho también", angulo: "Pieza breve de Navidad.", canales: ["instagram", "facebook"], fichaId: null },
    { id: "cal-2026-12-28", fecha: "2026-12-28", franja: "lunes_derechos", pilar: "salud", titulo: "Descansos que no se improvisan", angulo: "Registrar la jornada real.", canales: ["instagram", "facebook"], fichaId: null },
    { id: "cal-2026-12-30", fecha: "2026-12-30", franja: "miercoles_actividad", pilar: "participacion", titulo: "Enero se prepara con la ficha breve", angulo: "Qué enviar y cómo marcar lo sensible.", canales: ["instagram", "facebook"], fichaId: null },
  ]
  return piezas.map((piezaCal) => ({ ...piezaCal, excepcional: false, ejemplo: true }))
}

export function metricaDeEjemplo(): MetricaMes {
  return {
    mes: "2026-11",
    canales: {
      instagram: { publicaciones: 8, alcance: 14200, interacciones: 860, seguidores: 4180, variacionSeguidores: 64 },
      facebook: { publicaciones: 8, alcance: 18600, interacciones: 540, seguidores: 6020, variacionSeguidores: 28 },
      tiktok: { publicaciones: 3, alcance: 9800, interacciones: 1200, seguidores: 1640, variacionSeguidores: 90 },
    },
    notas: "Cifras de demostración. No proceden de las cuentas oficiales.",
    incidenciasSeguridad: 1,
    actualizadoPorId: "ejemplo",
    actualizadoPorNombre: "Ejemplo",
    actualizadoEn: "2026-11-21T18:00:00.000Z",
    ejemplo: true,
  }
}
