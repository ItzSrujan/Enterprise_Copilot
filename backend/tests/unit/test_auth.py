import pytest
from pydantic import ValidationError
from backend.app.auth.roles import UserRole
from backend.app.auth.invitations import verify_invitation_code
from backend.app.schemas.auth import RegisterRequest
from backend.app.core.config import settings


def get_admin_code() -> str:
    if settings.admin_invitation_code:
        return settings.admin_invitation_code.get_secret_value()
    return "code123"


def test_user_roles_are_only_admin_and_employee():
    """Verify that only ADMIN and EMPLOYEE roles exist in UserRole enum."""
    roles = {role.value for role in UserRole}
    assert roles == {"admin", "employee"}
    assert not hasattr(UserRole, "SUPPORT")


def test_register_request_employee_valid():
    """Employee registration succeeds without an invitation code."""
    req = RegisterRequest(
        full_name="Jane Doe",
        email="jane.doe@company.com",
        password="securepassword123",
        confirm_password="securepassword123",
        role="employee",
    )
    assert req.role == "employee"
    assert req.invitation_code is None


def test_register_request_admin_valid():
    """Admin registration succeeds with a valid invitation code."""
    admin_code = get_admin_code()
    req = RegisterRequest(
        full_name="Admin User",
        email="admin.user@company.com",
        password="securepassword123",
        confirm_password="securepassword123",
        role="admin",
        invitation_code=admin_code,
    )
    assert req.role == "admin"
    assert req.invitation_code == admin_code


def test_register_request_admin_requires_invitation_code():
    """Admin registration fails when invitation code is missing or empty."""
    with pytest.raises(ValidationError) as exc_info:
        RegisterRequest(
            full_name="Admin User",
            email="admin.user@company.com",
            password="securepassword123",
            confirm_password="securepassword123",
            role="admin",
            invitation_code="",
        )
    assert "Invitation code is required" in str(exc_info.value)


def test_register_request_rejects_support_role():
    """Registration schema strictly rejects 'support' role."""
    with pytest.raises(ValidationError) as exc_info:
        RegisterRequest(
            full_name="Support Agent",
            email="agent@company.com",
            password="securepassword123",
            confirm_password="securepassword123",
            role="support",
        )
    errors = str(exc_info.value)
    assert "Input should be 'employee' or 'admin'" in errors or "Literal" in errors


def test_verify_invitation_code_admin():
    """Verify invitation code validation logic for admin role."""
    admin_code = get_admin_code()
    assert verify_invitation_code(UserRole.ADMIN, admin_code) is True
    assert verify_invitation_code(UserRole.ADMIN, "invalid_secret_code") is False
    assert verify_invitation_code(UserRole.ADMIN, "") is False


def test_verify_invitation_code_unsupported_role():
    """Verify invitation code rejects non-admin roles."""
    admin_code = get_admin_code()
    assert verify_invitation_code(UserRole.EMPLOYEE, admin_code) is False
    assert verify_invitation_code("support", admin_code) is False
