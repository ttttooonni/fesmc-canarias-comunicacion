export type BloqueGuia = {
  id: string
  titulo: string
  parrafos: string[]
  lista?: string[]
}

export const GUIA_TONO: BloqueGuia[] = [
  {
    id: "voz",
    titulo: "Voz del equipo",
    parrafos: [
      "Hablamos en español de España, de tú a la persona trabajadora y con respeto a la estructura. La frase es corta, el dato está contrastado y el sujeto es quien trabaja, no el organigrama.",
      "Cercanía no es coloquialismo vacío. No hay exclamaciones, no hay alarmismo y no hay promesa de un resultado jurídico. Si un derecho depende del convenio, se dice así.",
    ],
    lista: [
      "Una idea por pieza. En redes no cabe el parte de un pleno.",
      "Lenguaje inclusivo con genéricos reales: la plantilla, las personas trabajadoras, delegadas y delegados. Sin barras ni arrobas.",
      "Canarias es plural. Si el hecho es de una isla, se nombra la isla. No se da por hecho que el archipiélago cabe en las dos capitales.",
      "Firmeza sin ataque personal. Se critica una práctica, no se señala a una persona identificable.",
    ],
  },
  {
    id: "ritmo",
    titulo: "Tres piezas por semana",
    parrafos: [
      "El calendario editorial arranca en diciembre de 2026 y reserva tres huecos fijos. El resto de la semana se deja en calma, salvo una pieza urgente marcada como fuera de ritmo.",
    ],
    lista: [
      "Lunes: derechos. Un derecho, un convenio o una duda frecuente, explicados para quien no vive en la jerga.",
      "Miércoles: actividad. Lo que la federación, una isla o un sector ha hecho. Hechos, no consignas.",
      "Viernes: actualidad y participación. Lo que está pasando y una puerta para que la afiliación entre: una pregunta, una ficha, una asamblea.",
    ],
  },
  {
    id: "pilares",
    titulo: "Secciones y pilares",
    parrafos: [
      "Cada pieza se apoya en un pilar. Sirve para no publicar siempre lo mismo y para ver, a fin de mes, qué temas se han quedado fuera.",
    ],
    lista: [
      "Derechos laborales.",
      "Actividad sindical.",
      "Actualidad.",
      "Participación.",
      "Sindi y Cato te lo cuentan.",
      "Igualdad.",
      "Salud laboral.",
      "Negociación colectiva.",
      "Servicios a la afiliación.",
    ],
  },
  {
    id: "sindi",
    titulo: "Sindi y Cato te lo cuentan",
    parrafos: [
      "Sindi y Cato son la serie pedagógica del plan. Sindi trae la duda de una persona trabajadora, con una situación reconocible y sin nombre propio. Cato responde con el derecho, en corto, y dice dónde se mira: convenio, estatuto o delegada y delegado.",
      "El tono es claro y adulto. No se infantiliza a la afiliación ni se bromea con una sanción, un despido o una baja. La serie no sustituye el asesoramiento sindical: al final siempre cabe la frase «pregunta en tu sección o a tu delegado o delegada».",
      "En imagen, Sindi y Cato son figuras propias de la federación. No se usan caricaturas de personas reales ni mascotas de terceros.",
    ],
  },
  {
    id: "canales",
    titulo: "Cómo se cuenta en cada canal",
    parrafos: [
      "La misma idea puede salir en los tres canales, pero no se pega el mismo texto. La ficha marca los canales previstos y la redacción los adapta.",
    ],
    lista: [
      "Instagram: una frase de apertura, un carrusel si el lunes es de derechos, y el pie con la idea y la fuente. Poco hashtag y al final.",
      "Facebook: un poco más de contexto. Es el texto que más se comparte en grupos de empresa, así que tiene que entenderse solo.",
      "TikTok: gancho en los dos primeros segundos, lenguaje oral y una sola idea. Sindi y Cato encajan aquí. Nada de música cuyo uso no esté aclarado.",
    ],
  },
  {
    id: "firma",
    titulo: "Firma, color y cierre",
    parrafos: [
      "El rojo de UGT es #E30613. El fondo de las piezas es blanco o gris muy claro y el texto, gris oscuro. No se inventan degradados ni se mezcla el rojo con otros colores de marca.",
      "La firma de las cuentas de la federación es «UGT FeSMC Canarias». Las cuentas insulares, cuando comparten, no reescriben el hecho: usan el texto sugerido de la ficha.",
    ],
    lista: [
      "Hashtags de cierre: #UGTFeSMCCanarias #UGT. Solo se añade uno de isla o de sector si la pieza es claramente de ahí.",
      "No se etiquetan empresas ni personas trabajadoras.",
      "No se publica desde perfiles personales ni desde grupos de mensajería como si fueran la cuenta oficial.",
    ],
  },
  {
    id: "no",
    titulo: "Lo que no publicamos",
    parrafos: [
      "Hay piezas que se quedan en la ficha. Mejor no salir que salir mal.",
    ],
    lista: [
      "Datos personales que no hacen falta: nombre y apellidos, DNI, teléfono, domicilio, salud, afiliación concreta de una persona.",
      "Fotos o vídeos sin autorización, menores identificables y capturas de conversaciones privadas.",
      "El detalle de una estrategia de negociación, de un conflicto abierto o de un procedimiento sancionador.",
      "Rankings entre islas o entre sectores. La presencia se mira para cubrir huecos, no para competir.",
      "Bulos, audios sin fuente y cifras que no salen de un sitio identificable.",
    ],
  },
]

