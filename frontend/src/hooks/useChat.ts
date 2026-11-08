import { useState, useCallback } from 'react';
import { chatApi } from '@/api/chat';
import { conversationsApi } from '@/api/conversations';
import { feedbackApi } from '@/api/feedback';
import { Message, FeedbackRating, ChatResponse } from '@/types';

export function useChat(initialConversationId?: number | null) {
  const [conversationId, setConversationId] = useState<number | null>(
    initialConversationId || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await conversationsApi.get(id);
      setConversationId(data.id);
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation history.');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (
      question: string,
      filters?: { document_type?: string | null; file_name?: string | null }
    ): Promise<ChatResponse | null> => {
      if (!question.trim()) return null;

      setError(null);

      // Create transient user message
      const userMessage: Message = {
        id: Date.now(),
        conversation_id: conversationId || 0,
        role: 'user',
        content: question,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      // Build lightweight conversation history for the backend
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const response = await chatApi.sendMessage({
          question,
          conversation_id: conversationId,
          conversation_history: history,
          document_type: filters?.document_type || null,
          file_name: filters?.file_name || null,
        });

        // Set or update conversation ID returned by backend
        if (response.conversation_id) {
          setConversationId(response.conversation_id);
        }

        // Retrieve real persisted message ID from backend for accurate feedback submission
        let assistantMsgId = Date.now() + 1;
        try {
          const detail = await conversationsApi.get(response.conversation_id);
          if (detail && detail.messages && detail.messages.length > 0) {
            const lastAssistantMsg = [...detail.messages]
              .reverse()
              .find((m) => m.role === 'assistant');
            if (lastAssistantMsg) {
              assistantMsgId = lastAssistantMsg.id;
            }
          }
        } catch {
          // Fallback to timestamp ID if retrieval fails
        }

        const assistantMessage: Message = {
          id: assistantMsgId,
          conversation_id: response.conversation_id,
          role: 'assistant',
          content: response.answer,
          sources: response.sources || [],
          citations: response.citations || [],
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        return response;
      } catch (err: any) {
        setError(err.message || 'Failed to generate answer. Please try again.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, messages]
  );

  const submitFeedback = useCallback(
    async (messageId: number, rating: FeedbackRating, comment?: string) => {
      try {
        const response = await feedbackApi.submit({
          message_id: messageId,
          rating,
          comment: comment || null,
        });

        // Update local message feedback state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  feedback: {
                    id: response.id,
                    rating: response.rating,
                    comment: response.comment,
                  },
                }
              : msg
          )
        );
      } catch (err: any) {
        console.error('Failed to submit feedback:', err.message);
      }
    },
    []
  );

  const resetChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    conversationId,
    messages,
    loading,
    error,
    sendMessage,
    loadConversation,
    submitFeedback,
    resetChat,
    setMessages,
  };
}

