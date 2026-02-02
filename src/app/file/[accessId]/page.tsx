'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { formatFileSize, formatTimeRemaining } from '@/lib/utils';

interface FileInfo {
    fileName: string;
    fileSize: number;
    fileType: string;
    createdAt: string;
    expiresAt: string;
    accessId: string;
}

export default function FilePage({
    params,
}: {
    params: Promise<{ accessId: string }>;
}) {
    const { accessId } = use(params);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [downloading, setDownloading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchFileInfo = async () => {
            try {
                const response = await fetch(`/api/file/${accessId}`);

                if (response.status === 404 || response.status === 410) {
                    router.push('/expired');
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch file information');
                }

                const data = await response.json();
                setFileInfo(data);
                setTimeRemaining(formatTimeRemaining(new Date(data.expiresAt)));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchFileInfo();
    }, [accessId, router]);

    useEffect(() => {
        if (!fileInfo) return;

        const interval = setInterval(() => {
            const remaining = formatTimeRemaining(new Date(fileInfo.expiresAt));
            setTimeRemaining(remaining);

            if (remaining === 'Expired') {
                router.push('/expired');
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [fileInfo, router]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const response = await fetch(`/api/download/${accessId}`);

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileInfo?.fileName || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Download failed');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-muted-foreground animate-pulse text-sm font-medium">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="clean-card p-8 max-w-md w-full">
                    <p className="text-destructive text-center font-medium">{error}</p>
                </div>
            </div>
        );
    }

    if (!fileInfo) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
            <div className="max-w-2xl w-full space-y-12">
                <div className="text-center space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Kabushare
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium">File ready to download</p>
                </div>

                <div className="clean-card p-8 space-y-8">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground">
                            <svg
                                className="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold break-all">
                                {fileInfo.fileName}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-6 border-y border-border">
                            <div className="text-center space-y-1">
                                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">File size</p>
                                <p className="font-bold text-lg">
                                    {formatFileSize(fileInfo.fileSize)}
                                </p>
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Expires in</p>
                                <p className="font-bold text-lg">{timeRemaining}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            <span className="text-xs font-medium">Secure & Private</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="w-full px-8 py-3 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {downloading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg
                                    className="animate-spin h-4 w-4"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Downloading...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                Download file
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:opacity-80 transition-opacity"
                    >
                        Upload your own file
                    </button>
                </div>
            </div>
        </div>
    );
}
