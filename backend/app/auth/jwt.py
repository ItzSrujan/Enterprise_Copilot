from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import InvalidTokenError
from backend.app.core.config import settings

def create_access_token(
    user_id: int,
    role: str
) -> str:
    """Create a signed JWT for an authenticated user."""
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes = settings.access_token_expire_minutes  
    )
    
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expires_at,
        "iat": datetime.now(timezone.utc)
    }
    
    return jwt.encode(
        payload,
        settings.jwt_secret_key.get_secret_value(),
        algorithm = settings.jwt_algorithm
    )
    
def decode_access_token(token: str) -> dict:
    """Validate a JWT and return its claims."""
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key.get_secret_value(),
            algorithms = [settings.jwt_algorithm]
        )
    except InvalidTokenError as exc:
        raise ValueError("Invalid or expired access token") from exc