import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FileModel from '@/lib/models/File';
import { getFileStream, fileExists } from '@/lib/storage';
import { isExpired } from '@/lib/utils';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ accessId: string }> }
) {
    try {
        const { accessId } = await params;

        if (!accessId) {
            return NextResponse.json(
                { error: 'Access ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const file = await FileModel.findOne({ accessId });

        if (!file) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        if (isExpired(file.expiresAt)) {
            return NextResponse.json(
                { error: 'File has expired' },
                { status: 410 }
            );
        }

        if (file.blobUrl) {
            // Only redirect to trusted Vercel Blob storage URLs
            try {
                const blobUrl = new URL(file.blobUrl);
                if (!blobUrl.hostname.endsWith('.public.blob.vercel-storage.com')) {
                    return NextResponse.json(
                        { error: 'Invalid file storage URL' },
                        { status: 500 }
                    );
                }
            } catch {
                return NextResponse.json(
                    { error: 'Invalid file storage URL' },
                    { status: 500 }
                );
            }
            return NextResponse.redirect(file.blobUrl);
        }

        if (!file.gridFsId) {
            return NextResponse.json(
                { error: 'File storage information missing' },
                { status: 500 }
            );
        }

        const exists = await fileExists(file.gridFsId);
        if (!exists) {
            return NextResponse.json(
                { error: 'File not found in storage' },
                { status: 404 }
            );
        }

        const fileStream = await getFileStream(file.gridFsId);

        const readableStream = new ReadableStream({
            start(controller) {
                fileStream.on('data', (chunk) => {
                    controller.enqueue(new Uint8Array(chunk));
                });

                fileStream.on('end', () => {
                    controller.close();
                });

                fileStream.on('error', (error) => {
                    controller.error(error);
                });
            },
        });

        return new NextResponse(readableStream, {
            headers: {
                'Content-Type': file.fileType || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(file.fileName)}"`,
                'Content-Length': file.fileSize.toString(),
            },
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: 'Failed to download file' },
            { status: 500 }
        );
    }
}
