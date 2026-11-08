import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Source } from '@/types';

interface SourceListProps {
  sources: Source[];
}

export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-surface-200 bg-surface-50/80 p-2.5 text-xs text-surface-700">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between font-medium text-surface-700 hover:text-surface-900 transition-colors"
      >
        <span className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-surface-500">
          <FileText className="h-3.5 w-3.5 text-brand-600" />
          Referenced Sources ({sources.length})
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-surface-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-surface-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-2.5 space-y-2 border-t border-surface-200/80 pt-2 animate-in fade-in duration-150">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="rounded border border-surface-200 bg-white p-2 shadow-2xs"
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-brand-900 flex items-center gap-1">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 text-[10px] text-brand-700 font-bold">
                    {src.source_id || idx + 1}
                  </span>
                  {src.file_name || (src.file_path ? src.file_path.split(/[/\\]/).pop() : `Source ${idx + 1}`)}
                </span>
                {src.score !== undefined && (
                  <span className="rounded bg-surface-100 px-1.5 py-0.5 text-[10px] text-surface-600 font-mono">
                    Score: {Math.round(src.score * 100)}%
                  </span>
                )}
              </div>
              {src.content && (
                <p className="text-[11px] text-surface-600 leading-relaxed italic line-clamp-3 bg-surface-50 p-1.5 rounded border border-surface-100">
                  "{src.content}"
                </p>
              )}
              {(src.page != null || src.page_number != null || src.file_path) && (
                <div className="mt-1 flex items-center justify-between text-[10px] text-surface-400">
                  <span>
                    {(src.page != null || src.page_number != null) && `Page ${src.page ?? src.page_number}`}
                  </span>
                  {src.file_path && (
                    <span className="truncate max-w-xs text-surface-400" title={src.file_path}>
                      {src.file_path}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

