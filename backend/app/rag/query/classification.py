def classify_query(query: str) -> str:
    """Classify queries using simple keyword rules."""

    text = query.lower()

    categories = {
        "payments": (
            "payment", "transaction", "upi", "gateway", "charged"
        ),
        "refunds": (
            "refund", "reimbursement", "money back"
        ),
        "shipping": (
            "shipping", "delivery", "tracking", "shipment"
        ),
        "authentication": (
            "login", "password", "otp", "authentication"
        ),
        "escalation": (
            "escalate", "escalation", "support team", "sla"
        ),
    }

    for category, keywords in categories.items():
        if any(keyword in text for keyword in keywords):
            return category

    return "general"