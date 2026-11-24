import { RetratoSindiYCato } from "@/components/retrato-sindi-cato"
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
      <figure className="grid gap-4 rounded-2xl bg-card p-4 shadow-[0_16px_40px_-24px_rgba(227,6,19,0.35)] ring-1 ring-foreground/10 sm:grid-cols-[14rem_1fr] sm:items-center">
        <RetratoSindiYCato variante="compacto" pie={false} className="rounded-2xl shadow-none" />
        <figcaption className="text-sm leading-relaxed">
          <span className="font-heading text-lg font-semibold">Sindi y Cato te lo cuentan</span>
          <span className="mt-1 block text-muted-foreground">
            Sindi trae la duda de una persona trabajadora. Cato responde con el derecho, en corto, y recuerda que la serie no sustituye a la asesoría.
          </span>
          <Link href="/sindi-cato" className="mt-3 inline-block font-medium text-primary underline-offset-4 hover:underline">
            Abrir el área de Sindi y Cato
          </Link>
        </figcaption>
      </figure>
      {GUIA_TONO.map((bloque) => (
        <section key={bloque.id} id={bloque.id} className="scroll-mt-24 space-y-3">
          <h2 className="font-heading text-2xl font-semibold">{bloque.titulo}</h2>
          {bloque.id === "sindi" ? (
            <RetratoSindiYCato variante="completo" className="mx-auto max-w-md" />
          ) : null}
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
          {bloque.id === "sindi" ? (
            <p>
              <Link href="/sindi-cato" className="font-medium text-primary underline-offset-4 hover:underline">
                Ir al área de creación y administración de Sindi y Cato
              </Link>
            </p>
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
