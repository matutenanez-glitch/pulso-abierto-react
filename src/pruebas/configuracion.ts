// Configuración común de las pruebas (se ejecuta antes de cada archivo de pruebas)
import "@testing-library/jest-dom/vitest"; // agrega toBeInTheDocument, toHaveTextContent, etc.
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { useFavoritos } from "../store/favoritos";

beforeEach(() => {
  // Ninguna prueba puede hacer solicitudes reales a CoinGecko: si alguna se olvida de
  // simular fetch o el servicio, la solicitud falla en lugar de salir a internet.
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("Las pruebas no pueden hacer solicitudes reales"))),
  );
});

afterEach(() => {
  cleanup(); // desmonta lo que se dibujó en la prueba
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  // Cada prueba empieza sin favoritos y con el almacenamiento vacío
  useFavoritos.setState({ favoritos: [] });
  localStorage.clear();
});
