import json
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from passlib.context import CryptContext
from app.models import User, MatchRequest, UserRole, MatchRequestStatus
from app.schemas import (
    SignupRequest, UpdateMentorProfileRequest, UpdateMenteeProfileRequest,
    MatchRequestCreate
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user: SignupRequest) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def update_mentor_profile(db: Session, user_id: int, profile: UpdateMentorProfileRequest) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != UserRole.MENTOR:
        return None
    
    user.name = profile.name
    if profile.bio is not None:
        user.bio = profile.bio
    if profile.image is not None:
        user.profile_image = profile.image
    if profile.skills is not None:
        user.skills = json.dumps(profile.skills)
    
    db.commit()
    db.refresh(user)
    return user


def update_mentee_profile(db: Session, user_id: int, profile: UpdateMenteeProfileRequest) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.role != UserRole.MENTEE:
        return None
    
    user.name = profile.name
    if profile.bio is not None:
        user.bio = profile.bio
    if profile.image is not None:
        user.profile_image = profile.image
    
    db.commit()
    db.refresh(user)
    return user


def get_mentors(db: Session, skill: Optional[str] = None, order_by: Optional[str] = None) -> List[User]:
    query = db.query(User).filter(User.role == UserRole.MENTOR)
    
    if skill:
        query = query.filter(User.skills.contains(skill))
    
    if order_by == "name":
        query = query.order_by(User.name)
    elif order_by == "skill":
        query = query.order_by(User.skills)
    else:
        query = query.order_by(User.id)
    
    return query.all()


def create_match_request(db: Session, mentee_id: int, request: MatchRequestCreate) -> Optional[MatchRequest]:
    # Check if mentor exists
    mentor = db.query(User).filter(User.id == request.mentorId, User.role == UserRole.MENTOR).first()
    if not mentor:
        return None
    
    # Check if mentee already has a pending request
    existing_request = db.query(MatchRequest).filter(
        MatchRequest.mentee_id == mentee_id,
        MatchRequest.status == MatchRequestStatus.PENDING
    ).first()
    if existing_request:
        return None
    
    match_request = MatchRequest(
        mentor_id=request.mentorId,
        mentee_id=mentee_id,
        message=request.message,
        status=MatchRequestStatus.PENDING
    )
    db.add(match_request)
    db.commit()
    db.refresh(match_request)
    return match_request


def get_incoming_match_requests(db: Session, mentor_id: int) -> List[MatchRequest]:
    return db.query(MatchRequest).filter(MatchRequest.mentor_id == mentor_id).all()


def get_outgoing_match_requests(db: Session, mentee_id: int) -> List[MatchRequest]:
    return db.query(MatchRequest).filter(MatchRequest.mentee_id == mentee_id).all()


def accept_match_request(db: Session, request_id: int, mentor_id: int) -> Optional[MatchRequest]:
    # Check if mentor already has an accepted request
    existing_accepted = db.query(MatchRequest).filter(
        MatchRequest.mentor_id == mentor_id,
        MatchRequest.status == MatchRequestStatus.ACCEPTED
    ).first()
    if existing_accepted:
        return None
    
    match_request = db.query(MatchRequest).filter(
        MatchRequest.id == request_id,
        MatchRequest.mentor_id == mentor_id,
        MatchRequest.status == MatchRequestStatus.PENDING
    ).first()
    
    if not match_request:
        return None
    
    match_request.status = MatchRequestStatus.ACCEPTED
    db.commit()
    db.refresh(match_request)
    return match_request


def reject_match_request(db: Session, request_id: int, mentor_id: int) -> Optional[MatchRequest]:
    match_request = db.query(MatchRequest).filter(
        MatchRequest.id == request_id,
        MatchRequest.mentor_id == mentor_id,
        MatchRequest.status == MatchRequestStatus.PENDING
    ).first()
    
    if not match_request:
        return None
    
    match_request.status = MatchRequestStatus.REJECTED
    db.commit()
    db.refresh(match_request)
    return match_request


def cancel_match_request(db: Session, request_id: int, mentee_id: int) -> Optional[MatchRequest]:
    match_request = db.query(MatchRequest).filter(
        MatchRequest.id == request_id,
        MatchRequest.mentee_id == mentee_id
    ).first()
    
    if not match_request:
        return None
    
    # API 문서에 따라 상태를 cancelled로 변경하고 삭제하지 않음
    match_request.status = MatchRequestStatus.CANCELLED
    db.commit()
    db.refresh(match_request)
    return match_request
