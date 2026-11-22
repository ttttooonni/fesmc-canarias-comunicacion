import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Outfit, Source_Sans_3 } from "next/font/google"
import { Proveedor } from "@/components/proveedor"
import { RegistroSw } from "@/components/registro-sw"
import { Shell } from "@/components/shell"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const source = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: {
    default: "Comunicación digital UGT FeSMC Canarias",
    template: "%s · UGT FeSMC Canarias",
  },
  description:
    "Herramienta del equipo de comunicación digital de UGT FeSMC Canarias: ficha breve, circuito de publicación, calendario editorial y métricas.",
  applicationName: "UGT Com",
  appleWebApp: {
    capable: true,
    title: "UGT Com",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#E30613",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${source.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <Proveedor>
          <Suspense fallback={<div className="grid min-h-dvh place-items-center px-6 text-sm text-[#3a3a3a]">Abriendo la redacción…</div>}>
            <Shell>{children}</Shell>
          </Suspense>
        </Proveedor>
        <RegistroSw />
        <Toaster theme="light" position="top-center" />
      </body>
    </html>
  )
}
