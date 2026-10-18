import {
  Banknote,
  Bell,
  ClipboardList,
  Download,
  FolderTree,
  Home,
  LayoutDashboard,
  Megaphone,
  Scale,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from "lucide-react";
import type { NavItem } from "@/shared/layouts/types";

/** Navigation de l'espace client (barre supérieure desktop, barre du bas mobile). Favoris retirés : écart E01. */
export const CLIENT_NAV: readonly NavItem[] = [
  { to: "/", labelKey: "nav.home", icon: Home, end: true },
  { to: "/client/commandes", labelKey: "nav.orders", icon: ClipboardList },
  { to: "/client/notifications", labelKey: "nav.notifications", icon: Bell },
  { to: "/client/profil", labelKey: "nav.profile", icon: User },
];

export const PRESTATAIRE_NAV: readonly NavItem[] = [
  { to: "/prestataire", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/prestataire/annonces", labelKey: "nav.myServices", icon: Megaphone },
  { to: "/prestataire/commandes", labelKey: "nav.receivedOrders", icon: ClipboardList },
  { to: "/prestataire/wallet", labelKey: "nav.wallet", icon: Wallet },
  { to: "/prestataire/retraits", labelKey: "nav.withdrawals", icon: Banknote },
  { to: "/prestataire/notifications", labelKey: "nav.notifications", icon: Bell },
  { to: "/prestataire/profil", labelKey: "nav.profile", icon: User },
];

export const ADMIN_NAV: readonly NavItem[] = [
  { to: "/admin", labelKey: "nav.dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/moderation", labelKey: "nav.moderation", icon: ShieldCheck },
  { to: "/admin/utilisateurs", labelKey: "nav.users", icon: Users },
  { to: "/admin/categories", labelKey: "nav.categories", icon: FolderTree },
  { to: "/admin/litiges", labelKey: "nav.disputes", icon: Scale },
  { to: "/admin/retraits", labelKey: "nav.withdrawals", icon: Banknote },
  { to: "/admin/export", labelKey: "nav.export", icon: Download },
];
