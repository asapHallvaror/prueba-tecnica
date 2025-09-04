import { AuthProvider, useAuth } from "./AuthContext";
import { useState, useEffect } from "react";
import { createCompany, listCompanies, createRequest, listRequests } from "./api";
import "./components/Login.css";
import Login from "./components/login";


function Companies() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [name, setName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [country, setCountry] = useState("CL");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadCompanies() {
    const data = await listCompanies(token);
    setCompanies(data.items || data);
  }

  function validateForm() {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }
    
    if (!taxId.trim()) {
      newErrors.taxId = "El RUT es requerido";
    }
    
    if (!country.trim()) {
      newErrors.country = "El país es requerido";
    } else if (country.trim().length !== 2) {
      newErrors.country = "Código de país debe ser de 2 letras (ej: CL, AR, PE)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCreate(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createCompany({ name: name.trim(), tax_id: taxId.trim(), country: country.trim().toUpperCase() }, token);
      setName("");
      setTaxId("");
      setCountry("CL");
      setErrors({});
      await loadCompanies();
    } catch (err) {
      console.error("Error creando empresa:", err);
      setErrors({ submit: err.message || "Hubo un error al crear la empresa" });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (token) loadCompanies();
  }, [token]);

  return (
    <div className="form-container">
      <h2 className="form-title">Gestión de Empresas</h2>
      <form onSubmit={handleCreate}>
        <div className="form-group">
          <label className="form-label">Nombre de la empresa</label>
          <input 
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="Ingrese el nombre de la empresa"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors(prev => ({ ...prev, name: undefined }));
              }
            }}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">RUT</label>
          <input 
            className={`form-input ${errors.taxId ? 'error' : ''}`}
            placeholder="12.345.678-9"
            value={taxId}
            onChange={(e) => {
              setTaxId(e.target.value);
              if (errors.taxId) {
                setErrors(prev => ({ ...prev, taxId: undefined }));
              }
            }}
          />
          {errors.taxId && <span className="form-error">{errors.taxId}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">País (código de 2 letras)</label>
          <input 
            className={`form-input ${errors.country ? 'error' : ''}`}
            placeholder="CL"
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              if (errors.country) {
                setErrors(prev => ({ ...prev, country: undefined }));
              }
            }}
            maxLength={2}
          />
          {errors.country && <span className="form-error">{errors.country}</span>}
        </div>

        {errors.submit && <div className="form-error">{errors.submit}</div>}
        
        <button 
          className="form-button" 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando..." : "Crear Empresa"}
        </button>
      </form>
      
      <ul className="items-list">
        {companies.map((c) => (
          <li key={c.id} className="item-card">
            <strong>{c.name}</strong> (ID: {c.id})<br />
            RUT: {c.tax_id} | País: {c.country}
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
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadRequests() {
    const data = await listRequests(token);
    setRequests(data.items || data);
  }

  function validateForm() {
    const newErrors = {};
    
    if (!companyId.trim()) {
      newErrors.companyId = "El ID de la empresa es requerido";
    }
    
    if (late < 0) {
      newErrors.late = "Los pagos atrasados no pueden ser negativos";
    } else if (late > 999) {
      newErrors.late = "El número de pagos atrasados parece muy alto";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCreate(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createRequest({
        company_id: companyId.trim(),
        risk_inputs: { pep_flag: pep, sanction_list: sanction, late_payments: late },
      }, token);
      setCompanyId("");
      setPep(false);
      setSanction(false);
      setLate(0);
      setErrors({});
      await loadRequests();
    } catch (err) {
      console.error("Error creando request:", err);
      setErrors({ submit: err.message || "Hubo un error al crear el request" });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (token) loadRequests();
  }, [token]);

  return (
    <div className="form-container">
      <h2 className="form-title">Evaluación de Riesgo</h2>
      <form onSubmit={handleCreate}>
        <div className="form-group">
          <label className="form-label">ID de la Empresa</label>
          <input 
            className={`form-input ${errors.companyId ? 'error' : ''}`}
            placeholder="Ingrese el ID de la empresa"
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              if (errors.companyId) {
                setErrors(prev => ({ ...prev, companyId: undefined }));
              }
            }}
          />
          {errors.companyId && <span className="form-error">{errors.companyId}</span>}
        </div>

        <div className="checkbox-group">
          <input 
            className="checkbox-input"
            type="checkbox" 
            id="pep"
            checked={pep} 
            onChange={(e) => setPep(e.target.checked)} 
          />
          <label className="checkbox-label" htmlFor="pep">
            Persona Expuesta Políticamente (PEP)
          </label>
        </div>

        <div className="checkbox-group">
          <input 
            className="checkbox-input"
            type="checkbox" 
            id="sanction"
            checked={sanction} 
            onChange={(e) => setSanction(e.target.checked)} 
          />
          <label className="checkbox-label" htmlFor="sanction">
            En lista de sanciones
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Número de pagos atrasados</label>
          <input
            className={`form-input ${errors.late ? 'error' : ''}`}
            type="number"
            min="0"
            max="999"
            value={late}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseInt(e.target.value);
              setLate(value);
              if (errors.late) {
                setErrors(prev => ({ ...prev, late: undefined }));
              }
            }}
            placeholder="0"
          />
          {errors.late && <span className="form-error">{errors.late}</span>}
        </div>

        {errors.submit && <div className="form-error">{errors.submit}</div>}
        
        <button 
          className="form-button" 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Evaluando..." : "Crear Evaluación"}
        </button>
      </form>
      
      <ul className="items-list">
        {requests.map((r) => (
          <li key={r.id} className="item-card">
            <strong>Request #{r.id}</strong><br />
            Score de Riesgo: <strong>{r.risk_score}</strong><br />
            Estado: {r.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Content() {
  const { token, logout } = useAuth();
  
  const handleLoginSuccess = () => {
    // El token se maneja automáticamente por el AuthContext
    // No necesitamos hacer nada aquí
  };

  return (
    <>
      {!token ? (
        <Login onLogin={handleLoginSuccess} />
      ) : (
        <>
          <div className="login-container">
            <p>Sesión iniciada</p>
            <button className="login-button" onClick={logout}>Cerrar sesión</button>
          </div>
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
      <div className="app-container">
        <div className="content-wrapper">
          <h1 className="app-title">Portal de Evaluación de Proveedores</h1>
          <Content />
        </div>
      </div>
    </AuthProvider>
  );
}
