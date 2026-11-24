import type { Criptomoneda } from "../tipos/cripto";
import { TarjetaCripto } from "./TarjetaCripto";

interface Props {
  criptomonedas: Criptomoneda[];
}

// Representa la colección de resultados. La clave de cada elemento es el id de la moneda,
// que es estable (no cambia entre consultas ni depende de la posición).
// Los favoritos ya no pasan por props: cada tarjeta los lee del store.
export function ListaCriptomonedas({ criptomonedas }: Props) {
  return (
    <ul className="tarjetas">
      {criptomonedas.map((cripto) => (
        <li key={cripto.id}>
          <TarjetaCripto criptomoneda={cripto} />
        </li>
      ))}
    </ul>
  );
}
