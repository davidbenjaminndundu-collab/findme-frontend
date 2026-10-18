import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { env } from "@/shared/config/env";
import fr from "./fr.json";

/**
 * Français par défaut ; la structure est prête pour l'anglais et le lingala
 * (ajouter en.json / ln.json dans `resources`).
 */
export const SUPPORTED_LOCALES = ["fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

void i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr } },
  lng: env.defaultLocale,
  fallbackLng: "fr",
  interpolation: { escapeValue: false }, // React échappe déjà le contenu
  returnNull: false,
});

export default i18n;
