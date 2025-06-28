import json
import base64
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user, get_current_mentor, get_current_mentee
from app.models import User, UserRole
from app.schemas import (
    SignupRequest, LoginRequest, LoginResponse,
    MentorProfile, MenteeProfile, MentorProfileDetails, MenteeProfileDetails,
    UpdateMentorProfileRequest, UpdateMenteeProfileRequest,
    MentorListItem, MatchRequestCreate, MatchRequest, MatchRequestOutgoing, MatchRequestIncoming,
    ErrorResponse
)
from app.crud import (
    get_user_by_email, create_user, authenticate_user,
    update_mentor_profile, update_mentee_profile,
    get_mentors, create_match_request,
    get_incoming_match_requests, get_outgoing_match_requests,
    accept_match_request, reject_match_request, cancel_match_request
)
from app.auth import create_access_token

router = APIRouter()


@router.post("/signup", status_code=201)
async def signup(user: SignupRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    try:
        created_user = create_user(db, user)
        return {"message": "User created successfully", "id": created_user.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/login", response_model=LoginResponse)
async def login(user: LoginRequest, db: Session = Depends(get_db)):
    # Authenticate user
    authenticated_user = authenticate_user(db, user.email, user.password)
    if not authenticated_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = create_access_token(authenticated_user)
    return LoginResponse(token=access_token)


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.MENTOR:
        skills = json.loads(current_user.skills) if current_user.skills else []
        return {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role.value,
            "profile": {
                "name": current_user.name,
                "bio": current_user.bio,
                "imageUrl": f"/images/mentor/{current_user.id}",
                "skills": skills
            }
        }
    else:
        return {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role.value,
            "profile": {
                "name": current_user.name,
                "bio": current_user.bio,
                "imageUrl": f"/images/mentee/{current_user.id}"
            }
        }


@router.get("/images/{role}/{id}")
async def get_profile_image(role: str, id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id, User.role == role).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.profile_image:
        # Decode base64 image
        try:
            image_data = base64.b64decode(user.profile_image)
            return Response(content=image_data, media_type="image/jpeg")
        except Exception:
            # If decoding fails, return default image
            pass
    
    # Return default image based on role
    if role == "mentor":
        default_url = "https://placehold.co/500x500.jpg?text=MENTOR"
    else:
        default_url = "https://placehold.co/500x500.jpg?text=MENTEE"
    
    return RedirectResponse(url=default_url)


@router.put("/profile")
async def update_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.MENTOR:
        profile_request = UpdateMentorProfileRequest(**profile_data)
        updated_user = update_mentor_profile(db, current_user.id, profile_request)
        if not updated_user:
            raise HTTPException(status_code=400, detail="Failed to update profile")
        
        skills = json.loads(updated_user.skills) if updated_user.skills else []
        return {
            "id": updated_user.id,
            "email": updated_user.email,
            "role": updated_user.role.value,
            "profile": {
                "name": updated_user.name,
                "bio": updated_user.bio,
                "imageUrl": f"/images/mentor/{updated_user.id}",
                "skills": skills
            }
        }
    else:
        profile_request = UpdateMenteeProfileRequest(**profile_data)
        updated_user = update_mentee_profile(db, current_user.id, profile_request)
        if not updated_user:
            raise HTTPException(status_code=400, detail="Failed to update profile")
        
        return {
            "id": updated_user.id,
            "email": updated_user.email,
            "role": updated_user.role.value,
            "profile": {
                "name": updated_user.name,
                "bio": updated_user.bio,
                "imageUrl": f"/images/mentee/{updated_user.id}"
            }
        }


@router.get("/mentors")
async def get_mentors_list(
    skill: Optional[str] = None,
    order_by: Optional[str] = None,
    current_user: User = Depends(get_current_mentee),
    db: Session = Depends(get_db)
):
    mentors = get_mentors(db, skill, order_by)
    mentor_list = []
    
    for mentor in mentors:
        skills = json.loads(mentor.skills) if mentor.skills else []
        mentor_list.append({
            "id": mentor.id,
            "email": mentor.email,
            "role": mentor.role.value,
            "profile": {
                "name": mentor.name,
                "bio": mentor.bio,
                "imageUrl": f"/images/mentor/{mentor.id}",
                "skills": skills
            }
        })
    
    return mentor_list


@router.post("/match-requests")
async def create_match_request_endpoint(
    request: MatchRequestCreate,
    current_user: User = Depends(get_current_mentee),
    db: Session = Depends(get_db)
):
    # API 문서에 따라 menteeId가 포함되지만, 보안상 토큰에서 추출한 사용자 ID 사용
    if request.menteeId != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot create request for another user")
    
    match_request = create_match_request(db, current_user.id, request)
    if not match_request:
        raise HTTPException(status_code=400, detail="Unable to create match request")
    
    return {
        "id": match_request.id,
        "mentorId": match_request.mentor_id,
        "menteeId": match_request.mentee_id,
        "message": match_request.message,
        "status": match_request.status.value
    }


@router.get("/match-requests/incoming")
async def get_incoming_requests(
    current_user: User = Depends(get_current_mentor),
    db: Session = Depends(get_db)
):
    requests = get_incoming_match_requests(db, current_user.id)
    result = []
    
    for req in requests:
        result.append({
            "id": req.id,
            "mentorId": req.mentor_id,
            "menteeId": req.mentee_id,
            "message": req.message,
            "status": req.status.value
        })
    
    return result


@router.get("/match-requests/outgoing")
async def get_outgoing_requests(
    current_user: User = Depends(get_current_mentee),
    db: Session = Depends(get_db)
):
    requests = get_outgoing_match_requests(db, current_user.id)
    result = []
    
    for req in requests:
        result.append({
            "id": req.id,
            "mentorId": req.mentor_id,
            "menteeId": req.mentee_id,
            "status": req.status.value
        })
    
    return result


@router.put("/match-requests/{request_id}/accept")
async def accept_request(
    request_id: int,
    current_user: User = Depends(get_current_mentor),
    db: Session = Depends(get_db)
):
    match_request = accept_match_request(db, request_id, current_user.id)
    if not match_request:
        raise HTTPException(status_code=404, detail="Match request not found or already processed")
    
    return {
        "id": match_request.id,
        "mentorId": match_request.mentor_id,
        "menteeId": match_request.mentee_id,
        "message": match_request.message,
        "status": match_request.status.value
    }


@router.put("/match-requests/{request_id}/reject")
async def reject_request(
    request_id: int,
    current_user: User = Depends(get_current_mentor),
    db: Session = Depends(get_db)
):
    match_request = reject_match_request(db, request_id, current_user.id)
    if not match_request:
        raise HTTPException(status_code=404, detail="Match request not found or already processed")
    
    return {
        "id": match_request.id,
        "mentorId": match_request.mentor_id,
        "menteeId": match_request.mentee_id,
        "message": match_request.message,
        "status": match_request.status.value
    }


@router.delete("/match-requests/{request_id}")
async def cancel_request(
    request_id: int,
    current_user: User = Depends(get_current_mentee),
    db: Session = Depends(get_db)
):
    match_request = cancel_match_request(db, request_id, current_user.id)
    if not match_request:
        raise HTTPException(status_code=404, detail="Match request not found")
    
    return {
        "id": match_request.id,
        "mentorId": match_request.mentor_id,
        "menteeId": match_request.mentee_id,
        "message": match_request.message,
        "status": match_request.status.value
    }
