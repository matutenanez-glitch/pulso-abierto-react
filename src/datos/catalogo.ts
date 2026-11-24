// Criptomonedas que admite la aplicación.
// Los ids son los mismos que usa CoinGecko, así se pueden usar en la URL y en la consulta.
export const IDS_ADMITIDOS = ["bitcoin", "ethereum", "solana"] as const;

export type IdCripto = (typeof IDS_ADMITIDOS)[number];

// Datos fijos de cada moneda (la API solo devuelve números)
export interface InfoCripto {
  nombre: string;
  simbolo: string;
  descripcion: string;
}

export const CATALOGO: Record<IdCripto, InfoCripto> = {
  bitcoin: {
    nombre: "Bitcoin",
    simbolo: "BTC",
    descripcion:
      "La primera criptomoneda, creada en 2009. Su cantidad máxima está limitada a 21 millones de unidades.",
  },
  ethereum: {
    nombre: "Ethereum",
    simbolo: "ETH",
    descripcion:
      "Red que permite ejecutar contratos inteligentes y aplicaciones. Su moneda se llama ether.",
  },
  solana: {
    nombre: "Solana",
    simbolo: "SOL",
    descripcion: "Red pensada para procesar muchas transacciones por segundo con comisiones bajas.",
  },
};

// Comprueba si un texto (por ejemplo, el id que viene en la URL) es una moneda admitida
export function esIdAdmitido(id: string): id is IdCripto {
  return (IDS_ADMITIDOS as readonly string[]).includes(id);
}
