/**
 * Variables d'environnement publiques (préfixe VITE_).
 * En développement, le proxy Vite redirige /api et /sanctum vers Laravel :
 * les valeurs par défaut restent donc relatives (même origine, cookies Sanctum fiables).
 */
const readEnv = (key: string, fallback: string): string => {
  const value: unknown = import.meta.env[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;
};

export const env = {
  /** Base des endpoints métier, ex. https://api.findme.cd/api/v1 */
  apiBaseUrl: readEnv("VITE_API_BASE_URL", "/api/v1"),
  /** Racine du serveur, utilisée pour /sanctum/csrf-cookie */
  apiRootUrl: readEnv("VITE_API_ROOT_URL", ""),
  appEnv: readEnv("VITE_APP_ENV", "development"),
  defaultLocale: readEnv("VITE_DEFAULT_LOCALE", "fr"),
  enableMocks: readEnv("VITE_ENABLE_MOCKS", "false") === "true",
} as const;
