import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PhoneInput } from "./PhoneInput";

function Harness() {
  const [value, setValue] = useState("");
  return (
    <>
      <PhoneInput aria-label="Téléphone" value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe("PhoneInput", () => {
  it("produit le format du contrat +243XXXXXXXXX", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Téléphone"), "812345678");

    expect(screen.getByTestId("value")).toHaveTextContent("+243812345678");
  });

  it("retire le 0 initial d'un numéro national", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Téléphone"), "0812345678");

    expect(screen.getByTestId("value")).toHaveTextContent("+243812345678");
  });

  it("limite la saisie à 9 chiffres nationaux", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText("Téléphone"), "81234567899");

    expect(screen.getByTestId("value")).toHaveTextContent("+243812345678");
  });
});
