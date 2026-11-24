// Store de favoritos: actualización inmutable, persistencia y recuperación de lo guardado
import { describe, expect, it } from "vitest";
import { CLAVE_FAVORITOS, limpiarFavoritosGuardados, useFavoritos } from "../store/favoritos";

function guardar(valor: unknown) {
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(valor));
}

describe("Store de favoritos", () => {
  it("agrega y quita un favorito creando un arreglo nuevo (sin modificar el anterior)", () => {
    const { alternarFavorito } = useFavoritos.getState();
    const inicial = useFavoritos.getState().favoritos;

    alternarFavorito("bitcoin");
    const conBitcoin = useFavoritos.getState().favoritos;
    expect(conBitcoin).toEqual(["bitcoin"]);
    expect(conBitcoin).not.toBe(inicial);
    expect(inicial).toEqual([]);

    alternarFavorito("bitcoin");
    expect(useFavoritos.getState().favoritos).toEqual([]);
    expect(conBitcoin).toEqual(["bitcoin"]);
  });

  it("guarda en localStorage solamente los favoritos", () => {
    useFavoritos.getState().alternarFavorito("solana");

    const guardado = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS) ?? "null");
    expect(guardado).toEqual({ state: { favoritos: ["solana"] }, version: 0 });
  });

  it("al recargar recupera los favoritos guardados", async () => {
    guardar({ state: { favoritos: ["ethereum", "solana"] }, version: 0 });

    await useFavoritos.persist.rehydrate(); // lo mismo que pasa al recargar la página

    expect(useFavoritos.getState().favoritos).toEqual(["ethereum", "solana"]);
  });

  // Regresión del diagnóstico (consigna 6)
  it("al recargar descarta ids desconocidos y datos con forma incorrecta", async () => {
    guardar({ state: { favoritos: ["bitcoin", "dogecoin", "bitcoin"] }, version: 0 });
    await useFavoritos.persist.rehydrate();
    expect(useFavoritos.getState().favoritos).toEqual(["bitcoin"]);

    guardar({ state: { favoritos: "bitcoin" }, version: 0 });
    await useFavoritos.persist.rehydrate();
    expect(useFavoritos.getState().favoritos).toEqual([]);

    // Después de recuperar datos incorrectos, la acción sigue funcionando
    useFavoritos.getState().alternarFavorito("bitcoin");
    expect(useFavoritos.getState().favoritos).toEqual(["bitcoin"]);
  });

  it("limpiarFavoritosGuardados solo deja ids admitidos y sin repetir", () => {
    expect(limpiarFavoritosGuardados(["solana", "solana", 3, null, "BITCOIN"])).toEqual(["solana"]);
    expect(limpiarFavoritosGuardados(undefined)).toEqual([]);
    expect(limpiarFavoritosGuardados({ 0: "bitcoin" })).toEqual([]);
  });
});
