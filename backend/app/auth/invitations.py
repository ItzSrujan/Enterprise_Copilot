import secrets

from backend.app.core.config import settings

def verify_invitation_code(
    role: str,
    invitation_code: str | None
) -> bool:
    if not invitation_code or role != "admin":
        return False
    
    expected_code = settings.admin_invitation_code
    if expected_code is None:
        return False
    
    return secrets.compare_digest(
        invitation_code,
        expected_code.get_secret_value()
    )
