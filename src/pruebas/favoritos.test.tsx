// A. Favoritos: una persona marca y desmarca criptomonedas y la interfaz lo representa
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { obtenerCriptomoneda, obtenerCriptomonedas } from "../servicios/coingecko";
import { CRIPTOS_DE_PRUEBA, renderizarApp } from "./utilidades";

// Se reemplazan las funciones del servicio: las pruebas no consultan la API real
vi.mock("../servicios/coingecko", async (importarOriginal) => ({
  ...(await importarOriginal<typeof import("../servicios/coingecko")>()),
  obtenerCriptomonedas: vi.fn(),
  obtenerCriptomoneda: vi.fn(),
}));

const obtenerCriptomonedasSimulado = vi.mocked(obtenerCriptomonedas);
const obtenerCriptomonedaSimulado = vi.mocked(obtenerCriptomoneda);

describe("Favoritos", () => {
  beforeEach(() => {
    obtenerCriptomonedasSimulado.mockResolvedValue(CRIPTOS_DE_PRUEBA);
    obtenerCriptomonedaSimulado.mockImplementation(
      async (id) => CRIPTOS_DE_PRUEBA.find((cripto) => cripto.id === id) ?? null,
    );
  });

  it("permite marcar y desmarcar una criptomoneda desde el listado", async () => {
    const usuario = userEvent.setup();
    renderizarApp("/?tipo=normal");

    const boton = await screen.findByRole("button", { name: /marcar bitcoin como favorita/i });
    expect(boton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("0 criptomonedas favoritas")).toBeInTheDocument();

    // Marcar
    await usuario.click(boton);
    expect(boton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { level: 3, name: /bitcoin.*favorita/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 criptomoneda favorita")).toBeInTheDocument();
    expect(screen.getByText(/favoritas en la lista: 1/i)).toBeInTheDocument();

    // Desmarcar
    await usuario.click(boton);
    expect(boton).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("★ Favorita")).not.toBeInTheDocument();
    expect(screen.getByText("0 criptomonedas favoritas")).toBeInTheDocument();
  });

  it("también se puede usar con el teclado", async () => {
    const usuario = userEvent.setup();
    renderizarApp("/?tipo=normal");
    const boton = await screen.findByRole("button", { name: /marcar ethereum como favorita/i });

    boton.focus();
    await usuario.keyboard("{Enter}");
    expect(boton).toHaveAttribute("aria-pressed", "true");
    await usuario.keyboard(" ");
    expect(boton).toHaveAttribute("aria-pressed", "false");
  });

  it("lo marcado en el listado se ve en el detalle y lo desmarcado en el detalle se ve en el listado", async () => {
    const usuario = userEvent.setup();
    renderizarApp("/?tipo=normal");

    // 1) Se marca Solana en el listado y se abre su detalle
    await usuario.click(
      await screen.findByRole("button", { name: /marcar solana como favorita/i }),
    );
    await usuario.click(screen.getByRole("link", { name: /ver detalle de solana/i }));

    expect(await screen.findByRole("heading", { level: 2, name: /solana/i })).toBeInTheDocument();
    const botonDetalle = screen.getByRole("button", { name: /marcar solana como favorita/i });
    expect(botonDetalle).toHaveAttribute("aria-pressed", "true");

    // 2) Se desmarca en el detalle y se vuelve al listado
    await usuario.click(botonDetalle);
    expect(screen.getByText("0 criptomonedas favoritas")).toBeInTheDocument();
    await usuario.click(screen.getByRole("link", { name: /volver a la consulta de precios/i }));
    await usuario.selectOptions(screen.getByLabelText("Tipo de consulta"), "normal");
    await usuario.click(screen.getByRole("button", { name: "Consultar precios" }));

    expect(
      await screen.findByRole("button", { name: /marcar solana como favorita/i }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});
