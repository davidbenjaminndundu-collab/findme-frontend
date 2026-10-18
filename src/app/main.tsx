import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router/dom";
import { Toaster } from "sonner";
// Sous-ensemble latin uniquement (français, anglais, lingala) : évite d'embarquer les autres alphabets.
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import "@fontsource/poppins/latin-800.css";
import "@/styles/index.css";
import "@/i18n";
import { setUnauthenticatedHandler } from "@/api/client";
import { env } from "@/shared/config/env";
import { sessionQueryKey } from "@/features/auth/hooks/useSession";
import { loginPathWithRedirect, LOGIN_PATH } from "@/features/auth/routing";
import { createQueryClient } from "./providers/queryClient";
import { router } from "./router/routes";

const queryClient = createQueryClient();

// 401 en cours de navigation : session expirée → purge locale et retour à la connexion (dossier §7.3).
setUnauthenticatedHandler(() => {
  queryClient.setQueryData(sessionQueryKey, null);
  const { pathname, search } = window.location;
  if (pathname !== LOGIN_PATH) void router.navigate(loginPathWithRedirect(pathname + search), { replace: true });
});

/** Développement sans backend : simulation de l'API par MSW (chargée à la demande, absente du build sinon). */
async function enableMocking(): Promise<void> {
  if (!env.enableMocks) return;
  // Démo : ?mockRole=client|prestataire|administrateur|aucun fixe le rôle simulé (voir tests/mocks/handlers.ts).
  const mockRole = new URLSearchParams(window.location.search).get("mockRole");
  if (mockRole) {
    try {
      if (mockRole === "aucun") window.localStorage.removeItem("findme:mock-role");
      else window.localStorage.setItem("findme:mock-role", mockRole);
    } catch {
      // stockage indisponible : le rôle simulé reste « visiteur »
    }
  }
  const { worker } = await import("@/tests/mocks/browser");
  await worker.start({ onUnhandledFrame: "bypass" });
}

function render(): void {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Élément #root introuvable dans index.html");

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors closeButton toastOptions={{ className: "font-sans" }} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

void enableMocking().then(render);
