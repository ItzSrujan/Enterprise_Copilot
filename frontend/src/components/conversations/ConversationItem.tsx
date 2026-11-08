import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Conversation } from '@/types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs cursor-pointer transition-colors ${
        isActive
          ? 'bg-brand-50 text-brand-900 font-semibold border border-brand-200'
          : 'text-surface-700 hover:bg-surface-100 hover:text-surface-900'
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-brand-600' : 'text-surface-400'}`} />
        <span className="truncate">{conversation.title || 'Conversation'}</span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        className="opacity-0 group-hover:opacity-100 rounded p-1 text-surface-400 hover:bg-surface-200 hover:text-rose-600 transition-opacity"
        title="Delete conversation"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};

