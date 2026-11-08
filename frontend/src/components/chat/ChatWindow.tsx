import React, { useRef, useEffect } from 'react';
import { Sparkles, HelpCircle, Loader2 } from 'lucide-react';
import { Message as MessageType, FeedbackRating } from '@/types';
import { Message } from './Message';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  messages: MessageType[];
  loading: boolean;
  onSendMessage: (question: string) => Promise<any>;
  onFeedback?: (messageId: number, rating: FeedbackRating, comment?: string) => Promise<void>;
  suggestedQuestions?: string[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  loading,
  onSendMessage,
  onFeedback,
  suggestedQuestions = [
    'What is our enterprise remote work and equipment policy?',
    'How do I file an expense report for business travel?',
    'What are the SLAs for Tier 1 vs Tier 2 support incidents?',
    'Explain the protocol for incident response and customer escalation.',
  ],
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 shadow-sm">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-surface-900">
              Enterprise Knowledge Copilot
            </h2>
            <p className="mt-2 text-xs text-surface-500 max-w-md leading-relaxed">
              Ask any question to retrieve verified organizational knowledge. All answers are grounded with citations from indexed company documents.
            </p>

            {suggestedQuestions && suggestedQuestions.length > 0 && (
              <div className="mt-8 w-full text-left">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-surface-400 mb-3">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Suggested Questions
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onSendMessage(q)}
                      disabled={loading}
                      className="group flex flex-col justify-between rounded-lg border border-surface-200 bg-surface-50/50 p-3 text-left transition-all hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-xs"
                    >
                      <span className="text-xs font-medium text-surface-700 group-hover:text-brand-900">
                        "{q}"
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {messages.map((m) => (
              <Message key={m.id} message={m} onFeedback={onFeedback} />
            ))}

            {loading && (
              <div className="flex w-full gap-3 bg-surface-50/60 py-4 px-4 sm:px-6 border-y border-surface-200/60 animate-pulse">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-surface-900">
                      Enterprise Copilot
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-brand-600 font-medium">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Retrieving &amp; verifying citations...
                    </span>
                  </div>
                  <div className="h-4 w-3/4 rounded bg-surface-200/70" />
                  <div className="h-4 w-1/2 rounded bg-surface-200/50" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Floating Input Area */}
      <div className="border-t border-surface-200 bg-surface-50/50 p-4">
        <div className="mx-auto max-w-3xl">
          <MessageInput onSendMessage={onSendMessage} loading={loading} />
        </div>
      </div>
    </div>
  );
};

