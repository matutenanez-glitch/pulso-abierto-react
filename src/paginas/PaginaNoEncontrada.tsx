import { Link, useLocation } from "react-router";

// Página para direcciones que no existen
export function PaginaNoEncontrada() {
  const { pathname } = useLocation();

  return (
    <section className="seccion" aria-labelledby="titulo-no-encontrada">
      <title>Página no encontrada - Pulso Abierto</title>
      <h2 id="titulo-no-encontrada">Página no encontrada (error 404)</h2>
      <div className="mensaje mensaje-error">
        <p>
          <span aria-hidden="true">⚠️</span> <strong>Error:</strong> la dirección{" "}
          <code>{pathname}</code> no existe en Pulso Abierto.
        </p>
      </div>
      <p>
        <Link to="/">Ir a la consulta de precios</Link>
      </p>
    </section>
  );
}
