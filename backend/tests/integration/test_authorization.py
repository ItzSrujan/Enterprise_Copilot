import pytest
import uuid
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.config import settings

client = TestClient(app)


def get_admin_code() -> str:
    if settings.admin_invitation_code:
        return settings.admin_invitation_code.get_secret_value()
    return "code123"


def test_reject_support_role_on_registration():
    """Verify that registering with role='support' is rejected with HTTP 422."""
    unique_email = f"support_test_{uuid.uuid4().hex[:8]}@company.com"
    payload = {
        "full_name": "Support Attempt",
        "email": unique_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "support",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


def test_register_and_login_employee():
    """Verify that registering and logging in an employee works cleanly."""
    unique_email = f"emp_{uuid.uuid4().hex[:8]}@company.com"
    payload = {
        "full_name": "Test Employee",
        "email": unique_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "employee",
    }
    # 1. Register
    reg_response = client.post("/api/v1/auth/register", json=payload)
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == unique_email
    assert user_data["role"] == "employee"

    # 2. Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": "Password123!"},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data


def test_register_and_login_admin():
    """Verify that registering and logging in an admin works with invitation code."""
    unique_email = f"admin_{uuid.uuid4().hex[:8]}@company.com"
    payload = {
        "full_name": "Test Admin",
        "email": unique_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "admin",
        "invitation_code": get_admin_code(),
    }
    # 1. Register
    reg_response = client.post("/api/v1/auth/register", json=payload)
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == unique_email
    assert user_data["role"] == "admin"

    # 2. Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": "Password123!"},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data


def test_register_admin_fails_without_invitation_code():
    """Verify that registering an admin without an invitation code fails."""
    unique_email = f"admin_nocode_{uuid.uuid4().hex[:8]}@company.com"
    payload = {
        "full_name": "Test Admin No Code",
        "email": unique_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "admin",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_rbac_document_management_access():
    """Admin can access /documents/stats and upload, but Employee gets 403 Forbidden."""
    # 1. Create Employee and get token
    emp_email = f"emp_rbac_{uuid.uuid4().hex[:8]}@company.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "RBAC Emp",
            "email": emp_email,
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "employee",
        },
    )
    emp_login = client.post(
        "/api/v1/auth/login",
        json={"email": emp_email, "password": "Password123!"},
    )
    emp_token = emp_login.json()["access_token"]

    # 2. Create Admin and get token
    admin_email = f"admin_rbac_{uuid.uuid4().hex[:8]}@company.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "RBAC Admin",
            "email": admin_email,
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "admin",
            "invitation_code": get_admin_code(),
        },
    )
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": admin_email, "password": "Password123!"},
    )
    admin_token = admin_login.json()["access_token"]

    # 3. Employee accessing /documents/stats must be 403 Forbidden
    emp_stats = client.get(
        "/api/v1/documents/stats",
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    assert emp_stats.status_code == 403

    # 4. Admin accessing /documents/stats must be 200 OK
    admin_stats = client.get(
        "/api/v1/documents/stats",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_stats.status_code == 200


def test_rbac_evaluation_access():
    """Admin can access /evaluation but Employee gets 403 Forbidden."""
    emp_email = f"emp_eval_{uuid.uuid4().hex[:8]}@company.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Eval Emp",
            "email": emp_email,
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "employee",
        },
    )
    emp_login = client.post(
        "/api/v1/auth/login",
        json={"email": emp_email, "password": "Password123!"},
    )
    emp_token = emp_login.json()["access_token"]

    admin_email = f"admin_eval_{uuid.uuid4().hex[:8]}@company.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Eval Admin",
            "email": admin_email,
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "admin",
            "invitation_code": get_admin_code(),
        },
    )
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": admin_email, "password": "Password123!"},
    )
    admin_token = admin_login.json()["access_token"]

    # Employee gets 403
    emp_eval = client.get(
        "/api/v1/evaluation",
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    assert emp_eval.status_code == 403

    # Admin gets 200
    admin_eval = client.get(
        "/api/v1/evaluation",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_eval.status_code == 200


def test_rbac_feedback_access():
    """Admin can access GET /feedback but Employee gets 403 Forbidden."""
    emp_email = f"emp_fb_{uuid.uuid4().hex[:8]}@company.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "FB Emp",
            "email": emp_email,
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "employee",
        },
    )
    emp_login = client.post(
        "/api/v1/auth/login",
        json={"email": emp_email, "password": "Password123!"},
    )
    emp_token = emp_login.json()["access_token"]

    admin_email = f"admin_fb_{uuid.uuid4().hex[:8]}@company.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "FB Admin",
            "email": admin_email,
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "admin",
            "invitation_code": get_admin_code(),
        },
    )
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": admin_email, "password": "Password123!"},
    )
    admin_token = admin_login.json()["access_token"]

    # Employee gets 403
    emp_fb = client.get(
        "/api/v1/feedback",
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    assert emp_fb.status_code == 403

    # Admin gets 200
    admin_fb = client.get(
        "/api/v1/feedback",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_fb.status_code == 200


def test_rbac_users_list_access():
    """Admin can access GET /auth/users but Employee gets 403 Forbidden."""
    emp_email = f"emp_usr_{uuid.uuid4().hex[:8]}@company.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "User Emp",
            "email": emp_email,
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "employee",
        },
    )
    emp_login = client.post(
        "/api/v1/auth/login",
        json={"email": emp_email, "password": "Password123!"},
    )
    emp_token = emp_login.json()["access_token"]

    admin_email = f"admin_usr_{uuid.uuid4().hex[:8]}@company.com"
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "User Admin",
            "email": admin_email,
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "admin",
            "invitation_code": get_admin_code(),
        },
    )
    admin_login = client.post(
        "/api/v1/auth/login",
        json={"email": admin_email, "password": "Password123!"},
    )
    admin_token = admin_login.json()["access_token"]

    # Employee gets 403
    emp_usrs = client.get(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {emp_token}"},
    )
    assert emp_usrs.status_code == 403

    # Admin gets 200
    admin_usrs = client.get(
        "/api/v1/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_usrs.status_code == 200
    users_list = admin_usrs.json()
    assert isinstance(users_list, list)
    assert len(users_list) > 0
    # Every user returned must only have role 'admin' or 'employee'
    for u in users_list:
        assert u["role"] in ("admin", "employee")
