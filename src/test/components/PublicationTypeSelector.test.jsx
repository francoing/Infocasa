import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

let mockUser = {};
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: mockUser }) }));

import PublicationTypeSelector from "@/features/property/components/form/PublicationTypeSelector";

function Harness({ onState }) {
  const [type, setType] = useState("basic");
  const [coins, setCoins] = useState(0);
  onState?.({ type, coins });
  return <PublicationTypeSelector value={type} onChange={setType} infocoins={coins} setInfocoins={setCoins} />;
}

describe("PublicationTypeSelector", () => {
  it("ya no ofrece el tipo premium: solo Común y Destacada", () => {
    mockUser = { featured_balance: 1, infocoins_balance: 0 };
    render(<Harness />);
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByText("Común")).toBeInTheDocument();
    expect(screen.getByText("Destacada")).toBeInTheDocument();
  });

  it("deshabilita Destacada sin destacados en la billetera", () => {
    mockUser = { featured_balance: 0, infocoins_balance: 0 };
    let state;
    render(<Harness onState={(s) => (state = s)} />);
    fireEvent.click(screen.getByText("Destacada"));
    expect(state.type).toBe("basic");
    expect(screen.getByText("Sin destacados")).toBeInTheDocument();
  });

  it("permite destacar y sumar InfoMonedas hasta el saldo", () => {
    mockUser = { featured_balance: 2, infocoins_balance: 5 };
    let state;
    render(<Harness onState={(s) => (state = s)} />);
    fireEvent.click(screen.getByText("Destacada"));
    fireEvent.change(screen.getByLabelText("InfoMonedas a asignar"), { target: { value: "9" } });
    expect(state).toEqual({ type: "featured", coins: 5 });
  });
});
