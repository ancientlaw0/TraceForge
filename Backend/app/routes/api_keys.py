from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import APIKey, User
from app.schemas.api_keys import APIKeyCreate, APIKeyResponse , APIKeyInfo
from app.security.api_keys import ( generate_api_key, hash_api_key )
from app.security.auth import get_current_user
from fastapi import HTTPException
from typing import List

router = APIRouter( prefix="/api-keys", tags=["API Keys"] )

@router.post(
    "/", response_model=APIKeyResponse, status_code=status.HTTP_201_CREATED
)
def create_api_key(
    api_key: APIKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Generate plaintext key
    plain_key = generate_api_key()

    # Hash it
    hashed_key = hash_api_key(plain_key)

    # Store only hash
    new_key = APIKey( user_id=current_user.id, name=api_key.name, key_hash=hashed_key )

    db.add(new_key)
    db.commit()
    db.refresh(new_key)
    return APIKeyResponse( api_key=plain_key )


@router.get( "/", response_model=List[APIKeyInfo] )
def get_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    api_keys = ( db.query(APIKey) .filter(APIKey.user_id == current_user.id) .all() )
    return api_keys


@router.delete( "/{key_id}", status_code=status.HTTP_204_NO_CONTENT )
def revoke_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    api_key = (
        db.query(APIKey)
        .filter(
            APIKey.id == key_id,
            APIKey.user_id == current_user.id
        )
        .first() # first return one object 
    )

    if api_key is None: raise HTTPException( status_code=status.HTTP_404_NOT_FOUND, detail="API Key not found." )
    api_key.is_active = False
    db.commit()