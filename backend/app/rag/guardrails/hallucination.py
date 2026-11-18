
def enforce_hallucination_guardrail(
    answer: str,
    grounding_results: dict | None,
    citations_result: dict | None = None,
) -> dict:
    """
    Evaluate grounding results and attach a verification warning
    without silently deleting claims from the original answer.
    """

    if not isinstance(answer, str):
        answer = ""

    if not grounding_results:
        return {
            "original_answer": answer,
            "final_answer": answer,
            "grounding_status": "no_evidence",
            "requires_attention": True,
            "unsupported_claims": [],
            "uncertain_claims": [],
            "uncited_claims": [],
            "warning": "Grounding could not be verified.",
        }

    claims = grounding_results.get("claims", [])

    if not isinstance(claims, list) or not claims:
        return {
            "original_answer": answer,
            "final_answer": answer,
            "grounding_status": "no_evidence",
            "requires_attention": True,
            "unsupported_claims": [],
            "uncertain_claims": [],
            "uncited_claims": [],
            "warning": "No verifiable claims were found.",
        }

    unsupported_claims = []
    uncertain_claims = []
    uncited_claims = []

    for claim in claims:
        if not isinstance(claim, dict):
            continue

        status = claim.get("status")
        claim_text = claim.get("claim", "")

        if status == "unsupported":
            unsupported_claims.append(claim_text)

        elif status == "uncertain":
            uncertain_claims.append(claim_text)

        elif status == "uncited":
            uncited_claims.append(claim_text)

    supported_count = sum(
        1
        for claim in claims
        if isinstance(claim, dict)
        and claim.get("status") == "supported"
    )

    has_issues = bool(
        unsupported_claims
        or uncertain_claims
        or uncited_claims
    )

    if not has_issues:
        grounding_status = "fully_grounded"
        warning = None

    elif supported_count > 0:
        grounding_status = "partially_grounded"
        warning = (
            "Verification Notice: Some claims could not be "
            "fully verified against the retrieved sources."
        )

    else:
        grounding_status = "ungrounded"
        warning = (
            "Verification Notice: The response could not be "
            "verified against the retrieved sources."
        )

    if citations_result:
        invalid_citations = citations_result.get(
            "invalid_citations", []
        )

        if invalid_citations:
            has_issues = True

            if grounding_status == "fully_grounded":
                grounding_status = "partially_grounded"

            warning = (
                warning
                or "Verification Notice: Invalid source references detected."
            )

    final_answer = answer

    if warning:
        final_answer = f"{answer}\n\n> ⚠️ **{warning}**"

    return {
        "original_answer": answer,
        "final_answer": final_answer,
        "grounding_status": grounding_status,
        "requires_attention": has_issues,
        "unsupported_claims": unsupported_claims,
        "uncertain_claims": uncertain_claims,
        "uncited_claims": uncited_claims,
        "warning": warning,
    }
