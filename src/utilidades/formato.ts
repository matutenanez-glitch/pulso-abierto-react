// Funciones para mostrar números y fechas con el formato argentino (es-AR).
// Antes este código estaba repetido en TarjetaCripto y PaginaDetalle.

// Monto en dólares, por ejemplo "US$ 73.844,00".
// Para montos grandes (capitalización, volumen) se pueden quitar los decimales.
export function formatearUsd(valor: number, decimales = 2): string {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

// Porcentaje sin signo y con hasta 2 decimales, por ejemplo "1,25"
export function formatearPorcentaje(valor: number): string {
  return Math.abs(valor).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

// Hora en formato de 24 horas, por ejemplo "15:20:09"
export function formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString("es-AR", { hour12: false });
}

// Fecha y hora en formato de 24 horas, por ejemplo "10/11/2026, 15:20:09"
export function formatearFechaHora(fecha: Date): string {
  return fecha.toLocaleString("es-AR", { hour12: false });
}
