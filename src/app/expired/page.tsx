'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ExpiredPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            <div className="max-w-2xl w-full space-y-12">
                <div className="flex justify-center">
                    <div className="w-16 h-16 border-2 border-destructive rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-destructive"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        File not found
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        This file has expired or doesn&apos;t exist
                    </p>
                </div>

                <div className="clean-card p-8 space-y-8">
                    <div className="space-y-6 text-foreground">
                        <div className="flex items-start gap-4">
                            <svg
                                className="w-6 h-6 mt-1 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div>
                                <h3 className="font-bold text-sm mb-1">File expired</h3>
                                <p className="text-sm">
                                    All files on Kabushare are automatically deleted after 48 hours for
                                    your privacy and security.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <svg
                                className="w-6 h-6 mt-1 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Invalid link</h3>
                                <p className="text-sm">
                                    The link you&apos;re trying to access may be incorrect or the file may
                                    have been deleted.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full px-8 py-3 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Upload a new file
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/"
                            className="text-muted-foreground hover:text-foreground transition-colors text-[10px] uppercase tracking-widest font-bold"
                        >
                            Return to home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
