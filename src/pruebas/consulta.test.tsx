// B. Consulta de datos y C. Error y recuperación (página de consulta)
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ErrorHttp, obtenerCriptomonedas } from "../servicios/coingecko";
import type { Criptomoneda } from "../tipos/cripto";
import { CRIPTOS_DE_PRUEBA, promesaControlada, renderizarApp } from "./utilidades";

vi.mock("../servicios/coingecko", async (importarOriginal) => ({
  ...(await importarOriginal<typeof import("../servicios/coingecko")>()),
  obtenerCriptomonedas: vi.fn(),
}));

const obtenerCriptomonedasSimulado = vi.mocked(obtenerCriptomonedas);

describe("Consulta de datos", () => {
  it("muestra la carga y después el resultado", async () => {
    const respuesta = promesaControlada<Criptomoneda[]>();
    obtenerCriptomonedasSimulado.mockReturnValue(respuesta.promesa);
    const usuario = userEvent.setup();
    renderizarApp("/");

    await usuario.selectOptions(screen.getByLabelText("Tipo de consulta"), "normal");
    await usuario.click(screen.getByRole("button", { name: "Consultar precios" }));

    // Carga: mensaje de estado y botón deshabilitado (no se puede iniciar otra consulta)
    expect(screen.getByRole("status")).toHaveTextContent(/cargando/i);
    expect(screen.getByRole("button", { name: "Consultando..." })).toBeDisabled();

    // Llega la respuesta
    respuesta.resolver(CRIPTOS_DE_PRUEBA);

    expect(await screen.findByRole("heading", { level: 3, name: "Bitcoin" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Ethereum" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Solana" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Se encontraron 3 criptomonedas");
    expect(screen.getByRole("button", { name: "Consultar precios" })).toBeEnabled();
    expect(obtenerCriptomonedasSimulado).toHaveBeenCalledWith("normal");
  });

  it("muestra un mensaje cuando la respuesta no tiene datos", async () => {
    obtenerCriptomonedasSimulado.mockResolvedValue([]);
    renderizarApp("/?tipo=normal");

    expect(await screen.findByText(/no devolvió datos/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Sin resultados");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});

describe("Error y recuperación", () => {
  it("muestra un mensaje comprensible y permite reintentar", async () => {
    obtenerCriptomonedasSimulado
      .mockRejectedValueOnce(new ErrorHttp(500)) // primera consulta: falla
      .mockResolvedValueOnce(CRIPTOS_DE_PRUEBA); // reintento: funciona
    const usuario = userEvent.setup();
    renderizarApp("/?tipo=normal");

    expect(
      await screen.findByText(/el servicio respondió con un error \(código 500\)/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Error");
    const reintentar = screen.getByRole("button", { name: "Volver a intentar" });

    await usuario.click(reintentar);

    expect(await screen.findByRole("heading", { level: 3, name: "Bitcoin" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Volver a intentar" })).not.toBeInTheDocument();
    expect(obtenerCriptomonedasSimulado).toHaveBeenCalledTimes(2);
  });

  it("explica el problema cuando no hay conexión", async () => {
    obtenerCriptomonedasSimulado.mockRejectedValue(new TypeError("Failed to fetch"));
    renderizarApp("/?tipo=normal");

    expect(await screen.findByText(/no se pudo conectar con el servicio/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Volver a intentar" })).toBeInTheDocument();
  });
});
