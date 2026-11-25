import { createContext, useContext, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("registrar_admin") || "null");
    } catch {
      return null;
    }
  });
  const login = async (identity, password) => {
    const { data } = await api.post("/auth/login", { identity, password });
    localStorage.setItem("registrar_token", data.token);
    localStorage.setItem("registrar_admin", JSON.stringify(data.admin));
    setAdmin(data.admin);
  };
  const logout = () => {
    localStorage.removeItem("registrar_token");
    localStorage.removeItem("registrar_admin");
    setAdmin(null);
  };
  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
