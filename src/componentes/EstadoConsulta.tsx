import type { Estado } from "../tipos/cripto";

interface Props {
  estado: Estado;
  mensaje: string;
  onReintentar?: () => void;
}

// Icono y título de cada estado: el estado se entiende por el texto y el icono, no solo por el color
const PRESENTACION: Record<Estado, { icono: string; titulo: string }> = {
  inicial: { icono: "ℹ️", titulo: "Sin consultas" },
  carga: { icono: "⏳", titulo: "Cargando" },
  resultado: { icono: "✅", titulo: "Consulta exitosa" },
  vacio: { icono: "📭", titulo: "Sin resultados" },
  error: { icono: "⚠️", titulo: "Error" },
};

// Comunica el estado de la operación y, si hubo un error, permite reintentar
export function EstadoConsulta({ estado, mensaje, onReintentar }: Props) {
  const { icono, titulo } = PRESENTACION[estado];

  return (
    <>
      <div className={`mensaje mensaje-${estado}`} role="status" aria-live="polite">
        <p>
          <span aria-hidden="true">{icono}</span> <strong>{titulo}:</strong> {mensaje}
        </p>
      </div>
      {estado === "error" && onReintentar && (
        <button type="button" className="boton-reintentar" onClick={onReintentar}>
          Volver a intentar
        </button>
      )}
    </>
  );
}
