# Pulso Abierto - Consulta de criptomonedas (versión React)

Actividad 4 - Programación Web
Alumno: Emanuel Ñañez

- **Aplicación publicada en Vercel:** https://pulso-abierto-react-nu.vercel.app/
- **Repositorio en GitHub:** https://github.com/matutenanez-glitch/pulso-abierto-react

## Descripción

Pulso Abierto es una aplicación web que consulta el precio actual de Bitcoin, Ethereum y Solana en dólares estadounidenses (USD). En la segunda versión (Actividad 2) la aplicación se reconstruyó con **React, Vite y TypeScript**: mantiene la API, la temática, los estados y los estilos de la Actividad 1, y agrega un formulario controlado validado con **Zod**, un filtro por nombre o símbolo, la opción de destacar monedas (en la Actividad 3 pasó a ser "favoritas"), una página de detalle por criptomoneda y una página para direcciones inexistentes (**React Router**).

### Novedades de la Actividad 3

- **Favoritos con Zustand**: se puede marcar una criptomoneda como favorita desde el listado o desde su página de detalle; el cambio se ve en las dos vistas y en el contador del encabezado. Reemplaza al botón "Destacar" de la Actividad 2, que era estado local de la página de consulta y se perdía al cambiar de página.
- **Persistencia**: los favoritos se guardan en `localStorage` (clave `pulso-abierto-favoritos`) y se conservan al recargar. Lo guardado se valida al recuperarlo.
- **Servicio consolidado**: todas las consultas pasan por la misma función (fetch → `response.ok` → JSON → validación con Zod → conversión).
- **Pruebas automatizadas** con Vitest, Testing Library y user-event (`npm run test`).

### Actividad 4: versión final publicada

