
"""
Centralized test runner for Enterprise Knowledge & Support Copilot.

Run from the project root:
    python -m scripts.run_all_tests

Tests use mock LLM responses where possible to avoid API costs.
"""

import csv
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace

from langchain_core.documents import Document


# ---------------------------------------------------------
# 1. Project paths
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[1]
TICKETS_FILE = PROJECT_ROOT / "data" / "tickets" / "support_tickets.csv"

# Allow imports from the project root.
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


# ---------------------------------------------------------
# 2. Mock LLM for citation-grounding tests
# ---------------------------------------------------------

class FakeLLM:
    """Returns predefined responses instead of calling an actual LLM."""

    def __init__(self, responses):
        self.responses = iter(responses)
        self.call_count = 0

    def invoke(self, messages):
        self.call_count += 1
        response = next(self.responses)
        return SimpleNamespace(content=response)


def make_document(content, **metadata):
    """Create a LangChain Document for testing."""

    return Document(
        page_content=content,
        metadata={
            "file_name": "test_policy.pdf",
            **metadata,
        },
    )


# ---------------------------------------------------------
# 3. Retrieval tests: BM25 and Reciprocal Rank Fusion
# ---------------------------------------------------------

class TestRetrieval(unittest.TestCase):

    def test_bm25_retrieves_relevant_document(self):
        from backend.app.rag.retrieval.bm25 import BM25Retriever

        documents = [
            make_document(
                "UPI payment pending after authorization."
            ),
            make_document(
                "Employees receive annual leave benefits."
            ),
            make_document(
                "Verify payment status before retrying a transaction."
            ),
        ]

        retriever = BM25Retriever(documents)
        results = retriever.search("UPI payment pending", k=2)

        self.assertIsInstance(results, list)
        self.assertGreater(len(results), 0)
        self.assertTrue(
            any("payment" in doc.page_content.lower()
                for doc in results)
        )

    def test_bm25_respects_requested_result_limit(self):
        from backend.app.rag.retrieval.bm25 import BM25Retriever

        documents = [
            make_document("Payment transaction failed."),
            make_document("Payment transaction is pending."),
            make_document("Payment transaction was completed."),
        ]

        retriever = BM25Retriever(documents)
        results = retriever.search("payment transaction", k=2)

        self.assertLessEqual(len(results), 2)

    def test_reciprocal_rank_fusion_returns_documents(self):
        from backend.app.rag.retrieval.fusion import (
            reciprocal_rank_fusion,
        )

        doc_a = make_document("UPI payment pending.")
        doc_b = make_document("Refund processing policy.")
        doc_c = make_document("Payment reconciliation procedure.")

        vector_results = [doc_a, doc_b]
        keyword_results = [doc_c, doc_a]

        fused = reciprocal_rank_fusion(
            [vector_results, keyword_results],
            k=60,
        )

        self.assertIsInstance(fused, list)
        self.assertGreater(len(fused), 0)
        self.assertTrue(
            all(isinstance(doc, Document) for doc in fused)
        )

    def test_rrf_prioritizes_document_ranked_high_by_both_methods(self):
        from backend.app.rag.retrieval.fusion import (
            reciprocal_rank_fusion,
        )

        doc_a = make_document("UPI payment pending.")
        doc_b = make_document("Unrelated employee leave policy.")
        doc_c = make_document("Payment reconciliation.")

        fused = reciprocal_rank_fusion(
            [
                [doc_a, doc_b, doc_c],
                [doc_a, doc_c, doc_b],
            ],
            k=60,
        )

        self.assertGreater(len(fused), 0)
        self.assertEqual(fused[0].page_content, doc_a.page_content)


# ---------------------------------------------------------
# 4. Relevance guardrail tests
# ---------------------------------------------------------

