import React, { createContext, useContext, useState, useEffect } from "react";
import { useAxios } from "../hooks/useAxios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken") || null
  );

  useEffect(() => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  }, [token, refreshToken]);

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{ token, refreshToken, logout, setToken, setRefreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