En esta etapa no se agregaron funcionalidades nuevas. Se revisaron los recorridos principales, se hizo una mejora de mantenibilidad acotada (ver [Mejora de mantenibilidad](#mejora-de-mantenibilidad-actividad-4)), se comprobó el build productivo, el proyecto se subió a GitHub y se publicó en Vercel (ver [Despliegue en Vercel](#despliegue-en-vercel)).

## Tecnologías

- React 19 + TypeScript 6
- Vite 8 (servidor de desarrollo y compilación)
- React Router 8 (modo declarativo: `BrowserRouter`, `Routes`, `Route`)
- Zustand 5 (estado global de favoritos, con el middleware `persist`)
- Zod 4 (validación del formulario y de la respuesta de la API)
- Vitest 5 + jsdom, Testing Library, user-event y jest-dom (pruebas)
- ESLint (con las reglas de hooks de React) y Prettier
- Git y GitHub (repositorio) y Vercel (publicación)

## API utilizada

- **Nombre:** CoinGecko API (pública, no necesita clave). Es la misma de la Actividad 1.
- **Endpoint:** `https://api.coingecko.com/api/v3/simple/price`
- **Parámetros:**
  - `ids=bitcoin,ethereum,solana`: monedas consultadas.
  - `vs_currencies=usd`: moneda del precio.
  - `include_market_cap`, `include_24hr_vol`, `include_24hr_change`, `include_last_updated_at` (todos en `true`): datos extra que se muestran en la página de detalle.
- **Propiedades usadas:** `usd`, `usd_market_cap`, `usd_24h_vol`, `usd_24h_change` y `last_updated_at` de cada moneda.

## Variables de entorno

El proyecto **no usa variables de entorno**: la API pública de CoinGecko no necesita clave y la URL está en `src/servicios/coingecko.ts`. Por eso no hay que configurar nada en Vercel ni crear un archivo `.env`. Igualmente, `.gitignore` excluye los archivos `.env` por si se agregan más adelante.

## Instalación y ejecución

Requisitos: Node.js 22.22 o superior (lo piden React Router 8 y Vitest 5) y npm.

1. Clonar el repositorio y entrar a la carpeta:

   ```
   git clone https://github.com/matutenanez-glitch/pulso-abierto-react.git
   cd pulso-abierto-react
   ```

2. Instalar las dependencias:

   ```
   npm install
   ```

3. Ejecutar la aplicación en modo desarrollo:

   ```
   npm run dev
   ```

   La aplicación queda disponible en http://localhost:5173/ (o el puerto que indique la terminal).

4. Ejecutar las pruebas automatizadas:

   ```
   npm run test
   ```

5. Generar el build de producción (revisa los tipos y genera la carpeta `dist/`):

   ```
   npm run build
   ```

6. Comprobar el build con un servidor local (sirve el contenido de `dist/`, por defecto en http://localhost:4173/):

   ```
   npm run preview
   ```

Otros comandos:

```
npm run test:watch  # ejecuta las pruebas y las repite al guardar cambios
npm run typecheck   # revisa los tipos con TypeScript
npm run lint        # revisa el código con ESLint
npm run format      # aplica el formato de Prettier
```

## Despliegue en Vercel

- **URL pública:** https://pulso-abierto-react-nu.vercel.app/
- El proyecto de Vercel está vinculado al repositorio de GitHub `matutenanez-glitch/pulso-abierto-react`. Cada push a la rama `main` genera un despliegue de producción nuevo.
- Configuración usada (coincide con el proyecto):

  | Opción               | Valor                                       |
  | -------------------- | ------------------------------------------- |
  | Application Preset   | Vite                                        |
  | Root Directory       | `./`                                        |
  | Build Command        | `npm run build` (el script de package.json) |
  | Output Directory     | `dist` (la carpeta que genera Vite)         |
  | Install Command      | `npm install`                               |
  | Variables de entorno | Ninguna (el proyecto no las usa)            |

**Problema que apareció solo en la versión publicada.** Después del primer despliegue, al abrir con un enlace directo o recargar una ruta de detalle (por ejemplo `/criptomonedas/solana`) Vercel mostraba su propia página "404: NOT_FOUND". En el panel de red se veía que la solicitud del documento `GET /criptomonedas/solana` respondía con código 404. La causa: en `dist/` solo existe `index.html` y las rutas las resuelve React Router en el navegador; el servidor de desarrollo y `npm run preview` devuelven `index.html` para cualquier ruta, pero Vercel busca un archivo con esa ruta y no lo encuentra.

**Corrección.** Se agregó `vercel.json` con una regla `rewrites` que envía todas las rutas a `/index.html`. Vercel sigue sirviendo primero los archivos que existen en `dist/` (JavaScript, CSS, favicon), así que la regla solo se aplica a las rutas de la aplicación. Después del cambio, `/criptomonedas/solana` responde 200 al recargar, `/criptomonedas/dogecoin` muestra el mensaje de moneda no admitida y una ruta inexistente muestra la página 404 de la aplicación.

## Rutas

| Ruta                 | Página                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `/`                  | Consulta y resultados. Los criterios aplicados quedan en la URL: `/?tipo=normal&busqueda=bit` |
| `/criptomonedas/:id` | Detalle de una criptomoneda (`bitcoin`, `ethereum` o `solana`)                                |
| `*`                  | Página para direcciones inexistentes (404)                                                    |

La página de detalle toma el id de la URL, comprueba que sea una moneda admitida y consulta la API, así que funciona al recargar la página o al entrar con un enlace directo. Si el id no es válido (por ejemplo `/criptomonedas/dogecoin`) muestra un mensaje y enlaces a las monedas disponibles.

## Estructura del proyecto

```
pulso-abierto-react/
├── index.html                    -> página base con el div#root
├── public/favicon.svg
├── src/
│   ├── main.tsx                  -> punto de entrada (StrictMode + BrowserRouter)
│   ├── App.tsx                   -> estructura general: encabezado, rutas y pie
│   ├── style.css                 -> estilos (vienen de la Actividad 1, ampliados)
│   ├── paginas/
│   │   ├── PaginaConsulta.tsx    -> consulta y resultados
│   │   ├── PaginaDetalle.tsx     -> detalle de una criptomoneda
│   │   └── PaginaNoEncontrada.tsx-> 404
│   ├── store/favoritos.ts        -> store de Zustand (favoritos + persistencia en localStorage)
│   ├── componentes/
│   │   ├── BotonFavorito.tsx     -> marcar/desmarcar favorita (listado y detalle)
│   │   ├── ContadorFavoritos.tsx -> cantidad de favoritas en el encabezado
│   │   ├── FormularioConsulta.tsx-> formulario controlado + validación con Zod
│   │   ├── EstadoConsulta.tsx    -> comunica el estado y permite reintentar
│   │   ├── ListaCriptomonedas.tsx-> colección de resultados
│   │   ├── TarjetaCripto.tsx     -> tarjeta reutilizable de cada moneda
│   │   └── VariacionPrecio.tsx   -> "Subió / Bajó x %" (tarjeta y detalle)
│   ├── hooks/
│   │   ├── useCriptomonedas.ts   -> coordina la consulta del listado
│   │   ├── useCriptomoneda.ts    -> coordina la consulta del detalle
│   │   └── estadoConsulta.ts     -> calcula el estado (carga, error, vacío...) para los dos hooks
│   ├── servicios/coingecko.ts    -> fetch, response.ok, JSON, validación, conversión y caché
│   ├── esquemas/consulta.ts      -> esquema de Zod del formulario
│   ├── esquemas/respuestaApi.ts  -> esquema de Zod de la respuesta de CoinGecko
│   ├── datos/catalogo.ts         -> monedas admitidas (nombre, símbolo, descripción)
│   ├── tipos/cripto.ts           -> tipos de la API y de la aplicación
│   ├── utilidades/formato.ts     -> formato de montos, porcentajes y fechas
│   └── pruebas/                  -> pruebas automatizadas y su configuración
├── capturas/                     -> capturas de pantalla
├── Registro_uso_IA.md            -> registros de uso de IA (Actividades 2 y 3)
├── vite.config.ts                -> configuración de Vite y de Vitest
├── vercel.json                   -> reescribe las rutas a index.html en Vercel
├── eslint.config.js, tsconfig.json, .prettierrc
└── package.json, package-lock.json
```

## Mejora de mantenibilidad (Actividad 4)

**Problema identificado.** Los hooks `useCriptomonedas` (listado) y `useCriptomoneda` (detalle) tenían una copia casi idéntica de la misma lógica: comprobar si la respuesta guardada pertenece a la consulta actual y, a partir de eso, calcular el estado de la interfaz (`inicial`, `carga`, `error`, `vacio` o `resultado`) con la misma cadena de `if`. La única diferencia era cómo se decide que una respuesta vino sin datos (lista vacía en el listado, `null` en el detalle). Si se cambiaba la regla en un hook había que acordarse de cambiarla en el otro.

**Cambio realizado.** Se extrajo esa lógica a una sola función, `calcularEstado`, en `src/hooks/estadoConsulta.ts`. Recibe la consulta actual, la respuesta guardada y una función que indica si la respuesta vino sin datos, y devuelve el estado y la respuesta vigente. Los dos hooks ahora la usan en lugar de su copia; se quitaron los `if` repetidos y la importación del tipo `Estado`, que ya no hacía falta en los hooks. No cambió la forma en que los hooks hacen la consulta ni lo que devuelven a las páginas.

**Cómo se comprobó que no hubo regresiones.**

- `npm run lint` sin errores y `npm run build` (que incluye `tsc`) compila correctamente.
- `npm run test`: pasan las 20 pruebas, entre ellas las de consulta (carga → resultado, respuesta sin datos, error y reintento) y las de favoritos, que recorren el listado y la página de detalle, o sea, los dos hooks modificados.
- Prueba manual en el navegador: tipo "Normal" (resultado), "Prueba: consulta sin resultados" (vacío), "Prueba: consulta con error" (error con botón "Volver a intentar"), búsqueda sin coincidencias, detalle de Solana (resultado) y `/criptomonedas/dogecoin` (moneda no admitida). Todos se ven igual que antes del cambio.

## Validación del formulario (Zod)

El esquema está en `src/esquemas/consulta.ts` y se aplica con `safeParse` al enviar el formulario:

1. **Búsqueda** (opcional): se quitan los espacios del principio y del final; si queda algo, tiene que tener entre 2 y 30 caracteres.
2. **Tipo de consulta**: tiene que ser una de las opciones admitidas (`normal`, `vacio` o `error`). La opción inicial "Elige una opción" no es válida.

Si hay errores, la consulta no se ejecuta y cada mensaje aparece debajo de su campo, con un ícono y la palabra "Error:", y el borde del campo pasa a ser punteado y más grueso (no depende solo del color). El campo queda vinculado al mensaje con `aria-describedby` y `aria-invalid`.

## Estados de la interfaz

| Estado    | Cuándo aparece                                                      | Cómo verlo                                                             |
| --------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Inicial   | Antes de la primera consulta                                        | Abrir `/`                                                              |
| Carga     | Mientras se espera la respuesta (el botón se deshabilita)           | Consultar. Para que dure más: F12 > Red > "3G lenta"                   |
| Resultado | La consulta funcionó y hay monedas para mostrar                     | Tipo "Normal"                                                          |
| Vacío     | La API no devolvió datos, o ninguna moneda coincide con la búsqueda | Tipo "Prueba: consulta sin resultados", o buscar "xyz"                 |
| Error     | La consulta falló. Aparece el botón "Volver a intentar"             | Tipo "Prueba: consulta con error" (la API responde 404) o sin internet |

## Favoritos y estado global

- El store está en `src/store/favoritos.ts`: guarda una colección de ids (`favoritos`) y la acción `alternarFavorito(id)`, que crea un arreglo nuevo en lugar de modificar el anterior.
- Cada componente lee solo lo que necesita mediante selectores: `seleccionarEsFavorita(id)` (botón y tarjeta), `seleccionarFavoritos` (resumen del listado) y `seleccionarCantidadFavoritos` (encabezado). La cantidad se calcula a partir de la colección; no se guarda aparte.
- No están en el store: la carga, los errores, los datos de la API, el filtro ni la cantidad de resultados (son estado local o datos derivados de cada página).
- Persistencia con `persist` de Zustand y `localStorage`. Solo se guardan los favoritos (`partialize`). Al recuperarlos, `merge` descarta ids que no estén en el catálogo, repetidos o datos con otra forma.

## Pruebas automatizadas

Se ejecutan con `npm run test`. No hacen solicitudes reales a CoinGecko: `fetch` queda bloqueado en la configuración común (`src/pruebas/configuracion.ts`) y cada prueba simula el servicio o la respuesta.

| Archivo                          | Qué comprueba                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/pruebas/favoritos.test.tsx` | Marcar y desmarcar (con mouse y teclado) y que el cambio se vea en el listado, el detalle y el contador |
| `src/pruebas/consulta.test.tsx`  | Carga seguida de resultado, respuesta sin datos, error con mensaje comprensible y reintento             |
| `src/pruebas/servicio.test.ts`   | Respuesta exitosa (forma de los datos), `ok: false`, formato inesperado y caché                         |
| `src/pruebas/store.test.ts`      | Actualización inmutable, qué se guarda en `localStorage` y recuperación de datos guardados incorrectos  |

## Accesibilidad y diseño adaptable

- Estructura semántica: `header`, `main`, `section` con títulos, `footer`, listas `ul` para las tarjetas y `dl` para los datos del detalle.
- Todos los controles tienen etiqueta visible y se usan con teclado (Tab, Enter, Espacio). El foco se ve con un borde naranja.
- La región de estado tiene `role="status"` y `aria-live="polite"`. Los errores del formulario tienen `role="alert"`.
- El botón "Favorita" usa `aria-pressed` y su nombre accesible incluye la moneda ("Marcar Bitcoin como favorita"). Para navegar se usan enlaces y para cambiar el estado de la interfaz, botones.
- Cada página cambia el título de la pestaña.
- En celular todo se ve en una columna; desde 768 px el formulario se pone en fila y las tarjetas en tres columnas. Botones y campos de al menos 44 px de alto.

## Problemas conocidos

- La API pública de CoinGecko limita la cantidad de consultas por minuto. Cuando se supera el límite responde sin los encabezados CORS y el navegador lo informa como un error de conexión, por eso el mensaje de error menciona las dos causas. Para gastar menos consultas, el servicio reutiliza durante 30 segundos la respuesta de una misma URL (y también una solicitud que todavía no terminó); los errores no se guardan, así "Volver a intentar" siempre consulta de nuevo.
- En modo desarrollo, `StrictMode` ejecuta los efectos dos veces; gracias a la caché eso no genera dos solicitudes.
- La hora que se muestra es la de la última actualización informada por CoinGecko (`last_updated_at`), que puede ser algunos minutos anterior a la consulta.

## Uso de inteligencia artificial

Los registros de uso de IA de las Actividades 2 y 3 están en [Registro_uso_IA.md](Registro_uso_IA.md). El de la Actividad 3 también forma parte del informe técnico. En la Actividad 4 se usó Claude (Claude Code) como asistente para la revisión, la mejora de mantenibilidad, el despliegue y esta documentación.

## Capturas

En la carpeta `/capturas`:

- `escritorio-1-inicial.jpg`, `escritorio-2-validacion.jpg`, `escritorio-3-carga.jpg`, `escritorio-4-resultado-destacada.jpg`, `escritorio-5-vacio.jpg`, `escritorio-6-error.jpg`
- `escritorio-7-detalle.jpg`, `escritorio-8-moneda-no-admitida.jpg`, `escritorio-9-pagina-404.jpg`, `escritorio-foco-teclado.jpg`
- `movil-1-resultado-filtro.jpg`, `movil-2-detalle.jpg`
- Actividad 3: `a3-pers-1` a `a3-pers-4` (favoritos antes y después de recargar), `a3-diag-1` a `a3-diag-3` (diagnóstico) y `a3-estado-error-reintento.jpg`

## Verificación final

- **Pruebas ejecutadas:** `npm run test` → 4 archivos y 20 pruebas, todas correctas. También `npm run lint` sin errores.
- **Build generado correctamente:** `npm run build` (`tsc` + `vite build`) sin errores; genera `dist/` con `index.html`, un archivo CSS y un archivo JavaScript.
- **Preview comprobado:** con `npm run preview` (http://localhost:4173/) la aplicación carga, la consulta trae los precios, se navega del listado al detalle y de vuelta, los favoritos se marcan y se conservan al recargar, y no hay errores en la consola.
- **Despliegue realizado:** https://pulso-abierto-react-nu.vercel.app/ (Vercel, rama `main`). En la URL pública se comprobó: carga de la aplicación, consulta a la API de CoinGecko, navegación del listado al detalle, apertura y recarga directa de `/criptomonedas/bitcoin` (después de agregar `vercel.json`), favoritos (marcar en el listado, desmarcar en el detalle, conservar al recargar), validación y uso del formulario, y diseño adaptable a 375 px (una columna) y 1280 px (tres columnas). Sin errores en la consola.
- **Fecha de verificación:** 23/11/2026.
