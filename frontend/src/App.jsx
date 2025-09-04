import { AuthProvider, useAuth } from "./AuthContext";
import { useState, useEffect } from "react";
import { createCompany, listCompanies, createRequest, listRequests } from "./api";

function LoginForm() {
  const { loginUser, token, logout } = useAuth();
  const [email, setEmail] = useState("admin@test.com");
  const [password, setPassword] = useState("Admin123!");

  async function handleLogin(e) {
    e.preventDefault();
    const res = await loginUser(email, password);
    console.log("Login:", res);
  }

  return token ? (
    <div>
      <p>Sesión iniciada ✅</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  ) : (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input
        value={password}
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

function Companies() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [country, setCountry] = useState("CL");

  async function loadCompanies() {
    const data = await listCompanies(token);
    setCompanies(data.items || data); // soporta paginación o lista directa
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || !taxId.trim()) {
      alert("Debes ingresar nombre y RUT válidos");
      return;
    }
    try {
      await createCompany({ name, tax_id: taxId, country }, token);
      setName("");
      setTaxId("");
      await loadCompanies();
    } catch (err) {
      console.error("Error creando empresa:", err);
      alert("Hubo un error al crear la empresa");
    }
  }

  useEffect(() => {
    if (token) loadCompanies();
  }, [token]);

  return (
    <div>
      <h2>Empresas</h2>
      <form onSubmit={handleCreate}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="RUT" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
        <input placeholder="País" value={country} onChange={(e) => setCountry(e.target.value)} />
        <button type="submit">Crear</button>
      </form>
      <ul>
        {companies.map((c) => (
          <li key={c.id}>
            {c.name} - {c.tax_id} ({c.country})
          </li>
        ))}
      </ul>
    </div>
  );
}

function Requests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [pep, setPep] = useState(false);
  const [sanction, setSanction] = useState(false);
  const [late, setLate] = useState(0);

  async function loadRequests() {
    const data = await listRequests(token);
    setRequests(data.items || data);
  }

  async function handleCreate(e) {
    e.preventDefault();
    await createRequest({
      company_id: companyId,
      risk_inputs: { pep_flag: pep, sanction_list: sanction, late_payments: late },
    }, token);
    loadRequests();
  }

  useEffect(() => {
    if (token) loadRequests();
  }, [token]);

  return (
    <div>
      <h2>Requests</h2>
      <form onSubmit={handleCreate}>
        <input placeholder="Company ID" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
        <label>
          <input type="checkbox" checked={pep} onChange={(e) => setPep(e.target.checked)} />
          PEP
        </label>
        <label>
          <input type="checkbox" checked={sanction} onChange={(e) => setSanction(e.target.checked)} />
          Sanciones
        </label>
        <input
          type="number"
          value={late}
          onChange={(e) => setLate(parseInt(e.target.value))}
          placeholder="Pagos atrasados"
        />
        <button type="submit">Crear</button>
      </form>
      <ul>
        {requests.map((r) => (
          <li key={r.id}>
            {r.id} → Score: {r.risk_score} (Status: {r.status})
          </li>
        ))}
      </ul>
    </div>
  );
}

function Content() {
  const { token } = useAuth();
  return (
    <>
      <LoginForm />
      {token && (
        <>
          <Companies />
          <Requests />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <h1>Portal de Evaluación de Proveedores</h1>
      <Content />
    </AuthProvider>
  );
}
