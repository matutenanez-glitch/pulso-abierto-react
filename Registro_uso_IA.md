# Registro de uso de inteligencia artificial

Este archivo reúne los registros de la Actividad 2 y de la Actividad 3 (al final).

# Actividad 2

Alumno: Emanuel Ñañez
Herramienta utilizada: Claude (Claude Code, de Anthropic)
Fecha: 10/11/2026

La asistencia se aplicó en dos partes, como pide la consigna 8: sobre el código de la Actividad 1 (para decidir cómo dividirlo en React) y sobre la nueva versión en React (refactorización de la página de detalle).

---

## Intervención 1: análisis del código de la Actividad 1

**Problema analizado.** En `src/main.ts` de la Actividad 1 casi toda la lógica está en pocas funciones que mezclan responsabilidades:

- `consultarPrecios()` controla que no haya dos consultas a la vez (variable `cargando`), deshabilita el botón y cambia su texto, muestra los mensajes de estado, hace la consulta, cuenta los resultados y traduce los errores a mensajes.
- `mostrarTarjetas()` combina los datos con los nombres de las monedas, da formato al precio y crea los elementos del DOM uno por uno.
- `mostrarEstado()` arma el HTML del mensaje con `innerHTML` y muestra u oculta el botón "Volver a intentar" con `hidden`.

**Consulta realizada.**

> Analiza este archivo main.ts (Actividad 1, TypeScript sin frameworks). Indica qué responsabilidades están mezcladas en cada función y cómo convendría separarlas al reconstruir la aplicación con React, Vite y TypeScript: componentes, estado y servicio de acceso a datos. No escribas la aplicación completa; quiero una propuesta de división.

**Síntesis de la propuesta.**

1. Pasar `obtenerPrecios` y `elegirUrl` a un servicio (`servicios/coingecko.ts`) que reciba el tipo de consulta y devuelva datos ya convertidos.
2. Reemplazar `mostrarEstado` por un componente `EstadoConsulta` que reciba el estado y el mensaje por props y muestre el botón de reintento con renderizado condicional.
3. Reemplazar `mostrarTarjetas` por `ListaCriptomonedas` + `TarjetaCripto`, usando `map` con el id de la moneda como clave.
4. Reemplazar la variable `cargando` por un estado booleano `cargando` que se active al comenzar el efecto.
5. Guardar los datos de la consulta en un contexto global (Context) para compartirlos entre páginas.

**Aspectos revisados.** Que cada funcionalidad de la Actividad 1 tuviera un lugar en la nueva versión (los cinco estados, el reintento, el botón deshabilitado durante la carga, `aria-live`, las consultas de prueba "vacío" y "error"), que desapareciera el uso de `innerHTML` y que se pudieran cumplir las consignas sobre datos derivados.

**Decisiones.**

- **Acepté** las propuestas 1, 2 y 3 tal como estaban.
- **Modifiqué** la propuesta 4: no usé un estado `cargando` separado. Activarlo dentro del efecto hace que ESLint marque el error `react-hooks/set-state-in-effect`, y además la consigna pide preferir datos derivados. La "carga" se calcula: la respuesta guardada indica a qué consulta pertenece y, si no coincide con la consulta actual, la aplicación está cargando.
- **Rechacé** la propuesta 5: solo la página de consulta usa el listado y el detalle consulta su propio dato a partir de la URL, así que un contexto global agregaba complejidad sin necesidad.

**Cambio incorporado.** La división de la aplicación en servicio, hooks, páginas y componentes que tiene el proyecto.

**Comprobación.** `npm run typecheck`, `npm run lint` y `npm run build` sin errores, y prueba en el navegador de los cinco estados, del reintento y del formulario.

---

## Intervención 2: refactorización de la página de detalle (React)

**Problema analizado.** La primera versión de `src/paginas/PaginaDetalle.tsx` (185 líneas) mezclaba tres responsabilidades: comprobar el id de la URL, coordinar la consulta a la API (efecto, bandera `ignorar`, respuesta asociada a la consulta y cálculo del estado) y presentar los datos dándoles formato. Además había código repetido:

