import { useCallback, useEffect, useState } from "react";
import { infocoinsApi } from "../api/infocoins";

/**
 * Hook para la billetera del usuario: saldo + transacciones.
 *
 * Uso:
 *   const { balance, transactions, loading, error, refetch } = useWallet();
 *
 * - `enabled: false` evita el fetch inicial (por si querés montar el componente
 *   sin cargar hasta que el usuario abra el modal).
 */
export function useWallet({ enabled = true } = {}) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await infocoinsApi.getWallet();
      setBalance(data?.balance ?? 0);
      setTransactions(data?.transactions ?? []);
    } catch (err) {
      setError(err?.message || "No se pudo cargar la billetera.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) fetchWallet();
  }, [enabled, fetchWallet]);

  return { balance, transactions, loading, error, refetch: fetchWallet };
}