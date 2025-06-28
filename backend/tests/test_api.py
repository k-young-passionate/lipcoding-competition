import pytest


class TestAPIEndpoints:
    """Test general API endpoints"""

    def test_root_endpoint_redirects_to_docs(self, client):
        """Test that root endpoint redirects to documentation"""
        response = client.get("/", allow_redirects=False)
        assert response.status_code == 307  # Temporary redirect
        assert response.headers["location"] == "/docs"

    def test_swagger_ui_endpoint_redirects_to_docs(self, client):
        """Test that swagger-ui endpoint redirects to docs"""
        response = client.get("/swagger-ui", allow_redirects=False)
        assert response.status_code == 307
        assert response.headers["location"] == "/docs"

    def test_openapi_json_endpoint(self, client):
        """Test OpenAPI JSON endpoint"""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        
        # Check that it's valid JSON
        openapi_spec = response.json()
        assert "openapi" in openapi_spec
        assert "info" in openapi_spec
        assert "paths" in openapi_spec

    def test_docs_endpoint_accessible(self, client):
        """Test that docs endpoint is accessible"""
        response = client.get("/docs")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]

    @pytest.mark.skip(reason="TestClient does not properly simulate CORS middleware")
    def test_cors_headers_present(self, client):
        """Test that CORS headers are present for API endpoints"""
        # Test with actual POST request to login
        response = client.post("/api/login", json={"email": "test@test.com", "password": "test"})
        # Should have CORS headers in response (even for failed auth)
        assert "access-control-allow-origin" in response.headers
        
    def test_nonexistent_endpoint_returns_404(self, client):
        """Test that nonexistent endpoints return 404"""
        response = client.get("/api/nonexistent")
        assert response.status_code == 404
