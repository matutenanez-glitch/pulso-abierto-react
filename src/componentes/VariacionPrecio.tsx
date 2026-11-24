import { formatearPorcentaje } from "../utilidades/formato";

interface Props {
  valor: number; // variación en porcentaje, por ejemplo -1.5
  sufijo?: string; // texto opcional al final, por ejemplo "en 24 h"
}

// Indica si el precio subió o bajó. Se entiende por la flecha y el texto, el color es un extra.
// Se usa en la tarjeta del listado y en la página de detalle.
export function VariacionPrecio({ valor, sufijo }: Props) {
  const sube = valor >= 0;

  return (
    <span className={sube ? "variacion sube" : "variacion baja"}>
      <span aria-hidden="true">{sube ? "▲" : "▼"} </span>
      {sube ? "Subió" : "Bajó"} {formatearPorcentaje(valor)} %{sufijo ? ` ${sufijo}` : ""}
    </span>
  );
}
