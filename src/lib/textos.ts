import {
  nombreIsla,
  nombreSector,
  type Ficha,
  type IslaId,
} from "@/lib/dominio"

export function recortar(texto: string, max: number): string {
  const limpio = texto.replace(/\s+/g, " ").trim()
  if (limpio.length <= max) return limpio
  return `${limpio.slice(0, max - 1).trimEnd()}…`
}

export function borradorPublicacion(
  ficha: Pick<Ficha, "titulo" | "queOcurrio" | "isla" | "sector">,
): string {
  return [
    ficha.titulo.trim(),
    "",
    recortar(ficha.queOcurrio, 420),
    "",
    `${nombreIsla(ficha.isla)} · ${nombreSector(ficha.sector)}`,
    "",
    "UGT FeSMC Canarias",
  ].join("\n")
}

export function textoParaCuentaInsular(
  ficha: Pick<Ficha, "titulo" | "queOcurrio" | "isla">,
  islaDestino?: IslaId | null,
): string {
  const isla = islaDestino && islaDestino !== "regional" ? nombreIsla(islaDestino) : null
  const apertura = isla
    ? `Desde UGT FeSMC Canarias, también para ${isla}.`
    : "Desde UGT FeSMC Canarias."
  return [
    apertura,
    "",
    ficha.titulo.trim(),
    "",
    recortar(ficha.queOcurrio, 280),
    "",
    "La pieza ya está en las cuentas de la federación. Si la compartes desde la cuenta insular, no añadas nombres, fotos ni detalles que no salgan en la publicación.",
    "",
    "#UGTFeSMCCanarias #UGT",
  ].join("\n")
}
