import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    const savedAdmin = localStorage.getItem("adminUser");

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (error) {
        localStorage.removeItem("adminUser");
      }
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    setAdmin(data.admin);
    setToken(data.token);
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminUser", JSON.stringify(data.admin));
  };

  const logout = () => {
    setAdmin(null);
    setToken("");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  };

  const value = useMemo(
    () => ({
      admin,
      token,
      loading,
      isAuthenticated: Boolean(token && admin),
      isAdmin: admin?.role === "admin",
      login,
      logout,
    }),
    [admin, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);