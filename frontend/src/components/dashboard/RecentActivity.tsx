import { MessageSquare, FileText, BarChart3, Ticket } from 'lucide-react';
import { ActivityItem } from '@/types';
import { cn } from '@/utils/helpers';

export interface RecentActivityProps {
  activities: ActivityItem[];
  title?: string;
  className?: string;
}

export function RecentActivity({
  activities,
  title = 'Recent System Activity',
  className = '',
}: RecentActivityProps) {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'query':
        return <MessageSquare className="h-3.5 w-3.5 text-brand-600" />;
      case 'document':
        return <FileText className="h-3.5 w-3.5 text-emerald-600" />;
      case 'evaluation':
        return <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />;
      case 'ticket':
        return <Ticket className="h-3.5 w-3.5 text-amber-600" />;
      default:
        return <MessageSquare className="h-3.5 w-3.5 text-surface-500" />;
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-surface-200 bg-white p-5 shadow-xs',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-surface-900">{title}</h3>
        <span className="text-xs text-surface-400">Live feed</span>
      </div>

      <div className="space-y-3">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-surface-50"
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-surface-200 bg-surface-50">
              {getIcon(item.type)}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="text-surface-700 leading-snug">
                <strong className="text-surface-900 font-semibold">
                  {item.user}
                </strong>{' '}
                {item.action}{' '}
                <span className="font-medium text-surface-900">
                  &ldquo;{item.target}&rdquo;
                </span>
              </p>
              <span className="mt-0.5 block text-[11px] text-surface-400">
                {item.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

