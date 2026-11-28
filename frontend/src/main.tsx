import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import "./index.css";
import { ErrorApi } from "./lib/api";
import { ProveedorSesion } from "./sesion/ProveedorSesion";

const cliente = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // No tiene sentido reintentar errores del cliente (401, 403, 404...)
      retry: (intentos, error) =>
        !(
          error instanceof ErrorApi &&
          error.estado > 0 &&
          error.estado < 500
        ) && intentos < 2,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={cliente}>
      <BrowserRouter>
        <ProveedorSesion>
          <App />
        </ProveedorSesion>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
