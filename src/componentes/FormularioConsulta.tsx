import { useState, type FormEvent } from "react";
import {
  esquemaConsulta,
  type CriteriosConsulta,
  type ValoresFormulario,
} from "../esquemas/consulta";
import type { TipoConsulta } from "../tipos/cripto";

interface Props {
  valoresIniciales: ValoresFormulario;
  consultando: boolean;
  onConsultar: (criterios: CriteriosConsulta) => void;
}

type Errores = Partial<Record<keyof ValoresFormulario, string>>;

const OPCIONES_TIPO: { valor: TipoConsulta; texto: string }[] = [
  { valor: "normal", texto: "Normal (Bitcoin, Ethereum y Solana)" },
  { valor: "vacio", texto: "Prueba: consulta sin resultados" },
  { valor: "error", texto: "Prueba: consulta con error" },
];

// Formulario controlado: los valores de los campos viven en el estado de este componente
export function FormularioConsulta({ valoresIniciales, consultando, onConsultar }: Props) {
  const [valores, setValores] = useState<ValoresFormulario>(valoresIniciales);
  const [errores, setErrores] = useState<Errores>({});

  // Crea un objeto nuevo en lugar de modificar el anterior
  function cambiarValor(campo: keyof ValoresFormulario, valor: string) {
    setValores((anteriores) => ({ ...anteriores, [campo]: valor }));
  }

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault(); // evita que la página se recargue

    const resultado = esquemaConsulta.safeParse(valores);

    // Si hay errores los muestro y NO hago la consulta
    if (!resultado.success) {
      const nuevos: Errores = {};
      for (const problema of resultado.error.issues) {
        const campo = problema.path[0];
        if ((campo === "busqueda" || campo === "tipo") && !nuevos[campo]) {
          nuevos[campo] = problema.message;
        }
      }
      setErrores(nuevos);
      return;
    }

    setErrores({});
    onConsultar(resultado.data);
  }

  // Si hay un error, el campo queda vinculado al mensaje con aria-describedby
  const describeBusqueda = errores.busqueda ? "ayuda-busqueda error-busqueda" : "ayuda-busqueda";

  return (
    <form className="formulario" onSubmit={manejarEnvio}>
      <div className="campo">
        <label htmlFor="busqueda">Buscar por nombre o símbolo</label>
        <input
          id="busqueda"
          name="busqueda"
          type="text"
          autoComplete="off"
          value={valores.busqueda}
          onChange={(evento) => cambiarValor("busqueda", evento.target.value)}
          aria-invalid={errores.busqueda ? true : undefined}
          aria-describedby={describeBusqueda}
        />
        <p id="ayuda-busqueda" className="ayuda">
          Opcional. Por ejemplo: "bit" o "SOL".
        </p>
        {errores.busqueda && (
          <p id="error-busqueda" className="error-campo" role="alert">
            <span aria-hidden="true">⚠️ </span>Error: {errores.busqueda}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="tipo">Tipo de consulta</label>
        <select
          id="tipo"
          name="tipo"
          value={valores.tipo}
          onChange={(evento) => cambiarValor("tipo", evento.target.value)}
          aria-invalid={errores.tipo ? true : undefined}
          aria-describedby={errores.tipo ? "error-tipo" : undefined}
        >
          <option value="">Elige una opción</option>
          {OPCIONES_TIPO.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
        </select>
        {errores.tipo && (
          <p id="error-tipo" className="error-campo" role="alert">
            <span aria-hidden="true">⚠️ </span>Error: {errores.tipo}
          </p>
        )}
      </div>

      <button type="submit" disabled={consultando}>
        {consultando ? "Consultando..." : "Consultar precios"}
      </button>
    </form>
  );
}
