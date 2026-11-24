// Datos y funciones auxiliares para las pruebas
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../App";
import { CATALOGO } from "../datos/catalogo";
import type { Criptomoneda } from "../tipos/cripto";

// Criptomonedas fijas, con la forma que devuelve el servicio (no salen de la API real)
export const CRIPTOS_DE_PRUEBA: Criptomoneda[] = [
  {
    id: "bitcoin",
    ...CATALOGO.bitcoin,
    precioUsd: 64042,
    capitalizacionUsd: 1_270_000_000_000,
    volumen24hUsd: 35_000_000_000,
    variacion24h: -1.35,
    actualizadoEn: new Date("2026-11-18T13:44:01Z"),
  },
  {
    id: "ethereum",
    ...CATALOGO.ethereum,
    precioUsd: 1793.68,
    capitalizacionUsd: 216_000_000_000,
    volumen24hUsd: 15_000_000_000,
    variacion24h: -1.44,
    actualizadoEn: new Date("2026-11-18T13:44:01Z"),
  },
  {
    id: "solana",
    ...CATALOGO.solana,
    precioUsd: 74.3,
    capitalizacionUsd: 38_000_000_000,
    volumen24hUsd: 2_000_000_000,
    variacion24h: 1.24,
    actualizadoEn: new Date("2026-11-18T13:44:01Z"),
  },
];

// Dibuja la aplicación completa (encabezado, rutas y pie) a partir de una dirección
export function renderizarApp(ruta = "/") {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  );
}

// Promesa que se resuelve "a mano": sirve para ver el estado de carga antes del resultado
export function promesaControlada<T>() {
  let resolver!: (valor: T) => void;
  const promesa = new Promise<T>((r) => {
    resolver = r;
  });
  return { promesa, resolver };
}
