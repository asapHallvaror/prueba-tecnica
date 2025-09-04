import uuid

def test_create_request_and_risk_score(client):
    unique_name = f"RiskCo-{uuid.uuid4().hex[:6]}"
    unique_tax_id = f"{uuid.uuid4().hex[:8]}-2"

    # Crear empresa primero
    response = client.post("/companies", json={
        "name": unique_name,
        "tax_id": unique_tax_id,
        "country": "CL"
    })
    assert response.status_code == 201
    company = response.json()

    # Crear request con riesgo alto
    response = client.post("/requests", json={
        "company_id": company["id"],
        "risk_inputs": {
            "pep_flag": True,
            "sanction_list": True,
            "late_payments": 3
        }
    })
    assert response.status_code == 201
    req = response.json()
    assert 0 <= req["risk_score"] <= 100   # 👈 validamos tope máximo
