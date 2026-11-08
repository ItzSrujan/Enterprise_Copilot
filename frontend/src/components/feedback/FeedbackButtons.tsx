import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check, MessageSquare, Send, X } from 'lucide-react';
import { FeedbackRating } from '@/types';

interface FeedbackButtonsProps {
  messageId: number;
  existingRating?: FeedbackRating;
  onFeedback: (rating: FeedbackRating, comment?: string) => Promise<void>;
}

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  messageId,
  existingRating,
  onFeedback,
}) => {
  const [currentRating, setCurrentRating] = useState<FeedbackRating | undefined>(
    existingRating
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');

  const handleRate = async (rating: FeedbackRating) => {
    if (submitting || currentRating === rating) return;
    setSubmitting(true);
    try {
      await onFeedback(rating, comment.trim() || undefined);
      setCurrentRating(rating);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    } catch (err) {
      console.error('Failed to submit feedback for message', messageId, err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRating || submitting) return;
    setSubmitting(true);
    try {
      await onFeedback(currentRating, comment.trim() || undefined);
      setShowCommentBox(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    } catch (err) {
      console.error('Failed to submit feedback comment', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center gap-1.5 text-surface-400">
      <button
        type="button"
        onClick={() => handleRate('positive')}
        disabled={submitting}
        title="Positive feedback: Accurate & helpful"
        className={`rounded p-1 transition-colors hover:bg-surface-100 ${
          currentRating === 'positive'
            ? 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-300'
            : 'hover:text-surface-600'
        }`}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => handleRate('negative')}
        disabled={submitting}
        title="Negative feedback: Inaccurate or unhelpful"
        className={`rounded p-1 transition-colors hover:bg-surface-100 ${
          currentRating === 'negative'
            ? 'text-rose-600 bg-rose-50 ring-1 ring-rose-300'
            : 'hover:text-surface-600'
        }`}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>

      {currentRating && !showCommentBox && (
        <button
          type="button"
          onClick={() => setShowCommentBox(true)}
          className="rounded p-1 text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
          title="Add detailed feedback comment"
        >
          <MessageSquare className="h-3 w-3" />
        </button>
      )}

      {submitted && (
        <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 ml-1 animate-in fade-in">
          <Check className="h-3 w-3" />
          Feedback recorded
        </span>
      )}

      {/* Inline Comment Popover */}
      {showCommentBox && (
        <div className="absolute right-0 bottom-7 z-20 w-64 rounded-lg border border-surface-200 bg-white p-2.5 shadow-lg animate-in fade-in">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-surface-700">
              Provide response feedback
            </span>
            <button
              type="button"
              onClick={() => setShowCommentBox(false)}
              className="text-surface-400 hover:text-surface-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <form onSubmit={handleCommentSubmit} className="space-y-2">
            <textarea
              rows={2}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What was good or could be improved? (optional)"
              className="w-full rounded border border-surface-300 p-1.5 text-xs text-surface-800 placeholder:text-surface-400 focus:border-brand-600 focus:outline-none"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setShowCommentBox(false)}
                className="rounded px-2 py-0.5 text-[11px] text-surface-500 hover:bg-surface-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1 rounded bg-brand-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-brand-700"
              >
                <Send className="h-2.5 w-2.5" />
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
