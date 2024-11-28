import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [streamToken, setStreamToken] = useState(
    localStorage.getItem("streamToken") || null
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken") || null
  );

  useEffect(() => {
    if (localStorage.getItem("token") !== token) {
      localStorage.setItem("token", token);
    }
    if (localStorage.getItem("refreshToken") !== refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    if (localStorage.getItem("streamToken") !== streamToken) {
      localStorage.setItem("streamToken", streamToken);
    }
    if (localStorage.getItem("user") !== user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [token, refreshToken, streamToken, user]);

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        refreshToken,
        logout,
        setToken,
        setRefreshToken,
        user,
        setUser,
        streamToken,
        setStreamToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