class TestRelevanceGuardrail(unittest.TestCase):

    def test_relevant_documents_pass_threshold(self):
        from backend.app.rag.guardrails.relevance import (
            filter_relevant_documents,
        )

        documents = [
            make_document(
                "UPI reconciliation procedure.",
                reranker_score=0.80,
            ),
            make_document(
                "Annual leave policy.",
                reranker_score=-0.20,
            ),
        ]

        results = filter_relevant_documents(
            documents,
            min_score=0.005,
        )

        self.assertEqual(len(results), 1)
        self.assertEqual(
            results[0].page_content,
            "UPI reconciliation procedure.",
        )

    def test_documents_below_threshold_are_removed(self):
        from backend.app.rag.guardrails.relevance import (
            filter_relevant_documents,
        )

        documents = [
            make_document("Unrelated content.", reranker_score=-0.1),
            make_document("Weakly relevant content.", reranker_score=0.004),
        ]

        results = filter_relevant_documents(
            documents,
            min_score=0.005,
        )

        self.assertEqual(results, [])

    def test_documents_without_scores_are_removed(self):
        from backend.app.rag.guardrails.relevance import (
            filter_relevant_documents,
        )

        documents = [
            make_document("Missing score."),
            make_document(
                "String score.",
                reranker_score="0.9",
            ),
        ]

        results = filter_relevant_documents(
            documents,
            min_score=0.005,
        )

        self.assertEqual(results, [])

    def test_sufficient_context_check(self):
        from backend.app.rag.guardrails.relevance import (
            has_sufficient_context,
        )

        documents = [make_document("Payment policy.")]

        self.assertTrue(has_sufficient_context(documents))
        self.assertFalse(has_sufficient_context([]))

    def test_invalid_minimum_context_raises_error(self):
        from backend.app.rag.guardrails.relevance import (
            has_sufficient_context,
        )

        with self.assertRaises(ValueError):
            has_sufficient_context([], min_documents=0)


# ---------------------------------------------------------
# 5. Citation-grounding tests
# ---------------------------------------------------------

class TestCitationGrounding(unittest.TestCase):

    def setUp(self):
        from backend.app.rag.citations.grounding import (
            validate_citation_grounding,
        )

        self.validate = validate_citation_grounding

    def test_empty_answer(self):
        llm = FakeLLM([])

        result = self.validate("", [], llm)

        self.assertEqual(result["claims"], [])
        self.assertFalse(result["all_claims_grounded"])
        self.assertEqual(llm.call_count, 0)

    def test_uncited_claim_is_flagged(self):
        llm = FakeLLM([])

        result = self.validate(
            "Check the transaction status.",
            [make_document("Check the payment status.")],
            llm,
        )

        self.assertEqual(len(result["claims"]), 1)
        self.assertEqual(result["claims"][0]["status"], "uncited")
        self.assertTrue(result["has_uncited_claims"])
        self.assertEqual(llm.call_count, 0)

    def test_unknown_source_id_is_unsupported(self):
        llm = FakeLLM([])

        result = self.validate(
            "Check the transaction status. [S99]",
            [make_document("Check the payment status.")],
            llm,
        )

        self.assertEqual(result["claims"][0]["status"], "unsupported")
        self.assertEqual(result["claims"][0]["citations"], ["S99"])
        self.assertEqual(llm.call_count, 0)

    def test_supported_claim(self):
        llm = FakeLLM([
            '{"status":"supported",'
            '"explanation":"The source supports the claim."}'
        ])

        result = self.validate(
            "Check provider reconciliation. [S1]",
            [
                make_document(
                    "Support should check provider reconciliation."
                )
            ],
            llm,
        )

        self.assertEqual(result["counts"]["supported"], 1)
        self.assertEqual(result["claims"][0]["status"], "supported")
        self.assertTrue(result["all_claims_grounded"])
        self.assertEqual(llm.call_count, 1)

    def test_unsupported_claim(self):
        llm = FakeLLM([
            '{"status":"unsupported",'
            '"explanation":"The source contradicts the claim."}'
        ])

        result = self.validate(
            "Make repeated payments while pending. [S1]",
            [
                make_document(
                    "Do not make repeated payments while pending."
                )
            ],
            llm,
        )

        self.assertEqual(result["counts"]["unsupported"], 1)
        self.assertFalse(result["all_claims_grounded"])

    def test_malformed_judge_response_becomes_uncertain(self):
        llm = FakeLLM(["This is not valid JSON"])

        result = self.validate(
            "Check provider reconciliation. [S1]",
            [make_document("Check provider reconciliation.")],
            llm,
        )

        self.assertEqual(result["claims"][0]["status"], "uncertain")
        self.assertEqual(result["counts"]["uncertain"], 1)
        self.assertFalse(result["all_claims_grounded"])

    def test_invalid_judge_status_becomes_uncertain(self):
        llm = FakeLLM([
            '{"status":"probably correct",'
            '"explanation":"Invalid classification."}'
        ])

        result = self.validate(
            "Check provider reconciliation. [S1]",
            [make_document("Check provider reconciliation.")],
            llm,
        )

        self.assertEqual(result["claims"][0]["status"], "uncertain")

    def test_duplicate_citations_are_deduplicated(self):
        llm = FakeLLM([
            '{"status":"supported",'
            '"explanation":"The source supports the claim."}'
        ])

        result = self.validate(
            "Check provider reconciliation. [S1][S1]",
            [make_document("Check provider reconciliation.")],
            llm,
        )

        self.assertEqual(result["claims"][0]["citations"], ["S1"])
        self.assertEqual(llm.call_count, 1)


