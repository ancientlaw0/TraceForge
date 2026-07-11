#"Someone makes an HTTP request, what should my backend do?"
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from Backend.app.security.auth import verify_password, create_access_token 
from app.database import get_db
from Backend.app.dependencies.current_user import get_current_user
from app.models import User
from app.schemas import UserSignup,UserLogin
from Backend.app.security.auth import hash_password


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user: UserSignup, db: Session = Depends(get_db)):

    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered."
        )

    hashed_password = hash_password(user.password)

    new_user = User(
        email=user.email,
        password_hash=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully"
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password." # you cant tell email not registered as it is useful infot for hacekr
        )

    if not verify_password(
        user.password,
        db_user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = create_access_token(db_user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id, # cant return the hwole object as it also contains passwords 
        "email": current_user.email,
        "created_at": current_user.created_at
    }