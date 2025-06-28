import pytest
import uuid


class TestUserProfileEndpoints:
    """Test user profile related endpoints"""

    def test_get_current_user_mentor(self, client):
        """Test getting current user info for mentor"""
        # Create unique mentor for this test
        mentor_id = str(uuid.uuid4())[:8]
        mentor_data = {
            "email": f"mentor{mentor_id}@test.com",
            "password": "testpassword123",
            "name": "Test Mentor",
            "role": "mentor"
        }
        
        # Create mentor
        signup_response = client.post("/api/signup", json=mentor_data)
        assert signup_response.status_code == 201
        
        # Login mentor
        login_response = client.post("/api/login", json={
            "email": mentor_data["email"],
            "password": mentor_data["password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get("/api/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == mentor_data["email"]
        assert data["name"] == mentor_data["name"]
        assert data["role"] == "mentor"

    def test_get_current_user_mentee(self, client):
        """Test getting current user info for mentee"""
        # Create unique mentee for this test  
        mentee_id = str(uuid.uuid4())[:8]
        mentee_data = {
            "email": f"mentee{mentee_id}@test.com",
            "password": "testpassword123",
            "name": "Test Mentee",
            "role": "mentee"
        }
        
        # Create mentee
        signup_response = client.post("/api/signup", json=mentee_data)
        assert signup_response.status_code == 201
        
        # Login mentee
        login_response = client.post("/api/login", json={
            "email": mentee_data["email"],
            "password": mentee_data["password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.get("/api/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == mentee_data["email"]
        assert data["name"] == mentee_data["name"]
        assert data["role"] == "mentee"

    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without authorization"""
        response = client.get("/api/me")
        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/api/me", headers=headers)
        assert response.status_code == 401

    def test_update_mentor_profile(self, client):
        """Test updating mentor profile"""
        # Create unique mentor for this test
        mentor_id = str(uuid.uuid4())[:8]
        mentor_data = {
            "email": f"mentor{mentor_id}@test.com",
            "password": "testpassword123",
            "name": "Test Mentor",
            "role": "mentor"
        }
        
        # Create mentor
        signup_response = client.post("/api/signup", json=mentor_data)
        assert signup_response.status_code == 201
        
        # Login mentor
        login_response = client.post("/api/login", json={
            "email": mentor_data["email"],
            "password": mentor_data["password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        update_data = {
            "name": "Updated Mentor Name",
            "bio": "Updated bio",
            "skills": ["Python", "JavaScript"]
        }
        response = client.put("/api/me", json=update_data, headers=headers)
        assert response.status_code == 200

    def test_update_mentee_profile(self, client):
        """Test updating mentee profile"""
        # Create unique mentee for this test
        mentee_id = str(uuid.uuid4())[:8]
        mentee_data = {
            "email": f"mentee{mentee_id}@test.com",
            "password": "testpassword123",
            "name": "Test Mentee",
            "role": "mentee"
        }
        
        # Create mentee
        signup_response = client.post("/api/signup", json=mentee_data)
        assert signup_response.status_code == 201
        
        # Login mentee
        login_response = client.post("/api/login", json={
            "email": mentee_data["email"],
            "password": mentee_data["password"]
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        update_data = {
            "name": "Updated Mentee Name",
            "bio": "Updated bio"
        }
        response = client.put("/api/me", json=update_data, headers=headers)
        assert response.status_code == 200

    def test_update_profile_unauthorized(self, client):
        """Test updating profile without authorization"""
        update_data = {"name": "Should Fail"}
        response = client.put("/api/me", json=update_data)
        assert response.status_code == 401

    def test_get_profile_image_default_mentor(self, client):
        """Test getting default profile image for mentor"""
        # Create unique mentor for this test
        mentor_id = str(uuid.uuid4())[:8]
        mentor_data = {
            "email": f"mentor{mentor_id}@test.com",
            "password": "testpassword123",
            "name": "Test Mentor",
            "role": "mentor"
        }
        
        # Create mentor
        signup_response = client.post("/api/signup", json=mentor_data)
        assert signup_response.status_code == 201
        user_id = signup_response.json()["id"]
        
        response = client.get(f"/api/profile-image/{user_id}")
        assert response.status_code == 200

    def test_get_profile_image_default_mentee(self, client):
        """Test getting default profile image for mentee"""
        # Create unique mentee for this test
        mentee_id = str(uuid.uuid4())[:8]
        mentee_data = {
            "email": f"mentee{mentee_id}@test.com",
            "password": "testpassword123",
            "name": "Test Mentee",
            "role": "mentee"
        }
        
        # Create mentee
        signup_response = client.post("/api/signup", json=mentee_data)
        assert signup_response.status_code == 201
        user_id = signup_response.json()["id"]
        
        response = client.get(f"/api/profile-image/{user_id}")
        assert response.status_code == 200

    def test_get_profile_image_nonexistent_user(self, client):
        """Test getting profile image for nonexistent user"""
        response = client.get("/api/profile-image/99999")
        assert response.status_code == 404
