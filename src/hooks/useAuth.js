import { useState, useEffect, useCallback } from "react";
import { api } from "../api/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setError(null);
    try {
      // En un sistema real, el password no se compararía así, pero es un mock
      const users = await api.get(`/users?email=${email}&password=${password}`);
      
      if (users && users.length > 0) {
        const loggedUser = users[0];
        if (!loggedUser.active && loggedUser.role !== 'admin') {
          throw new Error("Tu cuenta está desactivada. Contacta al administrador.");
        }
        localStorage.setItem("auth_user", JSON.stringify(loggedUser));
        setUser(loggedUser);
        return loggedUser;
      } else {
        throw new Error("Credenciales inválidas.");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      // Verificar si el email ya existe
      const existing = await api.get(`/users?email=${userData.email}`);
      if (existing && existing.length > 0) {
        throw new Error("El correo electrónico ya está registrado.");
      }

      const newUser = await api.post("/users", {
        ...userData,
        role: userData.role || "publisher",
        active: true,
        createdAt: new Date().toISOString()
      });

      localStorage.setItem("auth_user", JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_user");
    setUser(null);
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await api.patch(`/users/${userId}`, { active: status });
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUserStatus,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPublisher: user?.role === 'publisher'
  };
};
