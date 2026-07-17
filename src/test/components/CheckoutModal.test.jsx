import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CheckoutModal from "@/features/dashboard/components/CheckoutModal";

// Mock framer-motion to avoid animation issues in jsdom
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, initial, animate, exit, whileHover, whileTap, ...props }) =>
      React.createElement("div", props, children),
    form: ({ children, initial, animate, exit, whileHover, whileTap, ...props }) =>
      React.createElement("form", props, children),
  },
  AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
}));

const mockPaidPlan = {
  id: 2,
  name: "Premium",
  price: 2000,
  features: ["Hasta 20 propiedades", "Soporte prioritario"],
};

const mockFreePlan = {
  id: 1,
  name: "Basic",
  price: 0,
  features: ["Hasta 5 propiedades"],
};

describe("CheckoutModal", () => {
  let onConfirm, onCancel;

  beforeEach(() => {
    onConfirm = vi.fn();
    onCancel = vi.fn();
  });

  describe("initial render (form step)", () => {
    it("should show plan info in the header", () => {
      render(<CheckoutModal plan={mockPaidPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText("Finalizar Compra")).toBeInTheDocument();
      expect(screen.getByText("Premium")).toBeInTheDocument();
      expect(screen.getByText(/\$2000/)).toBeInTheDocument();
    });

    it("should show Mercado Pago button for paid plans", () => {
      render(<CheckoutModal plan={mockPaidPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText("Pagar con Mercado Pago")).toBeInTheDocument();
    });

    it("should show Free Activation button for free plans", () => {
      render(<CheckoutModal plan={mockFreePlan} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText("Activar Plan Gratis")).toBeInTheDocument();
    });

    it("should render the close button (X) and call onCancel on click", () => {
      render(<CheckoutModal plan={mockPaidPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      const closeBtn = document.querySelector('button svg.lucide-x')?.closest('button');
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("payment flow", () => {
    it("should call onConfirm when clicking Pagar con Mercado Pago", async () => {
      onConfirm.mockResolvedValueOnce(undefined);

      render(<CheckoutModal plan={mockPaidPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("Pagar con Mercado Pago"));

      expect(screen.getByText("Verificando Pago...")).toBeInTheDocument();

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(2);
      });
    });

    it("should call onConfirm when clicking Activar Plan Gratis", async () => {
      onConfirm.mockResolvedValueOnce(undefined);

      render(<CheckoutModal plan={mockFreePlan} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("Activar Plan Gratis"));

      expect(screen.getByText("Verificando Pago...")).toBeInTheDocument();

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(1);
      });
    });

    it("should show error screen when API call fails", async () => {
      onConfirm.mockRejectedValueOnce(new Error("Error al procesar el pago."));

      render(<CheckoutModal plan={mockPaidPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("Pagar con Mercado Pago"));

      await waitFor(() => {
        expect(screen.getByText("Error al procesar")).toBeInTheDocument();
      });
      expect(screen.getByText("Error al procesar el pago.")).toBeInTheDocument();
    });
  });

  describe("error screen interactions", () => {
    it("should display 'Intentar de nuevo' and 'Cancelar' on error", async () => {
      onConfirm.mockRejectedValueOnce(new Error("API error"));

      render(<CheckoutModal plan={mockPaidPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("Pagar con Mercado Pago"));

      await waitFor(() => {
        expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
      });
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });

    it("should go back to form when clicking 'Intentar de nuevo'", async () => {
      onConfirm.mockRejectedValueOnce(new Error("API error"));

      render(<CheckoutModal plan={mockPaidPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("Pagar con Mercado Pago"));
      await waitFor(() => {
        expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Intentar de nuevo"));

      expect(screen.getByText("Pagar con Mercado Pago")).toBeInTheDocument();
    });

    it("should call onCancel when clicking 'Cancelar' on error screen", async () => {
      onConfirm.mockRejectedValueOnce(new Error("API error"));

      render(<CheckoutModal plan={mockPaidPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("Pagar con Mercado Pago"));
      await waitFor(() => {
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cancelar"));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("plan validation", () => {
    it("should show error immediately when plan has no id", async () => {
      render(<CheckoutModal plan={{ name: "Invalid", price: 2000 }} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("Pagar con Mercado Pago"));

      await waitFor(() => {
        expect(screen.getByText("No se seleccionó un plan válido.")).toBeInTheDocument();
      });
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe("backdrop click", () => {
    it("should call onCancel when clicking the backdrop overlay", () => {
      render(<CheckoutModal plan={mockPaidPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      const backdrop = document.querySelector(".fixed.inset-0");
      expect(backdrop).toBeInTheDocument();

      fireEvent.click(backdrop);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should NOT call onCancel when clicking inside the modal content", () => {
      render(<CheckoutModal plan={mockPaidPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("Finalizar Compra"));
      expect(onCancel).not.toHaveBeenCalled();
    });
  });
});
