import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { listRequests, listCompanies } from "../api";
import "./Login.css";

/**
 * Componente TablaRequests - Muestra una tabla interactiva de solicitudes
 * Incluye funcionalidades de búsqueda, filtros y paginación
 */
export default function TablaRequests() {
  // Obtengo el token de autenticación del contexto
  const { token } = useAuth();
  
  // Estados para los datos principales
  const [requests, setRequests] = useState([]); // Lista completa de solicitudes
  const [companies, setCompanies] = useState([]); // Lista de empresas para filtros
  const [filteredRequests, setFilteredRequests] = useState([]); // Solicitudes filtradas
  const [loading, setLoading] = useState(true); // Estado de carga
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [statusFilter, setStatusFilter] = useState("all"); // Filtro por estado
  const [riskFilter, setRiskFilter] = useState("all"); // Filtro por nivel de riesgo
  const [companyFilter, setCompanyFilter] = useState("all"); // Filtro por empresa
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage] = useState(10); // Elementos por página (constante)

  /**
   * Effect para cargar datos iniciales cuando el componente se monta
   * o cuando cambia el token de autenticación
   */
  useEffect(() => {
    const fetchData = async () => {
      // Si no hay token, no puedo hacer peticiones autenticadas
      if (!token) return;
      
      setLoading(true);
      try {
        // Hago ambas peticiones en paralelo para mejor rendimiento
        const [requestsData, companiesData] = await Promise.all([
          listRequests(token), // Obtengo todas las solicitudes
          listCompanies(token) // Obtengo todas las empresas para los filtros
        ]);
        
        // Guardo los datos, manejando diferentes formatos de respuesta del backend
        setRequests(requestsData.items || requestsData);
        setCompanies(companiesData.items || companiesData);
      } catch (err) {
        console.error("Error al obtener datos:", err);
      } finally {
        setLoading(false); // Termino el estado de carga
      }
    };
    
    fetchData();
  }, [token]); // Se ejecuta cuando cambia el token

  // Effect para aplicar filtros y búsqueda cuando cambian los criterios
  useEffect(() => {
    let filtered = requests;

    // Búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.id.toString().includes(searchTerm.toLowerCase()) ||
        request.company_id.toString().includes(searchTerm.toLowerCase()) ||
        (request.company?.name && request.company.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filtro por riesgo
    if (riskFilter !== "all") {
      filtered = filtered.filter(request => {
        const score = request.risk_score;
        if (riskFilter === "high") return score >= 70;
        if (riskFilter === "medium") return score >= 30 && score < 70;
        if (riskFilter === "low") return score < 30;
        return true;
      });
    }

    // Filtro por empresa
    if (companyFilter !== "all") {
      filtered = filtered.filter(request => request.company_id === companyFilter);
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset a primera página cuando se filtra
  }, [requests, searchTerm, statusFilter, riskFilter, companyFilter]);

  // Calcular items para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'status-badge status-completed';
      case 'pending': return 'status-badge status-pending';
      case 'error': return 'status-badge status-error';
      default: return 'status-badge status-pending';
    }
  };

  const getRiskScoreClass = (score) => {
    if (score >= 70) return 'risk-score risk-high';
    if (score >= 30) return 'risk-score risk-medium';
    return 'risk-score risk-low';
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : `ID: ${companyId}`;
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="requests-container">
        <h2 className="form-title">Cargando solicitudes...</h2>
      </div>
    );
  }

  return (
    <div className="requests-container">
      <h2 className="form-title">Listado de Solicitudes</h2>
      
      {/* Búsqueda y Filtros */}
      <div className="search-filters-container">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="completed">Completado</option>
          <option value="error">Error</option>
        </select>
        
        <select
          className="filter-select"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          <option value="all">Todos los riesgos</option>
          <option value="high">Alto (≥70)</option>
          <option value="medium">Medio (30-69)</option>
          <option value="low">Bajo (&lt;30)</option>
        </select>
        
        <select
          className="filter-select"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="all">Todas las empresas</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {currentItems.length === 0 ? (
        <div className="no-results">
          No se encontraron solicitudes que coincidan con los filtros aplicados.
        </div>
      ) : (
        <>
          <table className="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Score de Riesgo</th>
                <th>PEP</th>
                <th>Sanciones</th>
                <th>Pagos Atrasados</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{getCompanyName(request.company_id)}</td>
                  <td>
                    <span className={getStatusBadgeClass(request.status)}>
                      {request.status || 'pending'}
                    </span>
                  </td>
                  <td className={getRiskScoreClass(request.risk_score)}>
                    {request.risk_score}
                  </td>
                  <td>{request.risk_inputs?.pep_flag ? '✓' : '✗'}</td>
                  <td>{request.risk_inputs?.sanction_list ? '✓' : '✗'}</td>
                  <td>{request.risk_inputs?.late_payments || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
              
              <span className="pagination-info">
                Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredRequests.length)} de {filteredRequests.length} solicitudes
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
