import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/utils/helpers';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  icon,
  badge,
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-surface-200 bg-white p-5 shadow-xs transition-all hover:border-surface-300">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-surface-900">
              {value}
            </span>
            {badge && (
              <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[11px] font-medium text-surface-600">
                {badge}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-surface-200 bg-surface-50 text-surface-600">
            {icon}
          </div>
        )}
      </div>

      {(change || subtitle) && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-surface-100 pt-3 text-xs">
          {change && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold',
                changeType === 'positive' && 'text-emerald-700',
                changeType === 'negative' && 'text-rose-700',
                changeType === 'neutral' && 'text-surface-600'
              )}
            >
              {changeType === 'positive' && <ArrowUpRight className="h-3.5 w-3.5" />}
              {changeType === 'negative' && <ArrowDownRight className="h-3.5 w-3.5" />}
              {changeType === 'neutral' && <Minus className="h-3.5 w-3.5" />}
              {change}
            </span>
          )}
          {change && subtitle && <span className="text-surface-300">&bull;</span>}
          {subtitle && <span className="text-surface-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