- La coordinación de la consulta era casi igual a la del hook `useCriptomonedas`.
- Había 7 llamadas a `toLocaleString("es-AR", ...)` repartidas entre `PaginaDetalle` (5) y `TarjetaCripto` (2).
- El bloque "▲/▼ Subió/Bajó x %" estaba copiado en los dos archivos.

**Consulta realizada.**

> Te paso PaginaDetalle.tsx, TarjetaCripto.tsx y useCriptomonedas.ts de mi proyecto en React + TypeScript. Detecta responsabilidades mezcladas y código repetido en PaginaDetalle.tsx y propone una refactorización que no cambie el comportamiento ni el aspecto de la página. No agregues dependencias nuevas.

**Síntesis de la propuesta.**

1. Extraer un hook `useCriptomoneda(id)` con el efecto y el cálculo del estado.
2. Crear funciones de formato (`formatearUsd`, `formatearFechaHora`, etc.) en un archivo de utilidades y un componente para la variación del precio, y usarlos en la tarjeta y en el detalle.
3. Unificar `useCriptomonedas` y `useCriptomoneda` en un único hook genérico `useConsultaRemota<T>(pedir)`, que reciba la función que hace la consulta.
4. Usar `AbortController` para cancelar la solicitud anterior cuando cambia el id.
5. Pasar el bloque "criptomoneda no encontrada" a un componente propio.

**Aspectos revisados.**

- Las reglas de los hooks: el hook tiene que llamarse antes del `return` anticipado del id inválido, así que tiene que aceptar `null`.
- Que el formato quedara exactamente igual (por ejemplo, la capitalización sin decimales).
- Las dependencias del `useEffect` (`[id, numeroConsulta]`).
- Cómo afectaba cada propuesta a la caché del servicio.

**Decisiones.**

- **Acepté con cambios** la propuesta 1: el hook recibe `IdCripto | null` (si es `null` no consulta) y devuelve también la función `reintentar`, así la página ya no maneja `numeroConsulta`.
- **Acepté con cambios** la propuesta 2: creé `src/utilidades/formato.ts` con `formatearUsd(valor, decimales)`, `formatearPorcentaje`, `formatearHora` y `formatearFechaHora`. Agregué `formatearHora` para usarla también en el mensaje del listado, así todo el formato queda en un solo lugar. Para la variación creé el componente `VariacionPrecio`, porque se reutiliza en dos lugares.
- **Rechacé** la propuesta 3: con solo dos usos, el hook genérico obliga a pasar la función de consulta y a memorizarla con `useCallback`. Si alguien se olvida, el efecto se repite sin fin. Me pareció más difícil de leer y de explicar. Lo dejo como posible mejora futura.
- **Rechacé** la propuesta 4: la consigna no lo exige y la bandera `ignorar` ya evita mostrar respuestas viejas. Además, el servicio comparte la misma solicitud entre consultas iguales (caché), y abortarla desde un componente la cancelaría también para el otro.
- **Rechacé** la propuesta 5: el bloque se usa solo en esa página y es corto. La consigna pide evitar componentes que no mejoren la comprensión o la reutilización.

**Cambio incorporado.**

- Nuevo `src/hooks/useCriptomoneda.ts`.
- Nuevo `src/utilidades/formato.ts`.
- Nuevo `src/componentes/VariacionPrecio.tsx`.
- `PaginaDetalle.tsx` pasó de 185 a 125 líneas.
- `TarjetaCripto.tsx` y `PaginaConsulta.tsx` usan las funciones de formato.
- Fuera de `formato.ts` ya no quedan llamadas a `toLocaleString`.

**Comprobación de que la aplicación sigue funcionando.**

