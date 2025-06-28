import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import get_db, Base
from app.models import User, UserRole
from main import app

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def test_db():
    """Create test database for each test function"""
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up after each test
    db = TestingSessionLocal()
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()
    db.close()


@pytest.fixture
def client(test_db):
    """Create test client"""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def test_user_mentor():
    """Test mentor user data with unique email"""
    unique_id = str(uuid.uuid4())[:8]
    return {
        "email": f"mentor{unique_id}@test.com",
        "password": "testpassword123",
        "name": "Test Mentor",
        "role": "mentor"
    }


@pytest.fixture
def test_user_mentee():
    """Test mentee user data with unique email"""
    unique_id = str(uuid.uuid4())[:8]
    return {
        "email": f"mentee{unique_id}@test.com", 
        "password": "testpassword123",
        "name": "Test Mentee",
        "role": "mentee"
    }


@pytest.fixture
def mentor_token(client, test_user_mentor):
    """Create mentor user and return auth token"""
    # Create mentor
    response = client.post("/api/signup", json=test_user_mentor)
    assert response.status_code == 201
    
    # Login mentor
    login_response = client.post("/api/login", json={
        "email": test_user_mentor["email"],
        "password": test_user_mentor["password"]
    })
    assert login_response.status_code == 200
    return login_response.json()["token"]


@pytest.fixture
def mentee_token(client, test_user_mentee):
    """Create mentee user and return auth token"""
    # Create mentee
    response = client.post("/api/signup", json=test_user_mentee)
    assert response.status_code == 201
    
    # Login mentee
    login_response = client.post("/api/login", json={
        "email": test_user_mentee["email"],
        "password": test_user_mentee["password"]
    })
    assert login_response.status_code == 200
    return login_response.json()["token"]


@pytest.fixture
def auth_headers_mentor(mentor_token):
    """Auth headers for mentor"""
    return {"Authorization": f"Bearer {mentor_token}"}


@pytest.fixture
def auth_headers_mentee(mentee_token):
    """Auth headers for mentee"""
    return {"Authorization": f"Bearer {mentee_token}"}
