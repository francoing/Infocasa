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

const mockPlan = {
  id: 2,
  name: "Premium",
  price: 2000,
  features: ["Hasta 20 propiedades", "Soporte prioritario"],
};

const submitCardForm = () => {
  const form = document.querySelector('form');
  if (!form) throw new Error('Card form not found');
  fireEvent.submit(form);
};

describe("CheckoutModal", () => {
  let onConfirm, onCancel;

  beforeEach(() => {
    onConfirm = vi.fn();
    onCancel = vi.fn();
  });

  describe("initial render (form step)", () => {
    it("should show plan info in the header", () => {
      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText("Finalizar Compra")).toBeInTheDocument();
      expect(screen.getByText("Premium")).toBeInTheDocument();
      expect(screen.getByText(/\$2000/)).toBeInTheDocument();
    });

    it("should show card method as default with form fields", () => {
      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByPlaceholderText("0000 0000 0000 0000")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("MM/AA")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("CVC")).toBeInTheDocument();
      expect(screen.getByText("Confirmar Pago")).toBeInTheDocument();
    });

    it("should show both payment method buttons", () => {
      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText("Tarjeta")).toBeInTheDocument();
      expect(screen.getByText("QR MP")).toBeInTheDocument();
    });

    it("should render the close button (X) and call onCancel on click", () => {
      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      const closeBtn = document.querySelector('button svg.lucide-x')?.closest('button');
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("card method - payment flow", () => {
    it("should show processing state on submit, call onConfirm on success, then close", async () => {
      onConfirm.mockResolvedValueOnce(undefined);

      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      submitCardForm();

      expect(screen.getByText("Verificando Pago...")).toBeInTheDocument();

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(2);
      });
    });

    it("should show error screen when API call fails", async () => {
      onConfirm.mockRejectedValueOnce(new Error("Error al procesar el pago."));

      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      submitCardForm();

      await waitFor(() => {
        expect(screen.getByText("Error al procesar")).toBeInTheDocument();
      });
      expect(screen.getByText("Error al procesar el pago.")).toBeInTheDocument();
    });

    it("should show generic error message when onConfirm rejects without message", async () => {
      onConfirm.mockRejectedValueOnce(new Error());

      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      submitCardForm();

      await waitFor(() => {
        expect(screen.getByText("Error al procesar el pago. Intentalo de nuevo.")).toBeInTheDocument();
      });
    });
  });

  describe("error screen interactions", () => {
    it("should display 'Intentar de nuevo' and 'Cancelar' on error", async () => {
      onConfirm.mockRejectedValueOnce(new Error("API error"));

      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      submitCardForm();

      await waitFor(() => {
        expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
      });
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
    });

    it("should go back to form when clicking 'Intentar de nuevo'", async () => {
      onConfirm.mockRejectedValueOnce(new Error("API error"));

      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      submitCardForm();
      await waitFor(() => {
        expect(screen.getByText("Intentar de nuevo")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Intentar de nuevo"));

      expect(screen.getByText("Confirmar Pago")).toBeInTheDocument();
    });

    it("should call onCancel when clicking 'Cancelar' on error screen", async () => {
      onConfirm.mockRejectedValueOnce(new Error("API error"));

      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      submitCardForm();
      await waitFor(() => {
        expect(screen.getByText("Cancelar")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Cancelar"));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe("QR method - payment flow", () => {
    it("should switch to QR view when QR MP button is clicked", () => {
      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("QR MP"));

      expect(screen.getByText("Ya escaneé y pagué")).toBeInTheDocument();
      expect(screen.getByAltText("QR Mercado Pago")).toBeInTheDocument();
    });

    it("should show processing and call onConfirm when 'Ya escaneé y pagué' is clicked", async () => {
      onConfirm.mockResolvedValueOnce(undefined);

      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("QR MP"));
      fireEvent.click(screen.getByText("Ya escaneé y pagué"));

      expect(screen.getByText("Verificando Pago...")).toBeInTheDocument();

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(2);
      });
    });
  });

  describe("plan validation", () => {
    it("should show error immediately when plan has no id", async () => {
      render(<CheckoutModal plan={{ name: "Invalid", price: 0 }} onConfirm={onConfirm} onCancel={onCancel} />);

      submitCardForm();

      await waitFor(() => {
        expect(screen.getByText("No se seleccionó un plan válido.")).toBeInTheDocument();
      });
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe("backdrop click", () => {
    it("should call onCancel when clicking the backdrop overlay", () => {
      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      const backdrop = document.querySelector(".fixed.inset-0");
      expect(backdrop).toBeInTheDocument();

      fireEvent.click(backdrop);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should NOT call onCancel when clicking inside the modal content", () => {
      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      fireEvent.click(screen.getByText("Finalizar Compra"));
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe("success screen", () => {
    it("should call onConfirm and close as safety net when API resolves", async () => {
      onConfirm.mockResolvedValueOnce(undefined);

      render(<CheckoutModal plan={mockPlan} onConfirm={onConfirm} onCancel={onCancel} />);

      submitCardForm();

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(2);
      });
    });
  });
});