| Verificación                          | Cómo                                                                                                                                                                                    | Resultado                                                                                                                       |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Análisis de tipos y compilación       | `npm run typecheck`, `npm run lint`, `npm run build`                                                                                                                                    | Sin errores                                                                                                                     |
| Ejecución                             | `npm run dev` y apertura en el navegador                                                                                                                                                | Sin advertencias de React en la consola                                                                                         |
| Funcionamiento de la parte modificada | En `/criptomonedas/ethereum`, antes y después del cambio: forcé un fallo de red desde la consola, comparé el texto del error, presioné "Volver a intentar" y comparé el detalle cargado | Texto del error idéntico. Detalle con la misma estructura y formato (solo cambian los precios). El reintento vuelve a consultar |
| Consulta a la API                     | Tipo "Normal" en la página de consulta                                                                                                                                                  | Las tres monedas con precio y variación                                                                                         |
| Navegación principal                  | Listado → "Ver detalle" → volver. Acceso directo a `/criptomonedas/bitcoin`, `/criptomonedas/dogecoin` y a una ruta inexistente                                                         | Funciona. Al volver, la consulta se reconstruye desde la URL. Se muestran los mensajes de moneda no admitida y de 404           |

---

# Actividad 3 - Uso de IA dentro del diagnóstico (consigna 7)

Herramienta utilizada: Claude (Claude Code, de Anthropic)
Fecha: 18/11/2026

**Contexto.** Durante el diagnóstico de la consigna 6 reproduje un dato persistido que no se recuperaba como esperaba: con `["bitcoin","dogecoin"]` guardado en `localStorage` el encabezado mostraba "2 criptomonedas favoritas" con una sola marcada, y con `"bitcoin"` (texto en lugar de arreglo) mostraba "7" y al presionar "Favorita" la consola informaba `TypeError: estado.favoritos.filter is not a function`.

**Información proporcionada.** El archivo `src/store/favoritos.ts` sin la corrección, los dos valores guardados en `localStorage`, el texto completo del error de la consola (con la pila: `alternarFavorito` ← `onClick` de `BotonFavorito`) y lo que se veía en pantalla.

**Consulta realizada (tarea delimitada).**

> Con este store de Zustand y esta evidencia, interpreta el error y explica por qué el contador muestra 2 y 7 favoritas. Propón una corrección acotada dentro del store, sin agregar dependencias y sin reescribirlo completo.

**Síntesis de la propuesta.**

1. Causa: `persist` recupera lo guardado con una mezcla superficial y no lo valida. La cantidad es `favoritos.length`, así que cuenta ids desconocidos; si el valor es un texto, `includes` funciona por ser un método de los textos, `length` es 7 y `filter` no existe.
2. Corrección: usar la opción `merge` de `persist` para quedarse solo con un arreglo de ids admitidos (`Array.isArray` + `esIdAdmitido`).
3. Alternativa: agregar `version` y `migrate` para descartar datos de versiones anteriores.
4. Alternativa: proteger la acción y los selectores con `Array.isArray` y filtrar ids en el contador.
5. Alternativa: borrar el almacenamiento (`persist.clearStorage()`) cuando los datos no sean válidos.

**Decisiones.**

- **Acepté con cambios** las propuestas 1 y 2. Saqué la validación a una función pura exportada (`limpiarFavoritosGuardados`) para poder probarla sola, agregué la eliminación de ids repetidos y contemplé que `merge` reciba `undefined`: lo comprobé leyendo el código de `persist` en `node_modules/zustand`, que llama a `merge` también cuando no hay nada guardado.
- **Rechacé** la 3: la consigna no pide versionado y no protege contra datos modificados con la misma versión.
- **Rechacé** la 4: corrige el síntoma en varios lugares y el estado del store sigue siendo incorrecto.
- **Rechacé** la 5: borraría también los favoritos válidos (en el caso 1, Bitcoin).

**Verificación técnica.**

- `npm run typecheck` y `npm run lint` sin errores.
- Repetí los dos casos en el navegador: caso 1 → "1 criptomoneda favorita"; al marcar Ethereum quedó guardado `["bitcoin","ethereum"]`. Caso 2 → "0"; al marcar Bitcoin funciona y queda `["bitcoin"]`. Sin excepciones en la consola.
- Prueba de regresión en `src/pruebas/store.test.ts`. Al quitar la corrección a propósito, la prueba falla; al restaurarla, pasa.
