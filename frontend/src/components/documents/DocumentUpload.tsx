import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { documentsApi } from '@/api/documents';
import { DocumentItem } from '@/types';

interface DocumentUploadProps {
  onSuccess?: (doc: DocumentItem) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('policies');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: 'policies', label: 'Policies & HR (policies)' },
    { value: 'product_docs', label: 'Product & Architecture Documentation (product_docs)' },
    { value: 'troubleshooting', label: 'Troubleshooting & Support Playbooks (troubleshooting)' },
    { value: 'faq', label: 'Frequently Asked Questions (faq)' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files are allowed by the backend ingestion pipeline.');
        setFile(null);
        return;
      }
      setFile(selected);
      setError(null);
      setSuccess(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const doc = await documentsApi.upload(file, documentType);
      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onSuccess) onSuccess(doc);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document. Please check the file format.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Document successfully uploaded and queued for hybrid vector indexing.</span>
        </div>
      )}

      {/* Drag & Drop / File Input Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
          file
            ? 'border-brand-500 bg-brand-50/30'
            : 'border-surface-300 hover:border-brand-400 bg-surface-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-3 shadow-2xs">
          {file ? <FileText className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
        </div>

        {file ? (
          <div>
            <p className="text-sm font-semibold text-surface-900">{file.name}</p>
            <p className="text-xs text-surface-500 mt-0.5">
              {(file.size / 1024 / 1024).toFixed(2)} MB &bull; PDF format verified &bull; Ready to ingest
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-surface-800">
              Click to select or drag and drop PDF document
            </p>
            <p className="text-xs text-surface-400 mt-1">
              Supported format: PDF only (Max 25MB)
            </p>
          </div>
        )}
      </div>

      {/* Document Category */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-surface-700 mb-1.5">
          Document Classification
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="block w-full rounded-md border border-surface-300 bg-white py-2 px-3 text-xs text-surface-900 shadow-2xs focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        >
          {documentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-surface-400">
          Categorization enables targeted metadata filtering during dense and sparse retrieval.
        </p>
      </div>

      {/* Submit */}
      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!file || uploading}
          loading={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              Ingesting &amp; Chunking...
            </>
          ) : (
            'Ingest into Knowledge Base'
          )}
        </Button>
      </div>
    </form>
  );
};

