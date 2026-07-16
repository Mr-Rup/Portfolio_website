"""
JWT Authentication Dependency & Route Guard Pattern
---------------------------------------------------
Demonstrates HTTPBearer OAuth2 token extraction, signature decoding, and role validation
used to guard the `/secure-control` administrative mutations.
"""

import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "DEMO_PLACEHOLDER_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Extracts Bearer token from headers, verifies the HMAC signature, and returns payload claims.
    Raises HTTP 401 on expired or tampered tokens.
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def verify_admin(payload: dict = Depends(verify_token)) -> dict:
    """
    Role-based access control guard ensuring only administrators can execute CRUD mutations.
    Raises HTTP 403 if role claim does not match 'admin'.
    """
    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required for this action"
        )
    return payload
