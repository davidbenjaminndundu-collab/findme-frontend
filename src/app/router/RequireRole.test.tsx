import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { Utilisateur } from "@/api/types";
import { MOCK_USERS } from "@/tests/mocks/fixtures";
import { RequireRole } from "./RequireRole";

const fetchCurrentUser = vi.fn<() => Promise<Utilisateur | null>>();
vi.mock("@/features/auth/api/session", () => ({
  fetchCurrentUser: () => fetchCurrentUser(),
  logout: vi.fn(),
}));

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        path: "/prestataire",
        element: (
          <RequireRole role="prestataire">
            <p>Espace prestataire</p>
          </RequireRole>
        ),
      },
      { path: "/connexion", element: <p>Page de connexion</p> },
      { path: "/403", element: <p>Accès refusé</p> },
    ],
    { initialEntries: [path] },
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe("RequireRole", () => {
  it("affiche l'espace quand le rôle correspond", async () => {
    fetchCurrentUser.mockResolvedValue(MOCK_USERS.prestataire);
    renderAt("/prestataire");
    expect(await screen.findByText("Espace prestataire")).toBeInTheDocument();
  });

  it("redirige un visiteur vers la connexion en conservant la page d'origine", async () => {
    fetchCurrentUser.mockResolvedValue(null);
    const router = renderAt("/prestataire?onglet=1");
    expect(await screen.findByText("Page de connexion")).toBeInTheDocument();
    expect(router.state.location.search).toBe(`?redirect=${encodeURIComponent("/prestataire?onglet=1")}`);
  });

  it("redirige un autre rôle vers la page 403", async () => {
    fetchCurrentUser.mockResolvedValue(MOCK_USERS.client);
    renderAt("/prestataire");
    expect(await screen.findByText("Accès refusé")).toBeInTheDocument();
  });

  it("propose de réessayer si la session ne peut pas être chargée", async () => {
    // Chaque test fixe son propre comportement : un mockReset() global fait signaler ce rejet
    // comme « non géré » par Vitest 5.
    fetchCurrentUser.mockImplementation(() => Promise.reject(new Error("boom")));
    renderAt("/prestataire");
    expect(await screen.findByRole("button", { name: "Réessayer" })).toBeInTheDocument();
  });
});
