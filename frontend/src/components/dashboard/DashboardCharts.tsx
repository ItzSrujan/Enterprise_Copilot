import { cn } from '@/utils/helpers';

export interface MonthlyIngestionData {
  month: string;
  count: number;
  chunks: number;
}

export interface CategoryBreakdownData {
  category: string;
  count: number;
  percentage: number;
}

export interface EvaluationTrendData {
  label: string;
  faithfulness: number;
  relevance: number;
  citations: number;
}

// 1. Ingestion Volume Bar Chart (SVG)
export function IngestionBarChart({
  data,
  totalChunks = 0,
  className = '',
}: {
  data: MonthlyIngestionData[];
  totalChunks?: number;
  className?: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 160;

  return (
    <div className={cn('rounded-lg border border-surface-200 bg-white p-5 shadow-xs', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">Document Ingestion Trend</h3>
          <p className="text-xs text-surface-500">Document volume &amp; generated chunks</p>
        </div>
      </div>

      <div className="pt-2">
        {data.length === 0 ? (
          <div className="h-[160px] flex items-center justify-center text-xs text-surface-400">
            No document uploads recorded yet.
          </div>
        ) : (
          <div className="flex items-end justify-between gap-3 h-[160px] pb-2 border-b border-surface-200">
            {data.map((item) => {
              const barHeight = Math.round((item.count / maxCount) * chartHeight);
              return (
                <div
                  key={item.month}
                  className="group relative flex flex-1 flex-col items-center justify-end h-full"
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-8 z-10 hidden rounded bg-surface-900 px-2 py-1 text-[10px] text-white shadow-md group-hover:block whitespace-nowrap">
                    {item.count} docs &bull; {item.chunks} chunks
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${Math.max(barHeight, 4)}px` }}
                    className="w-full max-w-[36px] rounded-t bg-brand-500 transition-all duration-300 group-hover:bg-brand-600"
                  />
                  <span className="mt-2 text-[11px] font-medium text-surface-500 truncate max-w-[48px]">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-surface-500">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-xs bg-brand-500" />
            <span>Uploaded Documents</span>
          </div>
          <span>Total Chunks: {totalChunks.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// 2. Category Distribution Progress Bars
export function CategoryDistributionCard({
  data,
  className = '',
}: {
  data: CategoryBreakdownData[];
  className?: string;
}) {
  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Product Docs':
        return 'bg-brand-500';
      case 'Policies':
        return 'bg-emerald-500';
      case 'Troubleshooting':
        return 'bg-amber-500';
      default:
        return 'bg-indigo-500';
    }
  };

  return (
    <div className={cn('rounded-lg border border-surface-200 bg-white p-5 shadow-xs', className)}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-surface-900">Knowledge Distribution</h3>
        <p className="text-xs text-surface-500">Indexed documents grouped by taxonomy</p>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center text-xs text-surface-400">
          No indexed documents found across categories.
        </div>
      ) : (
        <div className="space-y-3.5">
          {data.map((item) => (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-surface-700">{item.category}</span>
                <span className="text-surface-500">
                  <strong className="text-surface-900">{item.count}</strong> docs ({item.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-100">
                <div
                  style={{ width: `${item.percentage}%` }}
                  className={cn('h-full rounded-full transition-all duration-300', getBadgeColor(item.category))}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 3. RAG Quality Benchmark Trend (SVG)
export function EvaluationTrendChart({
  data,
  className = '',
}: {
  data: EvaluationTrendData[];
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-surface-200 bg-white p-5 shadow-xs', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">RAG Quality Progression</h3>
          <p className="text-xs text-surface-500">Weekly evaluation scores (Faithfulness, Relevance, Citations)</p>
        </div>
        <span className="rounded-md border border-surface-200 bg-surface-50 px-2 py-1 text-[11px] font-medium text-surface-600">
          Last 4 Weeks
        </span>
      </div>

      <div className="space-y-3">
        {data.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-md border border-surface-100 p-2.5 text-xs hover:bg-surface-50"
          >
            <span className="font-semibold text-surface-700 w-10">{row.label}</span>
            <div className="flex flex-1 items-center justify-around gap-2 px-2">
              <span className="text-surface-600">
                Faithfulness: <strong className="text-emerald-700 font-mono">{(row.faithfulness * 100).toFixed(0)}%</strong>
              </span>
              <span className="text-surface-300">&bull;</span>
              <span className="text-surface-600">
                Relevance: <strong className="text-brand-700 font-mono">{(row.relevance * 100).toFixed(0)}%</strong>
              </span>
              <span className="text-surface-300">&bull;</span>
              <span className="text-surface-600">
                Citations: <strong className="text-indigo-700 font-mono">{(row.citations * 100).toFixed(0)}%</strong>
              </span>
            </div>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              Verified
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

