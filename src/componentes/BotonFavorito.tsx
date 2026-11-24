import type { IdCripto } from "../datos/catalogo";
import {
  seleccionarAlternarFavorito,
  seleccionarEsFavorita,
  useFavoritos,
} from "../store/favoritos";

interface Props {
  id: IdCripto;
  nombre: string;
}

// Botón para marcar o desmarcar una criptomoneda como favorita.
// Se usa en la tarjeta del listado y en la página de detalle: como los dos leen el mismo
// store, al cambiarlo en una vista el cambio también se ve en la otra.
export function BotonFavorito({ id, nombre }: Props) {
  // Selectores: este botón solo necesita saber si SU moneda es favorita y la acción
  const esFavorita = useFavoritos(seleccionarEsFavorita(id));
  const alternarFavorito = useFavoritos(seleccionarAlternarFavorito);

  return (
    <button
      type="button"
      className="boton-favorito"
      aria-pressed={esFavorita}
      onClick={() => alternarFavorito(id)}
    >
      <span aria-hidden="true">{esFavorita ? "★" : "☆"} </span>
      {/* El espacio va fuera del texto oculto: si queda adentro, al calcular el nombre
          accesible se recorta y se lee "comoFavorita" (lo detectó una prueba) */}
      <span className="visualmente-oculto">Marcar {nombre} como</span> Favorita
    </button>
  );
}
