import { useQuery } from "@tanstack/react-query";
import { api } from "../api/api";

/**
 * Datos de referencia del formulario de propiedad (ubicaciones, tipos, zonas, features).
 * Casi estáticos → se cachean con staleTime alto y se comparten entre crear/editar.
 * Capa de datos: el único lugar que toca api/api.js (ver .ai/context/architecture.md).
 */
export const usePropertyFormRefs = () => {
  const query = useQuery({
    queryKey: ["propertyFormRefs"],
    queryFn: async () => {
      const [locRes, typeRes, zoneRes, featRes] = await Promise.all([
        api.get("/locations"),
        api.get("/property-types"),
        api.get("/zones"),
        api.get("/property-features"),
      ]);
      return {
        locations: locRes.data || [],
        propertyTypes: typeRes.data || [],
        zones: zoneRes.data || [],
        availableFeatures: featRes.data?.data || [],
      };
    },
    staleTime: 10 * 60 * 1000,
  });

  return {
    locations: query.data?.locations || [],
    propertyTypes: query.data?.propertyTypes || [],
    zones: query.data?.zones || [],
    availableFeatures: query.data?.availableFeatures || [],
    loadingRefs: query.isLoading,
  };
};
