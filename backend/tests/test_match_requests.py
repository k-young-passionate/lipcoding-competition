import pytest
import uuid


class TestMatchRequestEndpoints:
    """Test match request related endpoints"""

    def test_create_match_request_success(self, client):
        """Test creating a match request successfully"""
        # Create unique users for this test
        mentor_id = str(uuid.uuid4())[:8]
        mentee_id = str(uuid.uuid4())[:8]
        
        mentor_data = {
            "email": f"mentor{mentor_id}@test.com",
            "password": "testpassword123",
            "name": "Test Mentor",
            "role": "mentor"
        }
        
        mentee_data = {
            "email": f"mentee{mentee_id}@test.com",
            "password": "testpassword123",
            "name": "Test Mentee",
            "role": "mentee"
        }
        
        # Create mentor
        mentor_signup = client.post("/api/signup", json=mentor_data)
        assert mentor_signup.status_code == 201
        mentor_user_id = mentor_signup.json()["id"]
        
        # Create mentee
        mentee_signup = client.post("/api/signup", json=mentee_data)
        assert mentee_signup.status_code == 201
        
        # Login mentee
        mentee_login = client.post("/api/login", json={
            "email": mentee_data["email"],
            "password": mentee_data["password"]
        })
        assert mentee_login.status_code == 200
        mentee_token = mentee_login.json()["token"]
        mentee_headers = {"Authorization": f"Bearer {mentee_token}"}
        
        # Create match request
        request_data = {
            "mentor_id": mentor_user_id,
            "message": "I would like to learn from you!"
        }
        response = client.post("/api/match-requests", json=request_data, headers=mentee_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "id" in data
        assert data["message"] == "Match request created successfully"

    def test_create_match_request_to_nonexistent_mentor(self, client):
        """Test creating match request to nonexistent mentor"""
        # Create unique mentee for this test
        mentee_id = str(uuid.uuid4())[:8]
        mentee_data = {
            "email": f"mentee{mentee_id}@test.com",
            "password": "testpassword123",
            "name": "Test Mentee",
            "role": "mentee"
        }
        
        # Create mentee
        mentee_signup = client.post("/api/signup", json=mentee_data)
        assert mentee_signup.status_code == 201
        
        # Login mentee
        mentee_login = client.post("/api/login", json={
            "email": mentee_data["email"],
            "password": mentee_data["password"]
        })
        assert mentee_login.status_code == 200
        mentee_token = mentee_login.json()["token"]
        mentee_headers = {"Authorization": f"Bearer {mentee_token}"}
        
        request_data = {
            "mentor_id": 99999,
            "message": "This should fail"
        }
        response = client.post("/api/match-requests", json=request_data, headers=mentee_headers)
        assert response.status_code == 400

    def test_create_match_request_as_mentor_should_fail(self, client, auth_headers_mentor):
        """Test that mentors cannot create match requests"""
        request_data = {
            "mentor_id": 1,
            "message": "This should fail"
        }
        response = client.post("/api/match-requests", json=request_data, headers=auth_headers_mentor)
        assert response.status_code == 403

    def test_get_incoming_requests_as_mentor(self, client, auth_headers_mentor, auth_headers_mentee):
        """Test getting incoming requests as mentor"""
        # Create a match request first
        mentor_response = client.get("/api/me", headers=auth_headers_mentor)
        mentor_id = mentor_response.json()["id"]
        
        request_data = {
            "mentor_id": mentor_id,
            "message": "Please mentor me!"
        }
        client.post("/api/match-requests", json=request_data, headers=auth_headers_mentee)
        
        # Get incoming requests
        response = client.get("/api/match-requests/incoming", headers=auth_headers_mentor)
        
        assert response.status_code == 200
        requests = response.json()
        assert isinstance(requests, list)
        assert len(requests) >= 1
        
        # Check request structure
        request = requests[0]
        assert "id" in request
        assert "mentee_id" in request
        assert "mentee_name" in request
        assert "message" in request
        assert "status" in request
        assert "created_at" in request

    def test_get_outgoing_requests_as_mentee(self, client, auth_headers_mentee, auth_headers_mentor):
        """Test getting outgoing requests as mentee"""
        # Create a match request first
        mentor_response = client.get("/api/me", headers=auth_headers_mentor)
        mentor_id = mentor_response.json()["id"]
        
        request_data = {
            "mentor_id": mentor_id,
            "message": "I want to learn!"
        }
        client.post("/api/match-requests", json=request_data, headers=auth_headers_mentee)
        
        # Get outgoing requests
        response = client.get("/api/match-requests/outgoing", headers=auth_headers_mentee)
        
        assert response.status_code == 200
        requests = response.json()
        assert isinstance(requests, list)
        assert len(requests) >= 1

    def test_accept_match_request(self, client, auth_headers_mentor, auth_headers_mentee):
        """Test accepting a match request"""
        # Create a match request
        mentor_response = client.get("/api/me", headers=auth_headers_mentor)
        mentor_id = mentor_response.json()["id"]
        
        request_data = {
            "mentor_id": mentor_id,
            "message": "Accept this please!"
        }
        create_response = client.post("/api/match-requests", json=request_data, headers=auth_headers_mentee)
        request_id = create_response.json()["id"]
        
        # Accept the request
        response = client.put(f"/api/match-requests/{request_id}/accept", headers=auth_headers_mentor)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Match request accepted"
        assert data["status"] == "accepted"

    def test_reject_match_request(self, client, auth_headers_mentor, auth_headers_mentee):
        """Test rejecting a match request"""
        # Create a match request
        mentor_response = client.get("/api/me", headers=auth_headers_mentor)
        mentor_id = mentor_response.json()["id"]
        
        request_data = {
            "mentor_id": mentor_id,
            "message": "Reject this please!"
        }
        create_response = client.post("/api/match-requests", json=request_data, headers=auth_headers_mentee)
        request_id = create_response.json()["id"]
        
        # Reject the request
        response = client.put(f"/api/match-requests/{request_id}/reject", headers=auth_headers_mentor)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Match request rejected"
        assert data["status"] == "rejected"

    def test_cancel_match_request(self, client, auth_headers_mentee, auth_headers_mentor):
        """Test canceling a match request"""
        # Create a match request
        mentor_response = client.get("/api/me", headers=auth_headers_mentor)
        mentor_id = mentor_response.json()["id"]
        
        request_data = {
            "mentor_id": mentor_id,
            "message": "Cancel this later!"
        }
        create_response = client.post("/api/match-requests", json=request_data, headers=auth_headers_mentee)
        request_id = create_response.json()["id"]
        
        # Cancel the request
        response = client.delete(f"/api/match-requests/{request_id}", headers=auth_headers_mentee)
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Match request cancelled"

    def test_accept_nonexistent_request(self, client, auth_headers_mentor):
        """Test accepting nonexistent request"""
        response = client.put("/api/match-requests/99999/accept", headers=auth_headers_mentor)
        assert response.status_code == 404

    def test_unauthorized_access_to_requests(self, client):
        """Test unauthorized access to request endpoints"""
        # Test without authentication
        response = client.get("/api/match-requests/incoming")
        assert response.status_code == 403
        
        response = client.get("/api/match-requests/outgoing")
        assert response.status_code == 403
