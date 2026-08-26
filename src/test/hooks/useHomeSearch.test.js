import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHomeSearch } from "@/hooks/useHomeSearch";

// Mocks explícitos (el setup no auto-mockea nada — ver src/test/setup.js).
const useUserProvinceMock = vi.fn();
vi.mock("@/hooks/useUserProvince", () => ({
  useUserProvince: (...args) => useUserProvinceMock(...args),
}));

vi.mock("@/hooks/useLocationSearch", () => ({
  useLocationSearch: () => ({
    suggestions: [],
    loading: false,
    setQuery: vi.fn(),
    clearSuggestions: vi.fn(),
  }),
}));

vi.mock("@/hooks/usePropertyFormRefs", () => ({
  usePropertyFormRefs: () => ({ propertyTypes: [] }),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

const idleGateState = {
  status: "idle",
  province: null,
  error: null,
  checkProvince: vi.fn(),
  reset: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  useUserProvinceMock.mockReturnValue(idleGateState);
});

describe("useHomeSearch — gate de ubicación", () => {
  it("trigger sin ubicación verificada → abre el gate, no navega", () => {
    const { result } = renderHook(() => useHomeSearch());

    act(() => result.current.handleSearch({ preventDefault: () => {} }));

    expect(result.current.gate.open).toBe(true);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("trigger con ubicación ya verificada (sessionStorage) → navega sin abrir el gate", () => {
    sessionStorage.setItem("infocasa_location_verified", "true");
    const { result } = renderHook(() => useHomeSearch());

    act(() => result.current.handleSearch({ preventDefault: () => {} }));

    expect(result.current.gate.open).toBe(false);
    expect(navigateMock).toHaveBeenCalledWith("/search?operation=sale&location=");
  });

  it("sessionStorage 'true' al montar → arranca verificado, sin gate", () => {
    sessionStorage.setItem("infocasa_location_verified", "true");
    const { result } = renderHook(() => useHomeSearch());

    expect(result.current.gate.open).toBe(false);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("resolución 'allowed' → cierra el gate, persiste el flag y navega al listado", async () => {
    const { result, rerender } = renderHook(() => useHomeSearch());

    act(() => result.current.handleSearch({ preventDefault: () => {} }));
    expect(result.current.gate.open).toBe(true);

    useUserProvinceMock.mockReturnValue({ ...idleGateState, status: "allowed", province: "Tucumán" });
    await act(async () => rerender());

    expect(result.current.gate.open).toBe(false);
    expect(sessionStorage.getItem("infocasa_location_verified")).toBe("true");
    expect(navigateMock).toHaveBeenCalledWith("/search?operation=sale&location=");
  });

  it("resolución 'allowed' tras 'Buscar en Mapa' → navega a /explore (acción pendiente 'map')", async () => {
    const { result, rerender } = renderHook(() => useHomeSearch());

    act(() => result.current.handleMapExplore());
    expect(result.current.gate.open).toBe(true);

    useUserProvinceMock.mockReturnValue({ ...idleGateState, status: "allowed", province: "Tucumán" });
    await act(async () => rerender());

    expect(navigateMock).toHaveBeenCalledWith("/explore?operation=sale");
  });

  it.each(["blocked", "denied", "error"])(
    "resolución '%s' y cierre → no navega y NO resetea la pestaña de operación",
    (status) => {
      const { result, rerender } = renderHook(() => useHomeSearch());

      // El usuario elige la pestaña "Alquilar" antes de buscar.
      act(() => result.current.setOperation("Alquilar"));
      act(() => result.current.handleSearch({ preventDefault: () => {} }));
      expect(result.current.gate.open).toBe(true);

      useUserProvinceMock.mockReturnValue({ ...idleGateState, status, error: "falló" });
      act(() => rerender());

      // Solo 'allowed' cierra y navega: acá el gate sigue abierto y no hubo navegación.
      expect(result.current.gate.open).toBe(true);
      expect(navigateMock).not.toHaveBeenCalled();

      act(() => result.current.gate.onClose());

      expect(result.current.gate.open).toBe(false);
      // Fix #3: cerrar el gate NO resetea la operación elegida.
      expect(result.current.operation).toBe("Alquilar");
      expect(sessionStorage.getItem("infocasa_location_verified")).toBeNull();
    }
  );
});