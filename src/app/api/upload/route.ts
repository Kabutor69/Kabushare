import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FileModel from '@/lib/models/File';
import { generateAccessId, calculateExpirationDate, validateFileType, validateFileSize, sanitizeFilename } from '@/lib/utils';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            token: process.env.BLOB_READ_WRITE_TOKEN,
            onBeforeGenerateToken: async (
                pathname,
                clientPayload,
            ) => {
                const payload = clientPayload ? JSON.parse(clientPayload) : {};

                if (!payload.fileType || !validateFileType(payload.fileType)) {
                    throw new Error('File type not allowed');
                }

                if (!payload.fileSize || !validateFileSize(payload.fileSize)) {
                    throw new Error('File size exceeds the 100MB limit');
                }

                return {
                    allowedContentTypes: undefined,
                    tokenPayload: JSON.stringify({
                        accessId: payload.accessId,
                        fileSize: payload.fileSize,
                        fileType: payload.fileType,
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log('blob upload completed', blob, tokenPayload);

                try {
                    const payload = tokenPayload ? JSON.parse(tokenPayload) : {};
                    await connectDB();

                    const expiresAt = calculateExpirationDate();

                    await FileModel.create({
                        fileName: sanitizeFilename(blob.pathname),
                        fileSize: payload.fileSize || 0,
                        fileType: payload.fileType || 'application/octet-stream',
                        blobUrl: blob.url,
                        accessId: payload.accessId || generateAccessId(),
                        expiresAt,
                    });
                } catch (error) {
                    console.error('onUploadCompleted error:', error);
                    throw new Error('Could not save file record');
                }
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}
