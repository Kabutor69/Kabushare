'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const idsString = searchParams.get('ids') || '';
    const accessIds = idsString.split(',').filter(id => id.length > 0);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const router = useRouter();

    const getShareUrl = (id: string) => {
        if (typeof window === 'undefined') return '';
        return `${window.location.origin}/file/${id}`;
    };

    const copyToClipboard = async (id: string) => {
        try {
            await navigator.clipboard.writeText(getShareUrl(id));
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (accessIds.length === 0) {
        return (
            <div className="text-center space-y-4">
                <p className="text-muted-foreground">No files found.</p>
                <button
                    onClick={() => router.push('/')}
                    className="text-primary font-medium hover:underline"
                >
                    Go back home
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl w-full space-y-12">
            <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center text-primary">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Upload complete</h1>
                    <p className="text-sm text-muted-foreground">Your files are ready to be shared</p>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                    Shareable Links
                </h2>
                <div className="space-y-3">
                    {accessIds.map((id) => (
                        <div key={id} className="clean-card p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                                    ID: {id}
                                </span>
                                <button
                                    onClick={() => router.push(`/file/${id}`)}
                                    className="text-xs font-semibold text-primary hover:underline"
                                >
                                    View File
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={getShareUrl(id)}
                                    readOnly
                                    className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-mono focus:outline-none"
                                />
                                <button
                                    onClick={() => copyToClipboard(id)}
                                    className={`px-6 py-2 rounded-lg font-medium text-sm transition-opacity flex items-center gap-2 ${copiedId === id
                                        ? 'bg-green-500 text-white'
                                        : 'bg-foreground text-background hover:opacity-90'
                                        }`}
                                >
                                    {copiedId === id ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-6 flex flex-col items-center space-y-6">
                <button
                    onClick={() => router.push('/')}
                    className="w-full py-3 bg-secondary text-secondary-foreground font-medium rounded-xl hover:opacity-80 transition-opacity"
                >
                    Upload more files
                </button>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold opacity-50">
                    Links expire in 48 hours
                </p>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <Suspense fallback={<div className="text-muted-foreground animate-pulse">Loading links...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
