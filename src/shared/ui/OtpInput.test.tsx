import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { OtpInput } from "./OtpInput";

function Harness() {
  const [value, setValue] = useState("");
  return (
    <>
      <OtpInput label="Code" value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe("OtpInput", () => {
  it("avance automatiquement d'une case à l'autre", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText("Code 1/6"));
    await user.keyboard("482193");

    expect(screen.getByTestId("value")).toHaveTextContent("482193");
  });

  it("ignore les caractères non numériques", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText("Code 1/6"));
    await user.keyboard("a1b2");

    expect(screen.getByTestId("value")).toHaveTextContent("12");
  });

  it("accepte un code collé", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText("Code 1/6"));
    await user.paste("310 305");

    expect(screen.getByTestId("value")).toHaveTextContent("310305");
  });

  it("efface la case précédente avec Retour arrière", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByLabelText("Code 1/6"));
    await user.keyboard("123{Backspace}");

    expect(screen.getByTestId("value")).toHaveTextContent("12");
  });
});
