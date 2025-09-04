import { createContext, useState, useContext } from "react";
import { login } from "./api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  async function loginUser(email, password) {
    const data = await login({ email, password });
    if (data.access_token) {
      setToken(data.access_token);
      localStorage.setItem("token", data.access_token);
    }
    return data;
  }

  function logout() {
    setToken(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider value={{ token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
