from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    MENTOR = "mentor"
    MENTEE = "mentee"


class MatchRequestStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    bio = Column(Text)
    profile_image = Column(Text)  # Base64 encoded image
    skills = Column(Text)  # JSON string for mentor skills
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sent_requests = relationship("MatchRequest", foreign_keys="MatchRequest.mentee_id", back_populates="mentee")
    received_requests = relationship("MatchRequest", foreign_keys="MatchRequest.mentor_id", back_populates="mentor")


class MatchRequest(Base):
    __tablename__ = "match_requests"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mentee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text)
    status = Column(Enum(MatchRequestStatus), default=MatchRequestStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="received_requests")
    mentee = relationship("User", foreign_keys=[mentee_id], back_populates="sent_requests")
