import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ConversationList } from '@/components/conversations/ConversationList';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { conversationsApi } from '@/api/conversations';
import { Conversation } from '@/types';
import { MessageSquare, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q');

  const parsedId =
    conversationId && conversationId !== 'new'
      ? parseInt(conversationId, 10)
      : null;

  const {
    messages,
    loading,
    sendMessage,
    submitFeedback,
    loadConversation,
    resetChat,
  } = useChat(parsedId);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const initialSentRef = useRef(false);

  const fetchConversations = useCallback(async () => {
    setConvLoading(true);
    try {
      const data = await conversationsApi.list();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setConvLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (parsedId && !isNaN(parsedId)) {
      loadConversation(parsedId);
    } else {
      resetChat();
    }
  }, [parsedId, loadConversation, resetChat]);

  const handleSend = async (question: string) => {
    const res = await sendMessage(question);
    if (res && res.conversation_id) {
      if (!parsedId || parsedId !== res.conversation_id) {
        navigate(`/chat/${res.conversation_id}`, { replace: true });
      }
      fetchConversations();
    }
    return res;
  };

  useEffect(() => {
    if (initialQuery && !initialSentRef.current && messages.length === 0) {
      initialSentRef.current = true;
      handleSend(initialQuery);
    }
  }, [initialQuery, messages.length]);

  const handleSelectConversation = (id: number) => {
    navigate(`/chat/${id}`);
  };

  const handleNewConversation = () => {
    resetChat();
    navigate('/chat/new');
  };

  const handleDeleteConversation = async (id: number) => {
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await conversationsApi.delete(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (parsedId === id) {
        handleNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const userName =
    user?.full_name ||
    (user?.email
      ? user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'User');

  return (
    <DashboardLayout
      currentRole={user?.role || 'employee'}
      userName={userName}
      userEmail={user?.email || ''}
      onLogout={logout}
    >
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-surface-200 bg-white shadow-2xs">
        {/* Conversations History Sidebar */}
        {sidebarOpen && (
          <div className="w-64 sm:w-72 shrink-0 border-r border-surface-200 bg-surface-50 flex flex-col transition-all">
            <div className="flex items-center justify-between border-b border-surface-200 px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-surface-700">
                <MessageSquare className="h-3.5 w-3.5 text-brand-600" />
                History ({conversations.length})
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded p-1 text-surface-400 hover:bg-surface-200 hover:text-surface-700 transition-colors"
                title="Collapse history"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversations}
                activeId={parsedId}
                onSelect={handleSelectConversation}
                onNew={handleNewConversation}
                onDelete={handleDeleteConversation}
                loading={convLoading}
              />
            </div>
          </div>
        )}

        {/* Chat Window Panel */}
        <div className="flex flex-1 flex-col overflow-hidden relative">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-md border border-surface-200 bg-white p-1.5 text-xs text-surface-600 shadow-xs hover:bg-surface-50 hover:text-surface-900 transition-colors"
              title="Show conversations"
            >
              <PanelLeftOpen className="h-4 w-4 text-brand-600" />
              <span className="text-[11px] font-medium hidden sm:inline">History</span>
            </button>
          )}

          <ChatWindow
            messages={messages}
            loading={loading}
            onSendMessage={handleSend}
            onFeedback={submitFeedback}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
