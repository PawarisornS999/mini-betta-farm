"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AdminLanguage = "th" | "en";
const LanguageContext = createContext<{ language: AdminLanguage; setLanguage: (value: AdminLanguage) => void }>({ language: "th", setLanguage: () => undefined });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AdminLanguage>("th");
  // Read the preference after mount so the server and client render safely.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const saved = window.localStorage.getItem("admin-language"); if (saved === "th" || saved === "en") setLanguageState(saved); }, []);
  function setLanguage(value: AdminLanguage) { setLanguageState(value); window.localStorage.setItem("admin-language", value); }
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useAdminLanguage() { return useContext(LanguageContext); }

export function adminText(language: AdminLanguage, th: string, en: string) { return language === "th" ? th : en; }
