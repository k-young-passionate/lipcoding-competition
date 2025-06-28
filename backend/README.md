# Mentor-Mentee Matching Backend

A FastAPI-based backend for the mentor-mentee matching application.

## Features

- User authentication with JWT tokens
- User registration and login
- Profile management for mentors and mentees
- Mentor listing with filtering and sorting
- Match request system
- SQLite database with SQLAlchemy ORM
- OpenAPI/Swagger documentation

## Requirements

- Python 3.12
- FastAPI
- SQLAlchemy
- SQLite
- JWT authentication

## Installation

1. Create and activate virtual environment:
```bash
python3.12 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
source venv/bin/activate && python main.py
```

or

```bash
source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8080
```

## API Documentation

Once the server is running, visit:
- API Documentation: http://localhost:8080/docs
- OpenAPI Spec: http://localhost:8080/openapi.json

## Database

The application uses SQLite as the database, stored in `app.db` file.

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```
