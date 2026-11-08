import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, RefreshCw, Database } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DocumentTable } from '@/components/documents/DocumentTable';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { documentsApi } from '@/api/documents';
import { DocumentItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function DocumentManagementPage() {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await documentsApi.list();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this document from the knowledge base?')) {
      return;
    }
    try {
      await documentsApi.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  const filteredDocs = documents.filter((d) => {
    const term = search.toLowerCase();
    return (
      (d.title && d.title.toLowerCase().includes(term)) ||
      (d.file_name && d.file_name.toLowerCase().includes(term)) ||
      (d.document_type && d.document_type.toLowerCase().includes(term))
    );
  });

  const userName =
    user?.full_name ||
    (user?.email
      ? user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Admin');

  return (
    <DashboardLayout
      currentRole={user?.role || 'admin'}
      userName={userName}
      userEmail={user?.email || ''}
      onLogout={logout}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-2">
              <Database className="h-6 w-6 text-brand-600" />
              Document Management
            </h1>
            <p className="mt-1 text-xs text-surface-500">
              Upload, inspect, and manage indexed knowledge base documents and vector embeddings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocuments}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Search bar & statistics */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, filename, or type..."
              className="w-full rounded-md border border-surface-300 bg-white py-2 pl-9 pr-3 text-xs text-surface-900 placeholder:text-surface-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>

          <span className="text-xs text-surface-500 whitespace-nowrap">
            Showing <strong>{filteredDocs.length}</strong> of <strong>{documents.length}</strong> documents
          </span>
        </div>

        {/* Documents Table */}
        <DocumentTable
          documents={filteredDocs}
          loading={loading}
          onDelete={handleDelete}
        />

        {/* Upload Modal */}
        <Modal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          title="Upload & Ingest Document"
          size="lg"
        >
          <DocumentUpload
            onSuccess={() => {
              setIsUploadOpen(false);
              fetchDocuments();
            }}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

