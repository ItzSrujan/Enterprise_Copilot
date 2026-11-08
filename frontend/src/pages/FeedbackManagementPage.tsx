import { useState, useEffect, useCallback } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  AlertCircle,
  MessageSquare,
  Clock,
  User,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { feedbackApi } from '@/api/feedback';
import { AdminFeedbackRecord } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function FeedbackManagementPage() {
  const { user, logout } = useAuth();

  const [feedbackList, setFeedbackList] = useState<AdminFeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<'all' | 'positive' | 'negative'>('all');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await feedbackApi.list(filterRating === 'all' ? undefined : filterRating);
      setFeedbackList(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve feedback records.');
    } finally {
      setLoading(false);
    }
  }, [filterRating]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const positiveCount = feedbackList.filter((fb) => fb.rating === 'positive').length;
  const negativeCount = feedbackList.filter((fb) => fb.rating === 'negative').length;

  const userName =
    user?.full_name ||
    (user?.email
      ? user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Admin');

  return (
    <DashboardLayout
      currentRole="admin"
      userName={userName}
      userEmail={user?.email || 'admin@company.com'}
      onLogout={logout}
    >
      <div className="space-y-6 pb-12 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-surface-100 px-2.5 py-0.5 text-xs font-semibold text-surface-700">
                <ThumbsUp className="h-3.5 w-3.5 text-brand-600" />
                Response Grounding Audits
              </span>
              <span className="text-xs text-surface-400">&bull;</span>
              <span className="text-xs text-surface-500">
                {feedbackList.length} feedback entries
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
              User Feedback &amp; Quality
            </h1>
            <p className="mt-1 text-xs text-surface-500">
              Audit ratings and comments submitted by employees on Copilot answers to identify retrieval gaps.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchFeedback}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-300 bg-white px-3.5 py-2 text-xs font-semibold text-surface-700 shadow-xs hover:bg-surface-50 transition-colors self-start sm:self-auto"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Total Audited
            </span>
            <div className="mt-1 text-2xl font-bold text-surface-900 font-mono">
              {feedbackList.length}
            </div>
            <span className="text-[11px] text-surface-400">Total rated messages</span>
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Positive Ratings
            </span>
            <div className="mt-1 text-2xl font-bold text-emerald-700 font-mono">
              {positiveCount}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">Accurate grounding</span>
          </div>

          <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
              Negative Ratings
            </span>
            <div className="mt-1 text-2xl font-bold text-rose-700 font-mono">
              {negativeCount}
            </div>
            <span className="text-[11px] text-rose-600 font-medium">Review requested</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between border-b border-surface-200 pb-3">
          <div className="flex items-center gap-1.5 text-xs text-surface-500 font-medium">
            <Filter className="h-4 w-4 text-surface-400" />
            <span>Filter Rating:</span>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-surface-200 bg-surface-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterRating('all')}
              className={`rounded-md px-3 py-1.5 font-medium transition-all ${
                filterRating === 'all'
                  ? 'bg-white text-surface-900 font-semibold shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              All Feedback
            </button>
            <button
              type="button"
              onClick={() => setFilterRating('positive')}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 font-medium transition-all ${
                filterRating === 'positive'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <ThumbsUp className="h-3 w-3" />
              <span>Positive</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterRating('negative')}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 font-medium transition-all ${
                filterRating === 'negative'
                  ? 'bg-white text-rose-700 font-semibold shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <ThumbsDown className="h-3 w-3" />
              <span>Negative</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Failed to Load Feedback</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchFeedback}
              className="font-semibold text-rose-700 underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Feedback List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-surface-200 bg-white p-4 shadow-xs animate-pulse space-y-2"
              >
                <div className="h-4 w-1/3 bg-surface-200 rounded" />
                <div className="h-3 w-2/3 bg-surface-150 rounded" />
                <div className="h-3 w-1/2 bg-surface-150 rounded" />
              </div>
            ))}
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-3">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-surface-900">
              No feedback records found
            </h3>
            <p className="mt-1 text-xs text-surface-500 max-w-sm mx-auto">
              When employees rate Copilot responses in chat using thumbs up or down, their ratings and optional notes will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbackList.map((fb) => (
              <div
                key={fb.id}
                className="rounded-xl border border-surface-200 bg-white p-4 sm:p-5 shadow-xs hover:border-surface-300 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {fb.rating === 'positive' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <ThumbsUp className="h-3 w-3" /> Positive Rating
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">
                        <ThumbsDown className="h-3 w-3" /> Negative Rating
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-xs font-semibold text-surface-800">
                      <User className="h-3 w-3 text-surface-400" />
                      {fb.user_name || fb.user_email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(fb.created_at)}
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono text-[11px]">Msg #{fb.message_id}</span>
                  </div>
                </div>

                {fb.query_snippet && (
                  <div className="rounded-lg bg-surface-50 p-2.5 border border-surface-150 text-xs text-surface-800">
                    <span className="text-[10px] font-semibold uppercase text-surface-400 block mb-0.5">
                      Assistant Response Snippet
                    </span>
                    <p className="line-clamp-2 italic">
                      &ldquo;{fb.query_snippet}&rdquo;
                    </p>
                  </div>
                )}

                {fb.comment && (
                  <div className="rounded-lg bg-amber-50/70 p-2.5 border border-amber-200/80 text-xs text-amber-900">
                    <span className="text-[10px] font-semibold uppercase text-amber-700 block mb-0.5">
                      User Comment / Feedback Note
                    </span>
                    <p>{fb.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

