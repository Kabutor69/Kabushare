import { nanoid } from 'nanoid';

export function generateAccessId(): string {
    return nanoid(16);
}

export function validateFileSize(size: number, maxSizeMB: number = 100): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return size > 0 && size <= maxBytes;
}

export function validateFileType(mimeType: string): boolean {
    // Block executable files and scripts for security
    const blockedTypes = [
        'application/x-msdownload',
        'application/x-executable',
        'application/x-sh',
        'application/x-bat',
    ];

    return !blockedTypes.includes(mimeType);
}

export function sanitizeFilename(filename: string): string {
    // Remove any path separators and dangerous characters
    return filename
        .replace(/[\/\\]/g, '')
        .replace(/\.\./g, '')
        .replace(/[<>:"|?*]/g, '')
        .trim();
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function calculateExpirationDate(): Date {
    const now = new Date();
    return new Date(now.getTime() + 48 * 60 * 60 * 1000);
}

export function formatTimeRemaining(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) {
        return 'Expired';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h`;
    }

    return `${hours}h ${minutes}m`;
}

export function isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
}
