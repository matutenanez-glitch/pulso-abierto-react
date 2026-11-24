import { seleccionarCantidadFavoritos, useFavoritos } from "../store/favoritos";

// Cantidad de favoritas, visible en el encabezado de todas las páginas.
// Es un dato derivado: el selector la calcula a partir de la colección del store.
export function ContadorFavoritos() {
  const cantidad = useFavoritos(seleccionarCantidadFavoritos);

  return (
    <p className="contador-favoritos">
      <span aria-hidden="true">★ </span>
      {cantidad === 1 ? "1 criptomoneda favorita" : `${cantidad} criptomonedas favoritas`}
    </p>
  );
}
