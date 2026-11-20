import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SubscriptionStatusCard from "@/features/profile/components/SubscriptionStatusCard";

const userWith = (subscription) => ({ subscription });

describe("SubscriptionStatusCard", () => {
  it("renders nothing without an active subscription", () => {
    const { container } = render(<SubscriptionStatusCard user={userWith({ active: false })} />);
    expect(container.firstChild).toBeNull();
  });

  it("tells paid-plan users the payment does not renew and offers no renewal toggle", () => {
    render(
      <SubscriptionStatusCard
        user={userWith({ active: true, end_date: "2026-12-31T00:00:00Z", plan: { name: "Profesional", price: "75000" } })}
      />
    );
    expect(screen.getByText(/no se renueva automáticamente/i)).toBeInTheDocument();
    expect(screen.getByText(/vence el/i)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows free plans without the one-time payment text", () => {
    render(<SubscriptionStatusCard user={userWith({ active: true, end_date: null, plan: { name: "Dueño", price: "0" } })} />);
    expect(screen.getByText(/plan gratuito/i)).toBeInTheDocument();
    expect(screen.queryByText(/no se renueva/i)).not.toBeInTheDocument();
    expect(screen.getByText(/sin vencimiento/i)).toBeInTheDocument();
  });
});
