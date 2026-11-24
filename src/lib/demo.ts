import type { RolId } from "@/lib/dominio"

export type CuentaDemo = {
  email: string
  nombre: string
  rol: RolId
  detalle: string
}

export const CUENTAS_DEMO: CuentaDemo[] = [
  {
    email: "coordinacion@demo.ugt-fesmc.local",
    nombre: "Nuria Campos",
    rol: "coordinacion",
    detalle: "Coordinación y supervisión",
  },
  {
    email: "gestion@demo.ugt-fesmc.local",
    nombre: "Iago Martín",
    rol: "gestor",
    detalle: "Compañero gestor",
  },
  {
    email: "lanzarote@demo.ugt-fesmc.local",
    nombre: "Yaiza León",
    rol: "insular",
    detalle: "Responsable insular · Lanzarote",
  },
  {
    email: "tenerife@demo.ugt-fesmc.local",
    nombre: "Omar Betancor",
    rol: "insular",
    detalle: "Responsable insular · Tenerife",
  },
  {
    email: "grancanaria@demo.ugt-fesmc.local",
    nombre: "Ayoze Quintero",
    rol: "insular",
    detalle: "Responsable insular · Gran Canaria",
  },
  {
    email: "hosteleria@demo.ugt-fesmc.local",
    nombre: "Carla Mesa",
    rol: "sectorial",
    detalle: "Responsable sectorial · Hostelería y turismo",
  },
  {
    email: "juridico@demo.ugt-fesmc.local",
    nombre: "Héctor Déniz",
    rol: "juridico",
    detalle: "Referente jurídico",
  },
]
