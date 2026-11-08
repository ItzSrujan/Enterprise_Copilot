import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCw,
  MessageSquare,
  Layers,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { documentsApi } from '@/api/documents';
import { DocumentItem } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function KnowledgeBasePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentsApi.list();
      setDocuments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents from knowledge base.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'policies', label: 'HR & Policies' },
    { id: 'troubleshooting', label: 'Payment & Ops' },
    { id: 'product_docs', label: 'Product & Architecture' },
    { id: 'faq', label: 'General FAQ' },
  ];

  const filtered = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all' || doc.document_type === selectedCategory;
    const matchesQuery =
      doc.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'processed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Indexed &amp; Searchable
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
            Ingestion Failed
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'policies':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'troubleshooting':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'product_docs':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'faq':
      default:
        return 'bg-surface-100 text-surface-700 border-surface-200';
    }
  };

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
      <div className="space-y-6 pb-12 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-surface-200 bg-surface-100 px-2.5 py-0.5 text-xs font-semibold text-surface-700">
                <BookOpen className="h-3.5 w-3.5 text-brand-600" />
                Verified Corpus
              </span>
              <span className="text-xs text-surface-400">&bull;</span>
              <span className="text-xs text-surface-500">
                {documents.filter((d) => d.status === 'completed').length} searchable documents
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
              Enterprise Knowledge Base
            </h1>
            <p className="mt-1 text-xs text-surface-500">
              Browse indexed organizational documentation, company policies, and support guides verified for RAG retrieval.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDocuments}
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
              <MessageSquare className="h-4 w-4" />
              <span>Ask Copilot</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge documents by title or topic..."
              className="block w-full rounded-lg border border-surface-300 bg-white py-2.5 pl-10 pr-4 text-xs text-surface-900 placeholder:text-surface-400 transition-colors focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-surface-900 text-white shadow-xs font-semibold'
                    : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Failed to Load Knowledge Base</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchDocuments}
              className="font-semibold text-rose-700 underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-36 rounded-xl border border-surface-200 bg-white p-5 shadow-xs animate-pulse space-y-3"
              >
                <div className="h-4 w-2/3 bg-surface-200 rounded" />
                <div className="h-3 w-1/3 bg-surface-150 rounded" />
                <div className="h-3 w-1/2 bg-surface-150 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-dashed border-surface-300 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-surface-900">
              {searchQuery || selectedCategory !== 'all'
                ? 'No matching documents found'
                : 'No documents in knowledge base'}
            </h3>
            <p className="mt-1 text-xs text-surface-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try clearing your filters or searching with different keywords.'
                : 'Knowledge documents uploaded by administrators will appear here once indexed.'}
            </p>
          </div>
        ) : (
          /* Documents Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="group flex flex-col justify-between rounded-xl border border-surface-200 bg-white p-5 shadow-xs hover:border-brand-300 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${getCategoryBadge(
                        doc.document_type
                      )}`}
                    >
                      {doc.document_type.replace('_', ' ')}
                    </span>
                    {getStatusBadge(doc.status)}
                  </div>

                  <div className="mt-3 flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-100 text-brand-600 group-hover:bg-brand-50 transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-surface-900 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
                        {doc.file_name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-surface-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Layers className="h-3 w-3" />
                          {doc.chunk_count} chunks
                        </span>
                        <span>&bull;</span>
                        <span>{formatDate(doc.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-surface-400">
                    Doc #{doc.id}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/chat/new?q=${encodeURIComponent(
                          `What information is covered in ${doc.file_name}?`
                        )}`
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors"
                  >
                    <span>Ask about doc</span>
                    <MessageSquare className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

