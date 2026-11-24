import { useState } from "react";
import { useSearchParams } from "react-router";
import { EstadoConsulta } from "../componentes/EstadoConsulta";
import { FormularioConsulta } from "../componentes/FormularioConsulta";
import { ListaCriptomonedas } from "../componentes/ListaCriptomonedas";
import { esquemaConsulta, type CriteriosConsulta } from "../esquemas/consulta";
import { useCriptomonedas } from "../hooks/useCriptomonedas";
import { seleccionarFavoritos, useFavoritos } from "../store/favoritos";
import type { Criptomoneda, Estado } from "../tipos/cripto";
import { formatearHora } from "../utilidades/formato";

// Filtra por nombre o símbolo, sin distinguir mayúsculas de minúsculas
function filtrarCriptomonedas(lista: Criptomoneda[], busqueda: string): Criptomoneda[] {
  const texto = busqueda.toLowerCase();
  if (texto === "") {
    return lista;
  }
  return lista.filter(
    (cripto) =>
      cripto.nombre.toLowerCase().includes(texto) || cripto.simbolo.toLowerCase().includes(texto),
  );
}

// Página de consulta y resultados
export function PaginaConsulta() {
  // Los criterios aplicados quedan en la URL (por ejemplo ?tipo=normal&busqueda=bit).
  // Así la consulta se reconstruye al volver desde el detalle o al recargar la página.
  const [parametros, setParametros] = useSearchParams();
  const criterios = esquemaConsulta.safeParse({
    busqueda: parametros.get("busqueda") ?? "",
    tipo: parametros.get("tipo") ?? "",
  });
  const tipo = criterios.success ? criterios.data.tipo : null;
  const busqueda = criterios.success ? criterios.data.busqueda : "";

  const [numeroConsulta, setNumeroConsulta] = useState(0);
  const consulta = useCriptomonedas(tipo, numeroConsulta);
  // Estado global: la página solo lee la colección de favoritos (para el resumen)
  const favoritos = useFavoritos(seleccionarFavoritos);

  // ---- Datos derivados: se calculan en cada render, no se guardan en el estado ----
  const visibles = filtrarCriptomonedas(consulta.datos, busqueda);
  const cantidad = visibles.length;
  const favoritasVisibles = visibles.filter((cripto) => favoritos.includes(cripto.id)).length;
  // Hora más reciente informada por la API (en milisegundos, 0 si no hay)
  const ultimaActualizacion = Math.max(
    0,
    ...visibles.map((cripto) => cripto.actualizadoEn?.getTime() ?? 0),
  );
  // Si la API trajo datos pero ninguno coincide con la búsqueda, también es ausencia de datos
  const estado: Estado =
    consulta.estado === "resultado" && cantidad === 0 ? "vacio" : consulta.estado;

  function consultar(nuevos: CriteriosConsulta) {
    const valores: Record<string, string> = { tipo: nuevos.tipo };
    if (nuevos.busqueda !== "") {
      valores.busqueda = nuevos.busqueda;
    }
    setParametros(valores, { replace: true });
    // El nuevo número depende del anterior: uso la forma funcional
    setNumeroConsulta((anterior) => anterior + 1);
  }

  function reintentar() {
    setNumeroConsulta((anterior) => anterior + 1);
  }

  let mensaje = "";
  let textoResultados = "";
  switch (estado) {
    case "inicial":
      mensaje =
        'Todavía no se realizó ninguna consulta. Completa el formulario y presiona "Consultar precios".';
      textoResultados = "Aún no hay datos para mostrar.";
      break;
    case "carga":
      mensaje = "Consultando los precios, por favor espera...";
      textoResultados = "Cargando datos...";
      break;
    case "resultado": {
      const encontradas =
        cantidad === 1 ? "Se encontró 1 criptomoneda" : `Se encontraron ${cantidad} criptomonedas`;
      const filtro =
        busqueda === ""
          ? ""
          : ` que ${cantidad === 1 ? "coincide" : "coinciden"} con "${busqueda}"`;
      const hora =
        ultimaActualizacion === 0
          ? ""
          : ` Precios actualizados por CoinGecko a las ${formatearHora(new Date(ultimaActualizacion))}.`;
      mensaje = `${encontradas}${filtro}.${hora}`;
      break;
    }
    case "vacio":
      if (consulta.estado === "vacio") {
        mensaje = "La consulta se realizó correctamente pero no devolvió datos.";
        textoResultados = "No hay criptomonedas para mostrar.";
      } else {
        mensaje = `Ninguna criptomoneda coincide con "${busqueda}". Prueba con otro nombre o símbolo.`;
        textoResultados = "No hay criptomonedas que coincidan con la búsqueda.";
      }
      break;
    case "error":
      mensaje = `${consulta.error} Puedes volver a intentarlo.`;
      textoResultados = "No se pudieron cargar los datos.";
      break;
  }

  return (
    <>
      <title>Pulso Abierto - Precios de criptomonedas</title>

      <section className="seccion" aria-labelledby="titulo-consulta">
        <h2 id="titulo-consulta">Consultar precios</h2>
        <FormularioConsulta
          valoresIniciales={{ busqueda, tipo: tipo ?? "" }}
          consultando={estado === "carga"}
          onConsultar={consultar}
        />
      </section>

      <section className="seccion" aria-labelledby="titulo-estado">
        <h2 id="titulo-estado">Estado de la consulta</h2>
        <EstadoConsulta estado={estado} mensaje={mensaje} onReintentar={reintentar} />
      </section>

      <section className="seccion" aria-labelledby="titulo-resultados">
        <h2 id="titulo-resultados">Resultados</h2>
        {estado === "resultado" ? (
          <>
            <p className="resumen">
              Mostrando {cantidad} de {consulta.datos.length} criptomonedas. Favoritas en la lista:{" "}
              {favoritasVisibles}.
            </p>
            <ListaCriptomonedas criptomonedas={visibles} />
          </>
        ) : (
          <p>{textoResultados}</p>
        )}
      </section>
    </>
  );
}
