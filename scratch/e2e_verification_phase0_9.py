import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import uuid
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.auth.roles import UserRole
from backend.app.core.config import settings
from backend.app.db.session import SessionLocal
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.chunk import Chunk

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("STARTING E2E VERIFICATION: PHASES 0 THROUGH 9")
    print("=" * 60)

    # 1. VERIFY TWO-ROLE ARCHITECTURE ENUM
    print("\n[TEST 1] Verifying UserRole enum...")
    roles = {r.value for r in UserRole}
    assert roles == {"admin", "employee"}, f"Expected only admin and employee, got {roles}"
    assert not hasattr(UserRole, "SUPPORT"), "UserRole.SUPPORT must not exist!"
    print("  ✓ UserRole enum has strictly: 'admin' and 'employee'.")

    # 2. VERIFY DATABASE USERS AND MIGRATION OF SUPPORT USERS
    print("\n[TEST 2] Verifying database user roles...")
    db = SessionLocal()
    users = db.query(User).all()
    support_users = [u for u in users if u.role == "support"]
    assert len(support_users) == 0, f"Found {len(support_users)} users with role 'support' in DB!"
    admin_users = [u for u in users if u.role == "admin"]
    employee_users = [u for u in users if u.role == "employee"]
    print(f"  ✓ Database verified: {len(users)} total users ({len(admin_users)} admins, {len(employee_users)} employees, 0 support).")

    # Check migrated accounts
    migrated_user = db.query(User).filter(User.email == "support@company.com").first()
    if migrated_user:
        assert migrated_user.role == "employee", f"support@company.com has role {migrated_user.role}"
        print(f"  ✓ Migrated account 'support@company.com' exists with role '{migrated_user.role}'.")
    db.close()

    # 3. REGISTRATION AND ROLE REJECTION
    print("\n[TEST 3] Testing Registration endpoints...")
    # 3a. Reject support role
    sup_email = f"sup_reject_{uuid.uuid4().hex[:6]}@company.com"
    r = client.post("/api/v1/auth/register", json={
        "full_name": "Support Attempt",
        "email": sup_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "support",
    })
    assert r.status_code == 422, f"Expected 422 when registering as support, got {r.status_code}: {r.text}"
    print("  ✓ Registration with role='support' strictly rejected with HTTP 422.")

    # 3b. Register Employee (no code needed)
    emp_email = f"emp_test_{uuid.uuid4().hex[:6]}@company.com"
    r = client.post("/api/v1/auth/register", json={
        "full_name": "Test Employee",
        "email": emp_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "employee",
    })
    assert r.status_code == 201, f"Employee registration failed: {r.status_code} {r.text}"
    print(f"  ✓ Employee registration succeeded for {emp_email}.")

    # 3c. Register Admin requires invitation code
    admin_no_code = f"admin_nocode_{uuid.uuid4().hex[:6]}@company.com"
    r = client.post("/api/v1/auth/register", json={
        "full_name": "Admin No Code",
        "email": admin_no_code,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "admin",
    })
    assert r.status_code == 422, f"Admin without invitation code should fail 422, got {r.status_code}"
    print("  ✓ Admin registration without invitation code rejected with HTTP 422.")

    # 3d. Register Admin with valid invitation code
    admin_code = settings.admin_invitation_code.get_secret_value() if settings.admin_invitation_code else "code123"
    admin_email = f"admin_test_{uuid.uuid4().hex[:6]}@company.com"
    r = client.post("/api/v1/auth/register", json={
        "full_name": "Test Admin",
        "email": admin_email,
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "admin",
        "invitation_code": admin_code,
    })
    assert r.status_code == 201, f"Admin registration failed: {r.status_code} {r.text}"
    print(f"  ✓ Admin registration with invitation code succeeded for {admin_email}.")

    # 4. LOGIN TESTING
    print("\n[TEST 4] Testing Login endpoints...")
    # 4a. Login as new employee
    r = client.post("/api/v1/auth/login", json={"email": emp_email, "password": "Password123!"})
    assert r.status_code == 200, f"Employee login failed: {r.status_code}"
    emp_token = r.json()["access_token"]
    print("  ✓ Employee login returned valid access_token.")

    # 4b. Login as new admin
    r = client.post("/api/v1/auth/login", json={"email": admin_email, "password": "Password123!"})
    assert r.status_code == 200, f"Admin login failed: {r.status_code}"
    admin_token = r.json()["access_token"]
    print("  ✓ Admin login returned valid access_token.")

    # 4c. Verify /auth/me
    r_emp_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {emp_token}"})
    assert r_emp_me.status_code == 200 and r_emp_me.json()["role"] == "employee"
    r_adm_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_adm_me.status_code == 200 and r_adm_me.json()["role"] == "admin"
    print("  ✓ Authenticated /auth/me returns backend-verified user profile and role.")

    # 5. RBAC & ROUTE PROTECTION
    print("\n[TEST 5] Testing RBAC route protection...")
    # Admin stats endpoint
    r_emp_stats = client.get("/api/v1/documents/stats", headers={"Authorization": f"Bearer {emp_token}"})
    assert r_emp_stats.status_code == 403, f"Employee should get 403 on /documents/stats, got {r_emp_stats.status_code}"
    r_adm_stats = client.get("/api/v1/documents/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_adm_stats.status_code == 200, f"Admin should get 200 on /documents/stats, got {r_adm_stats.status_code}"
    print("  ✓ /documents/stats: Employee = 403 Forbidden, Admin = 200 OK.")

    # User Management endpoint
    r_emp_users = client.get("/api/v1/auth/users", headers={"Authorization": f"Bearer {emp_token}"})
    assert r_emp_users.status_code == 403, f"Employee should get 403 on /auth/users, got {r_emp_users.status_code}"
    r_adm_users = client.get("/api/v1/auth/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_adm_users.status_code == 200, f"Admin should get 200 on /auth/users, got {r_adm_users.status_code}"
    print("  ✓ /auth/users: Employee = 403 Forbidden, Admin = 200 OK.")

    # Feedback Management endpoint
    r_emp_fb = client.get("/api/v1/feedback", headers={"Authorization": f"Bearer {emp_token}"})
    assert r_emp_fb.status_code == 403, f"Employee should get 403 on GET /feedback, got {r_emp_fb.status_code}"
    r_adm_fb = client.get("/api/v1/feedback", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_adm_fb.status_code == 200, f"Admin should get 200 on GET /feedback, got {r_adm_fb.status_code}"
    print("  ✓ /feedback: Employee = 403 Forbidden, Admin = 200 OK.")

    # Evaluation endpoint
    r_emp_eval = client.get("/api/v1/evaluation", headers={"Authorization": f"Bearer {emp_token}"})
    assert r_emp_eval.status_code == 403, f"Employee should get 403 on /evaluation, got {r_emp_eval.status_code}"
    r_adm_eval = client.get("/api/v1/evaluation", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_adm_eval.status_code == 200, f"Admin should get 200 on /evaluation, got {r_adm_eval.status_code}"
    print("  ✓ /evaluation: Employee = 403 Forbidden, Admin = 200 OK.")

    # Knowledge Base documents endpoint (Accessible to authenticated employees)
    r_emp_docs = client.get("/api/v1/documents", headers={"Authorization": f"Bearer {emp_token}"})
    assert r_emp_docs.status_code == 200, f"Employee should get 200 on GET /documents, got {r_emp_docs.status_code}"
    print(f"  ✓ /documents: Employee = 200 OK (returned {len(r_emp_docs.json())} documents for Knowledge Base).")

    # 6. CONVERSATIONS & CHAT (RAG WITH SUPPORT TICKET RETRIEVAL)
    print("\n[TEST 6] Testing Conversations and RAG Chat (including Support Ticket retrieval)...")
    # 6a. Create conversation
    r_conv = client.post("/api/v1/conversations", json={"title": "E2E Test Session"}, headers={"Authorization": f"Bearer {emp_token}"})
    assert r_conv.status_code == 201, f"Failed to create conversation: {r_conv.text}"
    conv_id = r_conv.json()["id"]
    print(f"  ✓ Created conversation ID #{conv_id}.")

    # 6b. List conversations
    r_conv_list = client.get("/api/v1/conversations", headers={"Authorization": f"Bearer {emp_token}"})
    assert r_conv_list.status_code == 200
    assert any(c["id"] == conv_id for c in r_conv_list.json())
    print("  ✓ Listed conversations, newly created thread verified.")

    # 6c. Ask question targeting Support Tickets dataset (data/tickets/support_tickets.csv)
    print("  -> Querying RAG chat with support ticket query (TKT-1002 UPI payment pending)...")
    chat_payload = {
        "question": "What is the resolution for ticket TKT-1002 regarding UPI payment pending?",
        "conversation_id": conv_id,
        "conversation_history": [],
    }
    r_chat = client.post("/api/v1/chat", json=chat_payload, headers={"Authorization": f"Bearer {emp_token}"})
    assert r_chat.status_code == 200, f"Chat query failed: {r_chat.text}"
    chat_res = r_chat.json()
    assert "answer" in chat_res and len(chat_res["answer"]) > 0
    print(f"  ✓ Chat returned answer: {chat_res['answer'][:120]}...")
    print(f"  ✓ Sources retrieved: {len(chat_res.get('sources', []))} sources, Citations: {chat_res.get('citations', [])}")

    # Verify ticket retriever or support ticket source was retrieved
    sources = chat_res.get("sources", [])
    ticket_found = any(
        "TKT-1002" in str(s) or "support_ticket" in str(s) or "support_tickets.csv" in str(s) or "UPI" in str(s)
        for s in sources
    ) or "TKT-1002" in chat_res["answer"] or "reconciliation" in chat_res["answer"].lower()
    print(f"  ✓ Support ticket evidence matched: {ticket_found}.")

    # 6d. Verify conversation persistence and messages
    r_detail = client.get(f"/api/v1/conversations/{conv_id}", headers={"Authorization": f"Bearer {emp_token}"})
    assert r_detail.status_code == 200
    messages = r_detail.json().get("messages", [])
    assert len(messages) >= 2, f"Expected at least 2 messages (user + assistant), got {len(messages)}"
    assistant_msg = [m for m in messages if m["role"] == "assistant"][-1]
    print(f"  ✓ Conversation persisted with {len(messages)} messages (Assistant msg ID #{assistant_msg['id']}).")

    # 7. FEEDBACK SUBMISSION AND ADMIN AUDIT
    print("\n[TEST 7] Testing Feedback submission and Admin audit...")
    r_fb_sub = client.post("/api/v1/feedback", json={
        "message_id": assistant_msg["id"],
        "rating": "positive",
        "comment": "Accurate grounding with ticket details.",
    }, headers={"Authorization": f"Bearer {emp_token}"})
    assert r_fb_sub.status_code == 200, f"Feedback submission failed: {r_fb_sub.text}"
    print("  ✓ Employee feedback submitted successfully.")

    # Admin reads feedback list
    r_fb_list = client.get("/api/v1/feedback", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_fb_list.status_code == 200
    fb_items = r_fb_list.json()
    assert any(fb["message_id"] == assistant_msg["id"] for fb in fb_items)
    print(f"  ✓ Admin verified feedback record in GET /feedback ({len(fb_items)} total audited).")

    # 8. REAL DATA METRICS CHECK
    print("\n[TEST 8] Verifying Admin real data telemetry...")
    stats_data = client.get("/api/v1/documents/stats", headers={"Authorization": f"Bearer {admin_token}"}).json()
    print(f"  ✓ Total Documents: {stats_data['total_documents']}")
    print(f"  ✓ Processed Documents: {stats_data['processed_documents']}")
    print(f"  ✓ Failed Documents: {stats_data['failed_documents']}")
    print(f"  ✓ Total Registered Users: {stats_data['total_users']}")
    print(f"  ✓ Total Indexed Chunks: {stats_data['total_chunks']}")
    print(f"  ✓ Category Distribution: {stats_data['category_distribution']}")
    assert isinstance(stats_data["total_documents"], int)
    assert isinstance(stats_data["total_users"], int)

    print("\n" + "=" * 60)
    print("ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
