import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import FileModel from '@/lib/models/File';
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
                { status: 410 } // 410 Gone
            );
        }

        return NextResponse.json({
            fileName: file.fileName,
            fileSize: file.fileSize,
            fileType: file.fileType,
            createdAt: file.createdAt,
            expiresAt: file.expiresAt,
            accessId: file.accessId,
        });
    } catch (error) {
        console.error('File retrieval error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve file information' },
            { status: 500 }
        );
    }
}
