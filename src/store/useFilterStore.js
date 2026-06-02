import { create } from "zustand";

export const useFilterStore = create((set) => ({
  filters: {
    location: "",
    minPrice: "",
    maxPrice: "",
    type: "Todos",
    userId: "",
    sort: "recent",
    page: 1,
  },
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  resetFilters: () => set({
    filters: {
      location: "",
      minPrice: "",
      maxPrice: "",
      type: "Todos",
      userId: "",
      sort: "recent",
      page: 1,
    }
  }),
}));
