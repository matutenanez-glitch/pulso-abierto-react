import { z } from "zod";
import { TIPOS_CONSULTA } from "../tipos/cripto";

const MIN_CARACTERES = 2;
const MAX_CARACTERES = 30;

// Reglas del formulario de consulta
export const esquemaConsulta = z.object({
  // 1) La búsqueda es opcional. Si se escribe algo, después de quitar los espacios
  //    del principio y del final tiene que tener entre 2 y 30 caracteres.
  busqueda: z
    .string()
    .trim()
    .max(MAX_CARACTERES, {
      error: `La búsqueda puede tener como máximo ${MAX_CARACTERES} caracteres.`,
    })
    .refine((texto) => texto === "" || texto.length >= MIN_CARACTERES, {
      error: `Escribe al menos ${MIN_CARACTERES} caracteres (sin contar espacios) o deja el campo vacío para ver todas.`,
    }),

  // 2) El tipo de consulta tiene que ser una de las opciones admitidas
  tipo: z.enum(TIPOS_CONSULTA, { error: "Elige un tipo de consulta de la lista." }),
});

// Datos ya validados (la búsqueda queda sin espacios en los extremos)
export type CriteriosConsulta = z.infer<typeof esquemaConsulta>;

// Valores tal como están escritos en el formulario (el tipo puede estar vacío)
export interface ValoresFormulario {
  busqueda: string;
  tipo: string;
}
