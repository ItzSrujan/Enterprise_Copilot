import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessagesSquare,
  MessageSquarePlus,
  Search,
  Clock,
  Trash2,
  ArrowRight,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { conversationsApi } from '@/api/conversations';
import { Conversation } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function ConversationsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await conversationsApi.list();
      setConversations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    setDeletingId(id);
    try {
      await conversationsApi.delete(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete conversation.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = conversations.filter((c) =>
    (c.title || 'Untitled Conversation')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const currentRole = user?.role === 'admin' ? 'admin' : 'employee';
  const userName =
    user?.full_name ||
    (user?.email
      ? user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Employee');

  return (
    <DashboardLayout
      currentRole={currentRole}
      userName={userName}
      userEmail={user?.email || 'user@company.com'}
      onLogout={logout}
    >
      <div className="space-y-6 pb-12 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-surface-100 px-2.5 py-0.5 text-xs font-semibold text-surface-700">
                <MessagesSquare className="h-3.5 w-3.5 text-brand-600" />
                History
              </span>
              <span className="text-xs text-surface-400">&bull;</span>
              <span className="text-xs text-surface-500">
                {conversations.length} total saved
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
              My Conversations
            </h1>
            <p className="mt-1 text-xs text-surface-500">
              Review, resume, or manage previous Copilot Q&amp;A sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchConversations}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-300 bg-white px-3 py-2 text-xs font-semibold text-surface-700 shadow-xs hover:bg-surface-50 transition-colors"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/chat/new')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>New Conversation</span>
            </button>
          </div>
        </div>

        {/* Search Filter */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations by title or topic..."
            className="block w-full rounded-lg border border-surface-300 bg-white py-2.5 pl-10 pr-4 text-xs text-surface-900 placeholder:text-surface-400 transition-colors focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Error Loading Conversations</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchConversations}
              className="font-semibold text-rose-700 underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 rounded-lg border border-surface-200 bg-white p-4 shadow-xs animate-pulse flex items-center justify-between"
              >
                <div className="space-y-2 w-2/3">
                  <div className="h-4 w-1/3 bg-surface-200 rounded" />
                  <div className="h-3 w-1/4 bg-surface-150 rounded" />
                </div>
                <div className="h-8 w-16 bg-surface-150 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-surface-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-3">
              <MessagesSquare className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-surface-900">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </h3>
            <p className="mt-1 text-xs text-surface-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search keyword to find past conversation threads.'
                : 'Ask questions about company policies, SOPs, IT security, or support tickets.'}
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => navigate('/chat/new')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors shadow-xs"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span>Start New Chat</span>
              </button>
            </div>
          </div>
        ) : (
          /* Conversation List */
          <div className="rounded-xl border border-surface-200 bg-white divide-y divide-surface-100 shadow-xs overflow-hidden">
            {filtered.map((conv) => (
              <div
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className="group flex items-center justify-between p-4 cursor-pointer hover:bg-surface-50/80 transition-colors"
              >
                <div className="space-y-1 pr-4 min-w-0">
                  <h3 className="text-sm font-semibold text-surface-900 group-hover:text-brand-700 transition-colors truncate">
                    {conv.title || 'Untitled Conversation'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {conv.updated_at ? formatDate(conv.updated_at) : formatDate(conv.created_at)}
                    </span>
                    <span>&bull;</span>
                    <span>ID #{conv.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, conv.id)}
                    disabled={deletingId === conv.id}
                    title="Delete Conversation"
                    className="p-1.5 text-surface-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform pl-2">
                    <span>Open</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

