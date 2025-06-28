import pytest


class TestMentorEndpoints:
    """Test mentor listing endpoints"""

    def test_get_mentors_as_mentee(self, client, auth_headers_mentee, auth_headers_mentor):
        """Test getting mentor list as mentee"""
        # First, update mentor profile with skills
        mentor_update = {
            "name": "Skilled Mentor",
            "bio": "I teach programming",
            "skills": ["Python", "JavaScript", "React"]
        }
        client.put("/api/profile", json=mentor_update, headers=auth_headers_mentor)
        
        # Get mentors as mentee
        response = client.get("/api/mentors", headers=auth_headers_mentee)
        
        assert response.status_code == 200
        mentors = response.json()
        assert isinstance(mentors, list)
        assert len(mentors) >= 1
        
        # Check mentor data structure
        mentor = mentors[0]
        assert "id" in mentor
        assert "name" in mentor
        assert "bio" in mentor
        assert "skills" in mentor

    def test_get_mentors_with_skill_filter(self, client, auth_headers_mentee, auth_headers_mentor):
        """Test getting mentors filtered by skill"""
        # Update mentor with specific skills
        mentor_update = {
            "name": "Python Expert",
            "bio": "Python specialist",
            "skills": ["Python", "Django", "FastAPI"]
        }
        client.put("/api/profile", json=mentor_update, headers=auth_headers_mentor)
        
        # Filter by Python skill
        response = client.get("/api/mentors?skill=Python", headers=auth_headers_mentee)
        
        assert response.status_code == 200
        mentors = response.json()
        assert len(mentors) >= 1
        
        # Check that returned mentor has Python skill
        python_mentor_found = False
        for mentor in mentors:
            if "Python" in mentor.get("skills", []):
                python_mentor_found = True
                break
        assert python_mentor_found

    def test_get_mentors_with_name_ordering(self, client, auth_headers_mentee, auth_headers_mentor):
        """Test getting mentors ordered by name"""
        response = client.get("/api/mentors?order_by=name", headers=auth_headers_mentee)
        
        assert response.status_code == 200
        mentors = response.json()
        assert isinstance(mentors, list)

    def test_get_mentors_as_mentor_should_fail(self, client, auth_headers_mentor):
        """Test that mentors cannot access mentor list"""
        response = client.get("/api/mentors", headers=auth_headers_mentor)
        assert response.status_code == 403

    def test_get_mentors_unauthorized(self, client):
        """Test getting mentors without authentication"""
        response = client.get("/api/mentors")
        assert response.status_code == 403
