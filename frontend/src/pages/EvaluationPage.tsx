import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, AlertCircle, BarChart3, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { evaluationApi } from '@/api/evaluation';
import { EvaluationItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function EvaluationPage() {
  const { user, logout } = useAuth();
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [running, setRunning] = useState(false);

  // Form states for test execution
  const [testQuery, setTestQuery] = useState('');
  const [groundTruth, setGroundTruth] = useState('');
  const [runError, setRunError] = useState<string | null>(null);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const data = await evaluationApi.list(0, 50);
      setEvaluations(data);
    } catch (err: any) {
      console.error('Failed to load evaluation history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleRunEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuestion = testQuery.trim();
    if (!trimmedQuestion || trimmedQuestion.length < 3) {
      setRunError('Question must be at least 3 characters long.');
      return;
    }

    setRunning(true);
    setRunError(null);

    try {
      await evaluationApi.run({
        question: trimmedQuestion,
        expected_answer: groundTruth.trim() || undefined,
        relevant_chunk_ids: [],
      });
      setIsRunModalOpen(false);
      setTestQuery('');
      setGroundTruth('');
      fetchEvaluations();
    } catch (err: any) {
      setRunError(err.message || 'Failed to execute evaluation pipeline benchmark.');
    } finally {
      setRunning(false);
    }
  };

  const userName =
    user?.full_name ||
    (user?.email
      ? user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Admin');

  // Compute aggregate averages if evaluations exist
  const completedEvals = evaluations.filter((e) => e.status === 'completed');
  const avgFaithfulness =
    completedEvals.length > 0
      ? completedEvals.reduce((acc, curr) => {
          const val = curr.metrics?.generation?.faithfulness ?? 0;
          return acc + val;
        }, 0) / completedEvals.length
      : null;

  const avgRelevance =
    completedEvals.length > 0
      ? completedEvals.reduce((acc, curr) => {
          const val = curr.metrics?.generation?.answer_relevance ?? 0;
          return acc + val;
        }, 0) / completedEvals.length
      : null;

  const avgPrecision =
    completedEvals.length > 0
      ? completedEvals.reduce((acc, curr) => {
          const val = curr.metrics?.retrieval?.precision ?? 0;
          return acc + val;
        }, 0) / completedEvals.length
      : null;

  const avgRecall =
    completedEvals.length > 0
      ? completedEvals.reduce((acc, curr) => {
          const val = curr.metrics?.retrieval?.recall ?? 0;
          return acc + val;
        }, 0) / completedEvals.length
      : null;

  return (
    <DashboardLayout
      currentRole={user?.role || 'admin'}
      userName={userName}
      userEmail={user?.email || ''}
      onLogout={logout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-brand-600" />
              RAG Evaluation &amp; Benchmarks
            </h1>
            <p className="mt-1 text-xs text-surface-500">
              Measure retrieval precision, recall, faithfulness, and answer relevance via FastAPI evaluator.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEvaluations}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setRunError(null);
                setIsRunModalOpen(true);
              }}
              className="gap-1.5 text-xs"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Run Benchmark Test
            </Button>
          </div>
        </div>

        {/* Evaluation Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-500">
              Faithfulness
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-surface-900 font-mono">
                {avgFaithfulness != null ? `${(avgFaithfulness * 100).toFixed(1)}%` : 'N/A'}
              </span>
              <span className={`text-xs font-semibold ${avgFaithfulness != null ? 'text-emerald-600' : 'text-surface-400'}`}>
                {avgFaithfulness != null ? 'Benchmark Active' : 'No Runs Yet'}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-surface-400">
              Factual consistency against retrieved context chunks.
            </p>
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-500">
              Answer Relevance
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-surface-900 font-mono">
                {avgRelevance != null ? `${(avgRelevance * 100).toFixed(1)}%` : 'N/A'}
              </span>
              <span className={`text-xs font-semibold ${avgRelevance != null ? 'text-emerald-600' : 'text-surface-400'}`}>
                {avgRelevance != null ? 'Benchmark Active' : 'No Runs Yet'}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-surface-400">
              Semantic alignment with user question and intent.
            </p>
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-500">
              Context Precision
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-surface-900 font-mono">
                {avgPrecision != null ? `${(avgPrecision * 100).toFixed(1)}%` : 'N/A'}
              </span>
              <span className={`text-xs font-semibold ${avgPrecision != null ? 'text-emerald-600' : 'text-surface-400'}`}>
                {avgPrecision != null ? 'Benchmark Active' : 'No Runs Yet'}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-surface-400">
              Precision of hybrid dense + BM25 retrieved sources.
            </p>
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-500">
              Context Recall
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-surface-900 font-mono">
                {avgRecall != null ? `${(avgRecall * 100).toFixed(1)}%` : 'N/A'}
              </span>
              <span className={`text-xs font-semibold ${avgRecall != null ? 'text-emerald-600' : 'text-surface-400'}`}>
                {avgRecall != null ? 'Benchmark Active' : 'No Runs Yet'}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-surface-400">
              Completeness of evidence retrieved from database.
            </p>
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-xl border border-surface-200 bg-white shadow-2xs overflow-hidden">
          <div className="border-b border-surface-200 bg-surface-50 px-4 py-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-700">
              Evaluation Run History ({evaluations.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            </div>
          ) : evaluations.length === 0 ? (
            <div className="p-8 text-center text-xs text-surface-500">
              No evaluation tests recorded yet. Click "Run Benchmark Test" to benchmark RAG responses.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-surface-200 bg-surface-50 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
                  <tr>
                    <th className="py-2.5 px-4">ID</th>
                    <th className="py-2.5 px-4">Question</th>
                    <th className="py-2.5 px-4">Faithfulness</th>
                    <th className="py-2.5 px-4">Relevance</th>
                    <th className="py-2.5 px-4">Precision</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Executed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {evaluations.map((item) => {
                    const faithfulness = item.metrics?.generation?.faithfulness;
                    const relevance = item.metrics?.generation?.answer_relevance;
                    const precision = item.metrics?.retrieval?.precision;
                    const isSuccess = item.status === 'completed';

                    return (
                      <tr key={item.id} className="hover:bg-surface-50/60">
                        <td className="py-2.5 px-4 font-mono font-medium text-surface-500">
                          #{item.id}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-surface-900 max-w-xs truncate" title={item.question}>
                          {item.question}
                        </td>
                        <td className="py-2.5 px-4 font-mono">
                          {faithfulness != null ? `${(faithfulness * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="py-2.5 px-4 font-mono">
                          {relevance != null ? `${(relevance * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="py-2.5 px-4 font-mono">
                          {precision != null ? `${(precision * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                              isSuccess
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isSuccess ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-surface-400 text-[11px]">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Run Modal */}
        <Modal
          isOpen={isRunModalOpen}
          onClose={() => setIsRunModalOpen(false)}
          title="Run RAG Pipeline Benchmark"
          size="md"
        >
          <form onSubmit={handleRunEvaluation} className="space-y-4">
            {runError && (
              <div className="flex items-center gap-2 rounded border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{runError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Evaluation Test Question (min. 3 characters)
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="e.g. What is the process for submitting hardware reimbursement?"
                className="w-full rounded-md border border-surface-300 py-2 px-3 text-xs text-surface-900 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1">
                Expected Answer (Optional)
              </label>
              <textarea
                rows={3}
                value={groundTruth}
                onChange={(e) => setGroundTruth(e.target.value)}
                placeholder="Expected factual answer to evaluate generation against..."
                className="w-full rounded-md border border-surface-300 py-2 px-3 text-xs text-surface-900 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRunModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={testQuery.trim().length < 3 || running}
                loading={running}
              >
                Execute Benchmark
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
