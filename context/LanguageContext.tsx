import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { tamilTranslations } from "@/data/tamilTranslations";

export type AppLanguage = "en" | "ta";

const LANGUAGE_KEY = "@relationship_with_god/language";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (text: string, replacements?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    async function loadLanguage() {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage === "en" || savedLanguage === "ta") {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error("Could not load the saved language:", error);
      }
    }

    loadLanguage();
  }, []);

  const setLanguage = useCallback(async (nextLanguage: AppLanguage) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
      setLanguageState(nextLanguage);
    } catch (error) {
      console.error("Could not save the selected language:", error);
      throw error;
    }
  }, []);

  const t = useCallback(
    (text: string, replacements?: Record<string, string | number>) => {
      const translated =
        language === "ta" ? tamilTranslations[text] ?? text : text;

      if (!replacements) {
        return translated;
      }

      return Object.entries(replacements).reduce(
        (result, [key, value]) =>
          result.replaceAll(`{${key}}`, String(value)),
        translated
      );
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }
  return context;
}
