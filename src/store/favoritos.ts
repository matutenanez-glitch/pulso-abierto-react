// ===============================
// Store global de favoritos (Zustand)
// Es el único estado global de la aplicación: lo usan el listado, el detalle y el encabezado.
// Se guarda en localStorage para que la selección se conserve al recargar la página.
// ===============================

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { esIdAdmitido, type IdCripto } from "../datos/catalogo";

export interface EstadoFavoritos {
  favoritos: IdCripto[];
  alternarFavorito: (id: IdCripto) => void;
}

// Clave con la que se guarda en localStorage
export const CLAVE_FAVORITOS = "pulso-abierto-favoritos";

// Lo que viene de localStorage no es confiable: pudo editarse a mano, venir de otra versión
// o incluir una moneda que ya no está en el catálogo. Esta función se queda solo con los ids
// admitidos, sin repetidos. Si la estructura no es un arreglo, empieza sin favoritos.
// (Corrección del diagnóstico de la consigna 6.)
export function limpiarFavoritosGuardados(guardado: unknown): IdCripto[] {
  if (!Array.isArray(guardado)) {
    return [];
  }
  const admitidos = guardado.filter(
    (valor): valor is IdCripto => typeof valor === "string" && esIdAdmitido(valor),
  );
  return [...new Set(admitidos)];
}

export const useFavoritos = create<EstadoFavoritos>()(
  persist(
    (set) => ({
      favoritos: [],

      // Agrega o quita un favorito sin modificar el arreglo anterior (actualización inmutable):
      // filter y el spread crean un arreglo nuevo, así Zustand detecta el cambio.
      alternarFavorito: (id) =>
        set((estado) => ({
          favoritos: estado.favoritos.includes(id)
            ? estado.favoritos.filter((otro) => otro !== id)
            : [...estado.favoritos, id],
        })),
    }),
    {
      name: CLAVE_FAVORITOS,
      storage: createJSONStorage(() => localStorage),
      // Solo se guardan los ids (las acciones no se guardan)
      partialize: (estado) => ({ favoritos: estado.favoritos }),
      // Al recuperar, se arma el estado a mano en lugar de copiar todo lo guardado.
      // (Si no hay nada guardado, Zustand llama a merge con undefined.)
      merge: (guardado, actual) => {
        const valor = (guardado as { favoritos?: unknown } | null | undefined)?.favoritos;
        return { ...actual, favoritos: limpiarFavoritosGuardados(valor) };
      },
    },
  ),
);

// ---- Selectores: cada componente pide solo lo que necesita ----

export const seleccionarFavoritos = (estado: EstadoFavoritos) => estado.favoritos;

export const seleccionarAlternarFavorito = (estado: EstadoFavoritos) => estado.alternarFavorito;

// Dato derivado: la cantidad se calcula a partir de la colección, no se guarda aparte
export const seleccionarCantidadFavoritos = (estado: EstadoFavoritos) => estado.favoritos.length;

// Devuelve un booleano: el componente solo se vuelve a dibujar si cambia esa moneda
export const seleccionarEsFavorita = (id: IdCripto) => (estado: EstadoFavoritos) =>
  estado.favoritos.includes(id);
