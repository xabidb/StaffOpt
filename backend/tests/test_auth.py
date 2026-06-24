import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_and_login_user(client: AsyncClient):
    # 1. Create a user (since it is the first user, it should become an Admin)
    user_payload = {
        "email": "admin@explorium.com",
        "password": "strongpassword123",
        "full_name": "Admin User",
        "role": "Staff" # role field is ignored or overridden to Admin for first user
    }
    
    response = await client.post("/api/v1/users/", json=user_payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["email"] == "admin@explorium.com"
    assert data["full_name"] == "Admin User"
    assert data["role"] == "Admin"  # Bootstrapped first user is Admin
    assert "password" not in data
    
    # 2. Assert duplicate email registration fails
    dup_response = await client.post("/api/v1/users/", json=user_payload)
    assert dup_response.status_code == 400
    
    # 3. Log in via JSON /login endpoint
    login_payload = {
        "email": "admin@explorium.com",
        "password": "strongpassword123"
    }
    login_response = await client.post("/api/v1/auth/login", json=login_payload) # Note prefix /api/v1/auth/login is mounted under router
    assert login_response.status_code == 200, login_response.text
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    
    # 4. Get profile of current user (users/me)
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    me_response = await client.get("/api/v1/users/me", headers=headers)
    assert me_response.status_code == 200, me_response.text
    me_data = me_response.json()
    assert me_data["email"] == "admin@explorium.com"
    assert me_data["role"] == "Admin"
    
    # 5. Accessing users/me without credentials fails
    unauth_response = await client.get("/api/v1/users/me")
    assert unauth_response.status_code == 401
