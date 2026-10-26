import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PlanStatusCard from "../../common/components/PlanStatusCard"; // 👈 Ruta relativa corregida

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithQueryClient = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe("PlanStatusCard component", () => {
  const mockPlan = {
    details: {
      name: "Plan Profesional",
      limit: 30,
    },
  };

  it("should render nothing if plan is null", () => {
    const { container } = renderWithQueryClient(<PlanStatusCard plan={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render plan name, usage, and limit correctly", () => {
    renderWithQueryClient(<PlanStatusCard plan={mockPlan} usage={5} limit={30} />);
    expect(screen.getByText(/plan profesional/i)).toBeInTheDocument();
    expect(screen.getByText("5 / 30")).toBeInTheDocument();
  });

  it("should render expiration date formatted if expiresAt is provided", () => {
    const expiresAt = "2026-12-31T23:59:59Z";
    renderWithQueryClient(
      <PlanStatusCard plan={mockPlan} usage={5} limit={30} expiresAt={expiresAt} />
    );
    expect(screen.getByText(/vence el/i)).toBeInTheDocument();
  });

  it("should render 'Plan sin vencimiento' when expiresAt is null", () => {
    renderWithQueryClient(
      <PlanStatusCard plan={mockPlan} usage={5} limit={30} expiresAt={null} />
    );
    expect(screen.getByText(/plan sin vencimiento/i)).toBeInTheDocument();
  });

  it("should render the Upgrade button if onUpgrade is provided and trigger it on click", () => {
    const onUpgrade = vi.fn();
    renderWithQueryClient(
      <PlanStatusCard plan={mockPlan} usage={5} limit={30} onUpgrade={onUpgrade} />
    );
    const button = screen.getByRole("button", { name: /mejorar plan/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onUpgrade).toHaveBeenCalledTimes(1);
  });
});
