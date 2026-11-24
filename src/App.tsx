import { Link, Route, Routes } from "react-router";
import { ContadorFavoritos } from "./componentes/ContadorFavoritos";
import { PaginaConsulta } from "./paginas/PaginaConsulta";
import { PaginaDetalle } from "./paginas/PaginaDetalle";
import { PaginaNoEncontrada } from "./paginas/PaginaNoEncontrada";

// Estructura general: encabezado, contenido según la ruta y pie.
// El encabezado y el pie son simples, por eso quedan acá y no en componentes propios.
export function App() {
  return (
    <>
      <header className="encabezado">
        <h1>
          <Link to="/">Pulso Abierto</Link>
        </h1>
        <p>
          Consulta el precio actual de Bitcoin, Ethereum y Solana en dólares estadounidenses (USD).
        </p>
        <ContadorFavoritos />
      </header>

      <main className="contenedor">
        <Routes>
          <Route path="/" element={<PaginaConsulta />} />
          <Route path="/criptomonedas/:id" element={<PaginaDetalle />} />
          <Route path="*" element={<PaginaNoEncontrada />} />
        </Routes>
      </main>

      <footer className="pie">
        <p>
          Fuente de los datos: API pública de <a href="https://www.coingecko.com/">CoinGecko</a>.
        </p>
        <p>Actividad 4 - Programación Web</p>
      </footer>
    </>
  );
}
