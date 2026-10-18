import type { ReactNode } from "react";
import { Compass, Construction, Lock, TriangleAlert } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { useTranslation } from "react-i18next";

function SystemMessage({
  icon,
  code,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  code?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 px-6 py-16 text-center">
      <span className="flex size-20 items-center justify-center rounded-[1.75rem] bg-secondary text-primary shadow-sm">
        {icon}
      </span>
      {code && <p className="text-sm font-semibold tracking-[0.3em] text-brand">{code}</p>}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="text-muted">{description}</p>
      {action}
    </section>
  );
}

function HomeLink() {
  const { t } = useTranslation();
  return (
    <Link to="/" className="btn min-h-11 rounded-full px-6 font-semibold btn-primary">
      {t("common.backHome")}
    </Link>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <SystemMessage
      icon={<Compass size={36} aria-hidden="true" />}
      code="404"
      title={t("pages.notFound.title")}
      description={t("pages.notFound.description")}
      action={<HomeLink />}
    />
  );
}

export function ForbiddenPage() {
  const { t } = useTranslation();
  return (
    <SystemMessage
      icon={<Lock size={36} aria-hidden="true" />}
      code="403"
      title={t("pages.forbidden.title")}
      description={t("pages.forbidden.description")}
      action={<HomeLink />}
    />
  );
}

/** Écran provisoire d'une route dont l'écran appartient à un module ultérieur. */
export function ComingSoonPage({ title, module }: { title: string; module: string }) {
  const { t } = useTranslation();
  return (
    <SystemMessage
      icon={<Construction size={36} aria-hidden="true" />}
      code={module}
      title={title}
      description={t("common.comingSoon")}
    />
  );
}

/** Erreur de rendu ou de route, affichée à la place de l'espace concerné (ErrorBoundary). */
export function RouteErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  return (
    <SystemMessage
      icon={<TriangleAlert size={36} aria-hidden="true" />}
      title={t("errors.render")}
      description={t("errors.unknown")}
      action={
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn min-h-11 rounded-full px-6 btn-primary"
        >
          {t("common.retry")}
        </button>
      }
    />
  );
}
