import { z } from "zod";

// Forma esperada de la respuesta de /simple/price de CoinGecko.
// Por cada moneda llega el precio en USD y, si se piden, la capitalización, el volumen,
// la variación de 24 h y la hora de actualización (en segundos, formato Unix).
// Ejemplo: { "bitcoin": { "usd": 73844, "usd_24h_change": -1.01, ... } }
// El servicio valida el JSON con este esquema, así los datos tipados también son correctos
// mientras la aplicación se ejecuta (no solo para TypeScript).
export const esquemaPrecioApi = z.object({
  usd: z.number(),
  usd_market_cap: z.number().nullish(),
  usd_24h_vol: z.number().nullish(),
  usd_24h_change: z.number().nullish(),
  last_updated_at: z.number().nullish(),
});

// La respuesta es un objeto donde cada clave es el id de la moneda (puede venir vacío: {})
export const esquemaRespuestaPrecios = z.record(z.string(), esquemaPrecioApi);
