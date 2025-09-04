import { useState } from "react";
import { useAuth } from "../AuthContext";
import "./Login.css";

/**
 * Componente de Login para autenticar usuarios
 * @param {Function} onLogin - Callback que se ejecuta después de un login exitoso
 */
export default function login({ onLogin }) {
  // Obtengo la función loginUser del contexto de autenticación
  const { loginUser } = useAuth();
  
  // Estados locales para manejar el formulario y errores
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /**
   * Maneja el envío del formulario de login
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evito que se recargue la página
    setError(""); // Limpio errores previos antes de intentar login
    
    try {
      // Intento hacer login con las credenciales ingresadas
      await loginUser(email, password);
      // Si el login es exitoso, ejecuto el callback
      onLogin();
    } catch (err) {
      // Si hay error, muestro mensaje genérico al usuario
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        {/* Campo de email con validación HTML5 */}
        <input
          className="login-input"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {/* Campo de contraseña */}
        <input
          className="login-input"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="login-button" type="submit">Ingresar</button>
      </form>
      {/* Muestro mensaje de error solo si existe */}
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}
