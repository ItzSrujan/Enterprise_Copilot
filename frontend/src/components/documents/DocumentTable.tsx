import React from 'react';
import { FileText, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { DocumentItem } from '@/types';

interface DocumentTableProps {
  documents: DocumentItem[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  loading,
  onDelete,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Indexed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200 animate-pulse">
            <Clock className="h-3 w-3" />
            Processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 border border-rose-200">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-surface-100 px-2 py-0.5 text-[11px] font-medium text-surface-600">
            {status}
          </span>
        );
    }
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-surface-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <span className="text-xs">Loading enterprise documents...</span>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-surface-300 p-8 text-center">
        <FileText className="h-8 w-8 text-surface-400 mb-2" />
        <p className="text-sm font-semibold text-surface-700">No documents found</p>
        <p className="text-xs text-surface-400 mt-1">
          Upload organizational manuals, SOPs, or guides to index them into vector storage.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-surface-200 bg-white shadow-2xs">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-surface-200 bg-surface-50 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
          <tr>
            <th className="py-3 px-4">Document Title / File</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Chunks</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Indexed At</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 text-surface-700">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-surface-50/60 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-brand-50 text-brand-600 border border-brand-100">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-surface-900 block">
                      {doc.title || doc.file_name}
                    </span>
                    <span className="text-[10px] text-surface-400">{doc.file_name}</span>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 font-mono text-[11px] text-surface-600">
                {doc.document_type || 'General'}
              </td>
              <td className="py-3 px-4 font-mono font-medium text-surface-700">
                {doc.chunk_count || doc.chunks_count || '-'}
              </td>
              <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
              <td className="py-3 px-4 text-surface-500 text-[11px]">
                {doc.created_at
                  ? new Date(doc.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '-'}
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(doc.id)}
                  className="rounded p-1.5 text-surface-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

