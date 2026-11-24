import { Link, useParams } from "react-router";
import { BotonFavorito } from "../componentes/BotonFavorito";
import { EstadoConsulta } from "../componentes/EstadoConsulta";
import { VariacionPrecio } from "../componentes/VariacionPrecio";
import { CATALOGO, IDS_ADMITIDOS, esIdAdmitido } from "../datos/catalogo";
import { useCriptomoneda } from "../hooks/useCriptomoneda";
import { formatearFechaHora, formatearUsd } from "../utilidades/formato";

// Página de detalle: /criptomonedas/:id
// No depende de lo que se haya seleccionado en el listado: toma el id de la URL y consulta la API,
// así funciona al recargar la página o al entrar con un enlace directo.
export function PaginaDetalle() {
  const { id = "" } = useParams();
  // Compruebo que el id de la URL sea una de las monedas admitidas
  const idAdmitido = esIdAdmitido(id) ? id : null;
  const { estado, cripto, error, reintentar } = useCriptomoneda(idAdmitido);

  // El id no corresponde a ninguna moneda admitida
  if (idAdmitido === null) {
    return (
      <section className="seccion" aria-labelledby="titulo-no-disponible">
        <title>Criptomoneda no encontrada - Pulso Abierto</title>
        <h2 id="titulo-no-disponible">Criptomoneda no encontrada</h2>
        <div className="mensaje mensaje-vacio">
          <p>
            <span aria-hidden="true">📭</span> <strong>Sin resultados:</strong> la dirección pide la
            criptomoneda "{id}", que no es una de las que admite la aplicación.
          </p>
        </div>
        <p>Puedes ver el detalle de:</p>
        <ul className="lista-enlaces">
          {IDS_ADMITIDOS.map((otroId) => (
            <li key={otroId}>
              <Link to={`/criptomonedas/${otroId}`}>{CATALOGO[otroId].nombre}</Link>
            </li>
          ))}
        </ul>
        <p>
          <Link to="/">Volver a la consulta de precios</Link>
        </p>
      </section>
    );
  }

  const info = CATALOGO[idAdmitido];

  let mensaje = "";
  switch (estado) {
    case "carga":
      mensaje = `Consultando los datos de ${info.nombre}, por favor espera...`;
      break;
    case "error":
      mensaje = `${error} Puedes volver a intentarlo.`;
      break;
    case "vacio":
      mensaje = `La API no devolvió datos para ${info.nombre}.`;
      break;
    case "resultado":
      mensaje = `Datos de ${info.nombre} cargados correctamente.`;
      break;
  }

  return (
    <>
      <title>{`${info.nombre} (${info.simbolo}) - Pulso Abierto`}</title>

      <p className="volver">
        <Link to="/">
          <span aria-hidden="true">← </span>Volver a la consulta de precios
        </Link>
      </p>

      <section className="seccion" aria-labelledby="titulo-detalle">
        <h2 id="titulo-detalle">
          {info.nombre} <span className="simbolo">({info.simbolo})</span>
        </h2>
        <p>{info.descripcion}</p>

        {/* Mismo botón y mismo store que en el listado: el favorito se ve igual en las dos vistas.
            No depende de la API, así que se puede usar aunque la consulta falle. */}
        <div className="detalle-acciones">
          <BotonFavorito id={idAdmitido} nombre={info.nombre} />
        </div>

        <EstadoConsulta estado={estado} mensaje={mensaje} onReintentar={reintentar} />

        {cripto !== null && (
          <dl className="datos-detalle">
            <div>
              <dt>Precio actual</dt>
              <dd>{formatearUsd(cripto.precioUsd)}</dd>
            </div>
            <div>
              <dt>Variación en 24 h</dt>
              <dd>
                {cripto.variacion24h === null ? (
                  "Sin datos"
                ) : (
                  <VariacionPrecio valor={cripto.variacion24h} />
                )}
              </dd>
            </div>
            <div>
              <dt>Capitalización de mercado</dt>
              <dd>
                {cripto.capitalizacionUsd === null
                  ? "Sin datos"
                  : formatearUsd(cripto.capitalizacionUsd, 0)}
              </dd>
            </div>
            <div>
              <dt>Volumen negociado en 24 h</dt>
              <dd>
                {cripto.volumen24hUsd === null
                  ? "Sin datos"
                  : formatearUsd(cripto.volumen24hUsd, 0)}
              </dd>
            </div>
            <div>
              <dt>Última actualización de la API</dt>
              <dd>
                {cripto.actualizadoEn === null
                  ? "Sin datos"
                  : formatearFechaHora(cripto.actualizadoEn)}
              </dd>
            </div>
          </dl>
        )}
      </section>
    </>
  );
}
