import { createContext, useState, useContext } from "react";
import { login } from "./api";

// Creo el contexto de autenticación para compartir el estado del usuario
// en toda la aplicación sin necesidad de pasar props manualmente
const AuthContext = createContext();

/**
 * Proveedor del contexto de autenticación
 * Maneja el estado del token JWT y las funciones de login/logout
 * @param {Object} children - Componentes hijos que tendrán acceso al contexto
 */
export function AuthProvider({ children }) {
  // Estado del token: lo obtengo del localStorage si existe, sino null
  // Esto permite que el usuario mantenga su sesión al recargar la página
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  /**
   * Función para hacer login del usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} - Datos del usuario si el login es exitoso
   * @throws {Error} - Si las credenciales son incorrectas
   */
  async function loginUser(email, password) {
    try {
      // Llamo a la función login de api.js que hace la petición al backend
      const data = await login({ email, password });
      
      // Si recibo un token válido del servidor
      if (data.access_token) {
        // Guardo el token en el estado y en localStorage para persistencia
        setToken(data.access_token);
        localStorage.setItem("token", data.access_token);
        return data;
      } else {
        // Si no recibo token, algo salió mal en el servidor
        throw new Error("No se recibió token de acceso");
      }
    } catch (error) {
      // Re-lanzo el error para que lo capture el componente Login
      // y pueda mostrar el mensaje de error al usuario
      throw error;
    }
  }

  /**
   * Función para cerrar sesión del usuario
   * Limpia el token del estado y del localStorage
   */
  function logout() {
    setToken(null); // Limpio el estado
    localStorage.removeItem("token"); // Limpio el almacenamiento local
  }

  // Proveo el contexto con el token actual y las funciones de autenticación
  return (
    <AuthContext.Provider value={{ token, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para usar el contexto de autenticación
 * Simplifica el acceso al contexto desde cualquier componente
 * @returns {Object} - Objeto con token, loginUser y logout
 */
export function useAuth() {
  return useContext(AuthContext);
}
