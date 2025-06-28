import pytest


class TestAuthenticationEndpoints:
    """Test authentication related endpoints"""

    def test_signup_mentor_success(self, client, test_user_mentor):
        """Test successful mentor signup"""
        response = client.post("/api/signup", json=test_user_mentor)
        
        assert response.status_code == 201
        assert "message" in response.json()
        assert response.json()["message"] == "User created successfully"

    def test_signup_mentee_success(self, client, test_user_mentee):
        """Test successful mentee signup"""
        response = client.post("/api/signup", json=test_user_mentee)
        
        assert response.status_code == 201
        assert "message" in response.json()
        assert response.json()["message"] == "User created successfully"

    def test_signup_duplicate_email(self, client, test_user_mentor):
        """Test signup with duplicate email should fail"""
        # First signup
        response1 = client.post("/api/signup", json=test_user_mentor)
        assert response1.status_code == 201
        
        # Second signup with same email
        response2 = client.post("/api/signup", json=test_user_mentor)
        assert response2.status_code == 400
        assert "Email already registered" in response2.json()["detail"]

    def test_signup_invalid_email(self, client):
        """Test signup with invalid email format"""
        invalid_user = {
            "email": "invalid-email",
            "password": "testpassword123",
            "name": "Test User",
            "role": "mentor"
        }
        response = client.post("/api/signup", json=invalid_user)
        assert response.status_code == 422  # Validation error

    def test_login_mentor_success(self, client):
        """Test successful mentor login"""
        # Create mentor first
        signup_data = {
            "email": "mentor_login@test.com",
            "password": "testpassword123",
            "name": "Mentor Login Test",
            "role": "mentor"
        }
        client.post("/api/signup", json=signup_data)
        
        # Login
        login_data = {
            "email": signup_data["email"],
            "password": signup_data["password"]
        }
        response = client.post("/api/login", json=login_data)
        
        assert response.status_code == 200
        assert "token" in response.json()
        token = response.json()["token"]
        assert len(token) > 0

    def test_login_mentee_success(self, client):
        """Test successful mentee login"""
        # Create mentee first
        signup_data = {
            "email": "mentee_login@test.com",
            "password": "testpassword123",
            "name": "Mentee Login Test",
            "role": "mentee"
        }
        client.post("/api/signup", json=signup_data)
        
        # Login
        login_data = {
            "email": signup_data["email"],
            "password": signup_data["password"]
        }
        response = client.post("/api/login", json=login_data)
        
        assert response.status_code == 200
        assert "token" in response.json()

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials"""
        login_data = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        response = client.post("/api/login", json=login_data)
        
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    def test_login_wrong_password(self, client):
        """Test login with correct email but wrong password"""
        # Create user first
        signup_data = {
            "email": "wrongpw@test.com",
            "password": "correctpassword",
            "name": "Wrong PW Test",
            "role": "mentor"
        }
        client.post("/api/signup", json=signup_data)
        
        # Login with wrong password
        login_data = {
            "email": signup_data["email"],
            "password": "wrongpassword"
        }
        response = client.post("/api/login", json=login_data)
        
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]
