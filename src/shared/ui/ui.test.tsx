import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";
import { COMMANDE_STATUS } from "@/shared/lib/statuses";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { EmptyState, ErrorState, PageLoader } from "./Feedback";
import { Field } from "./Field";
import { Modal } from "./Modal";
import { Pagination } from "./Pagination";
import { PasswordInput } from "./PasswordInput";
import { StatusBadge } from "./StatusBadge";
import { TextInput } from "./TextInput";

describe("Button", () => {
  it("se désactive et s'annonce occupé pendant le chargement", () => {
    render(<Button loading>Envoyer</Button>);
    const button = screen.getByRole("button", { name: "Envoyer" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});

describe("Field + TextInput", () => {
  it("relie le libellé, l'aide et l'erreur au champ", () => {
    render(
      <Field label="Nom" hint="Ton nom de famille" error="Champ obligatoire">
        {({ id, describedBy, invalid }) => <TextInput id={id} aria-describedby={describedBy} invalid={invalid} />}
      </Field>,
    );
    const input = screen.getByLabelText("Nom");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Champ obligatoire");
    expect(screen.getByRole("alert")).toHaveTextContent("Champ obligatoire");
  });

  it("affiche la mention optionnelle", () => {
    render(
      <Field label="Postnom" optional>
        {({ id }) => <TextInput id={id} />}
      </Field>,
    );
    expect(screen.getByText("(optionnel)")).toBeInTheDocument();
  });
});

describe("PasswordInput", () => {
  it("affiche puis masque le mot de passe", async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Mot de passe" defaultValue="secret12" />);
    const input = screen.getByLabelText("Mot de passe");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Afficher le mot de passe" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Masquer le mot de passe" }));
    expect(input).toHaveAttribute("type", "password");
  });
});

describe("StatusBadge", () => {
  it("affiche le libellé traduit du statut", () => {
    render(<StatusBadge status={COMMANDE_STATUS.en_cours_realisation} />);
    expect(screen.getByText("En cours de réalisation")).toBeInTheDocument();
  });
});

describe("Avatar", () => {
  it("affiche les initiales sans photo (écart E05)", () => {
    render(<Avatar name="François Kalilwa" />);
    expect(screen.getByText("FK")).toBeInTheDocument();
  });

  it("affiche la photo quand elle existe", () => {
    const { container } = render(<Avatar name="Eliane" src="https://cdn.example.test/e.jpg" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "https://cdn.example.test/e.jpg");
  });
});

describe("Pagination", () => {
  it("navigue entre les pages à partir du bloc meta", async () => {
    const user = userEvent.setup();
    const onOffsetChange = vi.fn();
    render(<Pagination meta={{ limit: 20, offset: 20, total: 50 }} onOffsetChange={onOffsetChange} />);

    expect(screen.getByText("Page 2 sur 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Suivant" }));
    expect(onOffsetChange).toHaveBeenLastCalledWith(40);
    await user.click(screen.getByRole("button", { name: "Précédent" }));
    expect(onOffsetChange).toHaveBeenLastCalledWith(0);
  });

  it("disparaît quand tout tient sur une page", () => {
    const { container } = render(<Pagination meta={{ limit: 20, offset: 0, total: 5 }} onOffsetChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Feedback", () => {
  it("affiche un message adapté à une coupure réseau, avec réessai", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState error={new ApiError({ kind: "network", message: "" })} onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Connexion impossible");
    await user.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("affiche un état vide et un chargement accessibles", () => {
    render(
      <>
        <EmptyState title="Aucune commande" />
        <PageLoader />
      </>,
    );
    expect(screen.getByText("Aucune commande")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Chargement…");
  });
});

describe("Modal", () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Ouvrir
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Confirme ton paiement">
          <p>Contenu</p>
        </Modal>
      </>
    );
  }

  it("s'ouvre avec un titre accessible et se ferme", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Ouvrir" }));
    const dialog = screen.getByRole("dialog", { name: "Confirme ton paiement" });
    expect(dialog).toHaveAttribute("open");

    await user.click(screen.getAllByRole("button", { name: "Fermer" })[0]!);
    expect(dialog).not.toHaveAttribute("open");
  });
});
