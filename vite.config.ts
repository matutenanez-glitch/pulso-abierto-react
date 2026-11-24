import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Configuración de Vite con el plugin de React (JSX y recarga rápida)
// y de Vitest (pruebas automatizadas con "npm test").
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom simula el navegador (document, localStorage) dentro de Node
    environment: "jsdom",
    // Se ejecuta antes de cada archivo de pruebas
    setupFiles: ["./src/pruebas/configuracion.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
