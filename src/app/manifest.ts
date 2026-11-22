import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Comunicación digital UGT FeSMC Canarias",
    short_name: "UGT Com",
    description:
      "Herramienta del equipo de comunicación digital de UGT FeSMC Canarias para la ficha breve, el circuito de publicación y el calendario editorial.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es",
    dir: "ltr",
    background_color: "#F3EFEA",
    theme_color: "#E30613",
    categories: ["news", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
