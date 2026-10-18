import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import type { Utilisateur } from "@/api/types";
import { MOCK_USERS } from "@/tests/mocks/fixtures";
import { routes } from "./routes";

const fetchCurrentUser = vi.fn<() => Promise<Utilisateur | null>>();
const logout = vi.fn<() => Promise<void>>();
vi.mock("@/features/auth/api/session", () => ({
  fetchCurrentUser: () => fetchCurrentUser(),
  logout: () => logout(),
}));

function renderApp(path: string, user: Utilisateur | null) {
  fetchCurrentUser.mockResolvedValue(user);
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe("coquille de l'application", () => {
  it("affiche connexion et inscription à un visiteur, sans navigation du bas", async () => {
    renderApp("/", null);

    expect(await screen.findByRole("link", { name: "Se connecter" })).toHaveAttribute("href", "/connexion");
    expect(screen.getByRole("link", { name: "Créer un compte" })).toHaveAttribute("href", "/inscription");
    expect(screen.queryByRole("navigation", { name: "Navigation principale" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Catalogue des services" })).toBeInTheDocument();
  });

  it("donne au client la navigation Accueil / Commandes / Notifications / Profil (sans Favoris, écart E01)", async () => {
    renderApp("/client/commandes", MOCK_USERS.client);

    expect(await screen.findByRole("heading", { name: "Mes commandes" })).toBeInTheDocument();
    const navs = screen.getAllByRole("navigation", { name: "Navigation principale" });
    const labels = within(navs[0]!)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(labels).toEqual(["Accueil", "Commandes", "Notifications", "Profil"]);
    expect(screen.queryByText("Favoris")).not.toBeInTheDocument();
  });

  it("ouvre l'espace prestataire avec sa barre latérale", async () => {
    renderApp("/prestataire/wallet", MOCK_USERS.prestataire);

    expect(await screen.findByRole("heading", { name: "Portefeuille" })).toBeInTheDocument();
    const sidebar = screen.getByRole("navigation", { name: "Espace prestataire" });
    expect(within(sidebar).getByRole("link", { name: "Mes annonces" })).toHaveAttribute(
      "href",
      "/prestataire/annonces",
    );
    expect(screen.getByText("François Kalilwa")).toBeInTheDocument();
  });

  it("ouvre le back-office pour l'administrateur", async () => {
    renderApp("/admin/moderation", MOCK_USERS.administrateur);

    expect(await screen.findByRole("heading", { name: "Modération des annonces" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Administration" })).toBeInTheDocument();
  });

  it("refuse l'espace administrateur à un client (403)", async () => {
    const router = renderApp("/admin", MOCK_USERS.client);

    expect(await screen.findByRole("heading", { name: "Accès refusé" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/403");
  });

  it("propose un lien vers son espace à un prestataire sur le catalogue", async () => {
    renderApp("/", MOCK_USERS.prestataire);

    expect(await screen.findByRole("link", { name: "Espace prestataire" })).toHaveAttribute("href", "/prestataire");
  });

  it("affiche une page 404 pour une route inconnue", async () => {
    renderApp("/page-inexistante", null);

    expect(await screen.findByRole("heading", { name: "Page introuvable" })).toBeInTheDocument();
  });

  it("déconnecte et revient à l'accueil", async () => {
    const user = userEvent.setup();
    logout.mockResolvedValue(undefined);
    const router = renderApp("/prestataire", MOCK_USERS.prestataire);

    await user.click(await screen.findByRole("button", { name: "Se déconnecter" }));

    expect(logout).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(router.state.location.pathname).toBe("/"));
  });
});
