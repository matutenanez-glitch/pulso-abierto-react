import type { Estado } from "../tipos/cripto";

// Lo mínimo que tiene que tener la respuesta que guarda cada hook de consulta
interface RespuestaGuardada {
  consulta: string; // consulta a la que pertenece, por ejemplo "normal#2" o "bitcoin#0"
  error: string | null;
}

// Calcula el estado de la interfaz a partir de la consulta actual y la respuesta guardada.
// Lo usan useCriptomonedas (listado) y useCriptomoneda (detalle); antes cada hook tenía
// su propia copia de esta lógica.
// - consultaActual: null si todavía no hay nada para consultar.
// - sinDatos: indica si una respuesta correcta vino vacía (cada hook guarda datos distintos).
// Devuelve también la respuesta, solo si pertenece a la consulta actual: si es de una
// consulta anterior, la nueva todavía se está cargando.
export function calcularEstado<R extends RespuestaGuardada>(
  consultaActual: string | null,
  respuesta: R | null,
  sinDatos: (respuesta: R) => boolean,
): { estado: Estado; actual: R | null } {
  const actual = respuesta !== null && respuesta.consulta === consultaActual ? respuesta : null;

  let estado: Estado;
  if (consultaActual === null) {
    estado = "inicial";
  } else if (actual === null) {
    estado = "carga";
  } else if (actual.error !== null) {
    estado = "error";
  } else if (sinDatos(actual)) {
    estado = "vacio";
  } else {
    estado = "resultado";
  }

  return { estado, actual };
}
