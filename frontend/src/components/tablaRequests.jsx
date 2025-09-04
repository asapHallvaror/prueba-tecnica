import { useEffect, useState } from "react";
import api from "../api/axios";

export default function tablaRequest() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/requests");
        setRequests(res.data);
      } catch (err) {
        console.error("Error al obtener requests", err);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Requests</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Status</th>
            <th>Risk Score</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.company?.name || r.company_id}</td>
              <td>{r.status}</td>
              <td>{r.risk_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
