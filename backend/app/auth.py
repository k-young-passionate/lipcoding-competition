import os
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import get_user_by_id
from app.models import User

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 1

security = HTTPBearer()


def create_access_token(user: User) -> str:
    issued_at = datetime.now(timezone.utc)
    expires_at = issued_at + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    payload = {
        # RFC 7519 standard claims
        "iss": "mentor-mentee-app",  # issuer
        "sub": str(user.id),         # subject (user ID)
        "aud": "mentor-mentee-app",  # audience
        "exp": expires_at,           # expiration time
        "nbf": issued_at,            # not before
        "iat": issued_at,            # issued at
        "jti": f"{user.id}_{int(issued_at.timestamp())}",  # JWT ID
        
        # Custom claims
        "name": user.name,
        "email": user.email,
        "role": user.role.value
    }
    
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM],
            audience="mentor-mentee-app",
            issuer="mentor-mentee-app"
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = int(payload.get("sub"))
    user = get_user_by_id(db, user_id)
    
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


def get_current_mentor(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.value != "mentor":
        raise HTTPException(status_code=403, detail="Access denied. Mentor role required.")
    return current_user


def get_current_mentee(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.value != "mentee":
        raise HTTPException(status_code=403, detail="Access denied. Mentee role required.")
    return current_user
