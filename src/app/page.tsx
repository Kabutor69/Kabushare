'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatFileSize } from '@/lib/utils';

export default function HomePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles);
    setFiles((prev) => [...prev, ...validFiles]);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const { upload } = await import('@vercel/blob/client');
      const results = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const accessId = Math.random().toString(36).substring(2, 18);

        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          clientPayload: JSON.stringify({
            accessId,
            fileSize: file.size,
            fileType: file.type,
          }),
          onUploadProgress: (p) => {
            const totalProgress = ((i + p.percentage / 100) / files.length) * 100;
            setProgress(Math.round(totalProgress));
          },
        });

        results.push({ success: true, accessId });
      }

      setProgress(100);

      const ids = results
        .filter((f) => f.success)
        .map((f) => f.accessId)
        .join(',');

      router.push(`/success?ids=${ids}`);
    } catch (err) {
      console.error('Frontend upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-xl w-full space-y-12">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Kabushare
          </h1>
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-medium">
            Minimal File Sharing
          </p>
        </div>

        <div className="space-y-6">
          <div
            className={`relative group cursor-pointer transition-all border rounded-xl p-12 text-center ${dragActive
              ? 'border-primary bg-primary/5'
              : 'border-border'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />

            <div className="space-y-4">
              <div className="mx-auto w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Drop files or click to add</p>
                <p className="text-xs text-muted-foreground">Up to 100MB per file</p>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Files ({files.length})
                </h2>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs font-medium text-destructive hover:underline"
                  disabled={uploading}
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="clean-card p-4 flex items-center justify-between group">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      disabled={uploading}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {!uploading && (
                <button
                  onClick={handleUpload}
                  className="w-full mt-4 py-3 bg-foreground text-background font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Upload {files.length} {files.length === 1 ? 'file' : 'files'}
                </button>
              )}

              {uploading && (
                <div className="pt-4 space-y-3">
                  <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center font-medium text-muted-foreground animate-pulse">
                    Uploading files... {progress}%
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl">
              <p className="text-xs text-destructive text-center font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="pt-12 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold opacity-50">
            Auto-delete after 48h • No registration • Encrypted
          </p>
        </div>
      </div>
    </main>
  );
}
