import { GUIA_TONO, PASOS_CIRCUITO } from "@/lib/contenido"
import Link from "next/link"

export function Guia() {
  return (
    <main id="contenido" className="space-y-8">
      <header>
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Disponible sin conexión</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Guía de estilo y tono</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Cómo habla el equipo de comunicación digital de UGT FeSMC Canarias. Esta guía viaja con la aplicación: si ya la abriste una vez, puedes leerla sin red.
        </p>
      </header>
      <figure className="grid gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-[auto_1fr] sm:items-center">
        <SindiYCato />
        <figcaption className="text-sm leading-relaxed">
          <span className="font-heading text-lg font-semibold">Sindi y Cato te lo cuentan</span>
          <span className="mt-1 block text-muted-foreground">
            Sindi trae la duda de una persona trabajadora. Cato responde con el derecho, en corto, y recuerda que la serie no sustituye a la asesoría.
          </span>
        </figcaption>
      </figure>
      {GUIA_TONO.map((bloque) => (
        <section key={bloque.id} className="space-y-3">
          <h2 className="font-heading text-2xl font-semibold">{bloque.titulo}</h2>
          {bloque.parrafos.map((parrafo) => (
            <p key={parrafo} className="max-w-3xl text-base leading-relaxed">
              {parrafo}
            </p>
          ))}
          {bloque.lista ? (
            <ul className="max-w-3xl list-disc space-y-2 pl-5 text-base leading-relaxed">
              {bloque.lista.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
      <section className="space-y-3">
        <h2 className="font-heading text-2xl font-semibold">Quién hace qué en el circuito</h2>
        <ul className="grid gap-3">
          {PASOS_CIRCUITO.map((paso) => (
            <li key={paso.rol} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
              <p className="font-semibold">{paso.rol}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{paso.hace}</p>
            </li>
          ))}
        </ul>
      </section>
      <p>
        <Link href="/guia/seguridad" className="font-medium text-primary underline-offset-4 hover:underline">
          Abrir el checklist de seguridad y datos
        </Link>
      </p>
    </main>
  )
}

function SindiYCato() {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-full max-w-[220px]" role="img" aria-label="Dibujo sencillo de Sindi, con carpeta, y Cato, un gato con megáfono">
      <rect width="220" height="120" rx="16" fill="#F8E8E6" />
      <circle cx="58" cy="48" r="16" fill="#1C1C1C" />
      <rect x="42" y="66" width="32" height="34" rx="8" fill="#E30613" />
      <rect x="78" y="70" width="22" height="28" rx="3" fill="#FFFFFF" stroke="#1C1C1C" />
      <path d="M150 78c8-28 28-36 36-18 6 14-4 24-14 26" fill="#E30613" />
      <circle cx="156" cy="46" r="14" fill="#1C1C1C" />
      <path d="M146 38l-8-10 10 4zm20 0l8-10-10 4z" fill="#1C1C1C" />
      <circle cx="151" cy="45" r="1.6" fill="#fff" />
      <circle cx="160" cy="45" r="1.6" fill="#fff" />
      <path d="M176 58h22l-6 10h-12z" fill="#1C1C1C" />
    </svg>
  )
}
