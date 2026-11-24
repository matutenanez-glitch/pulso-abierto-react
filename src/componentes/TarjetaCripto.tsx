import { Link } from "react-router";
import { seleccionarEsFavorita, useFavoritos } from "../store/favoritos";
import type { Criptomoneda } from "../tipos/cripto";
import { formatearUsd } from "../utilidades/formato";
import { BotonFavorito } from "./BotonFavorito";
import { VariacionPrecio } from "./VariacionPrecio";

interface Props {
  criptomoneda: Criptomoneda;
}

// Tarjeta reutilizable con los datos principales de una criptomoneda
export function TarjetaCripto({ criptomoneda }: Props) {
  const { id, nombre, simbolo, precioUsd, variacion24h } = criptomoneda;
  // Selector: la tarjeta solo necesita saber si su moneda es favorita (para el borde y la insignia)
  const esFavorita = useFavoritos(seleccionarEsFavorita(id));

  return (
    <article className={esFavorita ? "tarjeta tarjeta-favorita" : "tarjeta"}>
      <h3>
        {nombre}
        {esFavorita && <span className="insignia">★ Favorita</span>}
      </h3>
      <p className="simbolo">Símbolo: {simbolo}</p>
      <p className="precio">{formatearUsd(precioUsd)}</p>
      {variacion24h !== null && (
        <p>
          <VariacionPrecio valor={variacion24h} sufijo="en 24 h" />
        </p>
      )}
      <p className="aclaracion">Precio actual en dólares estadounidenses (USD)</p>

      <div className="tarjeta-acciones">
        {/* Navegar: enlace. Cambiar el estado de la interfaz: botón */}
        <Link className="enlace-boton" to={`/criptomonedas/${id}`}>
          Ver detalle <span className="visualmente-oculto">de {nombre}</span>
        </Link>
        <BotonFavorito id={id} nombre={nombre} />
      </div>
    </article>
  );
}
