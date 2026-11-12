from datetime import datetime, timedelta, timezone


def create_user_and_get_token(
    client,
    email,
    role
):
    password = "testpassword123"

    register_response = client.post(
        "/api/auth/register",
        json={
            "name": f"Test {role}",
            "email": email,
            "password": password,
            "role": role
        }
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password
        }
    )

    assert login_response.status_code == 200

    access_token = login_response.json()["access_token"]

    return {
        "Authorization": f"Bearer {access_token}"
    }


def get_valid_donation_data():
    future_time = datetime.now(timezone.utc) + timedelta(days=1)

    return {
        "food_name": "Vegetable Meals",
        "description": "Fresh meals for distribution",
        "quantity": 50,
        "unit": "packets",
        "pickup_location": "Trivandrum",
        "expiry_time": future_time.isoformat()
    }
    
    
def test_donor_can_create_donation(client):
    donor_headers = create_user_and_get_token(
        client,
        "donor@example.com",
        "DONOR"
    )

    response = client.post(
        "/api/donations",
        json=get_valid_donation_data(),
        headers=donor_headers
    )

    assert response.status_code == 201

    response_data = response.json()

    assert response_data["food_name"] == "Vegetable Meals"
    assert response_data["quantity"] == 50
    assert response_data["available_quantity"] == 50
    assert response_data["status"] == "AVAILABLE"
    
    
def test_ngo_cannot_create_donation(client):
    ngo_headers = create_user_and_get_token(
        client,
        "ngo@example.com",
        "NGO"
    )

    response = client.post(
        "/api/donations",
        json=get_valid_donation_data(),
        headers=ngo_headers
    )

    assert response.status_code == 403

    response_data = response.json()

    assert response_data["detail"] == (
        "Only donors can create donations"
    )
    
def test_invalid_donation_quantity(client):
    donor_headers = create_user_and_get_token(
        client,
        "donor@example.com",
        "DONOR"
    )

    donation_data = get_valid_donation_data()
    donation_data["quantity"] = 0

    response = client.post(
        "/api/donations",
        json=donation_data,
        headers=donor_headers
    )

    assert response.status_code == 422
    
    
def create_donation(client, donor_headers):
    response = client.post(
        "/api/donations",
        json=get_valid_donation_data(),
        headers=donor_headers
    )

    assert response.status_code == 201

    return response.json()

def test_ngo_can_claim_donation(client):
    donor_headers = create_user_and_get_token(
        client,
        "donor@example.com",
        "DONOR"
    )

    donation = create_donation(client, donor_headers)

    ngo_headers = create_user_and_get_token(
        client,
        "ngo@example.com",
        "NGO"
    )

    response = client.post(
        f"/api/donations/{donation['id']}/claim",
        json={
            "requested_quantity": 10
        },
        headers=ngo_headers
    )

    assert response.status_code == 201

    response_data = response.json()

    assert response_data["donation_id"] == donation["id"]
    assert response_data["requested_quantity"] == 10
    assert response_data["status"] == "CONFIRMED"
    
    
def test_claim_reduces_available_quantity(client):
    donor_headers = create_user_and_get_token(
        client,
        "donor@example.com",
        "DONOR"
    )

    donation = create_donation(client, donor_headers)

    ngo_headers = create_user_and_get_token(
        client,
        "ngo@example.com",
        "NGO"
    )

    claim_response = client.post(
        f"/api/donations/{donation['id']}/claim",
        json={
            "requested_quantity": 10
        },
        headers=ngo_headers
    )

    assert claim_response.status_code == 201

    donor_response = client.get(
        "/api/donations",
        headers=donor_headers
    )

    assert donor_response.status_code == 200

    donations = donor_response.json()

    assert donations[0]["available_quantity"] == 40
    
def test_donor_cannot_claim_donation(client):
    donor_headers = create_user_and_get_token(
        client,
        "donor@example.com",
        "DONOR"
    )

    donation = create_donation(client, donor_headers)

    response = client.post(
        f"/api/donations/{donation['id']}/claim",
        json={
            "requested_quantity": 10
        },
        headers=donor_headers
    )

    assert response.status_code == 403

    response_data = response.json()

    assert response_data["detail"] == (
        "Only NGOs can claim donations"
    )
    
def test_ngo_cannot_claim_more_than_available(client):
    donor_headers = create_user_and_get_token(
        client,
        "donor@example.com",
        "DONOR"
    )

    donation = create_donation(client, donor_headers)

    ngo_headers = create_user_and_get_token(
        client,
        "ngo@example.com",
        "NGO"
    )

    response = client.post(
        f"/api/donations/{donation['id']}/claim",
        json={
            "requested_quantity": 100
        },
        headers=ngo_headers
    )

    assert response.status_code == 409

    response_data = response.json()

    assert response_data["detail"] == (
        "Requested quantity is greater than available quantity"
    )
    
def test_claim_non_existent_donation(client):
    ngo_headers = create_user_and_get_token(
        client,
        "ngo@example.com",
        "NGO"
    )

    response = client.post(
        "/api/donations/99999/claim",
        json={
            "requested_quantity": 10
        },
        headers=ngo_headers
    )

    assert response.status_code == 404

    response_data = response.json()

    assert response_data["detail"] == "Donation not found"