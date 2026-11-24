// ===============================
// Servicio de acceso a la API de CoinGecko
// Es la única parte de la aplicación que conoce la URL de la API y hace solicitudes.
// Todas las consultas siguen el mismo criterio (función pedirPrecios):
//   fetch -> comprobar response.ok -> procesar el JSON -> validar la forma -> convertir.
// Los componentes y los hooks reciben datos ya convertidos al tipo Criptomoneda.
// ===============================

import { CATALOGO, IDS_ADMITIDOS, type IdCripto } from "../datos/catalogo";
import { esquemaRespuestaPrecios } from "../esquemas/respuestaApi";
import type { Criptomoneda, PrecioApi, RespuestaPreciosApi, TipoConsulta } from "../tipos/cripto";

const URL_BASE = "https://api.coingecko.com/api/v3";

// Además del precio en USD pido capitalización, volumen, variación de 24 h y hora de actualización
const PARAMETROS =
  "vs_currencies=usd&include_market_cap=true&include_24hr_vol=true" +
  "&include_24hr_change=true&include_last_updated_at=true";

function urlPrecios(ids: readonly string[]): string {
  return `${URL_BASE}/simple/price?ids=${ids.join(",")}&${PARAMETROS}`;
}

// ---- Errores propios ----

// La API respondió, pero con un código de error (por ejemplo 404, 429 o 500)
export class ErrorHttp extends Error {
  codigo: number;

  constructor(codigo: number) {
    super("Error HTTP " + codigo);
    this.name = "ErrorHttp";
    this.codigo = codigo;
  }
}

// La API respondió bien, pero el contenido no es JSON o no tiene la forma esperada
export class ErrorFormato extends Error {
  constructor() {
    super("La respuesta no tiene el formato esperado");
    this.name = "ErrorFormato";
  }
}

// ---- Solicitud ----

// Hace la solicitud con fetch, comprueba response.ok, procesa el JSON y valida su forma
async function pedirPrecios(url: string): Promise<RespuestaPreciosApi> {
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new ErrorHttp(respuesta.status);
  }

  let json: unknown;
  try {
    json = await respuesta.json();
  } catch {
    throw new ErrorFormato(); // el cuerpo no era JSON
  }

  const validado = esquemaRespuestaPrecios.safeParse(json);
  if (!validado.success) {
    throw new ErrorFormato();
  }
  return validado.data;
}

// ---- Caché simple ----
// La API pública limita la cantidad de consultas por minuto y sus precios no cambian
// de un segundo a otro. Si se pide la misma URL dentro de 30 segundos, reutilizo la misma
// solicitud en lugar de hacer otra (también si la anterior todavía no terminó).
// Los errores no se guardan: "Volver a intentar" siempre hace una solicitud nueva.
const DURACION_CACHE_MS = 30_000;
const cache = new Map<string, { hora: number; promesa: Promise<RespuestaPreciosApi> }>();

function pedirConCache(url: string): Promise<RespuestaPreciosApi> {
  const guardada = cache.get(url);
  if (guardada && Date.now() - guardada.hora < DURACION_CACHE_MS) {
    return guardada.promesa;
  }

  const promesa = pedirPrecios(url);
  cache.set(url, { hora: Date.now(), promesa });
  promesa.catch(() => cache.delete(url));
  return promesa;
}

// Vacía la caché. Lo usan las pruebas para que cada caso empiece sin datos guardados.
export function vaciarCache(): void {
  cache.clear();
}

// ---- Transformación: de la forma de la API a la forma que usa la aplicación ----

// Combina los datos de la API con los del catálogo (nombre, símbolo y descripción)
function convertir(id: IdCripto, precio: PrecioApi): Criptomoneda {
  return {
    id,
    ...CATALOGO[id],
    precioUsd: precio.usd,
    capitalizacionUsd: precio.usd_market_cap ?? null,
    volumen24hUsd: precio.usd_24h_vol ?? null,
    variacion24h: precio.usd_24h_change ?? null,
    actualizadoEn: precio.last_updated_at ? new Date(precio.last_updated_at * 1000) : null,
  };
}

// Pasa la respuesta a una lista, en el orden del catálogo.
// Las monedas que no vienen en la respuesta no se incluyen.
function convertirRespuesta(datos: RespuestaPreciosApi): Criptomoneda[] {
  return IDS_ADMITIDOS.filter((id) => datos[id] !== undefined).map((id) =>
    convertir(id, datos[id]),
  );
}

// ---- Funciones públicas ----

// Consulta todas las criptomonedas del catálogo.
// "vacio" y "error" son consultas de prueba, igual que en las actividades anteriores.
export async function obtenerCriptomonedas(tipo: TipoConsulta): Promise<Criptomoneda[]> {
  let url = urlPrecios(IDS_ADMITIDOS);
  if (tipo === "vacio") {
    url = urlPrecios(["moneda-que-no-existe"]); // la API responde {}
  }
  if (tipo === "error") {
    url = `${URL_BASE}/ruta-que-no-existe`; // la API responde 404
  }

  const datos = await pedirConCache(url);
  return convertirRespuesta(datos);
}

// Consulta una sola criptomoneda (página de detalle).
// Usa la misma URL que el listado, así al ir y volver del detalle se aprovecha la caché.
// Devuelve null si la API no trae datos para ese id.
export async function obtenerCriptomoneda(id: IdCripto): Promise<Criptomoneda | null> {
  const datos = await pedirConCache(urlPrecios(IDS_ADMITIDOS));
  return convertirRespuesta(datos).find((cripto) => cripto.id === id) ?? null;
}

// Traduce un error a un mensaje que la persona pueda entender
export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorHttp) {
    if (error.codigo === 429) {
      return "Se hicieron demasiadas consultas seguidas y el servicio pidió esperar. Espera un minuto.";
    }
    return `El servicio respondió con un error (código ${error.codigo}).`;
  }
  if (error instanceof ErrorFormato) {
    return "El servicio respondió con datos que la aplicación no pudo interpretar.";
  }
  // Cuando se supera el límite de consultas, la API responde sin los encabezados CORS
  // y el navegador lo informa como un error de conexión, por eso menciono las dos causas.
  return (
    "No se pudo conectar con el servicio. Revisa tu conexión a internet o, si hiciste " +
    "muchas consultas seguidas, espera un minuto (la API pública limita las consultas por minuto)."
  );
}
