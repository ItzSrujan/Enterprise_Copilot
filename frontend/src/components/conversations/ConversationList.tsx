import React from 'react';
import { Plus, MessagesSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Conversation } from '@/types';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  loading = false,
}) => {
  return (
    <div className="flex h-full flex-col p-3 space-y-3">
      <Button
        variant="primary"
        size="sm"
        onClick={onNew}
        className="w-full gap-1.5 text-xs shadow-2xs"
      >
        <Plus className="h-3.5 w-3.5" />
        New Conversation
      </Button>

      <div className="flex-1 overflow-y-auto space-y-1">
        {loading ? (
          <div className="flex justify-center p-4 text-xs text-surface-400">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-surface-400">
            <MessagesSquare className="h-6 w-6 mb-1 text-surface-300" />
            <span className="text-[11px]">No conversations yet</span>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