# ---------------------------------------------------------
# 6. Support-ticket dataset tests
# ---------------------------------------------------------

class TestSupportTicketDataset(unittest.TestCase):

    def test_ticket_csv_exists(self):
        self.assertTrue(
            TICKETS_FILE.exists(),
            f"Ticket CSV not found: {TICKETS_FILE}",
        )

    def test_ticket_csv_has_required_columns(self):
        if not TICKETS_FILE.exists():
            self.skipTest("Support-ticket CSV is missing.")

        with TICKETS_FILE.open(
            "r",
            encoding="utf-8-sig",
            newline="",
        ) as file:
            reader = csv.DictReader(file)
            columns = set(reader.fieldnames or [])

        required = {
            "ticket_id",
            "category",
            "issue",
            "resolution",
            "status",
        }

        self.assertTrue(required.issubset(columns))

    def test_known_upi_ticket_exists(self):
        if not TICKETS_FILE.exists():
            self.skipTest("Support-ticket CSV is missing.")

        with TICKETS_FILE.open(
            "r",
            encoding="utf-8-sig",
            newline="",
        ) as file:
            tickets = list(csv.DictReader(file))

        upi_tickets = [
            ticket for ticket in tickets
            if ticket.get("ticket_id") == "TKT-1002"
        ]

        self.assertEqual(len(upi_tickets), 1)
        self.assertIn(
            "UPI",
            upi_tickets[0]["issue"].upper(),
        )
        self.assertTrue(upi_tickets[0]["resolution"].strip())

    def test_ticket_records_have_required_values(self):
        if not TICKETS_FILE.exists():
            self.skipTest("Support-ticket CSV is missing.")

        with TICKETS_FILE.open(
            "r",
            encoding="utf-8-sig",
            newline="",
        ) as file:
            tickets = list(csv.DictReader(file))

        self.assertGreater(len(tickets), 0)

        for ticket in tickets:
            for field in (
                "ticket_id",
                "category",
                "issue",
                "resolution",
                "status",
            ):
                with self.subTest(
                    ticket=ticket.get("ticket_id"),
                    field=field,
                ):
                    self.assertTrue(
                        ticket.get(field, "").strip(),
                        f"Missing {field} in {ticket.get('ticket_id')}",
                    )


# ---------------------------------------------------------
# 7. Test runner
# ---------------------------------------------------------

def main():
    print("=" * 65)
    print("ENTERPRISE KNOWLEDGE & SUPPORT COPILOT")
    print("CENTRALIZED TEST SUITE")
    print("=" * 65)

    suite = unittest.TestSuite()

    test_classes = [
        TestRetrieval,
        TestRelevanceGuardrail,
        TestCitationGrounding,
        TestSupportTicketDataset,
    ]

    for test_class in test_classes:
        suite.addTests(
            unittest.defaultTestLoader.loadTestsFromTestCase(test_class)
        )

    result = unittest.TextTestRunner(
        verbosity=2,
    ).run(suite)

    print("\n" + "=" * 65)
    print("TEST SUMMARY")
    print("=" * 65)
    print(f"Passed: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failed: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped)}")

    if result.wasSuccessful():
        print("\nAll executed tests passed.")
        return 0

    print("\nSome tests failed. Review the tracebacks above.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
