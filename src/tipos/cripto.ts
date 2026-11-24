import type { z } from "zod";
import type { IdCripto } from "../datos/catalogo";
import type { esquemaPrecioApi, esquemaRespuestaPrecios } from "../esquemas/respuestaApi";

// ---- Datos tal como llegan de la API ----
// Los tipos salen del esquema de Zod que usa el servicio para validar la respuesta.

export type PrecioApi = z.infer<typeof esquemaPrecioApi>;

export type RespuestaPreciosApi = z.infer<typeof esquemaRespuestaPrecios>;

// ---- Datos como los usa la aplicación ----

export interface Criptomoneda {
  id: IdCripto;
  nombre: string;
  simbolo: string;
  descripcion: string;
  precioUsd: number;
  capitalizacionUsd: number | null;
  volumen24hUsd: number | null;
  variacion24h: number | null; // en porcentaje, por ejemplo -1.5
  actualizadoEn: Date | null;
}

// Tipos de consulta del formulario. Los dos de prueba vienen de la Actividad 1
// y sirven para ver los estados de ausencia de datos y de error.
export const TIPOS_CONSULTA = ["normal", "vacio", "error"] as const;

export type TipoConsulta = (typeof TIPOS_CONSULTA)[number];

// Estados que puede mostrar la interfaz
export type Estado = "inicial" | "carga" | "resultado" | "vacio" | "error";
