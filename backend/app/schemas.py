from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, MatchRequestStatus


# Authentication schemas
class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str


# User profile schemas
class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    email: str
    role: UserRole
    bio: Optional[str] = None


class MentorProfile(UserBase):
    skills: Optional[List[str]] = None


class MenteeProfile(UserBase):
    pass


class MentorProfileDetails(MentorProfile):
    created_at: datetime
    updated_at: Optional[datetime] = None


class MenteeProfileDetails(MenteeProfile):
    created_at: datetime
    updated_at: Optional[datetime] = None


class UpdateMentorProfileRequest(BaseModel):
    name: str
    bio: Optional[str] = None
    image: Optional[str] = None  # Base64 encoded image
    skills: Optional[List[str]] = None


class UpdateMenteeProfileRequest(BaseModel):
    name: str
    bio: Optional[str] = None
    image: Optional[str] = None  # Base64 encoded image


# Mentor listing schemas
class MentorListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    bio: Optional[str] = None
    skills: Optional[List[str]] = None


# Match request schemas
class MatchRequestCreate(BaseModel):
    mentorId: int
    menteeId: int
    message: Optional[str] = None


class MatchRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    mentor_id: int
    mentee_id: int
    message: Optional[str] = None
    status: MatchRequestStatus
    created_at: datetime
    mentor_name: str
    mentee_name: str


class MatchRequestOutgoing(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    mentor_id: int
    mentor_name: str
    message: Optional[str] = None
    status: MatchRequestStatus
    created_at: datetime


class MatchRequestIncoming(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    mentee_id: int
    mentee_name: str
    message: Optional[str] = None
    status: MatchRequestStatus
    created_at: datetime


# Error response schema
class ErrorResponse(BaseModel):
    detail: str
