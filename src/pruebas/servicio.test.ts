// D. Servicio: se simula fetch, no se hacen solicitudes reales a CoinGecko
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ErrorFormato,
  ErrorHttp,
  mensajeDeError,
  obtenerCriptomoneda,
  obtenerCriptomonedas,
  vaciarCache,
} from "../servicios/coingecko";

// Respuesta simulada con lo mínimo que usa el servicio: ok, status y json()
function respuestaSimulada(ok: boolean, status: number, cuerpo: unknown): Response {
  return { ok, status, json: async () => cuerpo } as Response;
}

// JSON con la forma real de /simple/price (valores fijos)
const JSON_API = {
  bitcoin: {
    usd: 64042,
    usd_market_cap: 1270000000000,
    usd_24h_vol: 35000000000,
    usd_24h_change: -1.35,
    last_updated_at: 1795009441,
  },
  solana: { usd: 74.3 }, // sin datos opcionales
  ethereum: {
    usd: 1793.68,
    usd_market_cap: 216000000000,
    usd_24h_vol: 15000000000,
    usd_24h_change: -1.44,
    last_updated_at: 1795009441,
  },
};

const fetchSimulado = vi.fn<typeof fetch>();

beforeEach(() => {
  vaciarCache(); // cada prueba empieza sin respuestas guardadas
  fetchSimulado.mockReset();
  vi.stubGlobal("fetch", fetchSimulado);
});

describe("Servicio de CoinGecko", () => {
  it("con una respuesta exitosa devuelve los datos con la forma que usa la aplicación", async () => {
    fetchSimulado.mockResolvedValue(respuestaSimulada(true, 200, JSON_API));

    const resultado = await obtenerCriptomonedas("normal");

    // Se pidió la API correcta
    const url = String(fetchSimulado.mock.calls[0][0]);
    expect(url).toContain("https://api.coingecko.com/api/v3/simple/price");
    expect(url).toContain("ids=bitcoin,ethereum,solana");
    expect(url).toContain("vs_currencies=usd");

    // Transformación: orden del catálogo, datos del catálogo y nombres propios de la app
    expect(resultado.map((cripto) => cripto.id)).toEqual(["bitcoin", "ethereum", "solana"]);
    expect(resultado[0]).toEqual({
      id: "bitcoin",
      nombre: "Bitcoin",
      simbolo: "BTC",
      descripcion: expect.any(String),
      precioUsd: 64042,
      capitalizacionUsd: 1270000000000,
      volumen24hUsd: 35000000000,
      variacion24h: -1.35,
      actualizadoEn: new Date(1795009441 * 1000),
    });
    // Los datos opcionales que faltan quedan en null
    expect(resultado[2]).toMatchObject({
      id: "solana",
      precioUsd: 74.3,
      capitalizacionUsd: null,
      variacion24h: null,
      actualizadoEn: null,
    });
  });

  it("con una respuesta ok: false lanza un ErrorHttp con el código", async () => {
    fetchSimulado.mockResolvedValue(respuestaSimulada(false, 500, { error: "fallo" }));

    const promesa = obtenerCriptomonedas("normal");

    await expect(promesa).rejects.toBeInstanceOf(ErrorHttp);
    await expect(promesa).rejects.toMatchObject({ codigo: 500 });
    const error = await promesa.catch((e: unknown) => e);
    expect(mensajeDeError(error)).toBe("El servicio respondió con un error (código 500).");
  });

  it("con el código 429 pide esperar un minuto", async () => {
    fetchSimulado.mockResolvedValue(respuestaSimulada(false, 429, {}));

    const error = await obtenerCriptomonedas("normal").catch((e: unknown) => e);

    expect(mensajeDeError(error)).toMatch(/demasiadas consultas/i);
  });

  it("una respuesta sin datos devuelve una lista vacía", async () => {
    fetchSimulado.mockResolvedValue(respuestaSimulada(true, 200, {}));

    await expect(obtenerCriptomonedas("vacio")).resolves.toEqual([]);
  });

  it("si el JSON no tiene la forma esperada lanza un ErrorFormato", async () => {
    fetchSimulado.mockResolvedValue(respuestaSimulada(true, 200, { bitcoin: { usd: "mucho" } }));

    await expect(obtenerCriptomonedas("normal")).rejects.toBeInstanceOf(ErrorFormato);
  });

  it("los errores no se guardan en la caché: reintentar hace otra solicitud", async () => {
    fetchSimulado
      .mockResolvedValueOnce(respuestaSimulada(false, 500, {}))
      .mockResolvedValueOnce(respuestaSimulada(true, 200, JSON_API));

    await expect(obtenerCriptomonedas("normal")).rejects.toBeInstanceOf(ErrorHttp);
    await expect(obtenerCriptomonedas("normal")).resolves.toHaveLength(3);
    expect(fetchSimulado).toHaveBeenCalledTimes(2);
  });

  it("dos consultas iguales seguidas comparten una sola solicitud", async () => {
    fetchSimulado.mockResolvedValue(respuestaSimulada(true, 200, JSON_API));

    await Promise.all([obtenerCriptomonedas("normal"), obtenerCriptomoneda("ethereum")]);

    expect(fetchSimulado).toHaveBeenCalledTimes(1);
  });

  it("el detalle devuelve una sola criptomoneda o null si no vino en la respuesta", async () => {
    fetchSimulado.mockResolvedValue(respuestaSimulada(true, 200, { bitcoin: JSON_API.bitcoin }));

    await expect(obtenerCriptomoneda("bitcoin")).resolves.toMatchObject({ nombre: "Bitcoin" });
    await expect(obtenerCriptomoneda("solana")).resolves.toBeNull();
  });
});
