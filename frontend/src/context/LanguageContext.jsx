import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translateText, clearTranslationCache, SUPPORTED_LANGUAGES } from "@/services/translationService";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("nivesh_lang") || "en";
  });

  const changeLanguage = useCallback((langCode) => {
    clearTranslationCache(); // Clear stale translations before switching
    setLanguage(langCode);
    localStorage.setItem("nivesh_lang", langCode);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

/**
 * <T> component – wraps any text and translates it on the fly.
 * Usage: <T>Hello World</T>
 * 
 * It renders the original text first (no flash), then replaces with translated text.
 */
export function T({ children }) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(children);

  useEffect(() => {
    let cancelled = false;

    // If English or no children, show original
    if (language === "en" || children == null) {
      setTranslated(children);
      return;
    }

    // Extract text — handle strings, numbers, and coerce where possible
    let text = "";
    if (typeof children === "string") {
      text = children.trim();
    } else if (typeof children === "number") {
      text = String(children);
    } else {
      // Non-string children (JSX elements, arrays, etc.) — can't translate
      setTranslated(children);
      return;
    }

    if (!text) {
      setTranslated(children);
      return;
    }

    // Show original while loading
    setTranslated(children);

    translateText(text, language).then((result) => {
      if (!cancelled) {
        setTranslated(result);
      }
    });

    return () => { cancelled = true; };
  }, [language, children]);

  return <>{translated}</>;
}

export default LanguageContext;
