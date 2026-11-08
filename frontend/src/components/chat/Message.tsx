import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Sparkles } from 'lucide-react';
import { Message as MessageType, FeedbackRating } from '@/types';
import { SourceList } from './SourceList';
import { FeedbackButtons } from '../feedback/FeedbackButtons';

interface MessageProps {
  message: MessageType;
  onFeedback?: (messageId: number, rating: FeedbackRating, comment?: string) => Promise<void>;
}

export const Message: React.FC<MessageProps> = ({ message, onFeedback }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={`flex w-full gap-3 py-4 px-4 sm:px-6 transition-colors ${
        isAssistant ? 'bg-surface-50/60 border-y border-surface-200/60' : 'bg-white'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg text-xs font-semibold shadow-2xs ${
          isAssistant
            ? 'bg-brand-600 text-white shadow-brand-200'
            : 'bg-surface-200 text-surface-700'
        }`}
      >
        {isAssistant ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
          <span className="font-semibold text-surface-900">
            {isAssistant ? 'Enterprise Copilot' : 'You'}
          </span>
          {message.created_at && (
            <span className="text-[11px] text-surface-400">
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {/* Message body */}
        {isAssistant ? (
          <div className="prose-assistant text-sm text-surface-800 leading-relaxed break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-surface-800 leading-relaxed">
            {message.content}
          </p>
        )}

        {/* Citations badges if present */}
        {isAssistant && message.citations && message.citations.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-surface-400">
              Verified Citations:
            </span>
            {message.citations.map((c, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded bg-brand-50 border border-brand-200 px-1.5 py-0.5 text-[10px] font-mono font-bold text-brand-700 shadow-2xs"
              >
                {typeof c === 'string' ? c : (c as any).source_id || JSON.stringify(c)}
              </span>
            ))}
          </div>
        )}

        {/* Sources / Citations */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <SourceList sources={message.sources} />
        )}

        {/* Feedback footer for assistant responses */}
        {isAssistant && onFeedback && (
          <div className="mt-3 flex items-center justify-between border-t border-surface-200/60 pt-2 text-xs">
            <span className="text-[11px] text-surface-400">
              Responses are grounded on verified organizational knowledge.
            </span>
            <FeedbackButtons
              messageId={message.id}
              onFeedback={async (rating, comment) => {
                await onFeedback(message.id, rating, comment);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

