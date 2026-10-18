import { createBrowserRouter, type RouteObject } from "react-router";
import { ComingSoonPage, ForbiddenPage, NotFoundPage, RouteErrorPage } from "../pages/SystemPages";
import { AdminShell, ClientGuard, PrestataireShell, PublicShell } from "./shells";

/**
 * Arbres de routes par espace (dossier technologique §5.4).
 * Les écrans marqués ComingSoonPage sont livrés par les modules indiqués (voir docs/modules-conception.md).
 * Chaque espace aura son propre chunk (React.lazy / route.lazy) quand ses écrans existeront.
 */
const soon = (title: string, module: string) => <ComingSoonPage title={title} module={module} />;

export const routes: RouteObject[] = [
  {
    element: <PublicShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: soon("Catalogue des services", "M2") },
      { path: "connexion", element: soon("Connexion", "M1") },
      { path: "inscription", element: soon("Inscription", "M1") },
      { path: "mot-de-passe-oublie", element: soon("Mot de passe oublié", "M1") },
      { path: "annonces/:id", element: soon("Fiche annonce", "M2") },
      { path: "prestataires/:id", element: soon("Profil prestataire", "M2") },
      {
        path: "client",
        element: <ClientGuard />,
        children: [
          { path: "commandes", element: soon("Mes commandes", "M3") },
          { path: "commandes/:id", element: soon("Suivi de commande", "M3") },
          { path: "notifications", element: soon("Notifications", "M6") },
          { path: "profil", element: soon("Mon profil", "M6") },
        ],
      },
      { path: "403", element: <ForbiddenPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "prestataire",
    element: <PrestataireShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: soon("Tableau de bord", "M7") },
      { path: "annonces", element: soon("Mes annonces", "M7") },
      { path: "commandes", element: soon("Commandes reçues", "M7") },
      { path: "wallet", element: soon("Portefeuille", "M7") },
      { path: "retraits", element: soon("Retraits", "M7") },
      { path: "notifications", element: soon("Notifications", "M6") },
      { path: "profil", element: soon("Profil professionnel", "M7") },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "admin",
    element: <AdminShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: soon("Tableau de bord", "M8") },
      { path: "moderation", element: soon("Modération des annonces", "M8") },
      { path: "utilisateurs", element: soon("Utilisateurs", "M8") },
      { path: "categories", element: soon("Catégories", "M8") },
      { path: "litiges", element: soon("Litiges", "M8") },
      { path: "retraits", element: soon("Retraits", "M8") },
      { path: "export", element: soon("Export CSV", "M8") },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
