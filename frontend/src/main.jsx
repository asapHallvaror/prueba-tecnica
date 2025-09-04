import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Punto de entrada principal de la aplicación React
// Renderizo la aplicación en el elemento con id 'root' del HTML
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode ayuda a detectar problemas potenciales en desarrollo */}
    <App />
  </StrictMode>,
)
