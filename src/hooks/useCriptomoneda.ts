import { useEffect, useState } from "react";
import type { IdCripto } from "../datos/catalogo";
import { mensajeDeError, obtenerCriptomoneda } from "../servicios/coingecko";
import type { Criptomoneda } from "../tipos/cripto";
import { calcularEstado } from "./estadoConsulta";

// Resultado de una consulta, junto con la consulta a la que pertenece
interface Respuesta {
  consulta: string;
  dato: Criptomoneda | null;
  error: string | null;
}

// Coordina la consulta de una criptomoneda para la página de detalle.
// Recibe null cuando el id de la URL no es válido y en ese caso no consulta nada.
// (El hook se llama siempre, antes de cualquier return, como piden las reglas de los hooks.)
export function useCriptomoneda(id: IdCripto | null) {
  const [numeroConsulta, setNumeroConsulta] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  useEffect(() => {
    if (id === null) {
      return;
    }

    const consulta = `${id}#${numeroConsulta}`;
    // Si cambia el id (o se reintenta) antes de que llegue la respuesta, la anterior se ignora
    let ignorar = false;

    obtenerCriptomoneda(id)
      .then((dato) => {
        if (!ignorar) {
          setRespuesta({ consulta, dato, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!ignorar) {
          setRespuesta({ consulta, dato: null, error: mensajeDeError(error) });
        }
      });

    return () => {
      ignorar = true;
    };
  }, [id, numeroConsulta]);

  // ---- Datos derivados ----
  const consultaActual = id === null ? null : `${id}#${numeroConsulta}`;
  const { estado, actual } = calcularEstado(
    consultaActual,
    respuesta,
    (guardada) => guardada.dato === null,
  );

  // El nuevo número depende del anterior: uso la forma funcional
  function reintentar() {
    setNumeroConsulta((anterior) => anterior + 1);
  }

  return {
    estado,
    cripto: actual?.dato ?? null,
    error: actual?.error ?? null,
    reintentar,
  };
}
