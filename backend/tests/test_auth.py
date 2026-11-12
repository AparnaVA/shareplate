def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Test Restaurant",
            "email": "test@example.com",
            "password": "testpassword123",
            "role": "DONOR"
        }
    )

    assert response.status_code == 201

    response_data = response.json()

    assert response_data["email"] == "test@example.com"
    assert response_data["role"] == "DONOR"

    assert "password" not in response_data
    assert "password_hash" not in response_data
    
def test_register_duplicate_email(client):

    user_data = {
        "name": "Test Restaurant",
        "email": "duplicate@example.com",
        "password": "testpassword123",
        "role": "DONOR"
    }

    first_response = client.post(
        "/api/auth/register",
        json=user_data
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/auth/register",
        json=user_data
    )

    assert second_response.status_code == 409

    response_data = second_response.json()

    assert response_data["detail"] == "Email already registered"
    

def create_test_user(client):
    user_data = {
        "name": "Test Restaurant",
        "email": "login@example.com",
        "password": "testpassword123",
        "role": "DONOR"
    }

    response = client.post(
        "/api/auth/register",
        json=user_data
    )

    assert response.status_code == 201

    return user_data

def test_login_success(client):
    user_data = create_test_user(client)

    response = client.post(
        "/api/auth/login",
        json={
            "email": user_data["email"],
            "password": user_data["password"]
        }
    )

    assert response.status_code == 200

    response_data = response.json()

    assert "access_token" in response_data
    assert response_data["token_type"] == "bearer"
    
    
def test_login_wrong_password(client):
    user_data = create_test_user(client)

    response = client.post(
        "/api/auth/login",
        json={
            "email": user_data["email"],
            "password": "wrongpassword123"
        }
    )

    assert response.status_code == 401

    response_data = response.json()

    assert response_data["detail"] == "Invalid email or password"
    
    
def test_get_current_user_without_token(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401

    response_data = response.json()

    assert response_data["detail"] == (
        "Invalid or missing authentication token"
    )