"use client"

import { useApp } from "@/components/proveedor"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const PASOS = [
  {
    id: "que-es",
    titulo: "La redacción, en el bolsillo",
    texto: "Esta aplicación es la mesa de trabajo del equipo de comunicación de UGT FeSMC Canarias. No hay servidor: lo que escribes se queda en el teléfono hasta que lo compartes.",
    dibujo: "mesa",
  },
  {
    id: "perfil",
    titulo: "Tu nombre y tu rol",
    texto: "Al abrirla eliges cómo te llamas y si eres gestión, coordinación, una isla, un sector o revisión legal. Eso solo vive en este dispositivo y ordena los botones del circuito.",
    dibujo: "perfil",
  },
  {
    id: "ficha",
    titulo: "La ficha breve",
    texto: "Qué ocurrió, isla, fecha, sector, fuentes, material autorizado y si es sensible. Sin nombres, teléfonos ni datos de salud. Es el único relato que viaja.",
    dibujo: "ficha",
  },
  {
    id: "whatsapp",
    titulo: "Cada paso, por WhatsApp",
    texto: "Enviar propuesta, pedir revisión, revisión legal, aprobar, devolver con cambios y marcar publicada. Cada botón abre WhatsApp con un mensaje claro y el estado nuevo.",
    dibujo: "chat",
  },
  {
    id: "enlace",
    titulo: "El enlace importa la ficha",
    texto: "Quien recibe el mensaje abre el enlace en su móvil. La ficha entra en su aplicación, con el estado actualizado. El enlace va en el mensaje: no pasa por un servidor.",
    dibujo: "enlace",
  },
  {
    id: "calendario",
    titulo: "El calendario de diciembre",
    texto: "Lunes de derechos, miércoles de actividad, viernes de actualidad. Diciembre de 2026 se puede cargar como DEMOSTRACIÓN, marcado como tal y fácil de quitar.",
    dibujo: "cal",
  },
  {
    id: "sindi-cato",
    titulo: "Sindi y Cato",
    texto: "En Sindi y Cato está el área de creación de la serie: fichas de los personajes, episodios, prompts, documentación, revisión y publicaciones. Cada paso se queda en el teléfono y se puede compartir por WhatsApp.",
    dibujo: "sindi",
  },
  {
    id: "offline",
    titulo: "Sin cobertura",
    texto: "Después de abrirla una vez, la guía, el checklist y la mesa siguen disponibles sin red. Instálala para tenerla como una aplicación.",
    dibujo: "offline",
  },
  {
    id: "copia",
    titulo: "Una copia de seguridad",
    texto: "Desde Inicio puedes descargar un JSON con todo y volver a cargarlo en otro teléfono. Sirve de respaldo si cambias de dispositivo.",
    dibujo: "copia",
  },
] as const

export function Tutorial() {
  const { tutorialAbierto, cerrarTutorial } = useApp()
  const [indice, setIndice] = useState(0)
  const [origen, setOrigen] = useState<number | null>(null)

  if (!tutorialAbierto) return null
  const paso = PASOS[indice]
  if (!paso) return null
  const ultimo = indice === PASOS.length - 1

  function ir(delta: number) {
    setIndice((actual) => Math.min(PASOS.length - 1, Math.max(0, actual + delta)))
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="tutorial-titulo">
      <div
        className="aparecer flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-[28px] bg-card shadow-2xl"
        onTouchStart={(evento) => setOrigen(evento.changedTouches[0]?.clientX ?? null)}
        onTouchEnd={(evento) => {
          if (origen == null) return
          const delta = (evento.changedTouches[0]?.clientX ?? origen) - origen
          if (delta > 50) ir(-1)
          if (delta < -50) ir(1)
          setOrigen(null)
        }}
      >
        <div className="grid h-44 place-items-center bg-[#F8E8E6] dark:bg-[#2a1718]">
          <Dibujo tipo={paso.dibujo} />
        </div>
        <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {indice + 1} de {PASOS.length}
          </p>
          <h2 id="tutorial-titulo" className="mt-2 font-heading text-2xl font-semibold tracking-tight">{paso.titulo}</h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{paso.texto}</p>
          <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
            {PASOS.map((item, i) => (
              <span key={item.id} className={`h-1.5 rounded-full transition-all ${i === indice ? "w-6 bg-primary" : "w-1.5 bg-border"}`} />
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <Button type="button" variant="outline" className="h-12 flex-1" onClick={() => (indice === 0 ? (setIndice(0), cerrarTutorial()) : ir(-1))}>
              {indice === 0 ? "Saltar" : "Atrás"}
            </Button>
            <Button type="button" className="h-12 flex-1" onClick={() => (ultimo ? (setIndice(0), cerrarTutorial()) : ir(1))}>
              {ultimo ? "Empezar" : "Siguiente"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Dibujo({ tipo }: { tipo: (typeof PASOS)[number]["dibujo"] }) {
  return (
    <svg viewBox="0 0 160 100" className="h-28 w-44" role="img" aria-hidden>
      <rect x="18" y="12" width="124" height="76" rx="16" fill="#fff" />
      {tipo === "mesa" ? <path d="M40 62h80M48 62v16M112 62v16M56 38h48" stroke="#E30613" strokeWidth="4" fill="none" /> : null}
      {tipo === "perfil" ? <><circle cx="80" cy="40" r="12" fill="#1C1C1C" /><rect x="58" y="58" width="44" height="18" rx="9" fill="#E30613" /></> : null}
      {tipo === "ficha" ? <><rect x="46" y="28" width="68" height="48" rx="6" fill="#F3EFEA" /><path d="M56 42h48M56 52h36M56 62h28" stroke="#1C1C1C" strokeWidth="3" /></> : null}
      {tipo === "chat" ? <><rect x="42" y="30" width="70" height="36" rx="12" fill="#E30613" /><path d="M58 66l-8 10 16-6" fill="#E30613" /></> : null}
      {tipo === "enlace" ? <path d="M62 50l10-10a12 12 0 0 1 17 17L79 67M98 50l-10 10a12 12 0 0 1-17-17L81 33" stroke="#E30613" strokeWidth="4" fill="none" /> : null}
      {tipo === "cal" ? <><rect x="48" y="30" width="64" height="46" rx="6" fill="#F3EFEA" /><path d="M48 42h64" stroke="#E30613" strokeWidth="4" /><circle cx="66" cy="56" r="3" fill="#E30613" /><circle cx="80" cy="56" r="3" fill="#1C1C1C" /><circle cx="94" cy="56" r="3" fill="#1C1C1C" /></> : null}
      {tipo === "offline" ? <path d="M50 58c8-16 52-16 60 0M62 66c6-8 30-8 36 0M80 76h.1" stroke="#E30613" strokeWidth="4" fill="none" strokeLinecap="round" /> : null}
      {tipo === "sindi" ? <><circle cx="64" cy="44" r="10" fill="#1C1C1C" /><rect x="50" y="56" width="28" height="20" rx="6" fill="#E30613" /><circle cx="104" cy="44" r="10" fill="#1C1C1C" /><rect x="90" y="56" width="28" height="20" rx="6" fill="#1C1C1C" /></> : null}
      {tipo === "copia" ? <><rect x="50" y="26" width="40" height="50" rx="4" fill="#F3EFEA" /><rect x="66" y="34" width="40" height="50" rx="4" fill="#E30613" /></> : null}
    </svg>
  )
}