export type ItemChecklist = {
  id: string
  titulo: string
  detalle: string
}

export const CHECKLIST_SEGURIDAD: ItemChecklist[] = [
  {
    id: "fuente",
    titulo: "El hecho está contrastado",
    detalle: "Hay al menos una fuente identificada en la ficha: comité, delegado o delegada, convocatoria, convenio o nota interna. No se publica un audio reenviado.",
  },
  {
    id: "lugar",
    titulo: "Isla y sector son los correctos",
    detalle: "Un error de isla se nota enseguida y deja fuera a quien sí tenía que verse. Se revisa antes de redactar.",
  },
  {
    id: "datos",
    titulo: "No hay datos personales de más",
    detalle: "Fuera nombres y apellidos, DNI, teléfono, domicilio, datos de salud y cualquier dato que identifique a una persona concreta si no es imprescindible y autorizado.",
  },
  {
    id: "imagen",
    titulo: "Las imágenes tienen autorización",
    detalle: "Fotos y vídeos con permiso de uso y de las personas identificables. Si no hay permiso, la pieza sale con gráfica de la federación y sin caras.",
  },
  {
    id: "menores",
    titulo: "No aparecen menores identificables",
    detalle: "Ni en plano abierto ni de fondo. Si hay duda, se cambia el encuadre o no se usa el material.",
  },
  {
    id: "conflicto",
    titulo: "El conflicto abierto no se perjudica",
    detalle: "No se adelanta una estrategia, no se citan cifras internas de una mesa y no se deja en peor situación a quien está en una reclamación.",
  },
  {
    id: "sensible",
    titulo: "Lo sensible está marcado y, si toca, autorizado",
    detalle: "Salud, menores, sanciones, conflictos vivos y cualquier pieza que pueda identificar a un centro pequeño pasan por supervisión antes de programarse.",
  },
  {
    id: "promesa",
    titulo: "El texto no promete un resultado jurídico",
    detalle: "Se explica el derecho y se invita a consultar. No se dice «te tienen que pagar» como si el caso concreto ya estuviera resuelto.",
  },
  {
    id: "marcas",
    titulo: "La imagen respeta la marca y no pone a un tercero de protagonista",
    detalle: "Rojo #E30613, blanco y gris oscuro. Sin logotipos de empresas como gancho y sin plantillas ajenas.",
  },
  {
    id: "juridico",
    titulo: "Hay revisión jurídica cuando el tema lo pide",
    detalle: "Denuncia, sanción, salud, menores, igualdad y conflicto abierto no salen de redacción sin ese paso.",
  },
  {
    id: "archivo",
    titulo: "La ficha y el material autorizado quedan registrados",
    detalle: "Quien entre después tiene que poder ver qué se autorizó y quién era la persona de contacto del equipo.",
  },
  {
    id: "cuentas",
    titulo: "Se publica solo desde las cuentas oficiales",
    detalle: "Federación e islas. Los perfiles personales no adelantan la pieza ni añaden detalles que la ficha dejó fuera.",
  },
  {
    id: "reenvio",
    titulo: "El texto para las islas no añade datos nuevos",
    detalle: "Al compartir en la cuenta insular se usa el texto sugerido. No se completa con nombres, fotos del grupo de WhatsApp ni el «te cuento lo que no salió».",
  },
]

export const CHECKLIST_PUBLICAR: ItemChecklist[] = [
  {
    id: "contrastado",
    titulo: "El hecho está contrastado con la fuente de la ficha",
    detalle: "No queda ninguna cifra o acusación que no esté respaldada.",
  },
  {
    id: "sin_datos_de_mas",
    titulo: "No hay datos personales innecesarios",
    detalle: "Ni en el texto, ni en la imagen, ni en el pie.",
  },
  {
    id: "imagen",
    titulo: "La imagen está autorizada o la pieza no muestra personas",
    detalle: "Incluye el visto bueno de imagen del circuito.",
  },
  {
    id: "sensible_autorizado",
    titulo: "Si era sensible, supervisión ya la autorizó",
    detalle: "Si no era sensible, este punto se marca igualmente tras comprobarlo.",
  },
  {
    id: "sin_promesa_juridica",
    titulo: "El texto no promete un resultado del caso",
    detalle: "Informa del derecho y deriva al asesoramiento sindical.",
  },
  {
    id: "cuenta_oficial",
    titulo: "Se va a publicar desde la cuenta oficial",
    detalle: "Y el texto para las islas no añade nada que no esté en la pieza.",
  },
]

export const PASOS_CIRCUITO = [
  { rol: "Responsables insulares y sectoriales", hace: "Envían la ficha breve: qué ocurrió, isla, cuándo, sector, fuentes, material autorizado, contacto y si es sensible." },
  { rol: "Compañero gestor", hace: "Comprueba la ficha, redacta, programa, publica y prepara el texto para las cuentas insulares." },
  { rol: "Referente jurídico", hace: "Revisa jurídica e imagen. Si no es sensible, da paso a programación. Si lo es, lo eleva a supervisión." },
  { rol: "Coordinación y supervisión", hace: "Autoriza las piezas sensibles, puede intervenir en cualquier paso y mira el mes sin convertir las islas en un ranking." },
]
