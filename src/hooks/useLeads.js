import { useState, useCallback } from "react";
import { api } from "../api/api";

export const useLeads = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLeadsByPublisher = useCallback(async (publisherId) => {
    setLoading(true);
    try {
      const data = await api.get(`/leads?publisherId=${publisherId}&_sort=createdAt&_order=desc`);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLeadStatus = async (leadId, status) => {
    try {
      await api.patch(`/leads/${leadId}`, { status });
    } catch (err) {
      console.error("Error updating lead status:", err);
    }
  };

  return {
    loading,
    error,
    getLeadsByPublisher,
    updateLeadStatus
  };
};
