import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PlanStatusCard from "@/common/components/PlanStatusCard";

describe("PlanStatusCard component", () => {
  const mockPlan = {
    planId: "premium",
    expiryDate: null,
    details: {
      name: "Premium",
      limit: 20
    }
  };

  it("should render nothing if plan is null", () => {
    const { container } = render(<PlanStatusCard plan={null} usage={5} limit={20} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render plan name, usage, and limit correctly", () => {
    render(<PlanStatusCard plan={mockPlan} usage={5} limit={20} />);
    
    expect(screen.getByText("Premium")).toBeInTheDocument();
    expect(screen.getByText("5 / 20")).toBeInTheDocument();
    expect(screen.getByText("Plan sin vencimiento")).toBeInTheDocument();
  });

  it("should render expiration date formatted if expiresAt is provided", () => {
    render(<PlanStatusCard plan={mockPlan} usage={5} limit={20} expiresAt="2026-12-31T00:00:00.000Z" />);

    // Check if the localized date string is rendered
    const expectedDateString = new Date("2026-12-31T00:00:00.000Z").toLocaleDateString();
    expect(screen.getByText(`Tu plan vence el ${expectedDateString}`)).toBeInTheDocument();
  });

  it("should render 'Plan sin vencimiento' when expiresAt is null", () => {
    render(<PlanStatusCard plan={mockPlan} usage={5} limit={20} expiresAt={null} />);
    expect(screen.getByText("Plan sin vencimiento")).toBeInTheDocument();
  });

  it("should render the Upgrade button if onUpgrade is provided and trigger it on click", () => {
    const onUpgradeMock = vi.fn();
    render(<PlanStatusCard plan={mockPlan} usage={5} limit={20} onUpgrade={onUpgradeMock} />);
    
    const upgradeBtn = screen.getByText("Mejorar Plan");
    expect(upgradeBtn).toBeInTheDocument();
    
    fireEvent.click(upgradeBtn);
    expect(onUpgradeMock).toHaveBeenCalledTimes(1);
  });
});
