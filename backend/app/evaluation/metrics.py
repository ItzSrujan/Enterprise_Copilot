def calculate_precision(
    retrieved_ids: list[int],
    relevant_ids: list[int]
) -> float:
    ## Calculate precision@K.
    if not retrieved_ids:
        return 0.0
    
    relevant_set = set(relevant_ids)
    
    relevant_retrieved = sum(
        1 for chunk_id in retrieved_ids
        if chunk_id in relevant_set
    )
    
    return relevant_retrieved / len(retrieved_ids)

def calculate_recall(
    retrieved_ids: list[int],
    relevant_ids: list[int]
) -> float:
    ## Calculate Recall@K
    
    if not relevant_ids:
        return 0.0
    
    relevant_set = set(relevant_ids)
    retrieved_set = set(retrieved_ids)
    
    relevant_retrieved = len(
        retrieved_set.intersection(relevant_set)
    )
    
    return relevant_retrieved / len(relevant_set)

def calculate_f1(
    precision: float,
    recall: float,
) -> float:
    """Calculate F1 score."""

    if precision + recall == 0:
        return 0.0

    return 2 * (precision * recall) / (precision + recall)


def calculate_mrr(
    retrieved_ids: list[int],
    relevant_ids: list[int],
) -> float:
    """Calculate Mean Reciprocal Rank for one query."""

    relevant_set = set(relevant_ids)

    for rank, chunk_id in enumerate(retrieved_ids, start=1):
        if chunk_id in relevant_set:
            return 1.0 / rank

    return 0.0


def calculate_retrieval_metrics(
    retrieved_ids: list[int],
    relevant_ids: list[int],
) -> dict[str, float]:
    """Calculate all retrieval metrics."""

    precision = calculate_precision(
        retrieved_ids, relevant_ids
    )

    recall = calculate_recall(
        retrieved_ids, relevant_ids
    )

    f1 = calculate_f1(precision, recall)

    mrr = calculate_mrr(
        retrieved_ids, relevant_ids
    )

    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "mrr": round(mrr, 4),
    }