import { useEffect, useState } from "react";
import { mensajeDeError, obtenerCriptomonedas } from "../servicios/coingecko";
import type { Criptomoneda, TipoConsulta } from "../tipos/cripto";
import { calcularEstado } from "./estadoConsulta";

// Resultado de una consulta, junto con la consulta a la que pertenece
interface Respuesta {
  consulta: string;
  datos: Criptomoneda[];
  error: string | null;
}

// Coordina la consulta del listado a la API.
// - tipo: qué consulta hacer. Si es null, todavía no se consultó nada.
// - numeroConsulta: aumenta cada vez que se envía el formulario o se reintenta,
//   así se puede repetir una consulta del mismo tipo.
export function useCriptomonedas(tipo: TipoConsulta | null, numeroConsulta: number) {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  useEffect(() => {
    if (tipo === null) {
      return;
    }

    const consulta = `${tipo}#${numeroConsulta}`;
    // Si empieza otra consulta antes de que llegue esta respuesta, React ejecuta
    // la limpieza (el return de abajo) y la respuesta vieja se ignora.
    let ignorar = false;

    obtenerCriptomonedas(tipo)
      .then((datos) => {
        if (!ignorar) {
          setRespuesta({ consulta, datos, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!ignorar) {
          setRespuesta({ consulta, datos: [], error: mensajeDeError(error) });
        }
      });

    return () => {
      ignorar = true;
    };
  }, [tipo, numeroConsulta]);

  // ---- Datos derivados (no se guardan en otro estado) ----
  // Si la respuesta guardada no es de la consulta actual, todavía se está cargando.
  const consultaActual = tipo === null ? null : `${tipo}#${numeroConsulta}`;
  const { estado, actual } = calcularEstado(
    consultaActual,
    respuesta,
    (guardada) => guardada.datos.length === 0,
  );

  return {
    estado,
    datos: actual?.datos ?? [],
    error: actual?.error ?? null,
  };
}
