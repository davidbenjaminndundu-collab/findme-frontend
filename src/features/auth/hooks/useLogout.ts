import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { logout } from "../api/session";

/**
 * Déconnexion (POST /auth/logout) puis purge complète du cache :
 * aucune donnée de l'utilisateur précédent ne reste en mémoire (dossier technologique §7.1).
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: logout,
    onError: () => toast.error(t("errors.unknown")),
    onSettled: () => {
      queryClient.clear();
      void navigate("/", { replace: true });
    },
  });
}
