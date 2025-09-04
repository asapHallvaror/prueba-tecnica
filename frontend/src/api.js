const API_URL = import.meta.env.VITE_API_URL;

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Credenciales incorrectas");
  }
  
  return res.json();
}

export async function createCompany(data, token) {
  const res = await fetch(`${API_URL}/companies/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error al crear empresa");
  }

  return res.json();
}

export async function listCompanies(token) {
  const res = await fetch(`${API_URL}/companies/?page_size=100`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error listando empresas");
  }
  return res.json();
}


export async function createRequest(data, token) {
  const res = await fetch(`${API_URL}/requests/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function listRequests(token) {
  const res = await fetch(`${API_URL}/requests/?page_size=100`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Error listando requests");
  }
  return res.json();
}

