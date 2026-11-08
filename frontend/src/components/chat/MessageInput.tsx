import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<any>;
  loading: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  loading,
  placeholder = 'Ask a question or query policies, technical guides, SOPs...',
}) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [content]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || loading) return;

    const textToSend = content.trim();
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(textToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-xl border border-surface-300 bg-white p-2 shadow-sm transition-all focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        className="block w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-0 disabled:opacity-50"
      />

      <div className="flex items-center justify-between border-t border-surface-100 px-3 pt-2">
        <div className="flex items-center gap-2 text-[11px] text-surface-400">
          <span>
            Press <kbd className="rounded border border-surface-200 bg-surface-100 px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to send, <kbd className="rounded border border-surface-200 bg-surface-100 px-1 py-0.5 font-mono text-[10px]">Shift+Enter</kbd> for newline
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!content.trim() || loading}
          className="h-8 gap-1.5 px-3 text-xs"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <span>Ask Copilot</span>
              <Send className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

