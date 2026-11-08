import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MessageSquarePlus,
  ArrowRight,
  Clock,
  BookOpen,
  FileText,
  MessagesSquare,
  ChevronRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { sampleEmployeeData } from '@/utils/dashboard-data';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { conversationsApi } from '@/api/conversations';
import { documentsApi } from '@/api/documents';
import { Conversation, DocumentItem } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(true);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);

  useEffect(() => {
    conversationsApi
      .list()
      .then(setConversations)
      .catch(() => setConversations([]))
      .finally(() => setConvLoading(false));

    documentsApi
      .list()
      .then(setDocuments)
      .catch(() => setDocuments([]))
      .finally(() => setDocsLoading(false));
  }, []);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/chat/new?q=${encodeURIComponent(query)}`);
  };

  const handleQuestionClick = (q: string) => {
    navigate(`/chat/new?q=${encodeURIComponent(q)}`);
  };

  const userName =
    user?.full_name ||
    (user?.email
      ? user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Employee');

  const completedDocs = documents.filter((d) => d.status === 'completed' || d.status === 'processed');

  return (
    <DashboardLayout
      currentRole="employee"
      userName={userName}
      userEmail={user?.email || 'employee@company.com'}
      onLogout={logout}
    >
      <div className="space-y-6 pb-12">
        {/* 1. Welcome & Search Hero */}
        <div className="relative overflow-hidden rounded-xl border border-surface-200 bg-gradient-to-b from-white to-surface-50 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Enterprise Grounded RAG
                </span>
                <span className="text-xs text-surface-400">&bull;</span>
                <span className="text-xs font-medium text-surface-500">
                  {completedDocs.length} Verified Documents Indexed
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-surface-900 sm:text-3xl">
                Welcome back, {userName}
              </h1>
              <p className="mt-1 text-sm text-surface-600 max-w-2xl">
                Ask questions across verified company SOPs, HR handbooks, IT security guides, and support resolution playbooks with exact source citations.
              </p>
            </div>

            {/* Prominent New Conversation CTA */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => navigate('/chat/new')}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span>Start New Conversation</span>
              </button>
            </div>
          </div>

          {/* Search / Question Prompt Bar */}
          <form onSubmit={handleAskSubmit} className="mt-6">
            <div className="relative rounded-lg border border-surface-300 bg-white shadow-xs focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-surface-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything (e.g. What is the SLA for UPI transaction reversal? How to request parental leave?)"
                className="block w-full rounded-lg border-0 py-3.5 pl-11 pr-28 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none"
              />
              <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
                >
                  <span>Ask Copilot</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 2. Suggested Questions Grid */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-surface-900">
                Suggested Questions
              </h2>
              <p className="text-xs text-surface-500">
                Common queries with verified citations ready for instant answers
              </p>
            </div>
            <span className="text-xs text-surface-400">
              {sampleEmployeeData.suggestedQuestions.length} curated prompts
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sampleEmployeeData.suggestedQuestions.map((sq) => (
              <button
                key={sq.id}
                type="button"
                onClick={() => handleQuestionClick(sq.question)}
                className="group flex flex-col justify-between rounded-lg border border-surface-200 bg-white p-4 text-left shadow-xs transition-all hover:border-brand-300 hover:shadow-sm"
              >
                <div>
                  <span className="inline-block rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 uppercase tracking-wider">
                    {sq.category}
                  </span>
                  <h3 className="mt-2 text-xs font-semibold text-surface-900 group-hover:text-brand-700 leading-snug">
                    {sq.question}
                  </h3>
                  <p className="mt-1 text-[11px] text-surface-500 line-clamp-2">
                    {sq.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-brand-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Ask this query</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Two Columns: Recent Conversations & Quick Knowledge Base */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Conversations */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessagesSquare className="h-4 w-4 text-surface-600" />
                <h2 className="text-base font-semibold text-surface-900">
                  Recent Conversations
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/conversations')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                View All ({conversations.length}) &rarr;
              </button>
            </div>

            <div className="rounded-lg border border-surface-200 bg-white divide-y divide-surface-100 shadow-xs overflow-hidden">
              {convLoading ? (
                <div className="p-8 text-center text-xs text-surface-500">
                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent mb-2" />
                  <span>Loading your conversations...</span>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-surface-500 space-y-2">
                  <p>No conversations yet.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/chat/new')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>Start your first chat</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                conversations.slice(0, 5).map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => navigate(`/chat/${conv.id}`)}
                    className="group flex items-start justify-between p-4 cursor-pointer hover:bg-surface-50/80 transition-colors"
                  >
                    <div className="space-y-1 pr-4 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] text-surface-400">
                          <Clock className="h-3 w-3" />
                          {conv.updated_at ? formatDate(conv.updated_at) : formatDate(conv.created_at)}
                        </span>
                        <span className="text-[11px] text-surface-400">
                          &bull; ID #{conv.id}
                        </span>
                      </div>

                      <h3 className="text-xs font-semibold text-surface-900 group-hover:text-brand-700 truncate">
                        {conv.title || 'Untitled Conversation'}
                      </h3>
                    </div>

                    <div className="shrink-0 self-center">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-surface-200 bg-surface-50 text-surface-400 group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Knowledge Base Access */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-surface-600" />
                <h2 className="text-base font-semibold text-surface-900">
                  Knowledge Base
                </h2>
              </div>
              <span className="text-xs text-surface-400">
                {completedDocs.length} Indexed
              </span>
            </div>

            <div className="rounded-lg border border-surface-200 bg-white p-3 space-y-2 shadow-xs">
              {docsLoading ? (
                <div className="p-6 text-center text-xs text-surface-500">
                  <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent mb-2" />
                  <span>Loading verified documents...</span>
                </div>
              ) : completedDocs.length === 0 ? (
                <div className="p-6 text-center text-xs text-surface-500">
                  No documents in knowledge base yet.
                </div>
              ) : (
                completedDocs.slice(0, 4).map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() =>
                      navigate(
                        `/chat/new?q=${encodeURIComponent(
                          `What are the key points in ${doc.file_name}?`
                        )}`
                      )
                    }
                    className="group flex items-start justify-between rounded-md border border-surface-150 p-2.5 hover:border-surface-300 hover:bg-surface-50/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-100 text-surface-600 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-surface-900 group-hover:text-brand-700 leading-snug truncate">
                          {doc.file_name}
                        </h4>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-surface-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Layers className="h-3 w-3" />
                            {doc.chunk_count} chunks
                          </span>
                          <span>&bull;</span>
                          <span className="capitalize">{doc.document_type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/knowledge')}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-surface-200 bg-surface-50 py-2 text-xs font-semibold text-surface-700 hover:bg-surface-100 hover:text-surface-900 transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Browse All Knowledge Docs</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
