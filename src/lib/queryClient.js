import { QueryClient } from "@tanstack/react-query";

/**
 * Cliente único de react-query para toda la app.
 * Vive en un módulo (no dentro de <App>) para que las funciones de la capa de datos
 * que corren FUERA del render (createProperty, updateProperty, etc.) invaliden el
 * MISMO cache que consumen los componentes vía useQuery. Ver .ai/context/architecture.md.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita recargas agresivas al cambiar de ventana
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});
