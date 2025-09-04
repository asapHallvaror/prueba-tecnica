import uuid

def test_create_and_list_companies(client):
    unique_name = f"Acme-{uuid.uuid4().hex[:6]}"
    unique_tax_id = f"{uuid.uuid4().hex[:8]}-1"

    # Crear empresa
    response = client.post("/companies", json={
        "name": unique_name,
        "tax_id": unique_tax_id,
        "country": "CL"
    })
    assert response.status_code == 201
    company = response.json()
    assert company["name"] == unique_name

    # Listar empresas
    response = client.get("/companies")
    assert response.status_code == 200
    companies = response.json()
    assert any(c["name"] == unique_name for c in companies)
