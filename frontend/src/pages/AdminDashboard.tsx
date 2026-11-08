import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files,
  FileCheck2,
  FileX2,
  Users,
  UploadCloud,
  Play,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Layers,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import {
  IngestionBarChart,
  CategoryDistributionCard,
  CategoryBreakdownData,
  MonthlyIngestionData,
} from '@/components/dashboard/DashboardCharts';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { DocumentItem, AdminStatsData, EvaluationItem, AdminFeedbackRecord } from '@/types';
import { documentsApi } from '@/api/documents';
import { evaluationApi } from '@/api/evaluation';
import { feedbackApi } from '@/api/feedback';
import { formatDate } from '@/utils/helpers';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [feedbackList, setFeedbackList] = useState<AdminFeedbackRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, evalData, fbData] = await Promise.all([
        documentsApi.getStats().catch(() => null),
        evaluationApi.list(0, 5).catch(() => []),
        feedbackApi.list().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setEvaluations(evalData || []);
      setFeedbackList(fbData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const recentDocs = stats?.recent_documents || [];
  const filteredUploads =
    filterStatus === 'all'
      ? recentDocs
      : recentDocs.filter((item) => item.status === filterStatus);

  // Compute real Category Breakdown
  const totalCategoryDocs = stats?.total_documents || 0;
  const categoryBreakdown: CategoryBreakdownData[] = (stats?.category_distribution || []).map((cat) => ({
    category: cat.category.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    count: cat.count,
    percentage: totalCategoryDocs > 0 ? Math.round((cat.count / totalCategoryDocs) * 100) : 0,
  }));

  // Compute real monthly ingestion from actual uploaded documents
  const monthlyDataMap: Record<string, { count: number; chunks: number }> = {};
  for (const doc of recentDocs) {
    const month = new Date(doc.created_at).toLocaleString('default', { month: 'short' });
    if (!monthlyDataMap[month]) {
      monthlyDataMap[month] = { count: 0, chunks: 0 };
    }
    monthlyDataMap[month].count += 1;
    monthlyDataMap[month].chunks += doc.chunk_count || 0;
  }
  const monthlyIngestionTrend: MonthlyIngestionData[] = Object.entries(monthlyDataMap).map(
    ([month, vals]) => ({
      month,
      count: vals.count,
      chunks: vals.chunks,
    })
  );

  const latestEval = evaluations.length > 0 ? evaluations[0] : null;
  const latestMetrics = latestEval?.metrics || {};
  const retrievalMetrics = latestMetrics.retrieval || {};
  const generationMetrics = latestMetrics.generation || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'processed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Processed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 animate-pulse">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
      case 'failed':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
    }
  };

  const userName =
    user?.full_name ||
    (user?.email
      ? user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Admin User');

  return (
    <DashboardLayout
      currentRole="admin"
      userName={userName}
      userEmail={user?.email || 'admin@company.com'}
      onLogout={logout}
    >
      <div className="space-y-6 pb-12">
        {/* 1. Header Banner & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-surface-100 px-2.5 py-0.5 text-xs font-semibold text-surface-700">
                Admin Control Plane
              </span>
              <span className="text-xs text-surface-400">&bull;</span>
              <span className="text-xs text-surface-500">
                Corpus: PostgreSQL pgvector + BM25 Hybrid
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
              Knowledge &amp; RAG Administration
            </h1>
            <p className="mt-1 text-xs text-surface-500">
              Live telemetry on document ingestion pipelines, hybrid retrieval health, LLM evaluation benchmarks, and user feedback.
            </p>
          </div>

          {/* Quick Admin Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/admin/documents')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Document</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/evaluation')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-300 bg-white px-3.5 py-2 text-xs font-semibold text-surface-700 shadow-xs hover:bg-surface-50 transition-colors"
            >
              <Play className="h-3.5 w-3.5 text-brand-600" />
              <span>Run Benchmark</span>
            </button>
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-300 bg-white px-3.5 py-2 text-xs font-semibold text-surface-700 shadow-xs hover:bg-surface-50 transition-colors"
            >
              <RotateCw className={`h-3.5 w-3.5 text-surface-500 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Failed to Refresh Live Stats</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchDashboardData}
              className="font-semibold text-rose-700 underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* 2. Real KPI Cards from Database */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Documents"
            value={stats ? stats.total_documents : 0}
            badge="Corpus"
            change={stats ? `${stats.total_chunks.toLocaleString()} chunks embedded` : '0 chunks'}
            changeType="neutral"
            subtitle="Uploaded enterprise files"
            icon={<Files className="h-5 w-5 text-brand-600" />}
          />
          <StatCard
            title="Processed Documents"
            value={stats ? stats.processed_documents : 0}
            badge="Success"
            change="Ready for retrieval"
            changeType="positive"
            subtitle="Indexed in pgvector & BM25"
            icon={<FileCheck2 className="h-5 w-5 text-emerald-600" />}
          />
          <StatCard
            title="Failed Documents"
            value={stats ? stats.failed_documents : 0}
            badge={stats && stats.failed_documents > 0 ? 'Requires Review' : 'All Clear'}
            change={stats && stats.failed_documents > 0 ? `${stats.failed_documents} failed` : '0 errors'}
            changeType={stats && stats.failed_documents > 0 ? 'negative' : 'neutral'}
            subtitle={stats && stats.failed_documents > 0 ? 'Review ingestion logs' : 'Clean ingestion state'}
            icon={<FileX2 className="h-5 w-5 text-rose-600" />}
          />
          <StatCard
            title="Total Registered Users"
            value={stats ? stats.total_users : 0}
            badge="Active"
            change="Admin & Employee roles"
            changeType="positive"
            subtitle="Verified system accounts"
            icon={<Users className="h-5 w-5 text-indigo-600" />}
          />
        </div>

        {/* 3. Document Ingestion Overview (Bar Chart + Category Breakdown) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <IngestionBarChart
              data={monthlyIngestionTrend}
              totalChunks={stats ? stats.total_chunks : 0}
            />
          </div>
          <div>
            <CategoryDistributionCard data={categoryBreakdown} />
          </div>
        </div>

        {/* 4. Recent Document Uploads & Processing Status Table */}
        <div className="rounded-lg border border-surface-200 bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-surface-200 p-4 sm:px-6 gap-3">
            <div>
              <h2 className="text-sm font-semibold text-surface-900">
                Recent Document Uploads &amp; Processing Status
              </h2>
              <p className="text-xs text-surface-500">
                Real status of uploaded PDFs, chunk generation, and embedding pipeline
              </p>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 rounded-md border border-surface-200 bg-surface-50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`rounded px-2.5 py-1 font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white text-surface-900 font-semibold shadow-xs'
                    : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                All ({recentDocs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('completed')}
                className={`rounded px-2.5 py-1 font-medium transition-all ${
                  filterStatus === 'completed'
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                Completed ({recentDocs.filter((d) => d.status === 'completed').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('processing')}
                className={`rounded px-2.5 py-1 font-medium transition-all ${
                  filterStatus === 'processing'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                Processing ({recentDocs.filter((d) => d.status === 'processing').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('failed')}
                className={`rounded px-2.5 py-1 font-medium transition-all ${
                  filterStatus === 'failed'
                    ? 'bg-white text-rose-700 font-semibold shadow-xs'
                    : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                Failed ({recentDocs.filter((d) => d.status === 'failed').length})
              </button>
            </div>
          </div>

          {/* Uploads Table */}
          <div className="overflow-x-auto">
            {filteredUploads.length === 0 ? (
              <div className="p-8 text-center text-xs text-surface-500">
                No document uploads found.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-surface-150 bg-surface-50 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
                  <tr>
                    <th className="px-6 py-3">Document Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Chunks</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {filteredUploads.map((doc) => (
                    <tr key={doc.id} className="hover:bg-surface-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-surface-900">
                        <div className="flex items-center gap-2">
                          <Files className="h-4 w-4 text-surface-400 shrink-0" />
                          <span>{doc.file_name}</span>
                        </div>
                        {doc.error_message && (
                          <p className="mt-1 text-[11px] text-rose-600 font-normal">
                            Error: {doc.error_message}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded bg-surface-100 px-2 py-0.5 text-[10px] font-medium capitalize text-surface-600">
                          {doc.document_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{getStatusBadge(doc.status)}</td>
                      <td className="px-4 py-3.5 font-mono text-surface-700">
                        {doc.chunk_count > 0 ? doc.chunk_count : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-surface-500">{formatDate(doc.created_at)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => navigate('/admin/documents')}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                        >
                          Manage &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 5. RAG Evaluation Overview & Benchmarks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-surface-900">
                RAG Evaluation &amp; Accuracy Metrics
              </h2>
              <p className="text-xs text-surface-500">
                Live offline &amp; online evaluation scores across Hybrid Retrieval and Cross-Encoder Reranking
              </p>
            </div>
            {latestEval && (
              <button
                type="button"
                onClick={() => navigate('/admin/evaluation')}
                className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
              >
                View History ({evaluations.length} runs) &rarr;
              </button>
            )}
          </div>

          {evaluations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-300 bg-white p-8 text-center shadow-xs">
              <BarChart3 className="mx-auto h-8 w-8 text-surface-400 mb-2" />
              <h3 className="text-sm font-semibold text-surface-900">No evaluation records found</h3>
              <p className="mt-1 text-xs text-surface-500 max-w-sm mx-auto">
                No benchmarks have been run yet. Execute a benchmark test to compute precision, recall, faithfulness, and answer relevance.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/evaluation')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Run Benchmark Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              <div className="rounded-lg border border-surface-200 bg-white p-3 text-center shadow-xs">
                <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
                  Precision
                </span>
                <div className="mt-1 text-lg font-bold text-surface-900 font-mono">
                  {retrievalMetrics.precision != null
                    ? `${(retrievalMetrics.precision * 100).toFixed(1)}%`
                    : 'N/A'}
                </div>
                <span className="text-[10px] text-surface-400 font-medium">Retrieval Quality</span>
              </div>
              <div className="rounded-lg border border-surface-200 bg-white p-3 text-center shadow-xs">
                <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
                  Recall
                </span>
                <div className="mt-1 text-lg font-bold text-surface-900 font-mono">
                  {retrievalMetrics.recall != null
                    ? `${(retrievalMetrics.recall * 100).toFixed(1)}%`
                    : 'N/A'}
                </div>
                <span className="text-[10px] text-surface-400 font-medium">Coverage</span>
              </div>
              <div className="rounded-lg border border-surface-200 bg-white p-3 text-center shadow-xs">
                <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
                  MRR
                </span>
                <div className="mt-1 text-lg font-bold text-surface-900 font-mono">
                  {retrievalMetrics.mrr != null
                    ? Number(retrievalMetrics.mrr).toFixed(3)
                    : 'N/A'}
                </div>
                <span className="text-[10px] text-surface-400 font-medium">Mean Reciprocal Rank</span>
              </div>
              <div className="rounded-lg border border-surface-200 bg-white p-3 text-center shadow-xs">
                <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
                  Faithfulness
                </span>
                <div className="mt-1 text-lg font-bold text-emerald-700 font-mono">
                  {generationMetrics.faithfulness != null
                    ? `${(generationMetrics.faithfulness * 100).toFixed(1)}%`
                    : 'N/A'}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">Grounding Verified</span>
              </div>
              <div className="rounded-lg border border-surface-200 bg-white p-3 text-center shadow-xs">
                <span className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider">
                  Relevance
                </span>
                <div className="mt-1 text-lg font-bold text-brand-700 font-mono">
                  {generationMetrics.answer_relevance != null
                    ? `${(generationMetrics.answer_relevance * 100).toFixed(1)}%`
                    : 'N/A'}
                </div>
                <span className="text-[10px] text-brand-600 font-medium">Query Alignment</span>
              </div>
            </div>
          )}
        </div>

        {/* 6. Recent User Feedback Section */}
        <div className="rounded-lg border border-surface-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-surface-200 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-surface-900">
                Recent End-User Feedback
              </h3>
              <p className="text-xs text-surface-500">
                Audited thumbs up / thumbs down ratings on Copilot responses
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/feedback')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800"
            >
              View All ({feedbackList.length}) &rarr;
            </button>
          </div>

          {feedbackList.length === 0 ? (
            <div className="py-6 text-center text-xs text-surface-500">
              No user feedback records submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackList.slice(0, 3).map((fb) => (
                <div
                  key={fb.id}
                  className="flex items-start justify-between rounded-lg border border-surface-200 p-3.5 hover:bg-surface-50/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {fb.rating === 'positive' ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          <ThumbsUp className="h-3 w-3" /> Positive Rating
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
                          <ThumbsDown className="h-3 w-3" /> Negative Rating
                        </span>
                      )}
                      <span className="text-xs font-semibold text-surface-800">
                        {fb.user_name || fb.user_email}
                      </span>
                      <span className="text-xs text-surface-400">&bull;</span>
                      <span className="text-xs text-surface-400">{formatDate(fb.created_at)}</span>
                    </div>

                    {fb.query_snippet && (
                      <p className="text-xs font-medium text-surface-900 italic">
                        &ldquo;{fb.query_snippet}&rdquo;
                      </p>
                    )}

                    {fb.comment && (
                      <p className="text-xs text-surface-600 italic bg-surface-50 rounded p-2 border border-surface-200/60">
                        Note: {fb.comment}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[11px] font-mono text-surface-400">
                      Msg #{fb.message_id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
