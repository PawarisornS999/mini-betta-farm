"use client";

import { useEffect } from "react";
import { useLangStore } from "@/store/lang";

export function LanguageFont() {
  const lang = useLangStore((state) => state.lang);

  useEffect(() => {
    document.documentElement.lang = lang === "th" ? "th" : "en";
    document.body.classList.toggle("thai-font", lang === "th");

    return () => document.body.classList.remove("thai-font");
  }, [lang]);

  return null;
}
