import uuid

def test_register_and_login(client):
    # Uso un email único para evitar conflictos con registros previos
    unique_email = f"admin_{uuid.uuid4().hex[:6]}@test.com"

    # Intento registrar el usuario admin. Si ya existe, espero un 403.
    response = client.post("/auth/register", json={
        "email": unique_email,
        "password": "Admin123!",
        "role": "admin"
    })

    if response.status_code == 201:  
        # Si el registro fue exitoso, uso el email recién creado
        email = unique_email
    else:  
        # Si ya existe, uso el email por defecto y verifico el 403
        assert response.status_code == 403
        email = "admin@example.com"  

    # Ahora pruebo el login con el email correspondiente
    response = client.post("/auth/login", json={
        "email": email,
        "password": "Admin123!"
    })
    # El login debería funcionar y devolver el token
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

