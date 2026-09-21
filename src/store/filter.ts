import { create } from "zustand";
import { Difficulty, Species } from "@/types";

interface FilterStore {
  search: string;
  species: Species | "";
  category: string;
  priceRange: [number, number];
  difficulty: Difficulty | "";
  color: string;
  setSearch: (search: string) => void;
  setSpecies: (species: Species | "") => void;
  setCategory: (category: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setDifficulty: (difficulty: Difficulty | "") => void;
  setColor: (color: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  search: "",
  species: "",
  category: "",
  priceRange: [0, 2000],
  difficulty: "",
  color: "",
  setSearch: (search) => set({ search }),
  setSpecies: (species) => set({ species }),
  setCategory: (category) => set({ category }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setColor: (color) => set({ color }),
  resetFilters: () =>
    set({
      search: "",
      species: "",
      category: "",
      priceRange: [0, 2000],
      difficulty: "",
      color: "",
    }),
}));
