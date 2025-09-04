// Obtengo la URL base de la API desde las variables de entorno
// Esto me permite cambiar fácilmente entre desarrollo y producción
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Función para registrar un nuevo usuario en el sistema
 * @param {Object} data - Datos del usuario (email, password, role)
 * @returns {Promise} - Respuesta del servidor con los datos del usuario creado
 */
export async function registerUser(data) {
  // Hago una petición POST al endpoint de registro
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // Indico que envío JSON
    body: JSON.stringify(data), // Convierto el objeto a JSON
  });
  return res.json(); // Devuelvo la respuesta como objeto JavaScript
}

/**
 * Función para hacer login y obtener el token JWT
 * @param {Object} data - Credenciales del usuario (email, password)
 * @returns {Promise} - Respuesta con el access_token si es exitoso
 * @throws {Error} - Si las credenciales son incorrectas
 */
export async function login(data) {
  // Envío las credenciales al servidor
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  // Si la respuesta no es exitosa (status 400, 401, etc.)
  if (!res.ok) {
    // Intento obtener el mensaje de error del servidor
    const error = await res.json().catch(() => ({}));
    // Lanzo un error con el mensaje del servidor o uno genérico
    throw new Error(error.detail || "Credenciales incorrectas");
  }
  
  // Si todo está bien, devuelvo el token
  return res.json();
}

/**
 * Función para crear una nueva empresa
 * @param {Object} data - Datos de la empresa (name, tax_id, country)
 * @param {string} token - Token JWT para autenticación
 * @returns {Promise} - Datos de la empresa creada
 * @throws {Error} - Si hay algún error en la creación
 */
export async function createCompany(data, token) {
  const res = await fetch(`${API_URL}/companies/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Incluyo el token en el header Authorization para que el servidor me identifique
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  // Verifico si hubo algún error (empresa duplicada, datos inválidos, etc.)
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error al crear empresa");
  }

  return res.json();
}

/**
 * Función para obtener la lista de todas las empresas
 * @param {string} token - Token JWT para autenticación
 * @returns {Promise} - Array con todas las empresas
 * @throws {Error} - Si no se pueden cargar las empresas
 */
export async function listCompanies(token) {
  // Pido hasta 100 empresas de una vez (suficiente para el dropdown)
  const res = await fetch(`${API_URL}/companies/?page_size=100`, {
    headers: { 
      // Solo necesito el token para autenticarme, es una petición GET
      "Authorization": `Bearer ${token}` 
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error listando empresas");
  }
  return res.json();
}

/**
 * Función para crear una nueva solicitud de evaluación de riesgo
 * @param {Object} data - Datos de la solicitud (company_id, risk_inputs)
 * @param {string} token - Token JWT para autenticación
 * @returns {Promise} - Datos de la solicitud creada con el risk_score calculado
 */
export async function createRequest(data, token) {
  const res = await fetch(`${API_URL}/requests/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  // Nota: Aquí debería agregar manejo de errores como en las otras funciones
  // pero lo dejo así para mantener consistencia con el código original
  return res.json();
}

/**
 * Función para obtener la lista de todas las solicitudes de evaluación
 * @param {string} token - Token JWT para autenticación
 * @returns {Promise} - Array con todas las solicitudes y sus datos de empresa
 * @throws {Error} - Si no se pueden cargar las solicitudes
 */
export async function listRequests(token) {
  // Pido hasta 100 solicitudes de una vez para mostrar en la tabla
  const res = await fetch(`${API_URL}/requests/?page_size=100`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error listando requests");
  }
  return res.json();
}

