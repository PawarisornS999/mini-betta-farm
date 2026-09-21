import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "en" | "th";

interface LangStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

export const useLangStore = create<LangStore>()(
  persist(
    (set, get) => ({
      lang: "th",
      setLang: (lang) => set({ lang }),
      toggle: () => set({ lang: get().lang === "en" ? "th" : "en" }),
    }),
    { name: "minibetta-lang" },
  ),
);
